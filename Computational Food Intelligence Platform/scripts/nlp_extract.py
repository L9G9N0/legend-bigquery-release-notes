#!/usr/bin/env python3
"""
nlp_extract.py
Implements an NLP extraction pipeline that tokenizes and analyzes Ayurvedic
texts or scientific abstracts, extracting key properties (Rasa, Virya, Vipaka)
and chemical compounds using keyword rules and pattern matching.
"""

import os
import re
import json

# Define lexical dictionaries for Ayurvedic parameters
RASA_DICT = ["Tikta", "Katu", "Madhura", "Amla", "Lavana", "Kashaya"]
GUNA_DICT = ["Laghu", "Ruksha", "Teekshna", "Guru", "Snigdha", "Manda"]
VIRYA_DICT = ["Ushna", "Sheeta"]
VIPAKA_DICT = ["Katu", "Madhura", "Amla"]
DOSHA_DICT = ["Kapha", "Pitta", "Vata", "Tridosha"]

# Typical active compounds we look for
PHYTOCHEMICAL_DICT = ["Curcumin", "Eugenol", "Caryophyllene", "Ursolic acid", "Oleanolic acid", "Linalool", "Turmerone", "Zingiberene"]

def extract_entities(text):
    extracted = {
        "rasa": [],
        "guna": [],
        "virya": [],
        "vipaka": [],
        "dosha": [],
        "phytochemicals": []
    }
    
    # Case-insensitive word boundary matching
    for rasa in RASA_DICT:
        if re.search(rf"\b{rasa}\b", text, re.IGNORECASE):
            extracted["rasa"].append(rasa)
            
    for guna in GUNA_DICT:
        if re.search(rf"\b{guna}\b", text, re.IGNORECASE):
            extracted["guna"].append(guna)
            
    for virya in VIRYA_DICT:
        if re.search(rf"\b{virya}\b", text, re.IGNORECASE):
            extracted["virya"].append(virya)
            
    for vipaka in VIPAKA_DICT:
        if re.search(rf"\b{vipaka}\b", text, re.IGNORECASE):
            extracted["vipaka"].append(vipaka)
            
    for dosha in DOSHA_DICT:
        if re.search(rf"\b{dosha}\b", text, re.IGNORECASE):
            extracted["dosha"].append(dosha)
            
    for phyto in PHYTOCHEMICAL_DICT:
        if re.search(rf"\b{phyto}\b", text, re.IGNORECASE):
            extracted["phytochemicals"].append(phyto)
            
    # Remove duplicates
    for key in extracted:
        extracted[key] = list(set(extracted[key]))
        
    return extracted

def main():
    print("[+] Initializing NLP Extraction pipeline...")
    
    # Example raw text representations from classical texts/literature
    sample_texts = {
        "turmeric_abstract": (
            "Haridra (Curcuma longa) is characterized by Tikta and Katu Rasa. "
            "It possesses Laghu and Ruksha qualities (Guna), with Ushna Virya and Katu Vipaka. "
            "It is highly effective in pacifying Kapha and Pitta. The therapeutic actions are largely "
            "attributed to its active component Curcumin, which exhibits strong anti-inflammatory properties."
        ),
        "tulsi_abstract": (
            "Tulasi (Ocimum tenuiflorum), or Holy Basil, belongs to the family Lamiaceae. "
            "It is described as having Katu and Tikta Rasa, with Laghu, Ruksha, and Teekshna Guna. "
            "It acts on Vata and Kapha (Vata-Kaphahara). The plant yields volatile essential oil containing "
            "Eugenol, Caryophyllene, and Linalool, as well as triterpenoid Ursolic acid."
        )
    }
    
    results = {}
    for source, text in sample_texts.items():
        print(f"[-] Processing {source}...")
        results[source] = {
            "raw_text": text,
            "extracted_entities": extract_entities(text)
        }
        
    os.makedirs("data/processed", exist_ok=True)
    with open("data/processed/nlp_extraction_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)
        
    print("[+] NLP extraction complete. Saved results to data/processed/nlp_extraction_results.json")

if __name__ == "__main__":
    main()
