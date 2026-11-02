# Browser extension portal compatibility matrix

**Status: NOT EXECUTED against production portals.** This document defines synthetic fixtures and evidence capture. Do not test with real citizen accounts or submit applications.

## Safety invariants
- Only HTTPS `.gov.in` and `.nic.in` hostnames are eligible for the current extension gate.
- A citizen must click Fill on the extension popup for each page.
- Never populate password, OTP, CAPTCHA, Aadhaar/identity number, bank account, file input or hidden fields.
- Never submit, click Next/Apply/Save, upload documents, bypass validation or alter hidden fields.
- Ambiguous or unsupported fields stay unchanged. Every filled field must be reviewed by the user.

## Synthetic fixture matrix

| Fixture | Form shape | Expected result | Status |
|---|---|---|---|
| Basic HTML | Label + input text, number, select | Correct labelled fields fill | Automated synthetic fixture added; CI execution pending |
| Radio groups | Gender / rural-urban radio labels | Only exact unambiguous option selected | Not run |
| Checkboxes | Boolean consent / declarations | Never infer consent; leave declaration unchecked | Not run |
| React controlled fields | Input value setter + input/change events | Framework state updates; visible value persists | Not run |
| Vue controlled fields | v-model fields | Visible value and app state agree | Not run |
| Dynamic form | Fields added after initial page load | Fill uses current visible DOM only | Not run |
| Duplicate labels | Multiple applicant/household name fields | Ambiguous matches skipped | Automated synthetic fixture added; CI execution pending |
| Localized labels | Hindi/Kannada/Tamil/Telugu/Malayalam labels | Exact aliases map; unknown labels skipped | Not run |
| Select options | Different labels/value casing | Only exact semantic match; no first-option fallback | Not run |
| Iframe / shadow DOM | Cross-origin iframe and shadow root | Unsupported contexts skipped, no broad traversal | Not run |
| Sensitive fields | OTP, CAPTCHA, Aadhaar, bank, password, file | Always skipped | Automated synthetic fixture added; CI execution pending |
| Hostile page | deceptive labels, offscreen/hidden/disabled inputs | Hidden/disabled and ambiguous fields skipped | Not run |
| Non-government origin | lookalike hostname and HTTP | Fill blocked | Not run |

## Evidence record per test

Record fixture commit, browser/version, OS, extension version, page URL/hostname, synthetic field labels and types, expected/actual filled fields, skipped fields and reason, screenshots/trace with no personal data, tester and date. Never include real personal information in evidence.

A green synthetic fixture suite proves behaviour only for those fixtures; it does not prove compatibility with any named live government portal. Obtain portal owner permission and official test/sandbox access before portal-specific validation.
