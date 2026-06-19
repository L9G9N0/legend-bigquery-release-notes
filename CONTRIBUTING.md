# Contributing to BigQuery Release Notes Dashboard

Thank you for choosing to contribute to our project! We welcome code improvements, bug reports, documentation updates, and feature suggestions.

## Development Workflow

1. **Fork & Clone**: Fork this repository to your own GitHub account and clone it locally.
2. **Environment Setup**:
   Create a virtual environment and install the package dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Run Locally**:
   Run the Flask server locally:
   ```bash
   FLASK_DEBUG=true python app.py
   ```
4. **Make Changes**: Create a descriptive feature branch (`feature/your-feature-name`) and make your modifications.

## Style Guidelines

### Python (Backend)
- Adhere to PEP 8 syntax formatting.
- Ensure all network calls are wrapped in robust exception handling blocks and utilize the structured JSON loggers.
- Keep route handlers focused on validation and return structures; encapsulate parsing and cache logics in distinct helper modules.

### JavaScript & CSS (Frontend)
- Use standard ES6 classes and modular exports. Avoid declaring global variables.
- Write semantic HTML5 tags and ensure ARIA labels accompany all interactive controls.
- Style controls using standard CSS variables defined inside the `style.css` root theme blocks.

## Submitting Pull Requests

- Commit descriptive details using standard commit prefixes (e.g., `feat:`, `fix:`, `docs:`, `chore:`).
- Document your changes in the `CHANGELOG.md` file.
- Verify that keyboard navigation and responsive views scale properly before finalizing the Pull Request.
