# Computational Food Intelligence Platform
## Ayurveda & Modern Science Digital Twin Prototype (IIIT-Delhi BTP/IP Research Blueprint)

This repository contains a working research prototype for the **Computational Food Intelligence Platform**. It demonstrates the technical feasibility of merging ancient qualitative Ayurvedic pharmacodynamics (Rasa Panchaka) with modern quantitative biomedical science (phytochemistry, nutritional values, flavor molecules, and clinical evidence) into unified computational objects: **Food Digital Twins**.

To prove this architecture, the prototype provides full implementation for **two primary ingredients**:
1.  **Turmeric** (*Curcuma longa* / *Haridra*)
2.  **Tulsi** (*Ocimum tenuiflorum* / *Tulasi*)

---

## 🛠️ Project Folder Structure
```
Computational-Food-Intelligence-Platform/
├── data/
│   ├── raw/                      # Raw text extracts and OCR source files
│   └── processed/                # Normalized JSON Digital Twins and NLP outputs
│       ├── turmeric_twin.json    # Complete digital twin of Turmeric
│       ├── tulsi_twin.json       # Complete digital twin of Tulsi
│       └── nlp_extraction_results.json
├── scripts/
│   ├── collect_data.py           # Core ingestion and twin building script
│   ├── pdf_extract.py            # PDF Monograph parser (OCR normalization)
│   └── nlp_extract.py            # NLP entity extraction and dictionary tagging
├── database/
│   ├── postgres_schema.sql       # Normalized relational schema (PostgreSQL)
│   └── neo4j_schema.cypher       # Graph schema & Cypher query template (Neo4j)
├── backend/
│   ├── main.py                   # FastAPI service (endpoints: /ingredient, /simulate)
│   └── requirements.txt          # Python dependencies (fastapi, uvicorn, pydantic)
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # React dashboard, simulator UI, SVG Graph
│   │   ├── index.css             # Botanical styling system (dark glassmorphism)
│   │   └── main.jsx
│   ├── index.html                # SEO-optimized markup
│   ├── package.json
│   └── vite.config.js
├── docs/
│   └── RESEARCH_DOSSIER.md       # Complete 18-section technical due diligence report
└── README.md                     # Main instruction file and scaling blueprint
```

---

## 🚀 Getting Started

### 1. Backend Setup & Run
Prerequisites: Python 3.8+
```bash
# Install dependencies
pip3 install -r backend/requirements.txt

# Run the FastAPI server
python3 backend/main.py
```
The backend API will run on `http://127.0.0.1:8000`. You can explore the interactive documentation (Swagger) at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup & Run
Prerequisites: Node.js v18+
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. The frontend dashboard works in dual-mode: it queries the local FastAPI endpoints if online, and automatically falls back to static high-fidelity data if offline.

---

## 🔬 Computational Formulation

### 1. Ingestion Pipeline
*   **Ayurveda**: Standard monographs from the *Ayurvedic Pharmacopoeia of India (API)* are parsed to extract core attributes: Rasa (Taste), Guna (Physical attributes), Virya (Potency), Vipaka (Post-digestive effect), and Dosha-karma.
*   **Nutrition**: Quantitative values per 100g are sourced from *USDA FoodData Central* and *Indian Food Composition Tables (IFCT)*.
*   **Phytochemistry**: Active compounds are mapped via *IMPPAT* and *PubChem CIDs*.
*   **Volatiles**: Volatile flavor compounds are mapped to *FlavorDB* identifiers.
*   **Evidence**: Validated human trials and systemic reviews are mapped via *PubMed PMIDs* and *ClinicalTrials.gov NCT IDs*.

### 2. Substitution Simulation Equation
When substituting ingredient $S$ with $T$ in a portion of $m$ grams, the platform computes:
1.  **Nutritional Distance**: 
    $$D_N(S, T) = \sqrt{\sum_{k} w_k \left( N_{S,k} - N_{T,k} \right)^2}$$
2.  **Flavor Overlap (Jaccard Index)**: 
    $$S_F(S, T) = \frac{|F_S \cap F_T|}{|F_S \cup F_T|}$$
3.  **Ayurvedic Dosha Conflict**: 
    $$\Delta\vec{D} = \vec{D}_T - \vec{D}_S$$
    If any element of $\Delta\vec{D} > 0$ for a dosha that should be pacified, a warning is raised (e.g. Pitta escalation).

---

## 📈 Scaling Blueprint (From 2 to 2,000 Ingredients)

To scale this platform to include the full spectrum of ingredients, agricultural crops, and medicinal plants, the following engineering pipeline must be deployed:

### Phase A: Automated High-Throughput Scrapers (Months 1–3)
1.  **IMPPAT Bulk Mining**: Write a parallelized scraping script using Python `asyncio` and `BeautifulSoup` to crawl IMPPAT's 1,742 plant monographs, downloading their complete phytochemical mapping tables.
2.  **USDA & PubChem API Integration**:
    *   Query the USDA API (`https://api.nal.usda.gov/fdc/v1/foods/search`) in batches to retrieve nutritional compositions.
    *   Utilize PubChem PUG REST (`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/...`) to fetch molecular structures (SMILES, InChIKey) and canonical synonyms for every phytochemical retrieved from IMPPAT.
3.  **PDF OCR for Ayurvedic Monographs**:
    *   Deploy `layoutparser` (deep-learning layout analysis) and `pytesseract` to extract monographs from the 10 volumes of the *Ayurvedic Pharmacopoeia of India* (PDF formats).
    *   Use dictionary-based regex classifiers to segment text into sections (Rasa, Guna, Virya, Vipaka, Formulations).

### Phase B: Automated Entity Resolution (Months 4–6)
1.  **Cross-Database Linkage**:
    Map vernacular names (Sanskrit, Hindi, Tamil, English) to canonical Latin taxonomy IDs.
    *   Run matching queries against the GBIF backbone API: `https://api.gbif.org/v1/species/match?name={query_string}`.
    *   Anchor synonyms (e.g., *Ocimum sanctum* vs. *Ocimum tenuiflorum*) using the POWO (Plants of the World Online) database.
2.  **NLP Entity Extraction**:
    Train a Named Entity Recognition (NER) model (using SpaCy or BioBERT fine-tuned on medicinal texts) to automatically identify and extract phytochemical names, disease states, and dosage instructions from clinical abstracts.

### Phase C: Graph Loading & Neo4j Seed Scripts (Months 7–9)
1.  **Neo4j Load CSV**:
    Convert the parsed data tables into node tables (`ingredients.csv`, `compounds.csv`, `diseases.csv`, `publications.csv`) and relationship tables (`contains_compound.csv`, `treats_disease.csv`).
2.  **Bulk Cypher Import**:
    Run high-speed batch imports using Neo4j's Admin Import tool:
    ```cypher
    LOAD CSV WITH HEADERS FROM 'file:///contains_compound.csv' AS row
    MATCH (i:Ingredient {id: row.ingredient_id})
    MATCH (p:Phytochemical {pubchem_cid: toInteger(row.cid)})
    MERGE (i)-[:CONTAINS_PHYTOCHEMICAL {concentration: row.conc}]->(p);
    ```

### Phase D: Knowledge Graph Embeddings & Link Prediction (Months 10–12)
1.  **Imputation of Missing Links**:
    In large-scale biological networks, data is often incomplete (e.g., a plant contains a phytochemical, but its therapeutic trial has not been conducted).
2.  **Model Training**:
    Train graph embedding algorithms (e.g., Node2Vec, TransE, or Graph Convolutional Networks) on the Neo4j schema.
3.  **Predictive Pharmacology**:
    Predict missing relationships (e.g. `[:TREATS_DISEASE]`) based on structural node similarities and phytochemical profiles, highlighting novel candidates for drug discovery and culinary-medicinal substitution.
