# Phase 2 — Localization, accessibility and deployment assessment

**Updated:** 3 November 2026
**Status:** Prototype deployed to Vercel production; not production-ready for real citizen data.

## Implemented

- Main workspace UI copy, profile labels, catalogue categories, status labels, counts, notifications and date presentation support English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- Privacy and Terms pages switch across all six locales. Their translations are machine-drafted and explicitly unreviewed; the English source text is also not legal advice or legal approval.
- The Chrome MV3 form-assistant popup has six locale dictionaries with exact key parity. It imports a validated JanaSetu backup and fills visible, unambiguous fields only after a citizen clicks the fill action.
- Scheme summary/benefit/rule-note convenience translations are provided for the four built-in records. Official scheme names, third-party source records and legal/official terminology remain source-authoritative and may remain in their original language; a notice explains this boundary.
- Added translation-key parity checks for the main UI and extension popup, plus cross-locale Playwright checks for workspace navigation, profile labels, legal routes and accessibility.
- Added strict backup validation: profile/state validation, 5 MB cap, sanitized document metadata, trusted catalogue URLs, and restored assessments forced to require a fresh evaluation.
- Tightened assessment/draft safety so pending, missing or removed schemes cannot retain a positive/previously reviewed result.
- Improved extension identity matching so a full name is not copied into first-name, last-name, username or relative-name fields. Imported occupation values now use the same canonical allowlist/alias normalization as the app. The extension remains HTTPS `.gov.in` / `.nic.in` only and manual click-to-fill. It does not intentionally submit forms or upload documents, but portal scripts may react to field-change events.
- Changed CI installation to reproducible `npm ci` and made `npm run test:e2e` build the current source before starting Playwright, preventing stale `.next` output from being tested. CI uses the same command.
- Added a bundled 4,693-row full-text index. When the publisher `/search` endpoint is unavailable, JanaSetu searches the complete local snapshot rather than the current page and displays the stale-snapshot warning.
- Source health separately reports metadata and search availability, parsing the search JSON body before reporting availability. Degraded page-only search results use a 60-second shared-cache lifetime instead of the full-search one-hour cache.
- Local catalogue search includes the current locale's translated scheme summaries, benefits and rule notes.
- Local browser hydration preserves valid citizen review markers and approved-rule snapshots only for schemes currently approved; untrusted backup imports still reset those markers.

## Local verification — Fedora workstation

Latest complete application verification:

- Unit tests: **50 passed**.
- Playwright: **35 passed** against the production-mode local server.
- TypeScript: passed.
- Next.js production build: passed.
- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities**.
- Extension `node --check` for `fill.js` and `popup.js`: passed.
- Manifest V3 JSON validation: passed.
- Main UI locale key parity and extension popup locale key parity: passed.
- Local production smoke: `/api/health`, `/api/schemes` (142 records), `/api/sources/health`, `/api/schemes/open-data?q=farmer`, `/privacy` and `/terms` returned HTTP 200.
- `git diff --check`: passed.

The integrated release was merged by [PR #6](https://github.com/PSP-YN/JanaSetu-AI/pull/6) as commit `493d0c2414cfd1028b8f9887644355f6deb03dcc`. GitHub Actions run `41691385168` passed; the exact-commit Vercel Preview and six-locale accessibility checks passed before merge. The merge triggered the production deployment.

## Live Vercel observations — 3 November 2026

- Production domain: [https://jana-setu-ai.vercel.app](https://jana-setu-ai.vercel.app). Production deployment `janasetu-82sqegccz-pspyn.vercel.app` is READY for main commit `493d0c2414cfd1028b8f9887644355f6deb03dcc` (deployment `dpl_3GR7ZgPtByT2QpSTVnyhWiiC9vdX`).
- Production HTTP smoke: `/`, `/api/health`, `/api/schemes` (142 records), `/api/sources/health`, `/api/schemes/open-data?q=farmer` (full local-index results with freshness warning), `/privacy` and `/terms` all returned HTTP 200. Required security headers were present.
- Production source health correctly reports `attention_required`: the 5 July 2026 third-party snapshot is stale and upstream search is unavailable. The bounded current-page fallback returns results, but it is not a complete search across the full catalogue.
- Production browser checks: all six locales across home, Privacy and Terms passed **18/18** checks; critical/serious axe violations: **0**; browser page errors: **0**.
- The Preview for the exact release commit `afb09ff4ee5d578eec5418f4b8edcfec863c6009` was READY and passed the same 18/18 locale/accessibility checks before merge.
- PR #6 is merged; PRs #4 and #5 were closed as superseded and their stale feature branches deleted. `main` now requires the CI workflow, Vercel and Vercel Preview Comments checks, requires conversation resolution, and blocks force-pushes/deletion.

## Remaining release gates

- **Scheme governance:** all four built-in deterministic rules remain pending human approval. Each requires two independent source/rule approvals. The other catalogue records are discovery-only; they are not eligibility-screened.
- **Freshness and provenance:** the third-party dataset snapshot is dated 5 July 2026 (121 days old on 3 November 2026), exceeding the 90-day freshness policy. Its eligibility data is machine-parsed and unverified. Do not present it as authoritative.
- **Language review:** six-locale UI, legal pages, convenience scheme translations and extension popup are implemented, but no fluent-speaker/native-language review has been completed. Legal translations also need qualified legal review. Do not label translations certified or official.
- **Portal compatibility:** extension tests use synthetic forms only. No representative live government portal has been tested with written authorization. Autofill is best-effort field matching, not portal certification.
- **Privacy/security:** no qualified DPDP/privacy counsel review, DPIA approval, independent threat assessment or penetration test has been completed. Authentication, account recovery, durable shared rate limiting, incident response and production monitoring are not release-certified.
- **Operational assurance:** manual screen-reader, physical mobile, zoom/high-contrast and real-device testing remain outstanding. Backup/restore and disaster recovery have not been exercised as an operational service.

## Deployment decision

The code is a **deployed public prototype**, not a certified public-service decision system. The deployment is for demonstration and synthetic-data evaluation only. Do not use real sensitive citizen records or represent results as official eligibility decisions. A controlled pilot or public-service launch remains blocked until the external governance, freshness, language, legal, privacy and security gates above are closed.
