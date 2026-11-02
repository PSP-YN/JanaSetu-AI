# JanaSetu security assessment and independent test scope

**Status: Engineering controls in progress; no independent penetration test has been performed.**

## Implemented baseline
- HTTPS-only government-domain check in extension; explicit popup action; no form submission.
- Streaming JSON byte cap on intake, assessment and draft routes (oversized chunked bodies are cancelled before full buffering).
- Strict citizen-profile schema validation rejects unexpected keys, invalid types, out-of-range age/income and malformed enum values.
- Security response headers configured in Next.js: nosniff, frame denial, strict referrer policy, permissions policy, HSTS and COOP.
- Existing CI runs unit tests, TypeScript, extension syntax/manifest, production dependency audit, build and smoke tests.
- Scheme screening fails closed until a scheme is explicitly marked approved.

## Remaining engineering verification
- Verify the deployed response headers and HSTS behaviour over HTTPS.
- Validate every API route's schema, nested field types, boundary values and malformed JSON.
- Add abuse/rate controls using a durable shared store; do not rely on process-memory counters in serverless functions.
- Review CORS/origin behaviour, CSRF assumptions, caching, logs and error messages.
- Add CSP in report-only mode, collect violations, then enforce only after Next.js runtime compatibility tests.
- Inspect npm audit output, lockfile and GitHub Actions pinning; run secret scanning and SAST.
- Verify no request bodies or personal fields are written to logs/analytics.
- Test extension against hostile pages, iframes, duplicate labels, dynamic DOM, React/Vue controlled inputs and sensitive fields.

## Independent penetration-test scope
A qualified independent tester must receive a defined staging environment and written authorization. Scope should include:
- Reconnaissance and exposed route inventory.
- XSS (stored/reflected/DOM), injection, CSRF, CORS, SSRF, path traversal, request smuggling where applicable.
- API abuse, oversized payloads, rate-limit bypass, malformed JSON and resource exhaustion.
- Sensitive data exposure in browser storage, network traffic, logs, backups and errors.
- Extension permissions, content-script isolation, malicious DOM labels and host checks.
- Dependency/supply-chain review and deployment configuration.
- Findings rated with severity, reproducible evidence, remediation owner and retest outcome.

Do not describe internal CI, an AI code review or this threat model as a penetration test. No production launch with real citizen data until the report is received and all critical/high findings are remediated or explicitly risk-accepted by the accountable owner.
