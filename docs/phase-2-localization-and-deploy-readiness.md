# Phase 2 — Localization, accessibility and deployment assessment

**Updated:** 3 November 2026
**Status:** Local release candidate verified; not production-ready for real citizen data.

## Implemented

- Main workspace UI copy, profile labels, catalogue categories, status labels, counts, notifications and date presentation support English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- Privacy and Terms pages switch across all six locales. Their translations are machine-drafted and explicitly unreviewed; the English source text is also not legal advice or legal approval.
- The Chrome MV3 form-assistant popup has six locale dictionaries with exact key parity. It imports a validated JanaSetu backup and fills visible, unambiguous fields only after a citizen clicks the fill action.
- Scheme summary/benefit/rule-note convenience translations are provided for the four built-in records. Official scheme names, third-party source records and legal/official terminology remain source-authoritative and may remain in their original language; a notice explains this boundary.
- Added translation-key parity checks for the main UI and extension popup, plus cross-locale Playwright checks for workspace navigation, profile labels, legal routes and accessibility.
- Added strict backup validation: profile/state validation, 5 MB cap, sanitized document metadata, trusted catalogue URLs, and restored assessments forced to require a fresh evaluation.
- Tightened assessment/draft safety so pending, missing or removed schemes cannot retain a positive/previously reviewed result.
- Improved extension identity matching so a full name is not copied into first-name, last-name or username fields. The extension remains HTTPS `.gov.in` / `.nic.in` only and manual click-to-fill. It does not intentionally submit forms or upload documents, but portal scripts may react to field-change events.
- Changed CI installation to reproducible `npm ci`, added a lockfile, and made the browser suite run against a built production server. CI now builds before starting Playwright.
- Added bounded Hugging Face Dataset Viewer `/search` fallback. If `/search` is unavailable, the API filters the current `/rows` page and clearly reports page-only search; pagination advances by source rows.
- Source health separately reports metadata and search availability.

## Local verification — Fedora workstation

Latest complete application verification:

- Unit tests: **48 passed**.
- Playwright: **31 passed** against the production-mode local server.
- TypeScript: passed.
- Next.js production build: passed.
- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities**.
- Extension `node --check` for `fill.js` and `popup.js`: passed.
- Manifest V3 JSON validation: passed.
- Main UI locale key parity and extension popup locale key parity: passed.
- Local production smoke: `/api/health`, `/api/schemes` (142 records), `/api/sources/health`, `/api/schemes/open-data?q=farmer`, `/privacy` and `/terms` returned HTTP 200.
- `git diff --check`: passed.

These are local results. The integrated release branch is not yet pushed, and GitHub CI has not yet run against this exact tree.

## Live Vercel observations

- Current production domain: `https://jana-setu-ai.vercel.app`.
- Production root, `/api/health`, `/api/schemes`, `/privacy` and `/terms` returned HTTP 200 during the 3 November check.
- Production `/api/schemes/open-data?q=farmer` returned **HTTP 502**.
- Existing Phase 2 preview `https://janasetu-qjy21mmr2-pspyn.vercel.app` returned HTTP 200 for the same open-data query and the other checked routes. That preview belongs to the earlier `phase2-localization-search-fallback` branch/commit `4aca454`; it is not the current integrated release candidate and must not be promoted as a substitute for the tested tree.
- No deployment of the current local release candidate has been made.

## Remaining release gates

- **Scheme governance:** all four built-in deterministic rules remain pending human approval. Each requires two independent source/rule approvals. The other catalogue records are discovery-only; they are not eligibility-screened.
- **Freshness and provenance:** the third-party dataset snapshot is dated 5 July 2026 (121 days old on 3 November 2026), exceeding the 90-day freshness policy. Its eligibility data is machine-parsed and unverified. Do not present it as authoritative.
- **Language review:** six-locale UI, legal pages, convenience scheme translations and extension popup are implemented, but no fluent-speaker/native-language review has been completed. Legal translations also need qualified legal review. Do not label translations certified or official.
- **Portal compatibility:** extension tests use synthetic forms only. No representative live government portal has been tested with written authorization. Autofill is best-effort field matching, not portal certification.
- **Privacy/security:** no qualified DPDP/privacy counsel review, DPIA approval, independent threat assessment or penetration test has been completed. Authentication, account recovery, durable shared rate limiting, incident response and production monitoring are not release-certified.
- **Operational assurance:** manual screen-reader, physical mobile, zoom/high-contrast and real-device testing remain outstanding. Backup/restore and disaster recovery have not been exercised as an operational service.

## Deployment decision

The code is a **locally verified prototype release candidate**, suitable for a reviewed GitHub pull request and a fresh Vercel Preview. It is not certified for public-service decisions or real sensitive citizen records. Do not promote to production or accept real citizen data until the external gates above are closed and the new Preview is validated against the exact release commit.
