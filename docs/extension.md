# JanaSetu Form Assistant

**Status updated:** 24 November 2026

The JanaSetu Form Assistant is a Manifest V3 browser extension for importing a citizen-reviewed profile export, previewing field matches and filling individually selected profile values on a supported page. For Karnataka SSP only, an explicitly labelled Aadhaar-number field can use a one-session value typed in the extension popup; it is never persisted. The legacy `ssp.postmatric.karnataka.gov.in` host currently redirects to `ssp.karnataka.gov.in`, and both exact HTTPS hosts are allowlisted.

## Current live-portal state

The four seeded scheme adapters (PM-KISAN, PMAY-U 2.0, PM Ujjwala and NSP) still have no department authorization and are not certified scheme integrations. However, citizens can use **local, user-directed field assistance** on HTTPS government pages ending in .gov.in or .nic.in, after checking the exact active URL against the official link shown in JanaSetu and confirming the per-session checkbox.

This is not proof that a page is genuine, does not validate the page's fields, and does not claim government authorization. The citizen must inspect the URL and every suggested value. The extension may skip fields or fill only a subset.

## Install

1. Clone the JanaSetu repository and open its extension/ folder.
2. In Chrome or Brave, open `chrome://extensions` or `brave://extensions`, enable Developer mode, select **Load unpacked**, and choose the repository's `extension/` folder.
3. In Firefox, open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on…**, and choose `extension/manifest.json`. Temporary add-ons are removed when Firefox closes; permanent distribution requires Mozilla signing. Do not disable signature enforcement.
4. In JanaSetu, review the citizen profile and export the profile-only JSON file only after reading its plaintext-export warning. Keep the transfer file private and delete it after import.
5. In the extension popup, enter a strong passphrase of at least 12 characters and import the JSON. The extension encrypts the profile using PBKDF2-SHA-256 (600,000 iterations) and AES-256-GCM before writing it to extension storage, then reads it back and verifies it.
6. Each time the popup opens, enter the passphrase and choose **Unlock / securely migrate profile**. The passphrase is not saved; the decrypted profile exists only in popup memory for that popup session. Use **Lock profile now** to clear it earlier. There is no passphrase recovery.
7. Open the official portal link from the JanaSetu application planner, verify the exact URL in the extension, preview the matching fields and select only values you approve.

The extension requires activeTab, storage, scripting and notifications; it does not request blanket access to all sites. Desktop notifications identify OTP, CAPTCHA, consent/declaration and portal-button steps that require the citizen.

## Field matching and safety

- Matching uses visible labels, placeholders, names, IDs and reviewed aliases.
- Ambiguous duplicate fields, hidden/disabled controls, bank/PAN credentials, OTP/security PIN/CAPTCHA controls, file inputs and declaration checkboxes are left untouched. For either supported Karnataka SSP host, a citizen may type a 12-digit value into the popup for one session; it is not written to profile or extension storage and still requires individual field approval.
- Select controls require one exact normalized option match; ambiguous matches are skipped.
- The citizen explicitly selects each previewed field before the fill action.
- A stale tab or changed URL invalidates the preview.
- The extension does not upload documents, click Proceed/Verify/Submit/Apply, call form-submission APIs, solve CAPTCHA or automate OTP, Aadhaar/e-KYC verification, biometrics, payments or declarations. It may fill the one-session SSP popup value into an explicitly labelled Aadhaar-number field after individual approval; it does not verify identity.
- Dispatching input/change events can cause a portal's own scripts to react. Inspect the page immediately after any fill; do not assume the portal stayed on the same step.
- Imported profile data is encrypted at rest in browser extension storage using PBKDF2-SHA-256 (600,000 iterations), AES-256-GCM, a fresh 16-byte salt, a fresh 12-byte nonce and authenticated additional data. The passphrase and derived key are not persisted. The unlocked profile is held in popup memory and is discarded when the popup closes. Legacy plaintext migration verifies the encrypted copy before deleting the old value; on failure, the original value is preserved. The web-app JSON transfer file remains plaintext on disk until the citizen deletes it.

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
- `node --check extension/vault.js`, `node --check extension/popup.js` and `node --check extension/fill.js` validate JavaScript syntax.
- Dedicated vault tests cover AES-GCM round-trip, fresh salt/nonce, wrong passphrase, ciphertext tampering, weak passphrase rejection and encrypted-only storage. Chrome and Firefox popup tests cover encrypted import, legacy migration, lock/unlock and protected-field behavior.
- The manifest is validated as JSON in CI.

A passing synthetic test suite is not a live government-portal acceptance test.


## Citizen-directed live-page assistance

The extension's live-page workflow is deliberately local and interactive:

1. Open a scheme's official portal link from the JanaSetu application planner.
2. Compare the exact active URL shown in the extension with JanaSetu's official source link.
3. Check the per-session confirmation box. A different URL resets this confirmation.
4. Preview suggested fields. The extension skips hidden, disabled, ambiguous, already populated, bank/PAN, file, password, OTP, CAPTCHA and declaration controls. On either supported Karnataka SSP host, the popup-only one-session value can appear for an explicitly labelled Aadhaar-number field.
5. Select only the values that are correct and click **Fill selected fields**.
6. Review every field and any portal response. Continue the portal yourself.

The domain suffix filter is only a coarse safety boundary, not proof that a page is genuine. The citizen must verify the URL against the official source link. Encrypted profile data remains in local extension storage and is injected only into the active tab after explicit interaction. The plaintext transfer JSON must be deleted by the citizen after import. No data is posted to JanaSetu servers by the extension.

This feature does not guarantee that a particular portal page's labels match the profile. It may fill only some fields or none. For either supported Karnataka SSP host, an Aadhaar value typed into the popup is used only for the open session and only in an explicitly labelled field after per-field approval; it is not identity verification. PAN/bank identifiers, OTPs, passwords, CAPTCHA, e-KYC, biometrics, declarations, payments and document uploads remain outside the helper. Never treat a successful fill as a completed or submitted application.

## Karnataka SSP demonstration

The legacy post-matric create-account URL `https://ssp.postmatric.karnataka.gov.in/CA/` currently redirects to `https://ssp.karnataka.gov.in/`. The redirect currently lands on the SSP homepage rather than the previously observed first-step form, so do not assume that the old form or its selectors are still live. Navigate manually through the current official portal until the intended form is visible. The extension supports both exact SSP hosts; it previews only fields that are actually present on the active page. If an explicitly labelled Aadhaar field is present, the citizen may type the number into the popup for that session, review and approve that field, and click any portal continuation control manually. This is generic visible-field assistance, not a certified SSP adapter.
