# BigQuery Release Notes Explorer

The **BigQuery Release Notes Explorer** is a modern, responsive web application built with a Python Flask backend and a plain vanilla HTML, JavaScript, and CSS frontend. It parses Google Cloud's BigQuery release notes Atom feed, presents them in a beautiful, filterable dashboard, and allows you to select, customize, and share updates on X / Twitter.

## Features

- **Granular Parsing**: The backend fetches the official feed and parses individual release notes (splitting entries with multiple updates by `<h3>` tags) to provide clean date- and type-categorized cards.
- **Premium Aesthetics**: Features a professional glowing dark-theme developer portal with customized CSS variables, responsive grid layouts, hover effects, and custom scrollbars.
- **Modern CSS Animations**: The details drawer uses modern native CSS nesting, `@starting-style`, `transition-behavior: allow-discrete`, and the `overlay` property to enable smooth entry and exit transitions for the native HTML5 `<dialog>` component.
- **Advanced Tweet Composer**: Includes an integrated Tweet preview and edit area inside the details view, with accurate character count calculation (handles URL length weighting) and a one-click button to open X Web Intents.
- **Light/Dark Mode**: Clean color palette switching saved directly to the browser's local storage.
- **Robust Caching**: Utilizes a 5-minute memory cache on the backend to limit API rate usage and falls back to cached data in case the Google Cloud feeds go offline.

---

## Technical Stack

```
   Atom Feed: BigQuery XML 
             │
             ▼ (Fetched via Requests)
      Flask Server (app.py)
             │
             ▼ (Segments HTML via BeautifulSoup)
      JSON API (/api/notes)
             │
             ▼ (Fetch API / Vanilla JS)
      Frontend App (app.js)
             │
             ▼ (Populates Cards & Filters)
     HTML/CSS UI (index.html)
             │
             ▼ (Select Card)
  Details Modal & Tweet Composer
             │
             ▼ (X Web Intent)
      Twitter Share Window
```

- **Backend**:
  - `Flask`: Serves routes and JSON API.
  - `requests`: Pulls release notes XML from GCP.
  - `BeautifulSoup` (bs4): Segments multiple updates within XML entries and strips plain text for Twitter character validation.
- **Frontend**:
  - `HTML5`: Clean semantic elements (`<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`).
  - `Vanilla CSS3`: Responsive grid, custom glassmorphism glows, badge styling, and native dialog backdrop effects.
  - `Vanilla JS`: Search filtering, categorization, character counting, copy to clipboard, and light/dark theme toggle.

---

## File Structure

The project has been organized as follows:
- [app.py](app.py): Main entry point for the Flask server, caching logic, and feed parser.
- [templates/index.html](templates/index.html): HTML structure for the dashboard and details drawer.
- [static/style.css](static/style.css): Custom styles, colors, light/dark mode variables, and transitions.
- [static/app.js](static/app.js): Client-side routing, filtering, character counting, and interactions.

---

## How to Run Locally

### 1. Set Up the Environment
Make sure the virtual environment dependencies are active. You can run the application directly from the project directory:

```bash
# Execute within the project workspace (/Users/legend27648/agy-cli-projects)
./venv/bin/python app.py
```

### 2. Open the App
Once started, the Flask development server will run locally. Open your browser and navigate to:
[http://127.0.0.1:5000](http://127.0.0.1:5000)

### 3. Usage Tips
- **Force Refresh**: Click the **Refresh** button next to the theme toggle. This bypasses the in-memory cache and makes a fresh request to the GCP XML endpoint.
- **Filter & Search**: Select category pills (e.g. Features, Deprecations) to filter by update type, or type keywords in the search bar.
- **Compose and Tweet**: Click on any release card to open its detail panel. Adjust the draft text inside the text area, and click **Tweet** to share it.
