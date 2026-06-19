import re
import urllib3
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from flask import Flask, jsonify, render_template, request
import time

# Suppress insecure certificate warnings if any
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)

# Simple in-memory cache
CACHE_DURATION = 300  # 5 minutes
cache = {
    'data': None,
    'timestamp': 0
}

FEED_URL = 'https://docs.cloud.google.com/feeds/bigquery-release-notes.xml'

def parse_release_notes():
    try:
        # Fetch the feed
        # We can bypass SSL verification locally if needed, but try default SSL verify first.
        # Fallback to verify=False if it fails, ensuring robustness.
        try:
            response = requests.get(FEED_URL, timeout=10)
            response.raise_for_status()
        except requests.exceptions.SSLError:
            # Fallback for systems with certificate store issues
            response = requests.get(FEED_URL, verify=False, timeout=10)
            response.raise_for_status()
            
        xml_content = response.text
        
        # Clean namespace for easier xml parsing
        xml_content_clean = re.sub(r'\sxmlns="[^"]+"', '', xml_content, count=1)
        root = ET.fromstring(xml_content_clean)
        
        entries = []
        for entry_elem in root.findall('entry'):
            date_str = entry_elem.find('title').text
            if date_str:
                date_str = date_str.strip()
                
            updated_str = entry_elem.find('updated').text
            if updated_str:
                updated_str = updated_str.strip()
                
            link_elem = entry_elem.find('link')
            href = link_elem.attrib.get('href', '') if link_elem is not None else ''
            
            id_str = entry_elem.find('id').text
            if id_str:
                id_str = id_str.strip()
            
            content_elem = entry_elem.find('content')
            content_html = content_elem.text if content_elem is not None else ''
            
            if not content_html:
                continue
                
            soup = BeautifulSoup(content_html, 'html.parser')
            
            # Segment HTML content by <h3> tags
            current_type = 'General'
            current_html_parts = []
            
            for child in soup.contents:
                if child.name == 'h3':
                    # Save previous segment if it has content
                    if current_html_parts:
                        segment_html = "".join(str(c) for c in current_html_parts).strip()
                        if segment_html:
                            # Generate plain text summary for tweeting
                            plain_text = BeautifulSoup(segment_html, 'html.parser').get_text().strip()
                            # Clean up extra spacing
                            plain_text = re.sub(r'\s+', ' ', plain_text)
                            entries.append({
                                'date': date_str,
                                'updated': updated_str,
                                'type': current_type,
                                'html': segment_html,
                                'plain_text': plain_text,
                                'link': href,
                                'id': f"{id_str}_{current_type}_{len(entries)}"
                            })
                    current_type = child.get_text().strip()
                    current_html_parts = []
                else:
                    current_html_parts.append(child)
                    
            # Save the last segment
            if current_html_parts or current_type != 'General':
                segment_html = "".join(str(c) for c in current_html_parts).strip()
                if segment_html:
                    plain_text = BeautifulSoup(segment_html, 'html.parser').get_text().strip()
                    plain_text = re.sub(r'\s+', ' ', plain_text)
                    entries.append({
                        'date': date_str,
                        'updated': updated_str,
                        'type': current_type,
                        'html': segment_html,
                        'plain_text': plain_text,
                        'link': href,
                        'id': f"{id_str}_{current_type}_{len(entries)}"
                    })
                    
        return entries, None
    except Exception as e:
        return None, str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    current_time = time.time()
    
    if force_refresh or not cache['data'] or (current_time - cache['timestamp'] > CACHE_DURATION):
        data, error = parse_release_notes()
        if error:
            # If we have cached data, return it even if expired, rather than failing
            if cache['data']:
                return jsonify({
                    'status': 'warning',
                    'message': f"Failed to refresh data: {error}. Serving stale cache.",
                    'notes': cache['data'],
                    'cached_at': cache['timestamp']
                })
            return jsonify({
                'status': 'error',
                'message': f"Failed to fetch release notes: {error}"
            }), 500
        
        cache['data'] = data
        cache['timestamp'] = current_time
        
    return jsonify({
        'status': 'success',
        'notes': cache['data'],
        'cached_at': cache['timestamp']
    })

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
