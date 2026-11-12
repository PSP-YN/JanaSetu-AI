# PM-KISAN preparation and cross-device release notes

## What this branch adds

- An installable web-app manifest for the JanaSetu workspace. The same responsive web experience can be opened on Android, iOS, Windows, macOS and Linux browsers; installation support and naming vary by browser.
- A PM-KISAN preparation route at `/app/pm-kisan`.
- Five document/supporting-record placeholders with optional local file selection, readiness checklist and mobile-friendly layout.
- A form-field guide that distinguishes information requested on the official first-step form from later State/UT verification.
- Local persistence of checklist readiness in the current browser profile.
- End-to-end tests for the guide, local file selection, mobile overflow, checklist persistence and manifest.

## Important product boundaries

The optional file inputs are local-only UI placeholders. The selected file bytes are not uploaded, stored in JanaSetu's backend, or synchronised to another device. The browser checklist state is stored in localStorage on that device only. Cross-device account sync is not enabled by this change.

The current PM-KISAN first-step New Farmer Registration page exposes Aadhaar number, mobile number, State, CAPTCHA and Aadhaar consent. It does not expose a general document upload section. The five guide cards are records to keep ready or conditional items, not a claim that five files must be uploaded.

JanaSetu does not collect Aadhaar, bank account credentials, OTPs, CAPTCHA answers or government portal passwords. The guide opens the official service for the citizen to enter sensitive data and review consent directly.

The extension remains a user-invoked field-matching helper. It does not bypass portal security, solve CAPTCHA, perform Aadhaar authentication, upload documents or silently submit an application. A portal-specific submission action requires the official portal to permit it, a tested adapter, and explicit citizen confirmation of the exact final application. The PM-KISAN portal has not passed live end-to-end automation testing; do not advertise that it has.

## Official sources reviewed on 12 November 2026

- PM-KISAN New Farmer Registration: https://pmkisan.gov.in/RegistrationFormupdated.aspx
- PM-KISAN portal: https://pmkisan.gov.in/
- PM-KISAN FAQ: https://pmkisan.gov.in/Documents/FAQPMKISAN.PDF
- National Informatics Centre process overview: https://www.nic.gov.in/project/pm-kisan/
- Press Information Bureau eligibility and enrollment information: https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=156092&id=156092&lang=2&reg=3

## Verification status

Automated acceptance tests have been added to the existing GitHub Actions CI workflow. This branch has not been merged or deployed. A green test run and a live PM-KISAN portal test are still required before describing the workflow as production-ready.
