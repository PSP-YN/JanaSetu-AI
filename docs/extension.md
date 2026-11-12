# JanaSetu Form Assistant

**Status updated:** 12 November 2026

The JanaSetu Form Assistant is a Manifest V3 browser extension for importing a citizen-reviewed profile export, previewing field matches and filling only individually selected, non-sensitive fields on a supported page.

## Current live-portal state

**Live government form filling is disabled for all four initial scheme routes.** The PM-KISAN, PMAY-U 2.0, PM Ujjwala and NSP registry entries are all `not_requested`, have no allowed actions and have no department authorization reference or approval timestamp. The extension checks an exact HTTPS origin and path plus an approved action; a `.gov.in` or `.nic.in` suffix alone is never sufficient.

The extension can be imported and tested on synthetic forms. The production route guard intentionally blocks real government portal tabs until the exact route, field contract, department authorization and acceptance evidence have been reviewed and recorded. Do not change this gate to make the extension appear operational.

## Install for local/synthetic testing

1. Clone the JanaSetu repository and open its `extension/` folder.
2. In Chrome/Chromium/Edge, open `chrome://extensions` and enable Developer mode.
3. Select **Load unpacked** and choose the repository's `extension/` folder.
4. In JanaSetu, create and review a synthetic profile. Use the profile-only JSON export only after reading its plaintext-export warning.
5. Import that JSON file into the extension.
6. Test field preview and selected filling on a local synthetic form or the Playwright fixtures. The four live scheme routes remain blocked.

The extension requires only `activeTab`, `storage` and `scripting`; it does not request blanket access to all sites.

## Field matching and safety

- Matching uses visible labels, placeholders, names, IDs and reviewed aliases.
- Ambiguous duplicate fields, hidden/disabled controls, sensitive identifiers, OTP/security PIN/CAPTCHA controls, file inputs and declaration checkboxes are left untouched.
- Select controls require one exact normalized option match; ambiguous matches are skipped.
- The citizen explicitly selects each previewed field before the fill action.
- A stale tab or changed URL invalidates the preview.
- The extension does not upload documents, click Submit/Apply, call form-submission APIs, solve CAPTCHA or automate OTP, Aadhaar/e-KYC, biometrics, payments or declarations.
- Dispatching input/change events can cause a portal's own scripts to react. Inspect the page immediately after any fill; do not assume the portal stayed on the same step.
- Imported profile data is stored in the browser extension's local storage. Treat exports as sensitive and delete them when no longer needed.

## Authorization required before any live route is enabled

For each scheme and route, obtain and verify:

1. Written department/provider authorization naming the exact origin, path and permitted action.
2. A reviewed current field contract and non-sensitive field allowlist.
3. Current read-only route observation and synthetic/live sandbox acceptance tests.
4. A scheme-specific risk review, citizen consent scope and a rollback/disable mechanism.
5. Independent approval recorded with an authorization reference and timestamp.

Even after approval, protected identity checks and final submission remain citizen-controlled unless a lawful delegated API explicitly authorizes otherwise. Never infer route approval from a domain suffix or from another scheme's adapter.

## Verification

- Unit tests cover safe field matching, exact select values, ambiguous labels, sensitive fields, identity/name confusion, stale previews and route authorization.
- Playwright tests cover synthetic forms and confirm that the four live scheme routes remain blocked.
- `node --check extension/popup.js` and `node --check extension/fill.js` validate JavaScript syntax.
- The manifest is validated as JSON in CI.

A passing synthetic test suite is not a live government-portal acceptance test.
