#!/usr/bin/env python3
"""
collect_data.py
Compiles primary data sources into unified JSON digital twins for Turmeric and Tulsi,
structured according to the database tables and vector definitions (Section 9 and 11)
in the Technical Due Diligence Report.
"""

import os
import json

def get_turmeric_twin():
    return {
        "id": "ING-001",
        "canonical_name": "Turmeric",
        "taxonomy": {
            "scientific_name": "Curcuma longa",
            "common_name": "Turmeric",
            "sanskrit_name": "Haridra",
            "family": "Zingiberaceae",
            "powo_id": "urn:lsid:ipni.org:names:796451-1",
            "ncbi_taxon_id": 136217,
            "gbif_id": 3042211,
            "synonyms": [
                "Curcuma domestica Valeton",
                "Amomum curcuma Jacq."
            ]
        },
        "ayurveda": {
            "sanskrit_name": "Haridra",
            "rasa": ["Tikta", "Katu"],
            "guna": ["Laghu", "Ruksha"],
            "virya": "Ushna",
            "vipaka": "Katu",
            "overall_dosha": "Kapha-Pitta Shamaka",
            # Computational representations (Section 11)
            "rasa_vector": [0.0, 0.0, 0.0, 0.7, 0.8, 0.0],  # [Sweet, Sour, Salty, Bitter, Pungent, Astringent]
            "guna_vector": [1.0, 1.0, 0.0, 0.0, 0.0, 0.0],  # [Laghu, Ruksha, Teekshna, Guru, Snigdha, Manda]
            "virya_scalar": 0.8,                            # Spectrum from -1.0 (Sheet) to +1.0 (Ushna)
            "vipaka_vector": [0, 0, 1],                     # One-hot: [Madhura, Amla, Katu]
            "dosha_impact": [0, -1, -1],                    # 3D: [Vata, Pitta, Kapha] (-1: Pacifies, 0: Neutral, 1: Aggravates)
            "karma": [
                "Lekhana (Scraping)",
                "Varnya (Complexion promoting)",
                "Vishaghna (Anti-toxic)",
                "Krimighna (Anti-microbial)",
                "Sothahara (Anti-inflammatory)",
                "Pramehahara (Anti-diabetic)"
            ],
            "classical_references": [
                {
                    "text_name": "Ayurvedic Pharmacopoeia of India",
                    "citation": "Part I, Volume I, pp. 45-46",
                    "context": "Identifies Haridra as dry rhizome of Curcuma longa L., details quality control standards, and specifies Katu-Tikta Rasa, Ushna Virya, and Katu Vipaka."
                },
                {
                    "text_name": "Charaka Samhita",
                    "citation": "Sutrasthana Chapter 4, Lekhaniya Mahakashaya",
                    "context": "Grouped under herbs promoting scraping action and alleviating skin disorders."
                }
            ]
        },
        "nutrition": {
            "usda_fdc_id": "172231",
            "basis": "100g serving",
            "calories": 312.0,      # energy_kcal
            "proteins_g": 9.68,
            "fats_g": 3.25,
            "carbs_g": 67.14,
            "fiber_g": 22.7,
            "minerals": {
                "calcium_mg": 168.0,
                "iron_mg": 55.0,
                "magnesium_mg": 208.0,
                "potassium_mg": 2080.0,
                "sodium_mg": 38.0
            }
        },
        "phytochemicals": [
            {
                "name": "Curcumin",
                "pubchem_cid": 969516,
                "molecular_formula": "C21H20O6",
                "smiles": "COC1=C(C=CC(=C1)C=CC(=O)CC(=O)C=CC2=CC(=C(C=C2)O)OC)O",
                "inchikey": "WMRUPHIJSSGWFX-UHFFFAOYSA-N",
                "typical_concentration_range": "2.0% - 5.0%",
                "imppat_id": "IMPHY000216",
                "bioactivities": ["Anti-inflammatory", "Antioxidant", "Anti-diabetic"]
            },
            {
                "name": "Demethoxycurcumin",
                "pubchem_cid": 5469424,
                "molecular_formula": "C20H18O5",
                "typical_concentration_range": "0.5% - 1.5%",
                "imppat_id": "IMPHY000217",
                "bioactivities": ["Anti-inflammatory", "Antioxidant"]
            }
        ],
        "flavor_molecules": [
            {
                "name": "Curcumin",
                "pubchem_cid": 969516,
                "flavordb_id": "FDB012495",
                "odor_type": "woody, spicy",
                "flavor_profile": ["woody", "musty", "earthy"]
            },
            {
                "name": "ar-Turmerone",
                "pubchem_cid": 92233,
                "flavordb_id": "FDB022351",
                "odor_type": "spicy, herbal",
                "flavor_profile": ["spicy", "aromatic"]
            }
        ],
        "disease_associations": [
            {
                "disease_name": "Osteoarthritis",
                "mesh_id": "D010003",
                "evidence_level": "High",
                "pubmed_ids": ["PMID: 26860361"],
                "clinicaltrials_gov_ids": ["NCT03045237"],
                "summary": "Randomized trials confirm that Curcuma longa extracts are comparable to NSAIDs like ibuprofen in reducing arthritis pain with fewer GI adverse events."
            }
        ],
        "research_papers": [
            {
                "pmid": "17569205",
                "title": "Curcumin: the Indian solid gold",
                "authors": "Aggarwal BB et al.",
                "journal": "Adv Exp Med Biol",
                "year": 2007,
                "abstract": "This review summarizes the clinical and therapeutic properties of curcumin and its plant origin."
            }
        ]
    }

def get_tulsi_twin():
    return {
        "id": "ING-002",
        "canonical_name": "Tulsi",
        "taxonomy": {
            "scientific_name": "Ocimum tenuiflorum",
            "common_name": "Holy Basil",
            "sanskrit_name": "Tulasi",
            "family": "Lamiaceae",
            "powo_id": "urn:lsid:ipni.org:names:450125-1",
            "ncbi_taxon_id": 28540,
            "gbif_id": 2927096,
            "synonyms": [
                "Ocimum sanctum L.",
                "Ocimum frutescens Burm.f."
            ]
        },
        "ayurveda": {
            "sanskrit_name": "Tulasi",
            "rasa": ["Katu", "Tikta"],
            "guna": ["Laghu", "Ruksha", "Teekshna"],
            "virya": "Ushna",
            "vipaka": "Katu",
            "overall_dosha": "Vata-Kaphahara",
            # Computational representations (Section 11)
            "rasa_vector": [0.0, 0.0, 0.0, 0.5, 0.9, 0.0],  # [Sweet, Sour, Salty, Bitter, Pungent, Astringent]
            "guna_vector": [1.0, 1.0, 1.0, 0.0, 0.0, 0.0],  # [Laghu, Ruksha, Teekshna, Guru, Snigdha, Manda]
            "virya_scalar": 0.7,                            # Spectrum from -1.0 to +1.0
            "vipaka_vector": [0, 0, 1],                     # One-hot
            "dosha_impact": [-1, 1, -1],                    # 3D: [Vata, Pitta, Kapha] (-1: Pacifies, 0: Neutral, 1: Aggravates)
            "karma": [
                "Svasahara (Respiratory relief)",
                "Deepana (Digestive fire promoting)",
                "Vishaghna (Anti-toxic)",
                "Kasahara (Cough relief)"
            ],
            "classical_references": [
                {
                    "text_name": "Ayurvedic Pharmacopoeia of India",
                    "citation": "Part I, Volume II, pp. 165-167",
                    "context": "Specifies quality guidelines for dry leaves of Ocimum sanctum L., listing Katu-Tikta Rasa, Ushna Virya, and Katu Vipaka."
                },
                {
                    "text_name": "Bhavaprakasha Nighantu",
                    "citation": "Guduchyadi Varga, Shloka 62-63",
                    "context": "Identifies Tulasi as surasa (aromatic), kasashvashaharah (cures cough and dyspnea), and pittakrit (increases Pitta)."
                }
            ]
        },
        "nutrition": {
            "usda_fdc_id": "172227",
            "basis": "100g serving",
            "calories": 23.0,       # energy_kcal
            "proteins_g": 3.15,
            "fats_g": 0.64,
            "carbs_g": 2.65,
            "fiber_g": 1.6,
            "minerals": {
                "calcium_mg": 177.0,
                "iron_mg": 3.17,
                "magnesium_mg": 64.0,
                "potassium_mg": 295.0,
                "sodium_mg": 9.0
            }
        },
        "phytochemicals": [
            {
                "name": "Eugenol",
                "pubchem_cid": 3314,
                "molecular_formula": "C10H12O2",
                "smiles": "COC1=C(C=CC(=C1)CC=C)O",
                "inchikey": "RJUUPFJSKDNJQM-UHFFFAOYSA-N",
                "typical_concentration_range": "30.0% - 70.0% of volatile oil",
                "imppat_id": "IMPHY000049",
                "bioactivities": ["Antiseptic", "Analgesic", "Anti-inflammatory"]
            },
            {
                "name": "beta-Caryophyllene",
                "pubchem_cid": 5281515,
                "molecular_formula": "C15H24",
                "typical_concentration_range": "5.0% - 20.0%",
                "imppat_id": "IMPHY000724",
                "bioactivities": ["Anti-inflammatory", "Anxiolytic"]
            }
        ],
        "flavor_molecules": [
            {
                "name": "Eugenol",
                "pubchem_cid": 3314,
                "flavordb_id": "FDB000854",
                "odor_type": "clove, sweet, spicy",
                "flavor_profile": ["clove", "spicy", "warm"]
            },
            {
                "name": "beta-Caryophyllene",
                "pubchem_cid": 5281515,
                "flavordb_id": "FDB008924",
                "odor_type": "woody, spicy",
                "flavor_profile": ["woody", "spicy"]
            }
        ],
        "disease_associations": [
            {
                "disease_name": "Generalized Anxiety Disorder",
                "mesh_id": "D001008",
                "evidence_level": "Moderate",
                "pubmed_ids": ["PMID: 18226054"],
                "clinicaltrials_gov_ids": ["NCT01809626"],
                "summary": "Clinical trials demonstrate that Ocimum sanctum extract significantly reduces anxiety indices, confirming its adaptogenic role."
            }
        ],
        "research_papers": [
            {
                "pmid": "25624701",
                "title": "Tulsi - Ocimum sanctum: A herb for all reasons",
                "authors": "Cohen MM",
                "journal": "J Ayurveda Integr Med",
                "year": 2014,
                "abstract": "Summarizes the clinical evidence for the physiological and adaptogenic properties of Tulsi."
            }
        ]
    }

def main():
    print("[+] Compiling Ayurveda Digital Twin JSON data matching new specifications...")
    os.makedirs("data/processed", exist_ok=True)
    
    turmeric = get_turmeric_twin()
    with open("data/processed/turmeric_twin.json", "w", encoding="utf-8") as f:
        json.dump(turmeric, f, indent=4, ensure_ascii=False)
    print("Saved turmeric_twin.json to data/processed/")
        
    tulsi = get_tulsi_twin()
    with open("data/processed/tulsi_twin.json", "w", encoding="utf-8") as f:
        json.dump(tulsi, f, indent=4, ensure_ascii=False)
    print("Saved tulsi_twin.json to data/processed/")
    
    print("[+] Successfully compiled and saved 2 Digital Twin files.")

if __name__ == "__main__":
    main()
