# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-19
### Added
- Created a secure XML feed parser (`parser.py`) implementing `defusedxml` to block XXE attacks.
- Added thread-safe caching engine (`cache.py`) supporting memory caching and file-backed persistence to survive system restarts.
- Structured JSON Logging matching production server guidelines.
- Advanced Toolbar on the client UI supporting multi-select filters and Date Range Pickers.
- Card grid controls to switch between Layout grid and Compact list views.
- Bookmarks / Favorites system saving starred release notes in browser's local storage.
- Format Copying buttons allowing copying release notes as Plain Text, Markdown, or raw HTML structure.
- Client-side data exporters allowing batch downloads of filtered notes to JSON and CSV formats.
- CSS `@media print` style overrides allowing printing single notes directly to PDF format from the drawer dialog.
- Integration of Google Gemini AI API route (`/api/ai/analyze`) supplying developer summaries, beginner explanations, technical details, system impacts, checklists, breaking warnings, tweets, and blog outlines. Includes mock templates fallback.
- Stacking toast notification alerts.
- Accessibility improvements complying with WCAG AA guidelines (focus indicators, ARIA attributes, keyboard navigation arrow controls, and dialog focus loops).
- Content-Security-Policy (CSP) headers and DOMPurify client-side sanitization.

### Changed
- Refactored the monolithic script [static/app.js](static/app.js) into decoupled ES6 JavaScript modules: `state.js`, `api.js`, `ui.js`, `events.js`, and `exports.js`.
- redone CSS properties with organized layout variables and print support overrides.

## [1.0.0] - 2026-06-19
### Added
- Initial prototype application serving release notes fetched from Google Cloud's BigQuery RSS feed.
- Basic search input, type filter pills, and in-memory caching.
- Slide-out details drawer with single tweet composer.
- Theme toggles (Dark and Light modes).
