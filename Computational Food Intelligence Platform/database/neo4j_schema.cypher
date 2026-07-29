// neo4j_schema.cypher
// Neo4j Graph Database Schema for the Computational Food Intelligence Platform
// Structured to match Section 9 and Section 13 of the Technical Due Diligence Report.

// 1. Unique Constraints for Nodes
CREATE CONSTRAINT taxon_id_unique IF NOT EXISTS
FOR (t:Plant_Taxonomy) REQUIRE t.taxon_id IS UNIQUE;

CREATE CONSTRAINT powo_id_unique IF NOT EXISTS
FOR (t:Plant_Taxonomy) REQUIRE t.powo_id IS UNIQUE;

CREATE CONSTRAINT ingredient_id_unique IF NOT EXISTS
FOR (i:Ingredient) REQUIRE i.ingredient_id IS UNIQUE;

CREATE CONSTRAINT molecule_cid_unique IF NOT EXISTS
FOR (m:Molecule) REQUIRE m.pubchem_cid IS UNIQUE;

CREATE CONSTRAINT disease_id_unique IF NOT EXISTS
FOR (d:Disease) REQUIRE d.disease_id IS UNIQUE;

CREATE CONSTRAINT recipe_id_unique IF NOT EXISTS
FOR (r:Recipe) REQUIRE r.recipe_id IS UNIQUE;

// 2. Node Schema and Directed Edges Definition
//
// A. Taxonomic Mappings:
//    (:Ingredient)-[:HAS_TAXONOMY]->(:Plant_Taxonomy)
//
// B. Phytochemical & Flavor Chemistry (Plant_Molecule_Edge):
//    (:Plant_Taxonomy)-[:HAS_MOLECULE {concentration_ppm: 25000.0, source_db: 'IMPPAT'}]->(:Molecule)
//
// C. Flavor Classification (Derived from Flavor_Profile):
//    (:Molecule)-[:HAS_FLAVOR_PERCEPT {percepts: ['spicy', 'woody']}]->(:Flavor)
//
// D. Clinical/Literature Associations (Clinical_Evidence):
//    (:Molecule)-[:TREATS_DISEASE {openalex_work_id: 'W4234293842', effect_type: 'Positive'}]->(:Disease)
//    (:Plant_Taxonomy)-[:TREATS_DISEASE {openalex_work_id: 'W4234293842', effect_type: 'Positive'}]->(:Disease)
//
// E. Recipe Structure (USED_IN_RECIPE):
//    (:Ingredient)-[:USED_IN_RECIPE {portion_g: 10.0}]->(:Recipe)

// 3. Sample Cypher Query for Inredient Substitution Selection (Section 13)
// Match candidate Ghee to substitute Butter based on Vata-pacifying constraints (dosha_impact[0] = -1):
// MATCH (source:Ingredient {foodoscope_alias: 'Butter'})-[:HAS_TAXONOMY]->(source_tax:Plant_Taxonomy)-[h1:HAS_MOLECULE]->(m1:Molecule)
// MATCH (target:Ingredient {foodoscope_alias: 'Ghee'})-[:HAS_TAXONOMY]->(target_tax:Plant_Taxonomy)-[h2:HAS_MOLECULE]->(m2:Molecule)
// MATCH (target_tax)-[:AYURVEDIC_PROFILE]->(ap:Ayurvedic_Profile)
// WHERE ap.dosha_impact[0] = -1 // Vata-pacifying check
// OPTIONAL MATCH (m1)-[ev:TREATS_DISEASE]->(d:Disease)
// RETURN target.foodoscope_alias AS Target, ap.rasa_vector AS RasaVector, collect(distinct m2.iupac_name) AS TargetMolecules, collect(distinct d.disease_name) AS VerifiedClinicalOutcomes;
