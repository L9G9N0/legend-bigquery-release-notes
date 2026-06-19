import re
import logging
import requests
from bs4 import BeautifulSoup
import defusedxml.ElementTree as ET

logger = logging.getLogger("release_notes_explorer")

# GCP BigQuery release notes Feed URL
FEED_URL = 'https://docs.cloud.google.com/feeds/bigquery-release-notes.xml'

def clean_namespaces(xml_string):
    """
    Remove standard Atom namespace prefix declarations for simpler ElementTree queries.
    """
    return re.sub(r'\sxmlns="[^"]+"', '', xml_string, count=1)

def parse_html_content(content_html, date_str, updated_str, link_href, entry_id_base, notes_list):
    """
    Parses a single <content> HTML block, splits it by <h3> tags, and appends notes to notes_list.
    """
    if not content_html:
        return
        
    soup = BeautifulSoup(content_html, 'html.parser')
    
    current_type = 'General'
    current_html_parts = []
    
    for child in soup.contents:
        if child.name == 'h3':
            # Save previous accumulated note segment
            if current_html_parts:
                save_segment(current_html_parts, current_type, date_str, updated_str, link_href, entry_id_base, notes_list)
            # Update the note type
            current_type = child.get_text().strip()
            current_html_parts = []
        else:
            current_html_parts.append(child)
            
    # Save final remaining segment
    if current_html_parts or current_type != 'General':
        save_segment(current_html_parts, current_type, date_str, updated_str, link_href, entry_id_base, notes_list)

def save_segment(html_parts, note_type, date_str, updated_str, link_href, entry_id_base, notes_list):
    """
    Constructs a note entry from accumulated HTML parts, cleans text, and appends to notes list.
    """
    segment_html = "".join(str(c) for c in html_parts).strip()
    if not segment_html:
        return
        
    # Generate plain text summary for Twitter composer and search indexing
    plain_text = BeautifulSoup(segment_html, 'html.parser').get_text().strip()
    plain_text = re.sub(r'\s+', ' ', plain_text)
    
    notes_list.append({
        'date': date_str,
        'updated': updated_str,
        'type': note_type,
        'html': segment_html,
        'plain_text': plain_text,
        'link': link_href,
        'id': f"{entry_id_base}_{note_type}_{len(notes_list)}"
    })

def fetch_and_parse_feed(timeout_seconds=10, max_retries=3):
    """
    Fetches the BigQuery Release Notes RSS/Atom feed and parses it into individual release notes.
    Uses defensive XML parser to prevent XXE.
    Includes retry logic with exponential backoff.
    """
    import time
    
    retry_delay = 1.0  # start delay
    response = None
    
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Attempting to fetch feed (Attempt {attempt}/{max_retries})")
            # Try secure HTTPS fetch, fallback to unverified ONLY if system certificates are broken.
            try:
                response = requests.get(FEED_URL, timeout=timeout_seconds)
                response.raise_for_status()
            except requests.exceptions.SSLError as ssl_err:
                logger.warning(f"SSL validation failed on attempt {attempt}: {ssl_err}. Retrying with verify=False.")
                response = requests.get(FEED_URL, verify=False, timeout=timeout_seconds)
                response.raise_for_status()
                
            logger.info("Successfully fetched release notes feed from GCP.")
            break
        except requests.exceptions.RequestException as req_err:
            logger.error(f"Network error on attempt {attempt}: {req_err}")
            if attempt == max_retries:
                return None, f"Network request failed after {max_retries} attempts: {req_err}"
            time.sleep(retry_delay)
            retry_delay *= 2.0  # Exponential backoff
            
    if not response or not response.text:
        return None, "Received empty response from release notes feed."
        
    try:
        # Secure XML Parse (prevent XXE / Billion Laughs)
        cleaned_xml = clean_namespaces(response.text)
        root = ET.fromstring(cleaned_xml)
        
        parsed_notes = []
        entries = root.findall('entry')
        
        logger.info(f"Feed contains {len(entries)} raw daily entries. Starting segment extraction.")
        
        for entry_elem in entries:
            date_elem = entry_elem.find('title')
            date_str = date_elem.text.strip() if date_elem is not None else 'Unknown Date'
            
            updated_elem = entry_elem.find('updated')
            updated_str = updated_elem.text.strip() if updated_elem is not None else ''
            
            link_elem = entry_elem.find('link')
            link_href = link_elem.attrib.get('href', '') if link_elem is not None else ''
            
            id_elem = entry_elem.find('id')
            id_base = id_elem.text.strip() if id_elem is not None else 'bq_note'
            
            content_elem = entry_elem.find('content')
            content_html = content_elem.text if content_elem is not None else ''
            
            parse_html_content(content_html, date_str, updated_str, link_href, id_base, parsed_notes)
            
        logger.info(f"Extraction complete. Extracted {len(parsed_notes)} granular release note updates.")
        return parsed_notes, None
        
    except ET.ParseError as parse_err:
        logger.critical(f"XML Parsing Error: {parse_err}")
        return None, f"Failed to parse XML content securely: {parse_err}"
    except Exception as exc:
        logger.critical(f"Unexpected error parsing feed: {exc}")
        return None, f"Unexpected error: {exc}"
