# Phase 2 — Localization, accessibility and deployment assessment

**Updated:** 3 November 2026  
**Status:** Prototype-ready after verification; not production-ready for real citizen data.

## Implemented in this pass

- Expanded the primary workspace translations for English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- Localized workspace navigation, accessibility names, key headings, profile/assessment copy, catalogue labels, document/application states and common action notifications.
- Added translation-key validation so rendered keys must have an English fallback and each supported locale must provide a localized value or an existing locale dictionary value.
- Added Playwright checks for translated hero text and mobile navigation in all six languages.
- Changed CI installation from `npm install` to reproducible `npm ci` and added a lockfile.
- Added a bounded fallback for the Hugging Face Dataset Viewer `/search` outage. If `/search` fails or times out, the API reads a page through `/rows` and filters that page locally. The response explicitly identifies this as page-only search and advances pagination based on source rows, not filtered matches.
- Extended the source-health report to separately monitor dataset metadata and Hugging Face search availability.
- Added unit coverage for catalogue search fallback and source-health degradation reporting.

## Verification on the local Fedora workstation

- Unit tests: **32 passed**.
- Playwright: **22 passed** (mobile navigation, six locale labels, privacy-boundary workflow, synthetic extension form matching and axe critical/serious scans).
- TypeScript: passed.
- Next.js production build: passed.
- Production dependency audit: **0 vulnerabilities**.
- Extension JavaScript syntax and manifest JSON: validated.
- Local production smoke: `/api/health`, `/api/schemes/open-data` browse, query fallback, `/privacy`, `/terms` returned expected responses.

## Known limitations / not yet complete

- The privacy and terms page body is still maintained in English. Legal text should receive qualified translation review before publishing localized legal disclosures.
- Canonical scheme titles, third-party dataset summaries, official source names and some provider-originated error messages may remain in their source/English language. They must not be presented as official translations without review.
- Query fallback is page-by-page while Hugging Face `/search` is unavailable. Users must load additional pages to continue searching; it is not a global search over all 4,693 rows.
- Dataset snapshot is 5 July 2026 (120 days old as of 3 November 2026), beyond the 90-day freshness policy. The catalogue remains third-party and unverified; eligibility data is discovery-only.
- Extension compatibility has been tested against synthetic forms, not representative live government portal forms.
- Automated axe checks do not replace manual keyboard, screen-reader, contrast, zoom and mobile testing by fluent users.
- No independent penetration test, qualified DPDP/legal review, scheme-domain review or official government integration has been completed.

## Deployment assessment

- Vercel is connected to the GitHub repository and the current public prototype is reachable at `https://jana-setu-ai.vercel.app`.
- The existing production `/api/health` responds with HTTP 200.
- Before this pass, production `/api/schemes/open-data?q=...` returned HTTP 502 because Hugging Face `/search` stalled during its Hub authentication check. The new local fallback fixes this failure path, but the fix is **not live until a new deployment is created**.
- A preview deployment is suitable for validating the fallback and UI changes. A public prototype demo can be hosted, with synthetic data and visible disclaimers.
- Do not launch as a production citizen service or accept real sensitive records until the source-freshness, translation, legal/privacy, scheme-review, live-portal, and security gates are closed.

## Release recommendation

**Deploy a Preview first.** Promote only after confirming the Preview's catalogue search fallback, six-language interface, policy routes, and source-health status. Production deployment is technically possible, but this remains a controlled prototype, not an officially verified benefits service.
