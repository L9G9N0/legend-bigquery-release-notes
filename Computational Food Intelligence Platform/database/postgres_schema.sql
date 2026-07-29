-- postgres_schema.sql
-- PostgreSQL Database Schema for the Computational Food Intelligence Platform
-- Extensively structured according to Section 9 of the Technical Due Diligence Report.

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: Plant_Taxonomy
CREATE TABLE Plant_Taxonomy (
    taxon_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scientific_name VARCHAR(255) NOT NULL UNIQUE,
    powo_id VARCHAR(255) UNIQUE,
    common_name VARCHAR(255),
    family VARCHAR(255)
);

-- 2. Table: Ayurvedic_Profile
CREATE TABLE Ayurvedic_Profile (
    ayur_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taxon_id UUID REFERENCES Plant_Taxonomy(taxon_id) ON DELETE CASCADE,
    sanskrit_name VARCHAR(255),
    rasa_vector JSONB,        -- 6D array [Sweet, Sour, Salty, Bitter, Pungent, Astringent]
    guna_vector JSONB,        -- JSON array representing qualitative descriptors
    virya VARCHAR(50),        -- Enum-like: 'Sheet' or 'Ushna'
    vipaka VARCHAR(50),       -- Enum-like: 'Madhura', 'Amla', 'Katu'
    dosha_impact JSONB        -- 3D array [Vata, Pitta, Kapha] with values {-1, 0, 1}
);

-- 3. Table: Ingredient
CREATE TABLE Ingredient (
    ingredient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taxon_id UUID REFERENCES Plant_Taxonomy(taxon_id) ON DELETE CASCADE,
    foodoscope_alias VARCHAR(255),
    food_category VARCHAR(255)
);

-- 4. Table: Molecule
CREATE TABLE Molecule (
    molecule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pubchem_cid INTEGER UNIQUE,
    chebi_id VARCHAR(50),
    smiles TEXT,
    iupac_name TEXT,
    molecular_weight NUMERIC(8,3)
);

-- 5. Table: Flavor_Profile
CREATE TABLE Flavor_Profile (
    flavor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    molecule_id UUID REFERENCES Molecule(molecule_id) ON DELETE CASCADE,
    flavor_percepts TEXT[],   -- Array of taste and smell descriptions (e.g. ['spicy', 'woody'])
    aroma_threshold NUMERIC(12,6),
    taste_threshold NUMERIC(12,6)
);

-- 6. Table: Plant_Molecule_Edge
CREATE TABLE Plant_Molecule_Edge (
    edge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taxon_id UUID REFERENCES Plant_Taxonomy(taxon_id) ON DELETE CASCADE,
    molecule_id UUID REFERENCES Molecule(molecule_id) ON DELETE CASCADE,
    concentration_ppm NUMERIC(10,3),
    source_db VARCHAR(50),    -- 'IMPPAT', 'GRAYU', 'FlavorDB2'
    UNIQUE(taxon_id, molecule_id, source_db)
);

-- 7. Table: Nutrition
CREATE TABLE Nutrition (
    nutrition_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID REFERENCES Ingredient(ingredient_id) ON DELETE CASCADE,
    usda_fdc_id VARCHAR(50),
    calories NUMERIC(8,2),     -- energy_kcal equivalent
    proteins_g NUMERIC(6,2),
    fats_g NUMERIC(6,2),
    carbs_g NUMERIC(6,2),
    fiber_g NUMERIC(6,2)
);

-- 8. Table: Disease
CREATE TABLE Disease (
    disease_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icd11_code VARCHAR(50),
    umls_cui VARCHAR(50),
    namaste_tm2_code VARCHAR(50),
    disease_name TEXT NOT NULL UNIQUE
);

-- 9. Table: Clinical_Evidence
CREATE TABLE Clinical_Evidence (
    evidence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    molecule_id UUID REFERENCES Molecule(molecule_id) ON DELETE SET NULL,
    taxon_id UUID REFERENCES Plant_Taxonomy(taxon_id) ON DELETE SET NULL,
    disease_id UUID REFERENCES Disease(disease_id) ON DELETE CASCADE,
    openalex_work_id VARCHAR(100),
    effect_type VARCHAR(50)   -- 'Positive', 'Negative'
);

-- 10. Table: Recipe
CREATE TABLE Recipe (
    recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(255),
    ingredients_json JSONB,   -- Array of ingredient UUIDs and standard amounts
    processing_methods TEXT[]
);

COMMIT;
