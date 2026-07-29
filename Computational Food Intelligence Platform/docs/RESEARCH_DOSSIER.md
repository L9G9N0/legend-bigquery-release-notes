# Technical Due Diligence Report: Computational Food Intelligence Platform

## Section 1: Complete Survey of Existing Datasets
The foundation of the proposed Computational Food Intelligence Platform necessitates the integration of disparate data silos that span computational gastronomy, Ayurvedic pharmacology, modern phytochemistry, and biomedical literature. An exhaustive evaluation of currently available public datasets reveals a highly fragmented landscape. While chemical and nutritional spaces are well-documented, the translation of traditional medicinal properties into structured, computable formats remains scarce. The following table identifies and evaluates the core datasets required to construct the platform's multi-modal knowledge graph, detailing their structural characteristics, licensing constraints, and inherent limitations.

| Dataset Name | Owner / Maintainer | Website / API Link | Documentation | License | Research / Commercial Use | Format | Size / Records | Last Updated | Coverage & Quality | Limitations / Missing Data |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **IMPPAT 2.0** | Areejit Samal Lab, IMSc | cb.imsc.res.in/imppat | ACS Omega Figshare, GitHub | Open Access | Research: Yes / Commercial: Not Found | CSV, Python scripts | 4,010 plants, 17,967 phytochemicals, 1,095 uses | 2022 | High quality, manually curated, stereo-aware library | No live API found; requires manual static download. |
| **GRAYU** | NCBS (India) | caps.ncbs.res.in/GRAYU | Frontiers in Pharmacology | CC-BY | Research: Yes / Commercial: Not Found | CSV, Neo4j Graph | 1,039 formulations, 12,743 plants, 129,542 chemicals | 2024 | Integrates CMAUP, FooDB, HMDB, IMPPAT | Graph structure relies on static CSV dumps; no dynamic API. |
| **FlavorDB2** | CoSyLab, IIIT-Delhi | cosylab.iiitd.edu.in/flavordb2 | Scientific publication | CC BY-NC-ND 4.0 | Research: Yes / Commercial: No | JSON, CSV (via request) | 25,595 molecules, 936 ingredients | 2024 | Extensive flavor thresholds, ADMET, natural occurrence | Closed API; bulk data access restricted by non-commercial license. |
| **SpiceRx** | CoSyLab, IIIT-Delhi | cosylab.iiitd.edu.in/spicerx | Scientific publication | CC BY-NC-ND 4.0 | Research: Yes / Commercial: No | Web interface | 188 spices, extensive phytochemicals | 2018 | High-quality text-mining derived disease-spice associations | Proprietary backend; requires scraping or institutional collaboration. |
| **RecipeDB** | CoSyLab, IIIT-Delhi | cosylab.iiitd.edu.in/recipedb | Scientific publication | CC BY-NC-ND 4.0 | Research: Yes / Commercial: No | Web interface | 118,000+ recipes | 2022 | Global cuisine coverage, ingredient structured data | Lacks explicit per-recipe nutritional mapping. |
| **DietRx** | CoSyLab, IIIT-Delhi | cosylab.iiitd.edu.in/dietrx | Scientific publication | CC BY-NC-ND 4.0 | Research: Yes / Commercial: No | Web interface | 2,222 foods, 6,992 chemicals, 20,550 genes | 2020 | Connects food to diseases via genes and chemicals | No downloadable bulk data identified. |
| **OpenAlex** | OurResearch | api.openalex.org/works | docs.openalex.org | CC0 | Research: Yes / Commercial: Yes | JSON REST API | 250M+ scholarly works | Daily | Exhaustive modern science bibliometrics and citation graphs | Legacy concepts taxonomy is deprecated; rate limits apply without key. |
| **USDA FoodData Central** | USDA | api.nal.usda.gov/fdc/v1 | fdc.nal.usda.gov/api-guide | Public Domain | Research: Yes / Commercial: Yes | JSON REST API | 380,000+ foods | 2024 | Gold standard for US nutrition profiles and micronutrients | Limited coverage of Ayurvedic or endemic Indian botanical species. |
| **IFCT 2017** | NIN (India) | Kaggle mirror | PDF Report | Public | Research: Yes / Commercial: Not Found | CSV, PDF | 528 key foods | 2017 | Highly accurate for Indian diets | Small sample size; no live API available. |
| **POWO** | Kew Gardens | powo.science.kew.org | Apify documentation | CC BY 3.0 | Research: Yes / Commercial: Yes | JSON REST API / Web endpoints | 1.4M names | Continuous | Gold standard for global plant taxonomy and synonyms | Schema changes frequently; rate limiting on endpoints. |
| **ChEBI** | EMBL-EBI | ebi.ac.uk/chebi | API Spec provided | Public Domain | Research: Yes / Commercial: Yes | JSON REST API | Thousands of metabolites | Continuous | Links compounds to biological roles and structures | Complex hierarchical querying requires local caching. |
| **NAMASTE Portal** | Ministry of Ayush | namaste-ayush.gov.in | PDF manuals | Government | Research: Yes / Commercial: Not Found | Excel, PDF | 7,314 morbidity codes | 2024 | Standardizes Ayurveda to ICD-11 TM2 framework | API not publicly exposed for bulk access; clinical data is siloed. |

The analysis of these datasets indicates that while raw data exists to build the proposed Computational Food Intelligence Platform, the data is heavily compartmentalized. The extraction of structured Ayurvedic principles must be synthesized manually or via natural language processing from digitized classical texts, while modern scientific validation relies on the integration of massive relational databases like OpenAlex and graph structures like GRAYU. The primary technical challenge will be executing a unified entity resolution strategy across these disparate formats to create a cohesive computational representation.

---

## Section 2: Ayurveda Data
The integration of Ayurvedic principles requires extracting highly structured, phenomenological data from both classical Sanskrit texts and modern digitized government repositories. The transition of traditional Indian medicine from qualitative philosophy to computable informatics has accelerated recently, yet significant data engineering is required to bridge the gap between ancient nosology and modern biological data structures.

The Ayurvedic Pharmacopoeia of India (API), maintained by the Ministry of Ayush, serves as the primary legal and scientific standard for single botanical drugs. However, this repository exists primarily in PDF format, necessitating advanced Natural Language Processing to extract structured data. The exact fields available within the API monographs include the Sanskrit Name, Latin Botanical Name, regional synonyms, macroscopic and microscopic descriptions, quantitative data (such as ash and extractive values), and the critical phenomenological attributes: Rasa (taste), Guna (physical property), Virya (thermal potency), Vipaka (post-digestive effect), and Karma (pharmacological action). These qualitative attributes represent a systems-level understanding of drug-body interactions that must be mathematically vectorized for the proposed platform.

To bridge this qualitative data with modern phytochemistry, the IMPPAT 2.0 database acts as an essential intermediary. Maintained by the Samal Lab, this dataset is the largest FAIR-compliant, in silico stereo-aware library of Indian medicinal plants. The exact fields available include the botanical name, specific plant parts used (e.g., stem, root, leaves), phytochemical names, 2D/3D molecular structures encoded as SMILES and InChI, physicochemical properties (ADMET), drug-likeness scores, and therapeutic uses. Similarly, the GRAYU knowledge graph structures this information into a multipartite format, mapping 1,039 Ayurvedic formulations to 12,743 plants and 129,542 chemicals. GRAYU's exact graph edges, which can be directly ingested into our platform, include relationships such as FOUND_IN (linking phytochemicals to plants via PubChem CIDs), ASSOCIATED_WITH_DISEASE (linking plants to MESH/DOID identifiers), and IS_INGREDIENT_IN.

Furthermore, the clinical validation of these Ayurvedic concepts is undergoing rapid standardization via the National Ayush Morbidity and Standardized Terminologies Electronic (NAMASTE) Portal. The NAMASTE portal aligns traditional Ayurvedic diagnoses with the World Health Organization's ICD-11 Traditional Medicine Module 2 (TM2) framework. The exact fields extractable from this portal include the Ayush Morbidity Code (e.g., AAE-16), the classical Ayurvedic diagnosis (e.g., Sandhigatavata), the corresponding ICD-11 TM2 Code, the medical system classification, and encounter types. Finally, emerging ontological frameworks such as AyuRAG and AyurKOSH provide structured vocabularies mapping Dravya (herbs), Dosha, Dhatu, and Vyadhi (disease) to canonical biomedical counterparts. The absence of comprehensive, publicly accessible REST APIs for the classical Samhitas (Charaka, Sushruta, Ashtanga Hridayam) remains a limitation, dictating that the initial prototype must rely on the manually curated subsets available in IMPPAT 2.0 and GRAYU.

---

## Section 3: Food Data
Food data encompasses a vast, multidimensional landscape comprising recipes, flavor molecules, health impacts, and nutritional profiles. The CoSyLab at IIIT-Delhi has pioneered the digitization of this domain through computational gastronomy, providing a suite of interconnected databases that form the backbone of this platform.

RecipeDB contains a structured repository of over 118,000 recipes from 74 countries, enabling cross-cultural culinary analysis. The exact fields include the recipe name, cuisine origin, ingredients mapped to standardized aliases, and processing techniques. To understand the molecular basis of these ingredients, FlavorDB2 maps 25,595 distinct flavor molecules to 936 natural ingredients across 34 categories. This dataset is exceptionally rich, providing fields for common names, FEMA numbers, CAS numbers, functional groups, specific aroma and taste threshold values, natural occurrence data, consumption statistics, molecular weight, and ADMET properties. The platform will utilize this molecular data to compute the sensory similarity between ingredients during the substitution process.

The health impacts of these culinary ingredients are captured by SpiceRx and DietRx. SpiceRx focuses on 188 culinary spices and herbs, linking them to therapeutic and adverse effects via text-mined biomedical literature. Its fields include phytochemical composition, MeSH disease categories, and molecular partition coefficients. DietRx expands this paradigm by mapping 2,222 food ingredients to diseases via 6,992 chemicals and 20,550 genes, creating a tripartite network of food-disease associations.

To ground this molecular and culinary data in quantifiable health metrics, rigorous nutritional datasets are required. The USDA FoodData Central (FDC) provides the global gold standard for nutritional profiles, offering a REST API that delivers fields such as FDC ID, detailed food descriptions, macronutrient and micronutrient amounts, derivation methodologies, and standard errors for over 380,000 foods. Because the USDA dataset has limited coverage of endemic Indian botanicals, the platform must cross-reference the Indian Food Composition Tables (IFCT 2017) published by the National Institute of Nutrition. Although smaller in scope, covering 528 key foods, IFCT 2017 provides highly accurate, localized baseline data for moisture, protein, fat, carbohydrates, fiber, vitamins, and trace minerals. The integration of these datasets provides the necessary parameters to evaluate the nutritional degradation or enhancement of any algorithmically proposed recipe substitution.

---

## Section 4: Modern Science
To validate Ayurvedic claims and evaluate the systemic health impacts of specific food substitutions, the platform must programmatically query massive repositories of modern biomedical science and phytochemistry. This ensures that the computational model is grounded in evidence-based medicine rather than purely historical texts.

The primary engine for literature retrieval and evidence ranking will be OpenAlex, an open catalog of the global research system that has successfully replaced the deprecated Microsoft Academic Graph. OpenAlex exposes 16 REST API endpoints representing over 250 million scholarly works, authors, institutions, topics, and funders. By utilizing the /works endpoint, the platform can dynamically retrieve scholarly documents associated with specific phytochemicals or diseases, extracting metadata such as citation counts, publication years, and referenced works. This citation graph allows the platform to build an automated literature review pipeline, assigning a quantitative evidence score to the therapeutic claims of specific Ayurvedic ingredients.

For chemical standardization, PubChem serves as the foundational reference. As demonstrated by the GRAYU database architecture, mapping phytochemical records to their corresponding PubChem Compound IDs (CIDs) ensures data integrity and prevents the duplication of molecular entities across diverse datasets. Furthermore, the Chemical Entities of Biological Interest (ChEBI) database provides a critical semantic layer, linking compounds to their biological roles. The ChEBI REST Web Services API allows the platform to validate whether a specific compound is an active metabolite, facilitating a deeper understanding of its systemic impact on human physiology. PubMed and Europe PMC, accessible via NCBI E-utilities, will supplement OpenAlex by providing full abstracts necessary for advanced Named Entity Recognition (NER) tasks, specifically for extracting complex tripartite relationships between dietary interventions, target genes, and disease outcomes.

---

## Section 5: Taxonomy
Taxonomic normalization is an absolute prerequisite for this platform. The extreme variance in botanical nomenclature—spanning classical Sanskrit, regional dialects, and evolving scientific classifications—creates significant barriers to data integration. A single entity must be deterministically linked across all datasets to prevent knowledge graph fragmentation.

The authoritative source for this resolution is Plants of the World Online (POWO), maintained by the Royal Botanic Gardens, Kew. POWO serves as the global taxonomic backbone, encompassing over 1.4 million plant names. The platform will leverage POWO's web endpoints and available scraping interfaces to resolve ambiguous plant names into canonical identifiers. For example, when processing data from the Ayurvedic Pharmacopoeia, a Sanskrit term will be mapped to its corresponding scientific name, which is then validated against POWO to retrieve the accepted taxon ID, standard botanical name, family, and all documented synonyms. This methodology mirrors the successful data integration pipeline utilized by the GRAYU database, which mapped external databases to POWO and the World Flora Online (WFO) to merge typographical variants and correct naming errors. Supplemental taxonomic validation will be conducted using the NCBI Taxonomy and the Global Biodiversity Information Facility (GBIF) APIs to ensure alignment with biomedical literature indexing and geographical distribution data.

---

## Section 6: Ontologies
To enable formal computational reasoning, semantic interoperability, and automated inference, the platform must integrate existing Web Ontology Language (OWL) and Resource Description Framework (RDF) structures. Reusing established ontologies ensures the knowledge graph remains standardized and interoperable with global bioinformatics initiatives.

The FoodOn ontology is a critical, highly reusable asset for this project. Built to interoperate with the Open Biomedical Ontologies (OBO) Library, FoodOn provides a comprehensive global farm-to-fork vocabulary representing entities that bear a "food role." It accurately describes food materials, their anatomical and taxonomic origins, processing methods, and structural components. The ontology is available in OWL format and is actively maintained via GitHub. The platform will utilize FoodOn to classify ingredients extracted from RecipeDB and match them to their biological origins. Complementing FoodOn is the Ontology for Nutritional Studies (ONS), developed by the ENPADASI project. ONS defines a common language for nutritional studies, encompassing 4,834 classes related to material entities, anatomical entities, and dietary characteristics. This ontology is entirely reusable and will structure the nutritional vectors within the database schema.

To bridge the gap between traditional medicine and these biomedical ontologies, the platform will integrate the AyuRAG Ontology. This lightweight structure normalizes Ayurvedic nosology, providing crucial mappings between classical disease concepts and modern biomedical standards like ICD-11 and SNOMED CT. For modeling the etiology of conditions impacted by diet, the Disease Drivers Ontology (disdriv.owl) will be employed. This ontology explicitly connects environmental and dietary drivers to disease phenotypes, providing the semantic rules necessary for the platform's simulation engine to reason about the long-term health impacts of specific ingredient combinations.

---

## Section 7: Papers
The analytical methodology of the platform relies on extending state-of-the-art literature in computational gastronomy, network pharmacology, and topological data analysis. The following table evaluates the foundational papers, their methodologies, and their direct applicability to the proposed system.

| Paper Title & Reference | Problem Addressed | Method & Algorithm | Dataset Utilized | Evaluation & Findings | Limitations | Project Extension Potential (Yes/No) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FlavorDB: a database of flavor molecules** (Garg et al.) | Lack of a structured repository linking flavor molecules to natural sources and gustatory percepts. | Data mining and integration of flavor space with botanical entity space. | 25,595 molecules, 936 ingredients. | Successfully mapped molecular subsets to specific percepts (e.g., sweet, bitter). | Represents a static database; lacks predictive modeling for novel flavor combinations. | **YES**. The platform will utilize this as the baseline molecular graph for flavor similarity computation. |
| **FlavorDB2: An updated database...** (Grover et al.) | Need for chemical properties, regulatory status, and exact threshold values of flavors. | NLP and manual curation integrating FooDB, Flavornet, SuperSweet. | 25,595 molecules with extensive ADMET properties. | Developed advanced search engines and molecular editors (JSME) for robust querying. | Highly focused on Western science; completely ignores traditional Ayurvedic thermal potency (Virya). | **YES**. Will serve as the molecular ground truth for computing substitution vectors. |
| **Food-bridging: a new network construction...** (Simas et al.) | The food pairing hypothesis fails to explain cuisines where ingredients do not share flavor compounds. | Introduced Food-bridging using semi-metric path (SMP) analysis on bipartite graphs. | Ahn et al. 2011 global recipe dataset. | Identified four distinct classes of global cuisines based on pairing vs. bridging tendencies. | Limited purely to topological network analysis; ignores nutritional and therapeutic constraints. | **YES**. SMP analysis is crucial for ensuring ingredient substitutions do not destroy a recipe's topological identity. |
| **SpiceRx: an integrated resource...** (Rakhi et al.) | Unstructured data regarding the precise health impacts of culinary spices. | Text mining and Named Entity Recognition (NER) of biomedical literature to extract tripartite relations. | 188 spices, Medline biomedical articles. | High validation of positive/negative disease associations mapped to MeSH terms. | Focuses exclusively on modern disease terminology, failing to account for Ayurvedic Dosha imbalances. | **YES**. Acts as the primary bridge linking culinary ingredient data to disease networks. |
| **GRAYU: graph-based database...** (NCBS) | Traditional Indian medicinal knowledge is unstructured for modern computational drug discovery. | Data aggregation mapping classical formulations to plants, chemicals, and diseases. | 1,039 formulations, 12,743 plants. | Graph-based relationships enabled complex network analysis of Ayurvedic formulations. | Hints at mechanistic causality but requires extensive experimental validation. | **YES**. Acts as the foundational Ayurvedic graph backbone for the database schema. |
| **Food Pairing Unveiled...** (2024) | Determining if recipe creation relies purely on shared flavor compounds or statistical co-occurrence. | Collaborative filtering and LightGCN (Graph Convolutional Networks). | Ahn's dataset of recipes, ingredients, and flavors. | Found that recipe-based similarity significantly outperformed the flavor-based recommender system. | Demonstrated that food pairing is often driven by simplistic, trivial matches between highly similar ingredients. | **YES**. Graph embeddings and collaborative filtering algorithms will be adapted for evidence ranking and substitution reasoning. |
| **Topological analysis of the space of recipes** (2024) | Generating novel ingredient combinations mathematically. | Persistent homology analysis to study multiscale "holes" in recipe spaces. | Ahn et al. 2011 dataset. | Combinatorial optimization successfully generated novel, coherent recipes by exploiting topological holes. | Did not consider the complex flavor profiles of different ingredients in the homology calculations. | **YES**. Persistent homology provides a robust mathematical framework to evaluate the structural integrity of a modified recipe. |

Our project extends this literature by solving the fundamental disconnect between topological food networks and Ayurvedic systems biology. While existing works map ingredients to molecules or molecules to diseases, the proposed platform will mathematically map qualitative Ayurvedic parameters (Rasa, Virya) directly onto the high-dimensional molecular flavor networks, enabling deterministic substitution algorithms that respect both Western nutritional constraints and traditional holistic principles.

---

## Section 8: Foodoscope
Foodoscope represents the API and backend infrastructure developed by the CoSyLab at IIIT-Delhi to render computational gastronomy programmable, effectively aggregating data from RecipeDB, FlavorDB2, DietRx, and SpiceRx into a unified semantic web. A deep dive into the available documentation and associated repositories reveals the specific architecture and constraints of this system.

The system exposes several distinct API endpoints to interface with the underlying graph. Identified endpoints include:
*   `/entities/by-entity-alias-readable`: Allows searching for specific culinary ingredients by their common names.
*   `/entities/by-name-and-category`: Filters ingredients based on their taxonomical classification.
*   `/entities/by-natural-source`: Retrieves the specific flavor molecules linked to a natural botanical source.
*   `/food/by-alias`: Provides food pairing suggestions derived from graph topology.
*   `/molecules_data/`: Retrieves exact ADMET properties and threshold data for specific chemical compounds.

The underlying schema connects objects including **Entity** (the physical ingredient), **Molecule** (the phytochemical or flavor compound), **Recipe** (a structured graph of entities), and **Disease** (the clinical impact node). However, a significant limitation is that public documentation for Foodoscope is exceedingly sparse, and the API is subject to severe rate limits and restricted write-access designed to protect internal IIIT-D research infrastructure. To directly reuse this resource without encountering bottleneck failures, the proposed platform will utilize an API gateway to query Foodoscope endpoints for real-time molecular data, while simultaneously maintaining local PostgreSQL mirrors of the static supplementary datasets from FlavorDB2 and RecipeDB. This hybrid approach ensures that the platform can traverse the food graph efficiently while relying on Foodoscope for specific entity resolution tasks.

---

## Section 9: Database Design
To support the massive, multimodal queries required to intersect Ayurveda, nutritional science, and network biology, the system architecture mandates a dual-persistence strategy. A highly normalized relational database (PostgreSQL) will handle ACID-compliant transactions for structured properties, while a mirrored graph database (Neo4j) will execute complex edge traversals. The relational schema is engineered as follows:

### 1. Plant_Taxonomy
*   **Columns:** `taxon_id` (PK, UUID), `scientific_name` (Varchar), `powo_id` (Varchar, unique), `common_name` (Varchar), `family` (Varchar).
*   **Relationships:** 1:1 mapping to canonical POWO identifiers. Acts as the root hub for botanical resolution.

### 2. Ayurvedic_Profile
*   **Columns:** `ayur_id` (PK, UUID), `taxon_id` (FK), `sanskrit_name` (Varchar), `rasa_vector` (JSONB, 6D array), `guna_vector` (JSONB), `virya` (Enum: 'Sheet', 'Ushna'), `vipaka` (Enum: 'Madhura', 'Amla', 'Katu'), `dosha_impact` (JSONB, 3D array).
*   **Relationships:** 1:1 to `Plant_Taxonomy`.

### 3. Ingredient (Culinary Mapping)
*   **Columns:** `ingredient_id` (PK, UUID), `taxon_id` (FK), `foodoscope_alias` (Varchar), `food_category` (Varchar).
*   **Relationships:** Connects computational gastronomy entities (from RecipeDB) to their taxonomic identities.

### 4. Molecule
*   **Columns:** `molecule_id` (PK, UUID), `pubchem_cid` (Integer, unique), `chebi_id` (Varchar), `smiles` (Text), `iupac_name` (Text), `molecular_weight` (Numeric).
*   **Relationships:** Core chemical representation, heavily indexed for substructure search.

### 5. Flavor_Profile
*   **Columns:** `flavor_id` (PK, UUID), `molecule_id` (FK), `flavor_percepts` (Text Array), `aroma_threshold` (Numeric), `taste_threshold` (Numeric).
*   **Relationships:** Derived from FlavorDB2 attributes.

### 6. Plant_Molecule_Edge
*   **Columns:** `edge_id` (PK, UUID), `taxon_id` (FK), `molecule_id` (FK), `concentration_ppm` (Numeric, nullable), `source_db` (Enum: 'IMPPAT', 'GRAYU', 'FlavorDB2').
*   **Relationships:** M:N associative table representing the exact phytochemical composition of a plant. Mapped in Neo4j as a `HAS_MOLECULE` directed edge.

### 7. Nutrition
*   **Columns:** `nutrition_id` (PK, UUID), `ingredient_id` (FK), `usda_fdc_id` (Varchar), `calories` (Numeric), `proteins_g` (Numeric), `fats_g` (Numeric), `carbs_g` (Numeric), `fiber_g` (Numeric).
*   **Relationships:** Absolute nutritional baseline derived from USDA FDC and IFCT.

### 8. Disease
*   **Columns:** `disease_id` (PK, UUID), `icd11_code` (Varchar), `umls_cui` (Varchar), `namaste_tm2_code` (Varchar), `disease_name` (Text).
*   **Relationships:** Standardized morbidity mapping linking modern ICD codes to traditional TM2 codes.

### 9. Clinical_Evidence
*   **Columns:** `evidence_id` (PK, UUID), `molecule_id` (FK, nullable), `taxon_id` (FK, nullable), `disease_id` (FK), `openalex_work_id` (Varchar), `effect_type` (Enum: 'Positive', 'Negative').
*   **Relationships:** Connects dietary components to scholarly literature, mapped as `TREATS_DISEASE` in the graph.

### 10. Recipe
*   **Columns:** `recipe_id` (PK, UUID), `name` (Varchar), `cuisine` (Varchar), `ingredients_json` (JSONB array of ingredient_ids), `processing_methods` (Text Array).
*   **Relationships:** The structural blueprint of a dish, mapped as `USED_IN_RECIPE` edges in Neo4j.

---

## Section 10: Entity Mapping
The most critical technical hurdle in building the Computational Food Intelligence Platform is entity resolution across ontologies that utilize entirely different nomenclatures. The platform will employ a Canonical ID Strategy to ensure data fidelity.

Consider the mapping sequence for **Turmeric**:
1.  The Ayurvedic Pharmacopoeia identifies the botanical drug as **Haridra**. The ingestion layer maps *Haridra* to the `Ayurvedic_Profile.sanskrit_name`.
2.  Through textual normalization, this is linked to its scientific name, **Curcuma longa**.
3.  The system then queries the Plants of the World Online (POWO) API, retrieving a canonical identifier, for example, `powo_id: urn:lsid:ipni.org:names:77229619-1`. This UUID becomes the universally recognized `taxon_id` in the `Plant_Taxonomy` table.
4.  Simultaneously, food databases like RecipeDB and FlavorDB2 refer to the ingredient via the alias **"Turmeric powder"**. This alias is resolved against the FoodOn ontology and linked via foreign key to the established `taxon_id`.
5.  To map the chemical space, databases like IMPPAT 2.0 and GRAYU denote the active phytochemical as **Curcumin**. The system queries PubChem to retrieve **PubChem CID: 969516**, inserting it into the `Molecule` table, and creates a `Plant_Molecule_Edge` connecting the `taxon_id` (*Curcuma longa*) to the `molecule_id` (*Curcumin*).
6.  Finally, to rank the scientific evidence of this compound, the system queries the OpenAlex REST API for the terms *"Curcuma longa"* or *"Curcumin"*, retrieving specific **OpenAlex Work IDs** (e.g., scholarly papers validating its anti-inflammatory effects), which are stored in the `Clinical_Evidence` table.

Exact string matching is utilized for standardized IDs (PubChem, POWO), while LLM-assisted context extraction utilizing the AyuRAG ontology resolves polysemous Sanskrit ambiguities.

---

## Section 11: Computational Representation
To evolve beyond a static relational database into a platform capable of reasoning, simulation, and optimization, every qualitative Ayurvedic and culinary concept must be translated into a computable vector or matrix.

*   **Rasa (Taste):** Represented as a 6-dimensional normalized continuous vector `[Sweet, Sour, Salty, Bitter, Pungent, Astringent]`, where values range from $0.0$ to $1.0$.
    *   *Why needed?* Enables strict vector arithmetic for algorithmically evaluating ingredient substitutions.
    *   *Where obtained?* NLP extraction from the Ayurvedic Pharmacopoeia of India.
    *   *How validated?* Cross-referenced with computational taste prediction models (e.g., SweetPred, Bittersweet) that map specific molecular structures to gustatory percepts.
*   **Virya (Potency):** Represented as a scalar value on a continuous spectrum from $-1.0$ (Sheet/Cold) to $+1.0$ (Ushna/Hot). Sourced directly from classical texts.
*   **Vipaka (Post-digestive effect):** Handled as a categorical one-hot encoding `[Madhura, Amla, Katu]`.
*   **Dosha:** Structured as a 3-dimensional vector `[Vata, Pitta, Kapha]` with discrete values `{-1 (Pacifies), 0 (Neutral), +1 (Aggravates)}`. Essential for generating personalized, algorithmically sound dietary constraints.
*   **Flavor:** A high-dimensional binary vector indicating the presence or absence of the 25,595 distinct flavor molecules documented in FlavorDB2.
*   **Nutrition:** A continuous value array representing absolute macronutrients (grams/100g), reliably sourced from IFCT and USDA FDC APIs.
*   **Scientific Evidence:** A computed scalar evidence score $E \in [0,1]$. This score is dynamically calculated by weighting OpenAlex citation counts, journal impact metrics, and the density of positive clinical outcome reports within the knowledge graph.

---

## Section 12: Algorithms
The platform strictly eschews generic Large Language Model wrappers in favor of deterministic, mathematically grounded algorithms designed for robust graph traversal and numerical optimization.

### 1. Entity Resolution & Ontology Alignment
To align disparate datasets, the system employs Jaro-Winkler distance combined with TF-IDF cosine similarity over entity descriptions. This algorithm matches raw input strings to the standardized classes within the FoodOn and ONS ontologies.

### 2. Food-Pairing Evaluation
Food pairing hypotheses suggest ingredients sharing flavor compounds taste better together. This is computed using the Jaccard similarity coefficient over shared flavor compounds. For two ingredients $i$ and $j$ possessing sets of flavor molecules $F_i$ and $F_j$:
$$Pairing(i, j) = \frac{|F_i \cap F_j|}{|F_i \cup F_j|}$$
This algorithm explicitly quantifies the chemical overlap between nodes.

### 3. Food-Bridging (Network Topology Analysis)
When direct food pairing is low, ingredients can be connected via a third ingredient, functioning as a bridge. The algorithm performs semi-metric path (SMP) analysis on the bipartite flavor network. The mathematical intuition involves calculating the shortest path $s_{i,j}$ between ingredients $i$ and $j$. The network semi-metric percentage is defined as:
$$SMP = \frac{\sum_{i,j} \delta(s_{i,j} > 1 \land s_{i,j} < +\infty)}{\sum_{i,j} \delta(s_{i,j} \geq 1 \land s_{i,j} < +\infty)}$$
This topological metric evaluates whether substituting an ingredient maintains or destroys the underlying structural connectivity of the culinary recipe.

### 4. Graph Convolutional Networks (GCN) for Evidence Prediction
To predict missing links between phytochemicals and diseases, LightGCN is applied to the plant-molecule-disease graph derived from GRAYU and SpiceRx. This allows the platform to probabilistically rank the therapeutic viability of novel substitutions based on known graph embeddings.

### 5. Multi-objective Optimization (Simulation Reasoning)
To find the optimal ingredient substitute, the platform deploys the Non-dominated Sorting Genetic Algorithm II (NSGA-II). This evolutionary algorithm navigates a multidimensional search space, attempting to simultaneously minimize nutritional degradation, maximize flavor similarity, and strictly satisfy discrete Ayurvedic Dosha constraints.

---

## Section 13: Simulation Engine
The Simulation Engine represents the core intellectual property of the platform, computing the systemic impact of any ingredient substitution across all representation layers. The exact mechanics of the simulation avoid vague heuristics, relying entirely on the deterministic algorithms outlined above.

### Example Scenario: A user requests to replace "Butter" in a recipe with an Ayurvedic alternative that is strictly Vata-pacifying.

*   **Step 1: Input Processing & Constraint Setting**
    The engine receives the input vector $x = \text{Butter}$. The user sets a target constraint: $Dosha(\text{target}) = \text{Vata-pacifying}$. This translates mathematically to enforcing the target Dosha vector $V_{target} = [-1, X, X]$, where $-1$ represents pacification.
*   **Step 2: Candidate Generation via Graph Traversal**
    The engine queries the Neo4j Graph DB to retrieve all candidate nodes $Y$ where the property $Dosha(y)[0] = -1$. Let us assume the engine selects candidate $y = \text{Ghee (Clarified Butter)}$.
*   **Step 3: Nutritional Delta Computation ($Sim_{nutrition}$)**
    The engine retrieves the absolute nutritional vectors $N_x$ and $N_y$ from the PostgreSQL Nutrition table. It calculates the Euclidean distance to quantify the shift in macronutrients:
    $$Sim_{nutrition} = \frac{1}{1 + ||N_x - N_y||_2}$$
*   **Step 4: Flavor Similarity Computation ($Sim_{flavor}$)**
    The engine pulls the high-dimensional binary flavor molecule vectors $F_x$ and $F_y$ originally derived from FlavorDB2. It computes the Cosine similarity to ensure the culinary profile remains intact:
    $$Sim_{flavor} = \frac{F_x \cdot F_y}{||F_x|| \cdot ||F_y||}$$
*   **Step 5: Ayurvedic Compatibility Shift ($Ayur_{shift}$)**
    The engine evaluates the transformation across the qualitative Ayurvedic vectors. It calculates the Cosine similarity between the 6D $Rasa$ vectors and penalizes extreme divergence in the scalar $Virya$ value:
    $$Ayur_{shift} = \text{Cosine}(Rasa_x, Rasa_y) \times \left(1 - \frac{|Virya_x - Virya_y|}{2}\right)$$
*   **Step 6: Network Pharmacological Evidence Scoring ($Evidence_{score}$)**
    The engine queries the citation graph (via OpenAlex or DietRx mappings) for documented clinical interactions between the phytochemicals present in $y$ and metabolic markers associated with Vata imbalance. It outputs a normalized PageRank score based on citation density.
*   **Step 7: Final Optimization & Output**
    The engine aggregates the metrics using a weighted linear combination:
    $$Score(x \rightarrow y) = w_1 Sim_{nutrition} + w_2 Sim_{flavor} + w_3 Ayur_{shift} + w_4 Evidence_{score}$$
    The output is a ranked list of viable substitutes, accompanied by an explicit, mathematically derived trace matrix explaining exactly why the substitution works structurally, nutritionally, and therapeutically.

---

## Section 14: System Architecture
The technical architecture is designed to guarantee scalability, deterministic execution, and reproducible scientific outputs, systematically avoiding the unpredictable latency of relying solely on external APIs.

### Block 1: Data Ingestion & Harmonization Layer
*   **Why Needed:** Resolves structural heterogeneity across raw CSVs (IMPPAT), live JSON APIs (POWO, OpenAlex), and unstructured text (Ayurvedic Pharmacopoeia PDFs).
*   **Inputs:** Unstructured scholarly texts, JSON web responses, static CSV dumps.
*   **Algorithm/Process:** Regex extraction, BERT-based Named Entity Recognition (NER), and OAI-PMH harvesting protocols.
*   **Output:** Canonical, serialized JSON objects strictly mapped to the FoodOn and ONS ontologies.

### Block 2: Persistent Storage Layer
*   **Why Needed:** Ensures fast transactional reads for vectors while allowing complex relationship traversals across biological networks.
*   **Dataset/Stack:** PostgreSQL is utilized for storing relational vectors and nutritional profiles, Neo4j is deployed to map the graph edges (e.g., `HAS_MOLECULE`), and a Vector DB (such as Milvus) stores molecular embeddings.
*   **Complexity:** $O(1)$ for relational indexed lookups; $O(V+E)$ for graph traversals during candidate generation.

### Block 3: Simulation & Reasoning Engine
*   **Why Needed:** Executes the core mathematical operations detailed in Section 13 to compute substitution viabilities.
*   **Inputs:** Structured user queries defining target constraints and baseline ingredients.
*   **Algorithm:** NSGA-II multi-objective optimization, Cosine/Jaccard similarity engines, and Graph PageRank algorithms for evidence scoring.
*   **Output:** Ranked simulation results paired with a deterministic, mathematically verifiable explanation trace.

### Block 4: API Gateway & User Interface
*   **Why Needed:** Facilitates secure frontend interaction and allows third-party programmatic access for future research integrations.
*   **Algorithm:** A GraphQL federation layer that simultaneously queries PostgreSQL and Neo4j, unifying the response payload.
*   **Limitations:** Heavy computational requests, such as calculating the persistent homology of an entire recipe graph to assess food-bridging stability, possess high computational complexity and will require asynchronous processing queues.

---

## Section 15: Evaluation
Validating a multidisciplinary platform that merges quantitative computational biology with qualitative traditional medicine requires a rigorous, multi-tiered evaluation framework.

### 1. Entity Mapping Accuracy
*   **Ground Truth:** A manually annotated dataset containing 50 Ayurvedic medicinal plants, explicitly mapped by domain experts to their canonical POWO taxonomy, PubChem CID, and USDA nutritional profile.
*   **Metric:** The system's automated NER and alignment pipeline will be evaluated using standard Precision, Recall, and F1-score metrics against this ground truth.

### 2. Substitution Engine Viability
*   **Expert Evaluation:** Blinded A/B testing will compare engine-recommended ingredient substitutions against human expert recommendations. The panel will consist of 5 certified Ayurvedic physicians (BAMS) and 2 culinary scientists.
*   **Statistical Test:** Cohen’s Kappa coefficient will be calculated to measure inter-rater reliability and determine the statistical significance of the engine's alignment with human expert consensus.

### 3. Topological Stability Assessment
*   **Metric:** The platform will measure the persistence of the Food-bridging Semi-metric Path ($SMP$) metric before and after an algorithmic ingredient substitution. If the $SMP$ remains stable across the recipe graph, the core culinary identity of the dish is quantitatively proven to be preserved.

### 4. Baseline Comparison
*   **Benchmark:** The proposed Multi-objective Optimization algorithm will be benchmarked against naive computational baselines (e.g., executing a substitution based purely on nutritional macro-matching, or purely on flavor profile cosine similarity). This empirical comparison is necessary to prove the superiority and necessity of the multimodal, systems-level approach.

---

## Section 16: Research Gap
A comprehensive review of existing literature—including the Bagler Lab's extensive works (FlavorDB, SpiceRx), the NCBS's GRAYU graph, and the Samal Lab's IMPPAT 2.0 database—identifies a profound and unaddressed research gap.

Existing computational platforms excel at mapping entities within their specific disciplinary boundaries. For instance, GRAYU successfully maps plants to molecules and subsequently to diseases; FlavorDB accurately maps specific molecules to gustatory flavor percepts. However, no current system mathematically maps the qualitative, phenomenological parameters of Ayurveda (Rasa, Virya, Vipaka) directly onto high-dimensional molecular and nutritional flavor networks.

Current implementations of Ayurvedic AI, such as AyuRAG, rely heavily on textual Retrieval-Augmented Generation. While useful for text summarization, RAG is fundamentally non-deterministic and highly prone to hallucination when tasked with complex biochemical reasoning. The true gap is the complete absence of a deterministic, mathematically grounded translation layer. The field requires a computational architecture that proves, via rigorous graph analysis, why a specific combination of molecules (identified via FlavorDB and PubChem) results in a specific Virya (potency) or Dosha shift, thereby enabling scientifically validated, computable food simulation.

---

## Section 17: Feasibility
**Can this project actually be completed?** YES.

By strictly constraining the initial project scope to a pilot of 20–50 medicinal plants or core ingredients, the project is highly feasible utilizing currently available open-source datasets, APIs, and computational resources.

### Timeline & Semester-wise Milestones
*   **Semester 1 (Months 1-3):** Intensive data acquisition. Execution of API calls to POWO and OpenAlex; manual extraction and NLP processing of 50 plants from the Ayurvedic Pharmacopoeia and IMPPAT 2.0.
*   **Semester 1 (Months 4-6):** Database initialization (deploying PostgreSQL and Neo4j). Execution of Entity Resolution algorithms and finalization of Canonical ID mapping across all ontologies.
*   **Semester 2 (Months 7-9):** Core algorithm development. Mathematically vectorizing Rasa and Virya properties; programming and testing the Simulation Engine.
*   **Semester 2 (Months 10-12):** API/UI development, execution of Expert Evaluation panels, and final statistical validation for publication.

### Implementation Effort & Risks
*   **Data Collection Effort:** Moderate to High. While robust APIs exist for global taxonomy (POWO) and modern scientific literature (OpenAlex), historical Ayurvedic texts require manual data entry, NLP extraction, and rigorous cross-verification for the 50 selected plants.
*   **Manual Annotation Effort:** High. Bridging the semantic gap between a qualitative Sanskrit term and a measurable biological mechanism for the pilot plants requires continuous expert oversight to establish a reliable ground truth.
*   **Risks:**
    *   Foodoscope endpoints may undergo unannounced schema changes or enforce severe rate limits, necessitating a structural fallback to processing the raw FlavorDB2 and RecipeDB static CSV dumps.
    *   USDA nutritional data for endemic Indian plants is often missing or incomplete, requiring algorithmic imputation from the IFCT 2017 dataset to prevent null vectors during simulation.
*   **Expected Publication Potential:** Exceptionally high. Developing a working prototype that demonstrates deterministic, computable Ayurvedic-gastronomic substitution targets high-impact, top-tier journals such as *Nature Food*, *npj Science of Food*, or *Bioinformatics*.

---

## Section 18: Critical Review
To ensure absolute technical rigor, the proposed platform must be subjected to the harshest possible academic critique, anticipating objections from leading domain experts (e.g., adopting the critical perspective of Prof. Ganesh Bagler).

### Criticism 1: Epistemological Reductionism vs. Systems Biology
*   **Critique:** *"Ayurveda is a holistic, systems biology framework. By attempting to vectorize concepts like Rasa, Virya, and Vipaka into distinct, isolated mathematical vectors, you are reducing a complex, emergent biological property into a flawed reductionist model. You cannot accurately predict the holistic Dosha impact of a whole food simply by summing the vectors of its constituent phytochemicals."*
*   **Defense:** The proposed architecture explicitly rejects linear reductionism by utilizing Graph Convolutional Networks and complex topological metrics (such as the Food-Bridging $SMP$). The platform does not naively sum phytochemicals; rather, it maps the network interactions of those chemicals across the highly complex disease-gene tripartite networks established in datasets like DietRx and SpiceRx. The vectorized parameters for Rasa and Virya serve as boundary constraints within a non-linear optimization algorithm (NSGA-II), not as absolute linear predictors. This approach preserves the holistic, systems-level constraints of the recipe while still allowing for mathematical computation.

### Criticism 2: Severe Data Sparsity and Standardization Issues in Ayurveda
*   **Critique:** *"You propose using the Ayurvedic Pharmacopoeia of India as a baseline. The standardization across classical texts like the Charaka Samhita and Sushruta Samhita is notoriously poor, plagued with polysemous terms and contradictory properties for the exact same plant based on geographical origin. Your canonical entity mapping strategy will inevitably fail."*
*   **Defense:** Acknowledging this profound limitation is precisely why the project scope is aggressively restricted to a pilot of 20-50 highly characterized ingredients. For this initial prototype, the "ground truth" is strictly constrained to the government-ratified, standardized monographs published in the Ayurvedic Pharmacopoeia of India (API) Parts I-III, intentionally ignoring conflicting regional variations. Semantic ambiguities are deterministically resolved by deferring to the exact botanical species verified by the POWO API (e.g., isolating Terminalia chebula from its regional variants using canonical UUIDs).

### Criticism 3: Hallucination in Missing Data Imputation
*   **Critique:** *"If a specific plant retrieved from IMPPAT 2.0 does not possess a comprehensive nutritional profile in either the USDA FDC or IFCT 2017 datasets, your simulation engine will either fail execution or silently calculate false nutritional deltas, violating the core principle of scientific explainability."*
*   **Defense:** The simulation engine is architected to never hallucinate data. If the continuous vector for Nutrition is null, the multi-objective optimization algorithm treats that specific dimension as a dropped constraint. Crucially, the engine flags the output with a degraded `confidence_score` and explicitly logs the missing data in the explanation trace matrix. The governing rule of the simulation engine is deterministic evaluation: missing data equals a mathematically proven inability to compute that specific delta, ensuring absolute scientific integrity over the "black box" guessing inherent in LLM wrappers.

### Criticism 4: Fragile API Dependence and Infrastructure Risk
*   **Critique:** *"The architecture assumes seamless access to Foodoscope APIs and OpenAlex. The Foodoscope endpoints are internal to CoSyLab and are not provisioned for external, high-volume querying. Relying on them introduces a catastrophic single point of failure."*
*   **Defense:** The architectural design strictly isolates all external API calls into the asynchronous Data Ingestion & Harmonization Layer. The reasoning engine does not execute live API calls during a simulation. Should Foodoscope endpoints be restricted or rate-limited, the platform is designed to gracefully fallback to ingesting the raw, open-access CSV dumps provided in the published supplementary materials of FlavorDB2, RecipeDB, and SpiceRx. All data is statically loaded and indexed into our local PostgreSQL/Neo4j infrastructure, guaranteeing 100% uptime, ultra-low latency, and zero reliance on external server stability during the critical simulation and reasoning phases.
