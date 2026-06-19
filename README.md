# BigQuery Release Notes Dashboard (v2.0.0)

A production-quality, portfolio-worthy developer dashboard built with a Python Flask backend and a plain vanilla HTML, JavaScript (ES6 Modules), and CSS frontend. It secures, caches, and aggregates Google Cloud's BigQuery release notes XML feed, delivering them via a responsive interactive UI with full offline support, structured data export, keyboard controls, and Google Gemini AI insights.

---

## 1. Technical Architecture & Data Flow

This application is designed with strict separation of concerns, decoupling server-side parsing and caching logic from client-side state management, UI rendering, and user interactions.

```
       [Google Cloud BigQuery Atom Feed (XML)]
                         │
                         ▼ (HTTPS request with Exponential Backoff)
               [Feed Parser: parser.py]
                         │ (Namespace cleaning & secure defusedxml parsing)
                         ▼
             [Cache Manager: cache.py]
            (Thread-safe, File-backed JSON Cache)
                         │
                         ▼ (Flask Server: app.py)
       ┌─────────────────┴─────────────────┐
       ▼ (Serves static routes)            ▼ (JSON API: /api/notes)
  [HTML / CSS / JS Assets]           [Browser AJAX: modules/api.js]
                                           │
                                           ▼ (Pipes data & bookmarks)
                                    [State: modules/state.js]
                                           │
                                           ▼ (Sync state changes)
                                   [UI: modules/ui.js]
                                  (DOMPurify Sanitization)
                                           │
                        ┌──────────────────┼──────────────────┐
                        ▼                  ▼                  ▼
                [Grid/List views]   [Exporters / Copy]  [Gemini AI Panel]
```

- **Backend**: Serves JSON APIs, manages background feed parsing, handles credentials securely on the server, and hosts structured JSON logger outputs.
- **Frontend**: Organized as ES6 Javascript modules. Renders UI nodes, handles event binding, manages local state (bookmarks and history), and runs client-side file compilers.

---

## 2. Codebase Folder Structure

Here is the repository directory structure:

```
legend-bigquery-release-notes/
├── .github/                         # GitHub templates directory
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md            # Issue template for bugs reporting
│   │   └── feature_request.md       # Issue template for feature request ideas
│   └── PULL_REQUEST_TEMPLATE.md     # Code reviews check sheet
├── static/                          # Frontend Static Assets
│   ├── modules/                     # ES6 Javascript Modules
│   │   ├── api.js                   # Wraps backend route fetches
│   │   ├── events.js                # Keyboard shortcuts & toolbar bindings
│   │   ├── exports.js               # Copy to clipboard & file compiler Blobs
│   │   ├── state.js                 # Local filters state, bookmarks & history
│   │   └── ui.js                    # Card renders, loader nodes & toast stacks
│   ├── app.js                       # Main application entrance
│   └── style.css                    # UI styles, CSS variables & print media overrides
├── templates/
│   └── index.html                   # Semantic HTML layout, modals & templates
├── .gitignore                       # Ignores env variables, virtual env, and caches
├── CHANGELOG.md                     # Semantic versioning release notes history
├── CODE_OF_CONDUCT.md               # Community guidelines andstandards
├── CONTRIBUTING.md                  # Development setup and pull request rules
├── LICENSE                          # MIT open source license rules
├── SECURITY.md                      # Security vulnerability processes
├── README.md                        # Technical roadmap and architecture guides
├── app.py                           # Main Flask server & middleware
├── parser.py                        # Secure XML parser & segment extractor
├── cache.py                         # Thread-safe file-backed caching engine
└── ai_service.py                    # Google Gemini API connector & templates
```

---

## 3. Server API Reference

### 3.1 Fetch Release Notes
Retrieves granular release notes parsed from the BigQuery Atom feed.
- **Endpoint**: `/api/notes`
- **Method**: `GET`
- **Query Parameters**:
  - `refresh=true` (Optional: bypasses the cache and forces a fresh GCP request).
- **Responses**:
  - `200 OK` (Success):
    ```json
    {
      "status": "success",
      "notes": [
        {
          "id": "tag:google.com,2016:bigquery-release-notes#June_17_2026_Feature_0",
          "date": "June 17, 2026",
          "updated": "2026-06-17T00:00:00-07:00",
          "type": "Feature",
          "html": "<p>Autonomous embedding generation is now generally available...",
          "plain_text": "Autonomous embedding generation is now generally available...",
          "link": "https://docs.cloud.google.com/bigquery/docs/release-notes#June_17_2026"
        }
      ],
      "source": "cache" | "network" | "stale_cache"
    }
    ```
  - `500 Internal Server Error`: Returned if the GCP feed is offline and no cached database is available.

### 3.2 Request AI Analysis
Submits release note texts to Google Gemini to extract structural insights.
- **Endpoint**: `/api/ai/analyze`
- **Method**: `POST`
- **Request Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "id": "string (note unique id)",
    "content": "string (note plain text to analyze)",
    "date": "string (release date)",
    "type": "string (note type)",
    "mode": "summary" | "explanation_beginner" | "explanation_tech" | "impact" | "migration" | "upgrade_checklist" | "breaking_warning" | "tweet" | "linkedin" | "blog",
    "length": "short" | "medium" | "long",
    "link": "string (optional link back)"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "status": "success",
      "result": "AI generated analysis string...",
      "source": "gemini_api" | "mock_fallback"
    }
    ```
  - `400 Bad Request`: Content payload is missing.
  - `500 Server Error`: Unexpected AI exception processing.

---

## 4. Production Security Practices

1. **XML Entity Attacks Defense**: Standard Python XML parsers are vulnerable to XML entity expansion attacks. We utilize `defusedxml` to block external entity retrieval and recursive expansion during feed loading.
2. **Stored Cross-Site Scripting (XSS)**: Release notes contain active links and code tags. We parse elements securely and pass all HTML strings through `DOMPurify` on the client side before writing to elements (`innerHTML`), ensuring unverified scripts cannot execute.
3. **Strict Content-Security-Policy (CSP)**: Server responses restrict JS loads to trusted CDNs (for DOMPurify) and block unsafe executions of foreign scripts.
4. **Secure Keys Encapsulation**: Gemini keys are kept in server environments and never leak to browser configurations.

---

## 5. Development Setup & Execution

### Prerequisites
- Python 3.10 or higher.
- A Google Gemini API Key (Optional: for live AI generations).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/L9G9N0/legend-bigquery-release-notes.git
   cd legend-bigquery-release-notes
   ```

2. Initialize virtual environment and install packages:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install flask requests beautifulsoup4 defusedxml
   ```

3. Configure your environment keys (Optional):
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   export FLASK_DEBUG=true
   ```

4. Launch the local development server:
   ```bash
   python app.py
   ```
   Open your browser and navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## 6. Future Roadmap

### Phase 1: Advanced Metrics Tracking
- Implement Google Analytics or custom backend logging stats to track which update categories generate the most clicks and AI summary requests.
- Track user search trends to identify which BigQuery products are drawing the most interest.

### Phase 2: Webhook Alert Channels
- Set up Slack/Discord webhook alerts on the backend: notify engineering channels automatically as soon as a `Breaking Change` or `Deprecation` category update is parsed in the daily feed fetch.

### Phase 3: Offline PWA Support
- Convert the UI into a Progressive Web App (PWA) using Service Workers to cache assets locally, enabling users to browse historical release logs completely offline.
