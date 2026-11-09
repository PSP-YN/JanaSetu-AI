# Production readiness — current release assessment

## Current public-site release scope (9 November 2026)
The public root route is now a standalone landing page. The prior citizen workspace is retained at `/app` and marked `noindex`. Privacy and terms remain at their existing same-origin routes. This is a landing-page and information-architecture release, not a certification that the citizen application is production-ready.

### Implemented in this release candidate
- Responsive public landing page with a custom vector hero illustration and JanaSetu brand asset.
- Clear independent-service disclosure and no unsupported government affiliation, eligibility, coverage, or application-submission claims.
- Same-origin route to the existing workspace at `/app`.
- Canonical metadata, Open Graph/Twitter metadata, generated PNG Open Graph image, robots.txt, sitemap.xml and semantic FAQ content.
- CI smoke tests for the landing page, workspace, branding assets, SEO endpoints, existing API contracts and legal pages.
- Production monitor updated to check the new public route structure.
- Removed the sample household fixture and sample-profile action from the workspace.
- Citizen avatar now uses citizen initials or a generic icon; the uploaded image is used as the JanaSetu brand asset.

### Local verification evidence
- `npm run check`: passed (TypeScript plus 60 unit tests).
- `npm run build`: passed.
- `npm run test:e2e`: passed (40 Playwright tests; includes axe scans for landing, workspace, privacy and terms).
- Local production smoke test: passed for `/`, `/app`, logo, hero illustration, robots, sitemap, generated PNG Open Graph image, health API, privacy and terms.
- `npm audit --omit=dev --audit-level=high`: 0 production dependency vulnerabilities.
- `git diff --check`: passed.

## Still not production-ready for citizen application operations
- No JanaSetu-owned citizen authentication, database, or cross-device persistence.
- Citizen profile, assessments, drafts, documents metadata and reminders remain browser-local.
- Document file bytes are not securely uploaded, malware scanned, OCR processed or stored.
- The current catalogue remains partial and includes distinct catalogue-only and budget-lead classes. External machine-parsed discovery snapshot freshness is independently monitored but does not establish eligibility.
- No universal government portal submission integration or official status synchronization.
- No independently completed legal review, privacy impact assessment sign-off, penetration test, disaster-recovery drill or load test demonstrating high-concurrency capacity.

## Release gate
A landing-page release may be deployed independently after pull-request CI, preview review and production smoke checks pass. The full citizen application must not be represented as an end-to-end government application service until the outstanding backend, data verification, security, legal and authorized integration gates are implemented and independently verified.

---

## Previous detailed production assessment

# Production readiness assessment

**Status: deployed prototype — not production-ready for real citizen records. Updated 5 November 2026.**

This assessment is intentionally strict. A successful Next.js build and public deployment do not establish operational, security, privacy or legal readiness.

## Changes delivered in the 2–3 November 2026 hardening pass

- Fixed hero copy for all six configured interface locales and synchronized the document `lang` attribute.
- Improved hero typography for Indic scripts and added keyboard skip navigation/focus treatment.
- Added source-age/availability reporting for the third-party dataset. The 5 July 2026 snapshot is 121 days old on 3 November 2026 and exceeds the 90-day freshness policy; the monitor must report attention required.
- Added source-governance register and official-source spot-check notes. PM-USP AY 2026–27 window dates were inconsistent across official NSP search pages; treat the current application window as uncertain.
- Restricted the extension to HTTPS `.gov.in` and `.nic.in` hosts, with explicit click-to-fill and no direct form-submission API calls. Portal scripts may react to dispatched field-change events.
- Published prototype privacy and terms notices with six-locale page content. Translations are unreviewed drafts; these notices are not legal approval or a DPDP compliance certification.
- Added white-box locale/extension safety tests and black-box HTTP checks for API validation, policy pages and source-monitor contract.

- Expanded main-workspace UI localization, counts, dates, status copy and notifications across English, Hindi, Kannada, Tamil, Telugu and Malayalam. Privacy/Terms pages, convenience scheme summaries and extension popup now have six-locale content; fluent-speaker and qualified legal review remain outstanding.
- Added `package-lock.json` and switched CI to `npm ci` for reproducible installs.
- Added a complete local full-text index over all 4,693 bundled SmartDuke rows. The upstream `/search` endpoint remains unavailable, but keyword and category filtering now search the entire local snapshot rather than the displayed page; the UI explicitly discloses the stale snapshot and fallback mode.

## Verification evidence and remaining gaps

Local verification on 4 November 2026 passed: 59 unit tests, 36 Playwright tests against a freshly built production-mode local server, TypeScript, extension syntax/Manifest V3 validation, locale key-parity checks, production dependency audit (0 vulnerabilities), Next.js production build and local production smoke tests. PR #6 was squash-merged to main as `493d0c2414cfd1028b8f9887644355f6deb03dcc`; GitHub Actions run `41691385168` passed. The Vercel production deployment is READY and passed live HTTP plus six-locale browser/accessibility checks.

Not yet demonstrated:
- Fluent-speaker review of the implemented six-locale workspace, legal pages, convenience scheme translations and extension popup. Official source records remain source-authoritative and may remain in their original language.
- Manual keyboard, screen-reader, contrast, zoom and mobile review; axe scans currently cover critical/serious violations on main, privacy and terms pages.
- Portal-by-portal extension mapping accuracy on representative official application forms.
- Full review of every imported scheme record or independent approval of all four deterministic rules.
- Penetration test, privacy impact assessment, qualified legal review, incident response and operational monitoring.
- Real-world load, resilience, backup/restore and disaster-recovery exercises.

## Working today

- Public Next.js application deployed on Vercel.
- CI runs unit tests, TypeScript checks, production dependency audit, production build and HTTP smoke checks.
- Four built-in deterministic scheme rules, all fail-closed pending independent human source/rule approval; they must not be treated as approved eligibility decisions.
- Source links and source-period labels on catalogue records.
- Multilingual text intake patterns and optional browser speech recognition.
- Browser-local profile, assessment, draft, document metadata and reminder records; backup restore validates imported data and forces assessments to be rerun.
- Human review marker; JanaSetu makes no direct form-submission API calls. The experimental extension dispatches field-change events, which portal scripts may react to; check the page after filling.
- No Aadhaar or bank-account fields requested by the prototype.

## Current Vercel deployment observations — 3 November 2026

- Production domain [`https://jana-setu-ai.vercel.app`](https://jana-setu-ai.vercel.app) is live on main commit `493d0c2414cfd1028b8f9887644355f6deb03dcc`; Vercel deployment `dpl_3GR7ZgPtByT2QpSTVnyhWiiC9vdX` is READY.
- Live smoke on the prior production release: `/`, `/api/health`, `/api/schemes` (142 records), `/api/sources/health`, `/api/schemes/open-data?q=farmer`, `/privacy` and `/terms` returned HTTP 200. The new branch adds a full-index search smoke test and updated provenance counts.
- Source monitor remains `attention_required`: publisher metadata and `/rows` are reachable, upstream `/search` is unavailable, and the 5 July 2026 third-party snapshot is stale. The application searches the complete local 4,693-row index and displays a stale-snapshot/fallback warning; it is not a current official catalogue.
- Production browser checks passed for English, Hindi, Kannada, Tamil, Telugu and Malayalam across home, Privacy and Terms: **18/18**; critical/serious axe violations: **0**; browser page errors: **0**.
- The production deployment was automatically created by merging [PR #6](https://github.com/PSP-YN/JanaSetu-AI/pull/6). PRs #4 and #5 were closed as superseded; their stale branches were deleted.
- `main` requires the CI workflow, Vercel and Vercel Preview Comments checks; it requires conversation resolution and blocks force-pushes and deletion.

## Automated operations and canonical deployment — 5 November 2026

- Canonical public production domain: [https://jana-setu-ai.vercel.app](https://jana-setu-ai.vercel.app). The Vercel project is Git-linked to this repository; merges to `main` produce the production deployment. Pull requests retain preview deployments for review.
- Production deployment on `main` commit `ef2e079bfeb08605c60fca6f7e9f6e15a6186d99` is READY. Live checks returned HTTP 200 for the home page, avatar PNG, health, scheme catalogue, source-health, Privacy and Terms routes.
- CI passed on the production commit: 60 unit tests, 36 Playwright tests, type-check, production build, extension checks and production dependency audit (0 vulnerabilities). The avatar has a dedicated browser test and will also be covered by the production smoke test.
- A daily GitHub Actions workflow checks the upstream SmartDuke revision. A changed snapshot is validated, audited and submitted as a draft PR; CI must pass and a human must review it before merging.
- An hourly production monitor checks the canonical site, API health, catalogue counts, local snapshot integrity/row count and avatar asset. It opens one tracked GitHub issue on a sustained failure and closes that alert after recovery.
- Dependabot checks npm and GitHub Actions dependencies weekly. Updates still pass repository CI and Vercel preview checks before merging.
- The bundled SmartDuke snapshot remains 123 days old as of 5 November 2026. Metadata and rows endpoints are available, but publisher search is unavailable and no newer revision exists. This is a data freshness warning, not a service outage.
- The Vercel project currently has no project-specific environment variables configured. The prototype has no authenticated citizen accounts, persistent server database or authorized government API integration.

Operational details and recovery instructions: [Production operations runbook](operations-runbook.md).

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
- Keep `main` branch protection enabled: require the CI workflow, Vercel and Vercel Preview Comments checks; require conversation resolution; block force-pushes and branch deletion.
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
