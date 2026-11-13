# JanaSetu Form Assistant

**Status updated:** 12 November 2026

The JanaSetu Form Assistant is a Manifest V3 browser extension for importing a citizen-reviewed profile export, previewing field matches and filling individually selected profile values on a supported page. For Karnataka SSP only, an explicitly labelled Aadhaar-number field can use a one-session value typed in the extension popup; it is never persisted.

## Current live-portal state

The four seeded scheme adapters (PM-KISAN, PMAY-U 2.0, PM Ujjwala and NSP) still have no department authorization and are not certified scheme integrations. However, citizens can use **local, user-directed field assistance** on HTTPS government pages ending in .gov.in or .nic.in, after checking the exact active URL against the official link shown in JanaSetu and confirming the per-session checkbox.

This is not proof that a page is genuine, does not validate the page's fields, and does not claim government authorization. The citizen must inspect the URL and every suggested value. The extension may skip fields or fill only a subset.

## Install

1. Clone the JanaSetu repository and open its extension/ folder.
2. In Chrome/Chromium/Edge, open chrome://extensions and enable Developer mode.
3. Select Load unpacked and choose the repository's extension/ folder.
4. In JanaSetu, review the citizen profile and export the profile-only JSON file only after reading its plaintext-export warning.
5. Import that JSON file into the extension.
6. Open the official portal link from the JanaSetu application planner, verify the exact URL in the extension, preview the matching fields and select only values you approve.

The extension requires activeTab, storage, scripting and notifications; it does not request blanket access to all sites. Desktop notifications identify OTP, CAPTCHA, consent/declaration and portal-button steps that require the citizen.

## Field matching and safety

- Matching uses visible labels, placeholders, names, IDs and reviewed aliases.
- Ambiguous duplicate fields, hidden/disabled controls, bank/PAN credentials, OTP/security PIN/CAPTCHA controls, file inputs and declaration checkboxes are left untouched. For the exact Karnataka SSP host only, a citizen may type a 12-digit value into the popup for one session; it is not written to profile or extension storage and still requires individual field approval.
- Select controls require one exact normalized option match; ambiguous matches are skipped.
- The citizen explicitly selects each previewed field before the fill action.
- A stale tab or changed URL invalidates the preview.
- The extension does not upload documents, click Proceed/Verify/Submit/Apply, call form-submission APIs, solve CAPTCHA or automate OTP, Aadhaar/e-KYC verification, biometrics, payments or declarations. It may fill the one-session SSP popup value into an explicitly labelled Aadhaar-number field after individual approval; it does not verify identity.
- Dispatching input/change events can cause a portal's own scripts to react. Inspect the page immediately after any fill; do not assume the portal stayed on the same step.
- Imported profile data is stored in the browser extension's local storage. Treat exports as sensitive and delete them when no longer needed.

## Authorization required before a department-certified integration

For each scheme and route, obtain and verify:

1. Written department/provider authorization naming the exact origin, path and permitted action.
2. A reviewed current field contract and non-sensitive field allowlist.
3. Current read-only route observation and synthetic/live sandbox acceptance tests.
4. A scheme-specific risk review, citizen consent scope and a rollback/disable mechanism.
5. Independent approval recorded with an authorization reference and timestamp.

Even after approval, protected identity checks and final submission remain citizen-controlled unless a lawful delegated API explicitly authorizes otherwise. Never infer route approval from a domain suffix or from another scheme's adapter.

## Verification

- Unit tests cover safe field matching, exact select values, ambiguous labels, sensitive fields, identity/name confusion, stale previews and route authorization.
- Playwright tests cover synthetic forms, per-session URL confirmation, selected live-page field filling and rejection of deceptive non-government hostnames.
- `node --check extension/popup.js` and `node --check extension/fill.js` validate JavaScript syntax.
- The manifest is validated as JSON in CI.

A passing synthetic test suite is not a live government-portal acceptance test.


## Citizen-directed live-page assistance

The extension's live-page workflow is deliberately local and interactive:

1. Open a scheme's official portal link from the JanaSetu application planner.
2. Compare the exact active URL shown in the extension with JanaSetu's official source link.
3. Check the per-session confirmation box. A different URL resets this confirmation.
4. Preview suggested fields. The extension skips hidden, disabled, ambiguous, already populated, bank/PAN, file, password, OTP, CAPTCHA and declaration controls. On the exact Karnataka SSP host, the popup-only one-session value can appear for an explicitly labelled Aadhaar-number field.
5. Select only the values that are correct and click **Fill selected fields**.
6. Review every field and any portal response. Continue the portal yourself.

The domain suffix filter is only a coarse safety boundary, not proof that a page is genuine. The citizen must verify the URL against the official source link. Profile data remains in local extension storage and is injected only into the active tab after explicit interaction. No data is posted to JanaSetu servers by the extension.

This feature does not guarantee that a particular portal page's labels match the profile. It may fill only some fields or none. For the exact Karnataka SSP host, an Aadhaar value typed into the popup is used only for the open session and only in an explicitly labelled field after per-field approval; it is not identity verification. PAN/bank identifiers, OTPs, passwords, CAPTCHA, e-KYC, biometrics, declarations, payments and document uploads remain outside the helper. Never treat a successful fill as a completed or submitted application.

## Karnataka SSP demonstration

The initial post-matric create-account page is https://ssp.postmatric.karnataka.gov.in/CA/. The current page exposes an “Enter Student Aadhaar number” field and a “Click to proceed” submit control. The citizen may enter the value in the extension popup for one session, preview the match and approve it. The citizen must click “Click to proceed” themselves and complete any subsequent CAPTCHA, OTP, Aadhaar consent or declaration steps. This is generic visible-field assistance, not a certified SSP adapter.
