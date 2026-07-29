#!/usr/bin/env python3
"""
pdf_extract.py
Simulates parsing of the Ayurvedic Pharmacopoeia of India (API) PDF monographs.
Demonstrates text normalization, section segmentation, and keyword extraction
rules to turn unstructured PDF text into structured dictionary objects.
"""

import re
import json

def clean_extracted_text(text):
    # Remove excessive whitespaces and clean newlines
    text = re.sub(r'\s+', ' ', text)
    # Standardize hyphenations
    text = re.sub(r'-\s+', '', text)
    return text.strip()

def parse_monograph_text(raw_text):
    cleaned = clean_extracted_text(raw_text)
    
    # Locate major monograph fields using regex markers
    botanical_match = re.search(r'(?:Botanical Source|Source)\s*:\s*([^;.]+)', cleaned, re.IGNORECASE)
    parts_match = re.search(r'(?:Part Used|Parts)\s*:\s*([^;.]+)', cleaned, re.IGNORECASE)
    
    rasa_match = re.search(r'Rasa\s*:\s*([^;.]+)', cleaned, re.IGNORECASE)
    guna_match = re.search(r'Guna\s*:\s*([^;.]+)', cleaned, re.IGNORECASE)
    virya_match = re.search(r'Virya\s*:\s*([^;.]+)', cleaned, re.IGNORECASE)
    vipaka_match = re.search(r'Vipaka\s*:\s*([^;.]+)', cleaned, re.IGNORECASE)
    
    results = {
        "botanical_source": botanical_match.group(1).strip() if botanical_match else "Unknown",
        "part_used": parts_match.group(1).strip() if parts_match else "Unknown",
        "properties": {
            "rasa": [r.strip() for r in rasa_match.group(1).split(',')] if rasa_match else [],
            "guna": [g.strip() for g in guna_match.group(1).split(',')] if guna_match else [],
            "virya": virya_match.group(1).strip() if virya_match else "Unknown",
            "vipaka": vipaka_match.group(1).strip() if vipaka_match else "Unknown"
        }
    }
    
    return results

def main():
    print("[+] Initializing PDF Monograph Ingestion Pipeline...")
    
    # Raw mock text simulating text parsed from an API PDF scanner/OCR
    raw_pdf_text_turmeric = """
    MONOGRAPH: HARIDRA (Rhizome)
    Source: Curcuma longa L.
    Part Used: Dried rhizome.
    Rasa: Tikta, Katu.
    Guna: Laghu, Ruksha.
    Virya: Ushna.
    Vipaka: Katu.
    Formulations: Haridrakhanda, Vyoshadi Guti.
    """
    
    parsed_data = parse_monograph_text(raw_pdf_text_turmeric)
    print("[-] Extracted structured features from mock PDF:")
    print(json.dumps(parsed_data, indent=2))
    
    # Save a mock artifact demonstrating extraction
    output_path = "data/processed/pdf_extracted_monograph.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(parsed_data, f, indent=4)
    print(f"[+] Output saved successfully to {output_path}")

if __name__ == "__main__":
    main()
