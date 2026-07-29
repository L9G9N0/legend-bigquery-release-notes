# main.py
# FastAPI Backend for the Computational Food Intelligence Platform
# Integrates PostgreSQL/Neo4j concepts and runs mathematical simulations based on Section 13.

import os
import json
import math
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Computational Food Intelligence Platform API",
    description="Vectorized Ayurveda & Biomedical Simulation Engine for Food Digital Twins.",
    version="1.1.0"
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "processed")

def load_ingredient_data(name: str) -> Dict[str, Any]:
    """Helper function to load local digital twin JSON data."""
    filename = f"{name.lower().strip()}_twin.json"
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Ingredient '{name}' not found. Available: Turmeric, Tulsi")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading data: {str(e)}")

@app.get("/")
def read_root():
    return {
        "project": "Computational Food Intelligence Platform",
        "description": "Qualitative-Quantitative translation engine for Ayurveda & Modern Science.",
        "status": "Online",
        "ingredients": ["Turmeric", "Tulsi"]
    }

@app.get("/ingredients")
def get_ingredients_list():
    """Returns basic list of supported ingredients."""
    results = []
    for name in ["Turmeric", "Tulsi"]:
        data = load_ingredient_data(name)
        results.append({
            "id": data["id"],
            "name": data["canonical_name"],
            "scientific_name": data["taxonomy"]["scientific_name"],
            "family": data["taxonomy"]["family"],
            "sanskrit_name": data["taxonomy"]["sanskrit_name"]
        })
    return results

@app.get("/ingredient")
def get_ingredient(name: str = Query(..., description="Name of the ingredient (Turmeric or Tulsi)")):
    """Returns the full digital twin JSON for the given ingredient."""
    return load_ingredient_data(name)

@app.get("/ayurveda")
def get_ayurveda_properties(name: str = Query(..., description="Name of the ingredient")):
    data = load_ingredient_data(name)
    return {
        "ingredient": data["canonical_name"],
        "ayurvedic_profile": data["ayurveda"]
    }

@app.get("/nutrition")
def get_nutrition_properties(name: str = Query(..., description="Name of the ingredient")):
    data = load_ingredient_data(name)
    return {
        "ingredient": data["canonical_name"],
        "nutrition": data["nutrition"]
    }

@app.get("/phytochemicals")
def get_phytochemical_properties(name: str = Query(..., description="Name of the ingredient")):
    data = load_ingredient_data(name)
    return {
        "ingredient": data["canonical_name"],
        "phytochemicals": data["phytochemicals"]
    }

@app.get("/evidence")
def get_disease_evidence(name: str = Query(..., description="Name of the ingredient")):
    data = load_ingredient_data(name)
    return {
        "ingredient": data["canonical_name"],
        "disease_associations": data["disease_associations"]
    }

@app.get("/papers")
def get_research_papers(name: str = Query(..., description="Name of the ingredient")):
    data = load_ingredient_data(name)
    return {
        "ingredient": data["canonical_name"],
        "research_papers": data["research_papers"]
    }

class SubstitutionRequest(BaseModel):
    source_ingredient: str
    target_ingredient: str
    amount_g: float = 100.0
    target_dosha_constraint: Optional[str] = None  # e.g., "Vata-pacifying"

# Helper vector mathematics
def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot = sum(a*b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a*a for a in v1))
    mag2 = math.sqrt(sum(b*b for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)

@app.post("/simulate/substitution")
def simulate_substitution(req: SubstitutionRequest):
    """
    Computes the mathematical substitution score based on Section 13 equations:
    Score(x -> y) = w1*Sim_nutrition + w2*Sim_flavor + w3*Ayur_shift + w4*Evidence_score
    """
    x = load_ingredient_data(req.source_ingredient)
    y = load_ingredient_data(req.target_ingredient)
    
    amount_multiplier = req.amount_g / 100.0

    # 1. Target Dosha Constraint Check (Section 13 Step 1 & 2)
    # E.g., Vata-pacifying checks if dosha_impact[0] is -1.
    dosha_impact_y = y["ayurveda"]["dosha_impact"]
    constraint_satisfied = True
    constraint_message = "No constraint applied."
    
    if req.target_dosha_constraint == "Vata-pacifying":
        if dosha_impact_y[0] == -1:
            constraint_satisfied = True
            constraint_message = "Constraint Satisfied: Target is Vata-pacifying (dosha_impact[0] = -1)."
        else:
            constraint_satisfied = False
            constraint_message = "Constraint Violated: Target is NOT Vata-pacifying."

    # 2. Step 3: Nutritional Delta & Sim_nutrition
    # Sim_nutrition = 1 / (1 + ||Nx - Ny||_2)
    # Using calories, proteins_g, fats_g, carbs_g, fiber_g normalized per gram (divided by 100)
    nut_x = x["nutrition"]
    nut_y = y["nutrition"]
    
    # Scale values to portion amount (amount_g)
    cal_x, cal_y = nut_x["calories"] * amount_multiplier, nut_y["calories"] * amount_multiplier
    prot_x, prot_y = nut_x["proteins_g"] * amount_multiplier, nut_y["proteins_g"] * amount_multiplier
    fat_x, fat_y = nut_x["fats_g"] * amount_multiplier, nut_y["fats_g"] * amount_multiplier
    carb_x, carb_y = nut_x["carbs_g"] * amount_multiplier, nut_y["carbs_g"] * amount_multiplier
    fib_x, fib_y = nut_x["fiber_g"] * amount_multiplier, nut_y["fiber_g"] * amount_multiplier
    
    # Calculate Euclidean distance on normalized macronutrients (per portion)
    sq_dist = (
        (cal_x - cal_y)**2 +
        (prot_x - prot_y)**2 +
        (fat_x - fat_y)**2 +
        (carb_x - carb_y)**2 +
        (fib_x - fib_y)**2
    )
    euclidean_dist = math.sqrt(sq_dist)
    sim_nutrition = round(1.0 / (1.0 + euclidean_dist), 4)

    # 3. Step 4: Flavor Similarity (Sim_flavor)
    # Cosine similarity of presence/absence binary vectors over unique flavor molecule union
    x_cids = [f["pubchem_cid"] for f in x["flavor_molecules"]]
    y_cids = [f["pubchem_cid"] for f in y["flavor_molecules"]]
    
    union_cids = list(set(x_cids).union(set(y_cids)))
    
    # Represent as binary presence vectors
    vec_x = [1.0 if cid in x_cids else 0.0 for cid in union_cids]
    vec_y = [1.0 if cid in y_cids else 0.0 for cid in union_cids]
    
    sim_flavor = round(cosine_similarity(vec_x, vec_y), 4)

    # 4. Step 5: Ayurvedic Compatibility Shift (Ayur_shift)
    # Cosine(Rasa_x, Rasa_y) * (1 - |Virya_x - Virya_y| / 2)
    rasa_x = x["ayurveda"]["rasa_vector"]
    rasa_y = y["ayurveda"]["rasa_vector"]
    rasa_cos = cosine_similarity(rasa_x, rasa_y)
    
    virya_x = x["ayurveda"]["virya_scalar"]
    virya_y = y["ayurveda"]["virya_scalar"]
    virya_delta = abs(virya_x - virya_y)
    
    ayur_shift = round(rasa_cos * (1.0 - (virya_delta / 2.0)), 4)

    # 5. Step 6: Evidence score compatibility (Evidence_score)
    # PageRank representation or clinical trials density: Mapped from disease evidence levels
    evidence_y = y["disease_associations"][0]["evidence_level"] if y["disease_associations"] else "Low"
    evidence_weight = 0.8 if evidence_y == "High" else (0.5 if evidence_y == "Moderate" else 0.2)
    sim_evidence = round(evidence_weight, 2)

    # 6. Step 7: Final Score Computation
    # Score = w1*Sim_nutrition + w2*Sim_flavor + w3*Ayur_shift + w4*Evidence_score
    # Standard weights sum to 1.0: w1=0.25, w2=0.25, w3=0.30, w4=0.20
    w1, w2, w3, w4 = 0.25, 0.25, 0.30, 0.20
    final_score_raw = (w1 * sim_nutrition) + (w2 * sim_flavor) + (w3 * ayur_shift) + (w4 * sim_evidence)
    final_score_percentage = round(final_score_raw * 100.0, 1)

    # Determine qualitative rating
    rating = "Low"
    if final_score_percentage >= 70.0:
        rating = "High"
    elif final_score_percentage >= 40.0:
        rating = "Moderate"

    # Specific warnings for Pitta/Vata shifts
    warnings = []
    # If Vata target constraint was specified but target violates it, raise warning
    if req.target_dosha_constraint == "Vata-pacifying" and not constraint_satisfied:
        warnings.append(f"Constraint Warning: Target ingredient '{y['canonical_name']}' is NOT Vata-pacifying.")
    # Check Pitta escalation
    if x["ayurveda"]["dosha_impact"][1] <= 0 and y["ayurveda"]["dosha_impact"][1] > 0:
        warnings.append(f"Thermodynamic Warning: Target '{y['canonical_name']}' increases Pitta (+1), which may aggravate thermal disorders compared to '{x['canonical_name']}' (Pitta: {x['ayurveda']['dosha_impact'][1]}).")

    return {
        "simulation_parameters": {
            "source": x["canonical_name"],
            "target": y["canonical_name"],
            "amount_g": req.amount_g,
            "target_dosha_constraint": req.target_dosha_constraint
        },
        "constraint_status": {
            "satisfied": constraint_satisfied,
            "message": constraint_message
        },
        "overall_compatibility_score": final_score_percentage,
        "overall_compatibility_rating": rating,
        "trace_matrix": {
            "Sim_nutrition": {
                "score": sim_nutrition,
                "weight": w1,
                "euclidean_distance": round(euclidean_dist, 4),
                "source_values": {"calories": cal_x, "protein": prot_x, "fat": fat_x, "carbs": carb_x, "fiber": fib_x},
                "target_values": {"calories": cal_y, "protein": prot_y, "fat": fat_y, "carbs": carb_y, "fiber": fib_y}
            },
            "Sim_flavor": {
                "score": sim_flavor,
                "weight": w2,
                "source_volatiles_count": len(x_cids),
                "target_volatiles_count": len(y_cids),
                "cosine_overlap": sim_flavor
            },
            "Ayur_shift": {
                "score": ayur_shift,
                "weight": w3,
                "rasa_cosine_similarity": round(rasa_cos, 4),
                "virya_delta": round(virya_delta, 4),
                "source_virya_scalar": virya_x,
                "target_virya_scalar": virya_y
            },
            "Evidence_score": {
                "score": sim_evidence,
                "weight": w4,
                "target_clinical_grade": evidence_y
            }
        },
        "warnings": warnings
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
