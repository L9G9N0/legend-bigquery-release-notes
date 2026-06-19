import os
import json
import logging
from flask import Flask, jsonify, render_template, request
from parser import fetch_and_parse_feed
from cache import FileBackedCache
from ai_service import get_ai_insight

# ==========================================================================
# Load Environment Variables from .env
# ==========================================================================
if os.path.exists('.env'):
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key] = val.strip()

# ==========================================================================
# Structured Logging Setup (Production Standard JSON logs)
# ==========================================================================
class StructuredJsonFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "time": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "file": record.filename,
            "line": record.lineno
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)

# Configure Root logger
logger = logging.getLogger("release_notes_explorer")
logger.setLevel(logging.INFO)

# Stream Handler formatting JSON to stdout
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(StructuredJsonFormatter())
logger.addHandler(stream_handler)

# Disable duplicate default flask handlers for clean logs
flask_log = logging.getLogger('werkzeug')
flask_log.setLevel(logging.WARNING)

# Initialize Flask App
app = Flask(__name__)

# Initialize secure, thread-safe, file-backed cache
cache = FileBackedCache(cache_filepath="release_notes_cache.json", default_expiry_seconds=300)

# ==========================================================================
# Security Headers Middleware
# ==========================================================================
@app.after_request
def apply_security_headers(response):
    """
    Enforces secure headers to mitigate common web vulnerabilities
    including XSS, Clickjacking, and MIME-sniffing.
    """
    # Strict CSP allowing self, fonts, CDNs for bootstrap, popovers, DOMPurify
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https://*.google.com; "
        "connect-src 'self' https://docs.cloud.google.com;"
    )
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# ==========================================================================
# Routes
# ==========================================================================
@app.route('/')
def index():
    logger.info("Serving home route.")
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    """
    JSON API serving parsed release notes.
    Checks cache first, fetches from GCP on cache miss or force refresh.
    """
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    
    if force_refresh:
        logger.info("Force refresh requested. Clearing cache.")
        cache.clear()
        
    cached_data, is_stale = cache.get()
    
    if cached_data and not is_stale:
        return jsonify({
            'status': 'success',
            'notes': cached_data,
            'source': 'cache'
        })
        
    # Cache miss or expired cache
    fresh_notes, error = fetch_and_parse_feed()
    
    if fresh_notes:
        cache.set(fresh_notes)
        return jsonify({
            'status': 'success',
            'notes': fresh_notes,
            'source': 'network'
        })
        
    # If network fetch failed, but we have stale cache, serve stale cache gracefully
    if cached_data:
        logger.warning(f"Network fetch failed: {error}. Falling back to stale cached data.")
        return jsonify({
            'status': 'warning',
            'message': f"Could not fetch fresh updates ({error}). Displaying cached notes.",
            'notes': cached_data,
            'source': 'stale_cache'
        })
        
    # Network failed and no cache is available
    logger.error(f"Failed to fetch release notes and no cache is available. Error: {error}")
    return jsonify({
        'status': 'error',
        'message': f"Failed to retrieve release notes: {error}"
    }), 500

# Production-ready endpoint for Phase 5 Gemini AI features
@app.route('/api/ai/analyze', methods=['POST'])
def analyze_note():
    """
    Invokes the Gemini AI Service to analyze release notes.
    Accepts JSON body specifying release contents, categories, and lengths.
    """
    try:
        req_data = request.get_json() or {}
        
        note_id = req_data.get('id')
        content = req_data.get('content', '')
        date_str = req_data.get('date', '')
        type_str = req_data.get('type', '')
        mode = req_data.get('mode', 'summary')
        length = req_data.get('length', 'medium')
        link_url = req_data.get('link', '')
        
        if not content:
            return jsonify({
                'status': 'error',
                'message': 'No content provided for AI analysis'
            }), 400
            
        logger.info(f"AI analysis requested for note: {note_id}, category: {mode}, length: {length}")
        
        result, source = get_ai_insight(
            note_content=content,
            date_str=date_str,
            type_str=type_str,
            link_url=link_url,
            mode=mode,
            length=length
        )
        
        return jsonify({
            'status': 'success',
            'result': result,
            'source': source
        })
        
    except Exception as err:
        logger.error(f"Error handling /api/ai/analyze route: {err}")
        return jsonify({
            'status': 'error',
            'message': f"Unexpected system error: {str(err)}"
        }), 500

if __name__ == '__main__':
    # Production note: debug should be set via environment variable. 
    # For local running, default to False for security.
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug_mode, host='127.0.0.1', port=5000)
