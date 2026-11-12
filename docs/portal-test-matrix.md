# Browser extension portal compatibility matrix

**Status updated:** 12 November 2026
**Live government portal tests:** NOT AUTHORIZED / NOT EXECUTED
**Synthetic regression suite:** PASS (Playwright extension popup, field safety and identity-safety tests).

## Safety invariants

- A domain suffix is only a preliminary allowlist condition; it is not authorization.
- Live filling requires exact HTTPS origin + path, adapter approval, permitted action, written department/provider authorization reference, approval timestamp and current field-contract evidence.
- All four initial scheme routes remain not_requested with no allowed actions; the extension must block them.
- A citizen must explicitly click the extension action and approve each selected field.
- Never populate password, OTP, CAPTCHA, Aadhaar/identity number, bank account, file input, hidden field or declaration/consent checkbox.
- Never submit, click Next/Apply/Save, upload documents, bypass validation or alter hidden fields.
- Ambiguous or unsupported fields stay unchanged. Every filled field must be reviewed by the citizen.

## Current scheme route matrix

| Scheme | Exact route state | Department authorization | Expected extension result |
|---|---|---|---|
| PM-KISAN | First-step registration path observed read-only | Not requested | Block |
| PMAY-U 2.0 | Landing page only; application path not verified | Not requested | Block |
| PM Ujjwala 2.0 | Official information page only; application path not verified | Not requested | Block |
| NSP / CSSS | Official portal landing page only; application path not verified | Not requested | Block |

## Synthetic fixture matrix

| Fixture | Expected result | Current evidence |
|---|---|---|
| Basic labelled text/number inputs | Correct unique fields preview and fill | Automated Playwright test |
| Select/radio controls | Only one exact, enabled, unambiguous option is selected | Automated Playwright test |
| Duplicate applicant/household names | Ambiguous matches skipped | Automated Playwright test |
| First/last name, username and relative-name fields | Applicant full name is not copied into semantically different fields | Automated Playwright test |
| React controlled input | Native input/change events update visible framework state | Automated Playwright test |
| Hidden, disabled and sensitive fields | Remain untouched | Automated Playwright test |
| File inputs and account-holder names | Remain untouched | Automated Playwright test |
| Deceptive hostnames and generic government domains | Blocked | Automated Playwright popup test |
| PM-KISAN observed registration route | Blocked until exact-route authorization | Automated Playwright popup test |
| Invalid backup profile | Rejected before extension storage | Automated Playwright popup test |
| Six locale translations | Translation keys remain in parity | Unit test |

## Evidence record for future live acceptance

For each separately authorized route, record fixture/adapter commit, browser/version, OS, extension version, exact URL/path, authorization reference, field-contract version, synthetic values, expected/actual filled fields, skipped fields and reasons, screenshots/trace with no personal data, tester and date. Use only official sandbox/test accounts and dummy data. Never include real citizen information in evidence.

A green synthetic suite proves only the tested fixtures. It does not certify compatibility with a named live government portal. Obtain portal-owner permission and official test/sandbox access before portal-specific validation.
