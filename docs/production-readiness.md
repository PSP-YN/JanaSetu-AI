# Production readiness assessment

**Status: prototype / controlled pilot candidate — not production-ready for real citizen records.**

This assessment is intentionally strict. A successful Next.js build and public deployment do not establish operational, security, privacy or legal readiness.

## Changes delivered in the 2 November 2026 hardening pass

- Fixed hero copy for all six configured interface locales and synchronized the document `lang` attribute.
- Improved hero typography for Indic scripts and added keyboard skip navigation/focus treatment.
- Added source-age/availability reporting for the third-party dataset. The current 5 July 2026 snapshot exceeds the 90-day freshness policy as of 2 November 2026, so the monitor should report attention required.
- Added source-governance register and official-source spot-check notes. PM-USP AY 2026–27 window dates were inconsistent across official NSP search pages; treat the current application window as uncertain.
- Restricted the extension to HTTPS `.gov.in` and `.nic.in` hosts, with explicit click-to-fill and no submission behaviour.
- Published prototype privacy and terms notices. These are disclosures, not legal approval or a DPDP compliance certification.
- Added white-box locale/extension safety tests and black-box HTTP checks for API validation, policy pages and source-monitor contract.

## Verification evidence and remaining gaps

The latest completed CI run before the final documentation-only update passed: unit tests, TypeScript, extension syntax/manifest validation, production dependency audit, Next.js production build and the then-current production HTTP smoke tests. A subsequent CI run adds black-box checks for policy pages and malformed API requests; it must pass before release promotion.

Not yet demonstrated:
- Browser-driven end-to-end tests across all pages, devices and six locales.
- Automated WCAG/axe audit plus manual keyboard and screen-reader review.
- Portal-by-portal extension mapping accuracy on representative official application forms.
- Full review of every imported scheme record or independent approval of all four deterministic rules.
- Penetration test, privacy impact assessment, qualified legal review, incident response and operational monitoring.
- Real-world load, resilience, backup/restore and disaster-recovery exercises.

## Working today

- Public Next.js application deployed on Vercel.
- CI runs unit tests, TypeScript checks, production dependency audit, production build and HTTP smoke checks.
- Deterministic rule screening for four curated Central Government scheme records.
- Source links and source-period labels on catalogue records.
- Multilingual text intake patterns and optional browser speech recognition.
- Browser-local profile, assessment, draft, document metadata and reminder records.
- Human review marker; no automatic government submission.
- No Aadhaar or bank-account fields requested by the prototype.

## Blocking requirements before real citizen use

### Identity, authorization and data
- Add authentication and session management with secure account recovery.
- Replace browser-only persistence with a reviewed database design, encryption at rest, tenant isolation and row-level authorization.
- Define data minimization, purpose limitation, consent, retention, export and deletion workflows.
- Threat-model local storage, XSS, CSRF, session fixation, IDOR and malicious document uploads.
- Never store Aadhaar, bank credentials or sensitive identity documents unless a separately reviewed lawful requirement and secure integration exist.

### Scheme-data governance
- Establish an accountable scheme-domain review process.
- Version every rule with official source, effective date, last checked date, jurisdiction, amendments and reviewer.
- Add automated source-change detection with manual approval before rule updates.
- Build state/UT packs incrementally; do not infer State coverage from profile geography.
- Add rule test fixtures for boundary values, exclusions, conflicting facts and outdated notices.
- Show stale-source warnings and stop screening when a critical source cannot be verified.

### Document processing
- Implement private upload storage, malware scanning, file-type/size controls and OCR with confidence scores.
- Require citizen confirmation of extracted facts; do not treat OCR output as verified evidence.
- Support document deletion, access logs and expiring signed URLs.
- Complete a DPIA/privacy review before processing real documents.

### Reliability and security
- Add browser-based end-to-end tests for core journeys and accessibility checks.
- Add rate limiting, request-size limits, bot protection, structured redacted logs and error monitoring.
- Add backup/restore tests, incident response, dependency update automation and vulnerability remediation SLAs.
- Configure Vercel deployment checks so production promotion is gated by required GitHub checks.
- Add staging/production separation and rollback runbooks.
- Complete an independent penetration test and privacy/security review.

### Integrations and human operations
- Obtain documented permission and API access before integrating DigiLocker, Bhashini, myScheme or departmental systems.
- Maintain official application destinations and never simulate a successful submission.
- Build assisted-worker roles, consent capture and audit trails before partner pilots.
- Define a human escalation and correction path for uncertain or disputed rules.

## Release gates

| Gate | Required evidence |
|---|---|
| Prototype demo | CI green, synthetic-data test, visible disclaimer |
| Controlled pilot | Security review, authenticated accounts, consent, retention/deletion, reviewed scheme packs, support owner |
| Public launch | Pen-test, privacy/legal review, incident response, monitoring, backups, accessible UX, source-update operations |
| Government integration | Written authorization, documented API contract, audit and human approval |

## Current operational boundary

Profiles and drafts are stored in browser local storage. Assessment and draft requests send relevant fields to the app server for processing; the current handlers do not intentionally persist citizen records in a server database. Optional browser speech recognition may use a browser-vendor speech service. Do not enter real sensitive data in the public prototype.
