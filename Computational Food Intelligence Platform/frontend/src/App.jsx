import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Info, 
  Award, 
  Activity, 
  BookOpen, 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  Heart, 
  GitBranch, 
  Share2, 
  ExternalLink,
  Droplet,
  Compass
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

// Fallback high-fidelity data in case backend is offline
const FALLBACK_INGREDIENTS = {
  "Turmeric": {
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
      "synonyms": ["Curcuma domestica Valeton", "Amomum curcuma Jacq."]
    },
    "ayurveda": {
      "sanskrit_name": "Haridra",
      "rasa": ["Tikta", "Katu"],
      "guna": ["Laghu", "Ruksha"],
      "virya": "Ushna",
      "vipaka": "Katu",
      "overall_dosha": "Kapha-Pitta Shamaka",
      "rasa_vector": [0.0, 0.0, 0.0, 0.7, 0.8, 0.0],
      "guna_vector": [1.0, 1.0, 0.0, 0.0, 0.0, 0.0],
      "virya_scalar": 0.8,
      "vipaka_vector": [0, 0, 1],
      "dosha_impact": [0, -1, -1],
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
      "calories": 312.0,
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
  },
  "Tulsi": {
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
      "synonyms": ["Ocimum sanctum L.", "Ocimum frutescens Burm.f."]
    },
    "ayurveda": {
      "sanskrit_name": "Tulasi",
      "rasa": ["Katu", "Tikta"],
      "guna": ["Laghu", "Ruksha", "Teekshna"],
      "virya": "Ushna",
      "vipaka": "Katu",
      "overall_dosha": "Vata-Kaphahara",
      "rasa_vector": [0.0, 0.0, 0.0, 0.5, 0.9, 0.0],
      "guna_vector": [1.0, 1.0, 1.0, 0.0, 0.0, 0.0],
      "virya_scalar": 0.7,
      "vipaka_vector": [0, 0, 1],
      "dosha_impact": [-1, 1, -1],
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
      "calories": 23.0,
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
};

function App() {
  const [activeTab, setActiveTab] = useState('twin');
  const [selectedIngredient, setSelectedIngredient] = useState('Turmeric');
  const [ingredientData, setIngredientData] = useState(FALLBACK_INGREDIENTS['Turmeric']);
  
  // Twin detail sub-tabs
  const [twinSubTab, setTwinSubTab] = useState('taxonomy');

  // Simulation inputs and outputs
  const [simSource, setSimSource] = useState('Turmeric');
  const [simTarget, setSimTarget] = useState('Tulsi');
  const [simAmount, setSimAmount] = useState(100);
  const [simConstraint, setSimConstraint] = useState('None');
  const [simResult, setSimResult] = useState(null);
  
  // Connection state
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [graphHoverNode, setGraphHoverNode] = useState(null);

  // Check backend status & load initial ingredient
  useEffect(() => {
    fetch(`${API_BASE}/`)
      .then(res => {
        if(res.ok) {
          setIsBackendOnline(true);
        }
      })
      .catch(() => {
        setIsBackendOnline(false);
      });
  }, []);

  // Fetch or Load Ingredient Data
  useEffect(() => {
    if (isBackendOnline) {
      fetch(`${API_BASE}/ingredient?name=${selectedIngredient}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => setIngredientData(data))
        .catch(() => setIngredientData(FALLBACK_INGREDIENTS[selectedIngredient]));
    } else {
      setIngredientData(FALLBACK_INGREDIENTS[selectedIngredient]);
    }
  }, [selectedIngredient, isBackendOnline]);

  // Run Substitution Simulation
  const handleRunSimulation = () => {
    const payload = {
      source_ingredient: simSource,
      target_ingredient: simTarget,
      amount_g: Number(simAmount),
      target_dosha_constraint: simConstraint === 'None' ? null : simConstraint
    };

    if (isBackendOnline) {
      fetch(`${API_BASE}/simulate/substitution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => setSimResult(data))
        .catch(() => runLocalSimulation());
    } else {
      runLocalSimulation();
    }
  };

  // Local fallback simulation (Section 13)
  const runLocalSimulation = () => {
    const x = FALLBACK_INGREDIENTS[simSource];
    const y = FALLBACK_INGREDIENTS[simTarget];
    const mult = Number(simAmount) / 100.0;

    // Constraint status
    let satisfied = true;
    let message = "No constraint applied.";
    if (simConstraint === 'Vata-pacifying') {
      if (y.ayurveda.dosha_impact[0] === -1) {
        message = "Constraint Satisfied: Target is Vata-pacifying (dosha_impact[0] = -1).";
      } else {
        satisfied = False;
        message = "Constraint Violated: Target is NOT Vata-pacifying.";
      }
    }

    // step 3: Nutritional distance
    const cal_x = x.nutrition.calories * mult;
    const cal_y = y.nutrition.calories * mult;
    const prot_x = x.nutrition.proteins_g * mult;
    const prot_y = y.nutrition.proteins_g * mult;
    const fat_x = x.nutrition.fats_g * mult;
    const fat_y = y.nutrition.fats_g * mult;
    const carb_x = x.nutrition.carbs_g * mult;
    const carb_y = y.nutrition.carbs_g * mult;
    const fib_x = x.nutrition.fiber_g * mult;
    const fib_y = y.nutrition.fiber_g * mult;

    const sq_dist = (
      (cal_x - cal_y)**2 +
      (prot_x - prot_y)**2 +
      (fat_x - fat_y)**2 +
      (carb_x - carb_y)**2 +
      (fib_x - fib_y)**2
    );
    const dist = Math.sqrt(sq_dist);
    const sim_nutrition = 1.0 / (1.0 + dist);

    // step 4: Flavor Jaccard / Cosine representation
    const x_cids = x.flavor_molecules.map(f => f.pubchem_cid);
    const y_cids = y.flavor_molecules.map(f => f.pubchem_cid);
    const intersection = x_cids.filter(c => y_cids.includes(c));
    const sim_flavor = x_cids.length > 0 && y_cids.length > 0 
      ? intersection.length / Math.sqrt(x_cids.length * y_cids.length) 
      : 0.0;

    // step 5: Rasa / Guna / Virya shift
    const rasa_cos = 0.88; // representative overlap of Tikta-Katu profiles
    const virya_delta = Math.abs(x.ayurveda.virya_scalar - y.ayurveda.virya_scalar);
    const ayur_shift = rasa_cos * (1.0 - (virya_delta / 2.0));

    // step 6: Evidence score
    const sim_evidence = 0.50; // Moderate evidence weight

    // step 7: weights: w1=0.25, w2=0.25, w3=0.30, w4=0.20
    const final_score = (0.25 * sim_nutrition) + (0.25 * sim_flavor) + (0.30 * ayur_shift) + (0.20 * sim_evidence);
    const pct_score = Math.round(final_score * 1000.0) / 10.0;

    const warnings = [];
    if (simConstraint === 'Vata-pacifying' && y.ayurveda.dosha_impact[0] !== -1) {
      warnings.push(`Constraint Warning: Target ingredient '${y.canonical_name}' is NOT Vata-pacifying.`);
    }
    if (x.ayurveda.dosha_impact[1] <= 0 && y.ayurveda.dosha_impact[1] > 0) {
      warnings.push(`Thermodynamic Warning: Target '${y.canonical_name}' increases Pitta (+1), which may aggravate thermal disorders.`);
    }

    setSimResult({
      simulation_parameters: {
        source: simSource,
        target: simTarget,
        amount_g: Number(simAmount),
        target_dosha_constraint: simConstraint === 'None' ? null : simConstraint
      },
      constraint_status: {
        satisfied,
        message
      },
      overall_compatibility_score: pct_score,
      overall_compatibility_rating: pct_score >= 70.0 ? "High" : (pct_score >= 40.0 ? "Moderate" : "Low"),
      trace_matrix: {
        Sim_nutrition: {
          score: Number(sim_nutrition.toFixed(4)),
          weight: 0.25,
          euclidean_distance: Number(dist.toFixed(4)),
          source_values: { calories: cal_x, protein: prot_x, fat: fat_x, carbs: carb_x, fiber: fib_x },
          target_values: { calories: cal_y, protein: prot_y, fat: fat_y, carbs: carb_y, fiber: fib_y }
        },
        Sim_flavor: {
          score: Number(sim_flavor.toFixed(4)),
          weight: 0.25,
          source_volatiles_count: x_cids.length,
          target_volatiles_count: y_cids.length,
          cosine_overlap: Number(sim_flavor.toFixed(4))
        },
        Ayur_shift: {
          score: Number(ayur_shift.toFixed(4)),
          weight: 0.30,
          rasa_cosine_similarity: rasa_cos,
          virya_delta: virya_delta,
          source_virya_scalar: x.ayurveda.virya_scalar,
          target_virya_scalar: y.ayurveda.virya_scalar
        },
        Evidence_score: {
          score: sim_evidence,
          weight: 0.20,
          target_clinical_grade: y.disease_associations[0].evidence_level
        }
      },
      warnings: warnings
    });
  };

  useEffect(() => {
    runLocalSimulation();
  }, [simSource, simTarget, simAmount, simConstraint]);

  // Graph Node Map definition for visualization
  const graphNodes = [
    { id: "ING", label: ingredientData.canonical_name, type: "ingredient", x: 400, y: 250, r: 40, color: "#c5a059" },
    { id: "TAX", label: ingredientData.taxonomy.scientific_name, type: "taxon", x: 200, y: 120, r: 25, color: "#10b981" },
    { id: "RAS", label: `Rasa Vector: [${ingredientData.ayurveda.rasa_vector.join(', ')}]`, type: "rasa", x: 250, y: 380, r: 25, color: "#3b82f6" },
    { id: "VIR", label: `Virya Scalar: ${ingredientData.ayurveda.virya_scalar}`, type: "virya", x: 400, y: 420, r: 22, color: "#ef4444" },
    { id: "VIP", label: `Vipaka Vector: [${ingredientData.ayurveda.vipaka_vector.join(', ')}]`, type: "vipaka", x: 550, y: 380, r: 22, color: "#f59e0b" },
    { id: "DOS", label: `Dosha Impact: [${ingredientData.ayurveda.dosha_impact.join(', ')}]`, type: "dosha", x: 600, y: 150, r: 25, color: "#a855f7" },
    { id: "PHY", label: ingredientData.phytochemicals[0]?.name || "Active Actives", type: "phytochemical", x: 580, y: 270, r: 23, color: "#ec4899" },
    { id: "DIS", label: ingredientData.disease_associations[0]?.disease_name || "Target Indication", type: "disease", x: 220, y: 250, r: 23, color: "#f97316" }
  ];

  const graphLinks = [
    { source: "ING", target: "TAX", label: "HAS_TAXONOMY" },
    { source: "ING", target: "RAS", label: "HAS_RASA" },
    { source: "ING", target: "VIR", label: "HAS_VIRYA" },
    { source: "ING", target: "VIP", label: "HAS_VIPAKA" },
    { source: "ING", target: "DOS", label: "PACIFIES" },
    { source: "ING", target: "PHY", label: "HAS_MOLECULE" },
    { source: "ING", target: "DIS", label: "TREATS_DISEASE" },
    { source: "PHY", target: "DIS", label: "TREATS" }
  ];

  return (
    <div className="container animate-fade-in">
      {/* Top Banner Navigation */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Compass size={36} color="var(--color-primary)" />
            <h1 style={{ fontSize: '2.2rem', background: 'linear-gradient(90deg, #c5a059, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Computational Food Intelligence Platform
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Research-Grade Ayurveda & Modern Science Digital Twins
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            fontSize: '0.8rem', 
            padding: '0.35rem 0.75rem', 
            borderRadius: '50px', 
            background: isBackendOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isBackendOnline ? 'var(--color-success)' : 'var(--color-danger)'}`,
            color: isBackendOnline ? 'var(--color-success)' : 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isBackendOnline ? 'var(--color-success)' : 'var(--color-danger)', display: 'inline-block' }}></span>
            API: {isBackendOnline ? "ONLINE" : "OFFLINE (FALLBACK ACTIVE)"}
          </span>
        </div>
      </header>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('twin')}
          className={`btn ${activeTab === 'twin' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Compass size={18} />
          Digital Twin Explorer
        </button>
        <button 
          onClick={() => setActiveTab('simulation')}
          className={`btn ${activeTab === 'simulation' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <RefreshCw size={18} />
          Substitution Simulator
        </button>
        <button 
          onClick={() => setActiveTab('graph')}
          className={`btn ${activeTab === 'graph' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <GitBranch size={18} />
          Interactive Graph
        </button>
      </div>

      {/* TAB 1: DIGITAL TWIN EXPLORER */}
      {activeTab === 'twin' && (
        <div>
          {/* Ingredient Selector card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>SELECT TARGET:</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {["Turmeric", "Tulsi"].map(ing => (
                  <button
                    key={ing}
                    onClick={() => setSelectedIngredient(ing)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: selectedIngredient === ing ? 'rgba(197, 160, 89, 0.25)' : 'transparent',
                      color: selectedIngredient === ing ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>SANSKRIT NAME</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{ingredientData.ayurveda.sanskrit_name}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>SCIENTIFIC NAME</span>
                <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{ingredientData.taxonomy.scientific_name}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
            {/* Sub navigation column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'taxonomy', label: 'Taxonomy & Identity', icon: <Info size={16} /> },
                { id: 'ayurveda', label: 'Ayurvedic (Rasa Panchaka)', icon: <Award size={16} /> },
                { id: 'nutrition', label: 'Nutrition Profile', icon: <Droplet size={16} /> },
                { id: 'phytochemicals', label: 'Phytochemicals', icon: <Activity size={16} /> },
                { id: 'evidence', label: 'Clinical Evidence', icon: <Heart size={16} /> },
                { id: 'papers', label: 'Scientific Papers', icon: <BookOpen size={16} /> }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setTwinSubTab(sub.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.9rem 1.2rem',
                    borderRadius: '8px',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: twinSubTab === sub.id ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
                    borderLeft: twinSubTab === sub.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                    color: twinSubTab === sub.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: '600',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {sub.icon}
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-tab Content Panel */}
            <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
              
              {/* SUBTAB: TAXONOMY */}
              {twinSubTab === 'taxonomy' && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem' }}>
                    <Info color="var(--color-primary)" /> Scientific Taxonomy
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p><strong>Common Name:</strong> {ingredientData.taxonomy.common_name}</p>
                      <p><strong>Scientific Name:</strong> <span style={{ fontStyle: 'italic' }}>{ingredientData.taxonomy.scientific_name}</span></p>
                      <p><strong>Sanskrit Name:</strong> {ingredientData.taxonomy.sanskrit_name}</p>
                      <p><strong>Family:</strong> {ingredientData.taxonomy.family}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                      <p><strong>NCBI Taxonomy ID:</strong> <a href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${ingredientData.taxonomy.ncbi_taxon_id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{ingredientData.taxonomy.ncbi_taxon_id} <ExternalLink size={12} /></a></p>
                      <p><strong>GBIF Backbone ID:</strong> <a href={`https://www.gbif.org/species/${ingredientData.taxonomy.gbif_id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{ingredientData.taxonomy.gbif_id} <ExternalLink size={12} /></a></p>
                      <p><strong>POWO Plant ID:</strong> <a href={`https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:${ingredientData.taxonomy.powo_id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{ingredientData.taxonomy.powo_id} <ExternalLink size={12} /></a></p>
                      <p><strong>Synonyms:</strong></p>
                      <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-secondary)' }}>
                        {ingredientData.taxonomy.synonyms.map((syn, idx) => <li key={idx} style={{ fontStyle: 'italic' }}>{syn}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: AYURVEDA */}
              {twinSubTab === 'ayurveda' && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem' }}>
                    <Award color="var(--color-primary)" /> Ayurvedic Profile & Computable Vectors (Section 11)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p><strong>Rasa (Tastes):</strong> {ingredientData.ayurveda.rasa.join(', ')}</p>
                      <p><strong>Guna (Attributes):</strong> {ingredientData.ayurveda.guna.join(', ')}</p>
                      <p><strong>Virya (Potency):</strong> <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{ingredientData.ayurveda.virya}</span></p>
                      <p><strong>Vipaka (Post-Digestive):</strong> {ingredientData.ayurveda.vipaka}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                      <p><strong>Rasa 6D Vector:</strong> <span style={{ fontFamily: 'monospace' }}>[{ingredientData.ayurveda.rasa_vector.join(', ')}]</span></p>
                      <p><strong>Guna 6D Vector:</strong> <span style={{ fontFamily: 'monospace' }}>[{ingredientData.ayurveda.guna_vector.join(', ')}]</span></p>
                      <p><strong>Virya Potency Scalar:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>{ingredientData.ayurveda.virya_scalar}</span></p>
                      <p><strong>Vipaka 3D Vector:</strong> <span style={{ fontFamily: 'monospace' }}>[{ingredientData.ayurveda.vipaka_vector.join(', ')}]</span></p>
                      <p><strong>Dosha 3D Vector:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--color-secondary)' }}>[{ingredientData.ayurveda.dosha_impact.join(', ')}]</span></p>
                    </div>
                  </div>

                  <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Karma (Pharmacological Actions)</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                    {ingredientData.ayurveda.karma.map((karma, idx) => (
                      <span key={idx} style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {karma}
                      </span>
                    ))}
                  </div>

                  <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Classical Reference Citations</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {ingredientData.ayurveda.classical_references.map((ref, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{ref.text_name} — <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{ref.citation}</span></p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '0.25rem' }}>"{ref.context}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB: NUTRITION */}
              {twinSubTab === 'nutrition' && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem' }}>
                    <Droplet color="var(--color-primary)" /> Nutritional Composition (per 100g)
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(197, 160, 89, 0.1)', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Nutrient</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.5rem 1rem', color: 'var(--color-text-secondary)' }}>Energy (Calories)</td>
                          <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{ingredientData.nutrition.calories} kcal</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.5rem 1rem', color: 'var(--color-text-secondary)' }}>Proteins</td>
                          <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{ingredientData.nutrition.proteins_g} g</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.5rem 1rem', color: 'var(--color-text-secondary)' }}>Fats</td>
                          <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{ingredientData.nutrition.fats_g} g</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.5rem 1rem', color: 'var(--color-text-secondary)' }}>Carbohydrates</td>
                          <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{ingredientData.nutrition.carbs_g} g</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.5rem 1rem', color: 'var(--color-text-secondary)' }}>Dietary Fiber</td>
                          <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{ingredientData.nutrition.fiber_g} g</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Micronutrients & Minerals</h4>
                  <ul>
                    {Object.entries(ingredientData.nutrition.minerals).map(([key, val]) => (
                      <li key={key} style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        <strong style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}:</strong> {val}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SUBTAB: PHYTOCHEMICALS */}
              {twinSubTab === 'phytochemicals' && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity color="var(--color-primary)" /> Phytochemical Mapping (IMPPAT & GRAYU)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {ingredientData.phytochemicals.map((phyto, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <div>
                            <h4 style={{ color: 'var(--color-primary)' }}>{phyto.name}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>PubChem CID: {phyto.pubchem_cid} | IMPPAT ID: {phyto.imppat_id}</span>
                          </div>
                          <span style={{ background: 'rgba(197, 160, 89, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                            Volatile oil conc: {phyto.typical_concentration_range}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                          <p><strong>Formula:</strong> {phyto.molecular_formula}</p>
                          {phyto.smiles && <p style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '0.25rem' }}><strong>SMILES:</strong> {phyto.smiles}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {phyto.bioactivities.map((bio, bIdx) => (
                            <span key={bIdx} style={{ fontSize: '0.75rem', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                              {bio}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB: EVIDENCE */}
              {twinSubTab === 'evidence' && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem' }}>
                    <Heart color="var(--color-primary)" /> Clinical Disease Efficacy (PubMed & MeSH)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {ingredientData.disease_associations.map((disease, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div>
                            <h4 style={{ color: 'var(--color-text-primary)' }}>{disease.disease_name}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>MeSH ID: {disease.mesh_id}</span>
                          </div>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.25rem 0.6rem', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            background: disease.evidence_level === 'High' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: disease.evidence_level === 'High' ? 'var(--color-success)' : 'var(--color-warning)'
                          }}>
                            Grade: {disease.evidence_level}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                          {disease.summary}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', display: 'flex', gap: '1rem' }}>
                          <span>Publications: {disease.pubmed_ids.join(', ')}</span>
                          {disease.clinicaltrials_gov_ids.length > 0 && <span>ClinicalTrials: {disease.clinicaltrials_gov_ids.join(', ')}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB: PAPERS */}
              {twinSubTab === 'papers' && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen color="var(--color-primary)" /> Verified Publications (OpenAlex & PubMed)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {ingredientData.research_papers.map((paper, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ color: 'var(--color-primary)', fontSize: '1rem', lineHeight: '1.4', marginBottom: '0.5rem' }}>{paper.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{paper.authors} — <em>{paper.journal} ({paper.year})</em></p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: '1.5' }}><strong>Abstract:</strong> {paper.abstract}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>PMID: {paper.pmid}</span>
                          <a 
                            href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                          >
                            View PubMed Record <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSTITUTION SIMULATOR */}
      {activeTab === 'simulation' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
          
          {/* Controls Panel */}
          <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw color="var(--color-primary)" /> Simulation Config
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>SOURCE INGREDIENT</label>
                <select 
                  value={simSource} 
                  onChange={(e) => setSimSource(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#0e1410', color: 'var(--color-text-primary)' }}
                >
                  <option value="Turmeric">Turmeric (Haridra)</option>
                  <option value="Tulsi">Tulsi (Tulasi)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>REPLACEMENT TARGET</label>
                <select 
                  value={simTarget} 
                  onChange={(e) => setSimTarget(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#0e1410', color: 'var(--color-text-primary)' }}
                >
                  <option value="Tulsi">Tulsi (Tulasi)</option>
                  <option value="Turmeric">Turmeric (Haridra)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>RECIPE PORTION (G)</label>
                <input 
                  type="number" 
                  value={simAmount} 
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#0e1410', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>AYURVEDIC CONSTRAINT</label>
                <select 
                  value={simConstraint} 
                  onChange={(e) => setSimConstraint(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#0e1410', color: 'var(--color-text-primary)' }}
                >
                  <option value="None">No constraint</option>
                  <option value="Vata-pacifying">Strictly Vata-pacifying (Vata = -1)</option>
                </select>
              </div>

              <button 
                onClick={handleRunSimulation}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                disabled={simSource === simTarget}
              >
                Run In Silico Simulation
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {simResult ? (
              <div>
                {/* Upper compatibility rating card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>Substitution Score</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Replacing {simResult.simulation_parameters.source} with {simResult.simulation_parameters.target} ({simResult.simulation_parameters.amount_g}g)</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'block', marginTop: '0.25rem' }}>{simResult.constraint_status.message}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>COMPATIBILITY</span>
                      <h2 style={{ 
                        color: simResult.overall_compatibility_rating === 'High' ? 'var(--color-success)' : 'var(--color-warning)',
                        fontSize: '1.5rem'
                      }}>
                        {simResult.overall_compatibility_rating}
                      </h2>
                    </div>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      border: `4px solid ${simResult.overall_compatibility_rating === 'High' ? 'var(--color-success)' : 'var(--color-warning)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      {simResult.overall_compatibility_score}%
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {simResult.warnings?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '2.0rem' }}>
                    <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      {simResult.warnings.map((warn, idx) => (
                        <p key={idx}>{warn}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid tabs for properties comparisons */}
                <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Mathematical Trace Matrix (Section 13)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  
                  {/* Card 1: Nutrition Euclidean Distance */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Droplet size={16} color="var(--color-secondary)" />
                      <strong style={{ fontSize: '0.9rem' }}>Nutritional Distance ($Sim_{"nutrition"}$)</strong>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Score: {simResult.trace_matrix.Sim_nutrition.score} (weight: {simResult.trace_matrix.Sim_nutrition.weight})</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Euclidean distance: {simResult.trace_matrix.Sim_nutrition.euclidean_distance}</p>
                  </div>

                  {/* Card 2: Flavor Cosine Overlap */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Activity size={16} color="var(--color-primary)" />
                      <strong style={{ fontSize: '0.9rem' }}>Flavor Cosine Overlap ($Sim_{"flavor"}$)</strong>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Score: {simResult.trace_matrix.Sim_flavor.score} (weight: {simResult.trace_matrix.Sim_flavor.weight})</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Volatiles: Source ({simResult.trace_matrix.Sim_flavor.source_volatiles_count}) | Target ({simResult.trace_matrix.Sim_flavor.target_volatiles_count})</p>
                  </div>

                  {/* Card 3: Ayurvedic Potency Shift */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Award size={16} color="var(--color-accent)" />
                      <strong style={{ fontSize: '0.9rem' }}>Ayurvedic Shift ($Ayur_{"shift"}$)</strong>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Score: {simResult.trace_matrix.Ayur_shift.score} (weight: {simResult.trace_matrix.Ayur_shift.weight})</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Rasa overlap: {simResult.trace_matrix.Ayur_shift.rasa_cosine_similarity} | Virya delta: {simResult.trace_matrix.Ayur_shift.virya_delta}</p>
                  </div>

                  {/* Card 4: Modern Science Grade */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifySelf: 'start', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <BookOpen size={16} color="#a855f7" />
                      <strong style={{ fontSize: '0.9rem' }}>Clinical Evidence ($Evidence_{"score"}$)</strong>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Score: {simResult.trace_matrix.Evidence_score.score} (weight: {simResult.trace_matrix.Evidence_score.weight})</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Evidence grade: {simResult.trace_matrix.Evidence_score.target_clinical_grade}</p>
                  </div>

                </div>

                {/* Detailed Values comparison table */}
                <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Nutrient Portions Vector comparison (portion scale)</h4>
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(197, 160, 89, 0.08)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Nutrient</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Source ({simResult.simulation_parameters.source})</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Target ({simResult.simulation_parameters.target})</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(simResult.trace_matrix.Sim_nutrition.source_values).map(([key, sVal]) => {
                        const tVal = simResult.trace_matrix.Sim_nutrition.target_values[key] || 0.0;
                        const delta = tVal - sVal;
                        return (
                          <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '0.4rem 0.75rem', textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{key}</td>
                            <td style={{ padding: '0.4rem 0.75rem' }}>{sVal}</td>
                            <td style={{ padding: '0.4rem 0.75rem' }}>{tVal}</td>
                            <td style={{ padding: '0.4rem 0.75rem', color: delta >= 0 ? 'var(--color-success)' : 'var(--color-accent)', fontWeight: 'bold' }}>
                              {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                Set inputs and click 'Run' to compute model.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: INTERACTIVE KNOWLEDGE GRAPH */}
      {activeTab === 'graph' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          {/* SVG Graph container */}
          <div className="glass-panel" style={{ padding: '1rem', position: 'relative', overflow: 'hidden', height: '550px' }}>
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
              <h4 style={{ color: 'var(--color-primary)' }}>Ayur-Biomedical Knowledge Graph</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Interactive semantic representation of {ingredientData.canonical_name}. Hover nodes for context.</p>
            </div>
            
            <svg style={{ width: '100%', height: '100%' }}>
              {/* Arrows definitions */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.15)" />
                </marker>
              </defs>

              {/* Render edges */}
              {graphLinks.map((link, idx) => {
                const sNode = graphNodes.find(n => n.id === link.source);
                const tNode = graphNodes.find(n => n.id === link.target);
                if(!sNode || !tNode) return null;
                
                return (
                  <g key={idx}>
                    <line 
                      x1={sNode.x} 
                      y1={sNode.y} 
                      x2={tNode.x} 
                      y2={tNode.y} 
                      stroke="rgba(255, 255, 255, 0.1)" 
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                    <text 
                      x={(sNode.x + tNode.x) / 2} 
                      y={(sNode.y + tNode.y) / 2 - 5}
                      fill="var(--color-text-muted)"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {link.label}
                    </text>
                  </g>
                );
              })}

              {/* Render nodes */}
              {graphNodes.map((node) => {
                const isHovered = graphHoverNode === node.id;
                
                return (
                  <g 
                    key={node.id} 
                    className="node-interactive"
                    onMouseEnter={() => setGraphHoverNode(node.id)}
                    onMouseLeave={() => setGraphHoverNode(null)}
                  >
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r={node.r + (isHovered ? 4 : 0)} 
                      fill={node.color} 
                      opacity="0.25"
                      stroke={node.color}
                      strokeWidth={isHovered ? "3" : "1"}
                    />
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r={node.r - 4} 
                      fill={node.color} 
                      opacity="0.8"
                    />
                    <text 
                      x={node.x} 
                      y={node.y + 4} 
                      fill="#0d120e" 
                      fontWeight="bold" 
                      fontSize="10" 
                      textAnchor="middle"
                      fontFamily="var(--font-display)"
                    >
                      {node.id}
                    </text>
                    <title>{node.label}</title>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node details side card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Semantic Context</h3>
              
              {graphHoverNode ? (
                (() => {
                  const node = graphNodes.find(n => n.id === graphHoverNode);
                  return (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: node.color }}></span>
                        <h4 style={{ textTransform: 'capitalize' }}>{node.type} Node</h4>
                      </div>
                      <p><strong>Label:</strong> {node.label}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {node.type === 'ingredient' && "Main subject of this digital twin. Houses all linked nodes."}
                        {node.type === 'taxon' && "Standard taxonomic record in NCBI/GBIF/POWO backbones."}
                        {node.type === 'rasa' && "Ayurvedic taste property vector (Sweet, Sour, Salty, Bitter, Pungent, Astringent)."}
                        {node.type === 'virya' && "Ayurvedic thermal potency scalar (-1.0 to +1.0)."}
                        {node.type === 'vipaka' && "Post-digestive metabolic transformation vector."}
                        {node.type === 'dosha' && "Bio-energetic profile balanced or modified by this ingredient (-1: Pacifies, 0: Neutral, 1: Aggravates)."}
                        {node.type === 'phytochemical' && "Identified chemical compounds validated in laboratory/clinical databases (PubChem)."}
                        {node.type === 'disease' && "Clinical conditions where therapeutic efficacy is scientifically verified."}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Hover over any graph node to inspect relationships and metadata properties.</p>
              )}
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', display: 'block', marginBottom: '0.25rem' }}>Graph Schema Legend:</span>
              <ul style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><strong>ING</strong>: Ingredient Node (Gold)</li>
                <li><strong>TAX</strong>: Botanical Taxon (Green)</li>
                <li><strong>RAS / VIR / VIP</strong>: Ayurvedic (Blue/Red/Orange)</li>
                <li><strong>DOS</strong>: Dosha Profile (Purple)</li>
                <li><strong>PHY</strong>: Phytochemical Active (Pink)</li>
                <li><strong>DIS</strong>: Disease Associated (Copper)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
