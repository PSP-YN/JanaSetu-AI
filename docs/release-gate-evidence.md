# JanaSetu release-gate evidence register

**Status: BLOCKED — prototype only.** This register distinguishes implemented controls from evidence that must come from people, independent testing, or official sources. A checked box means the evidence exists in the repository; it does not imply legal or government approval.

Last updated: 2 November 2026.

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

Current evidence: skip link and visible focus styling exist. Automated axe and manual assistive-technology evidence is not present. **Not passed.**

## Gate 3 — browser extension portal compatibility

- [ ] Maintain a named test matrix of portal hostname, form URL, date, browser/OS, form version and tested fields.
- [ ] Use synthetic fixtures or official sandbox/test environments; never use real citizen accounts or submit test applications.
- [ ] Verify label, name, id, placeholder, select, radio, checkbox, controlled React/Vue inputs, dynamic forms, validation and multi-step navigation.
- [ ] Confirm unknown/ambiguous fields are left untouched and no field is submitted automatically.
- [ ] Confirm OTP, CAPTCHA, password, Aadhaar, bank and document upload fields are never populated.
- [ ] Re-run the matrix after portal markup or extension changes.

Current evidence: hostname restriction and click-to-fill are implemented. Heuristic matching has not been proven portal by portal. **Not passed.**

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

Current evidence: prototype privacy/terms pages exist. No qualified legal review or DPIA has been completed. **Not passed.**

## Gate 6 — security assurance

- [ ] Maintain a threat model covering browser local storage, XSS, CSRF, injection, SSRF, IDOR, rate abuse, supply chain, extension permissions, malicious portal DOM and data leakage.
- [ ] Verify security headers, request size limits, schema validation, rate limits, redacted logs and error handling.
- [ ] Run SAST, dependency and secret scanning; triage and remediate all exploitable findings.
- [ ] Run authenticated and unauthenticated abuse tests for every API route.
- [ ] Independent penetration test against a defined staging scope; record tester, dates, methodology, findings and retest.
- [ ] Incident response, rollback, backup/restore and vulnerability disclosure procedures are exercised.

Current evidence: CI unit/type/build/dependency checks and selected API smoke tests exist. No independent penetration test or complete threat assessment exists. **Not passed.**

## Release decision

No real citizen personal or sensitive data, public eligibility decisions, or production government integrations until all six gates are signed off with evidence. A green CI build is necessary but not sufficient. Do not scrape myScheme or automate access without written authorization.
