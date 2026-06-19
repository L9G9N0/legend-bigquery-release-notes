# Security Policy

## Supported Versions

Only the latest version of the dashboard application is actively supported and monitored for security issues.

| Version | Supported |
| :--- | :--- |
| v2.0.x | Yes |
| < v2.0.0 | No |

## Reporting a Vulnerability

If you discover any security vulnerability in this project, please do not disclose it publicly or open a GitHub issue. Instead, report it through the following process:

1. Send an email describing the details to **security-report@example.com** (replace with your secure contact if desired).
2. Include description details of the vulnerability, step-by-step instructions to reproduce it, and potential mitigations.
3. We will acknowledge your report within 48 hours and work with you to resolve the vulnerability securely.
4. Once fixed, we will publish a security patch release and credit your contribution.

---

## Implemented Defenses

Our architecture implements the following security protocols:
- **XML Security**: Uses `defusedxml` to parse Atom feed XML, preventing XML External Entity (XXE) and Billion Laughs XML entity expansion attacks.
- **Client Sanitization**: Employs `DOMPurify` to sanitize release note markup before rendering it in the DOM, preventing stored Cross-Site Scripting (XSS).
- **HTTP Security Headers**: Enforces strict security configurations on the Flask server, including Content-Security-Policy (CSP), X-Frame-Options (Clickjacking defense), and X-Content-Type-Options.
- **Secure Key Management**: Sources sensitive credentials (like the Google Gemini API Key) strictly from server-side environment variables (`GEMINI_API_KEY`), ensuring keys are never exposed to the client browser.
