# JanaSetu release-gate evidence register

**Status: BLOCKED — prototype only.** This register distinguishes implemented controls from evidence that must come from people, independent testing, or official sources. A checked box means the evidence exists in the repository; it does not imply legal or government approval.

Last updated: 2 November 2026.

## Local verification record

Validated locally on commit `50fbe47821123929e9691828b4e410461eadcf8c` (`main`) using Fedora Linux, Node.js 24.15.0 and npm 11.12.1:

- `npm test`: 29/29 passed.
- `npx playwright test`: 21/21 passed, including desktop/mobile axe scans, six-language selector behaviour, keyboard navigation, extension safety fixtures and the main-workflow privacy network-boundary test.
- `npm run typecheck`: passed.
- `node --check extension/fill.js` and `node --check extension/popup.js`: passed; extension manifest JSON parsed successfully.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- `npm run build`: passed.
- Production smoke checks: health, scheme catalogue, source monitor, privacy/terms routes and invalid API payload handling passed.

These are local verification results, not a claim that GitHub Actions or a hosted deployment passed. They do not replace manual, independent, legal or official-source review.

## Gate 1 — complete interface localization

- [ ] Every user-visible interface string is keyed (navigation, headings, buttons, labels, hints, empty states, errors, dialogs, notifications, accessibility names and metadata).
- [ ] English, Hindi, Kannada, Tamil, Telugu and Malayalam translations are complete and reviewed by fluent speakers.
- [ ] Locale changes update all routes and dynamic content without a reload or mixed-language state.
- [ ] Scheme/source content follows the policy in [localization policy](./localization-policy.md).
- [ ] Automated locale coverage test fails on missing keys and raw translation keys.
- [ ] Manual review at mobile and desktop breakpoints for text expansion, wrapping and script rendering.

Current evidence: the hero and a subset of shared copy have translations. Several page sections remain English. Malayalam has a larger set of profile labels than the other locales. **Not passed.**

## Gate 2 — accessibility

- [ ] axe-core scan reports zero critical/serious violations on every primary route and interactive state.
- [ ] Keyboard-only test covers navigation, tabs, dialogs, forms, error recovery, search, scheme details and extension popup.
- [ ] Screen-reader review covers landmarks, headings, form labels, validation announcements, status changes and focus management.
- [ ] Contrast verified for text, controls, focus indicators and disabled states; do not rely on colour alone.
- [ ] Mobile zoom/reflow, touch target size, orientation and virtual keyboard tested on representative Android devices.
- [ ] Accessibility findings have severity, owner, reproduction steps and retest evidence.

Current evidence: local Playwright run passed 21/21 tests, including axe scans for the overview, privacy and terms routes, a mobile overview scan, keyboard skip-link test and six-locale selector behaviour. Other primary tabs and interactive states are not covered by axe, and no manual screen-reader/assistive-technology sign-off is recorded. **Not passed.**

## Gate 3 — browser extension portal compatibility

- [ ] Maintain a named test matrix of portal hostname, form URL, date, browser/OS, form version and tested fields.
- [ ] Use synthetic fixtures or official sandbox/test environments; never use real citizen accounts or submit test applications.
- [ ] Verify label, name, id, placeholder, select, radio, checkbox, controlled React/Vue inputs, dynamic forms, validation and multi-step navigation.
- [ ] Confirm unknown/ambiguous fields are left untouched and no field is submitted automatically.
- [ ] Confirm OTP, CAPTCHA, password, Aadhaar, bank and document upload fields are never populated.
- [ ] Re-run the matrix after portal markup or extension changes.

Current evidence: hostname restriction and click-to-fill are implemented. Local Playwright synthetic fixtures passed for basic text/number fill, React-controlled input events, sensitive-field skipping, username/account-holder protection, file-input exclusion, exact select matching, Male/Female collision prevention, unmatched options and duplicate exact options. Heuristic matching has not been proven portal by portal. **Not passed.**

## Gate 4 — scheme verification and approval

- [ ] Every record has a primary official source, source period, jurisdiction, effective date, last-checked date and version.
- [ ] Reviewer 1 verifies scheme existence, benefit, application window, eligibility and exclusions against current primary material.
- [ ] Reviewer 2 independently approves every deterministic eligibility rule and its boundary/unknown/conflict fixtures.
- [ ] Outdated or conflicting source data disables deterministic screening until re-approved.
- [ ] Catalogue-only records remain discovery-only and never enter eligibility calculations.
- [ ] Original scheme titles and quoted/source wording remain traceable to the source.

Current evidence: four prototype rule-screened records exist; none has final two-person approval recorded. Other built-in records and external dataset records are not individually verified. **Not passed.**

## Gate 5 — privacy and legal review

- [ ] Complete a data-flow inventory for browser storage, server requests, logs, analytics, speech services, backups and third-party portals.
- [ ] Complete and sign a privacy impact assessment with purpose, lawful basis, minimization, retention, deletion, access, processor and incident analysis.
- [ ] Qualified Indian privacy counsel reviews the DPDP Act/Rules applicability, notices, consent design, children/minors handling, grievance process, retention and cross-border processing.
- [ ] Publish only after legal reviewer, version, date and approval scope are recorded.
- [ ] Verify actual runtime behaviour against the published notices; do not rely on documentation alone.

Current evidence: the privacy notice and DPIA draft now describe the observed browser/API boundary. The main-workflow Playwright network test passed and confirmed no POST to screening, intake or draft API routes during the tested journey. Hosting logs, provider retention and all possible external flows remain unverified. No qualified legal review or DPIA approval has been completed. **Not passed.**

## Gate 6 — security assurance

- [ ] Maintain a threat model covering browser local storage, XSS, CSRF, injection, SSRF, IDOR, rate abuse, supply chain, extension permissions, malicious portal DOM and data leakage.
- [ ] Verify security headers, request size limits, schema validation, rate limits, redacted logs and error handling.
- [ ] Run SAST, dependency and secret scanning; triage and remediate all exploitable findings.
- [ ] Run authenticated and unauthenticated abuse tests for every API route.
- [ ] Independent penetration test against a defined staging scope; record tester, dates, methodology, findings and retest.
- [ ] Incident response, rollback, backup/restore and vulnerability disclosure procedures are exercised.

Current evidence: local unit tests, TypeScript check, production build, selected API smoke checks and `npm audit --omit=dev --audit-level=high` passed; the audit reported zero vulnerabilities. Security headers are covered by a browser test. No independent penetration test or complete threat assessment exists. **Not passed.**

## Release decision

No real citizen personal or sensitive data, public eligibility decisions, or production government integrations until all six gates are signed off with evidence. A green CI build is necessary but not sufficient. Do not scrape myScheme or automate access without written authorization.
