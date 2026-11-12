# JanaSetu public-use release — 12 November 2026

## Release scope

This release makes the browser-local preparation workflow useful without waiting for scheme publication, cloud-storage approval or government portal authorization. It does **not** turn unreviewed catalogue entries into eligibility decisions or government submissions.

### What a citizen can do now

1. Open the public workspace at https://jana-setu-ai.vercel.app/app. No account is required for local profile, discovery and preparation.
2. Select a State/UT in **My profile**. Add only the profile details needed for the route being explored. Do not enter Aadhaar numbers, bank-account numbers, OTPs, passwords or CAPTCHA answers.
3. Open **Find benefits** and search the built-in catalogue.
4. Review the source and the status label on each result. The built-in inventory is 142 records:
   - 4 deterministic rule prototypes, all pending independent source/rule/legal approval.
   - 42 source-linked catalogue-only scheme references. These can now produce a local document checklist and preparation record, but not an eligibility result.
   - 96 Karnataka FY 2026–27 budget line-item leads. These are not confirmed citizen-facing schemes and cannot be prepared as applications.
5. For one of the 46 scheme references, choose **Prepare local checklist**. The record stays in the current browser. It includes the available profile fields, the source-linked document list and the official information/application links.
6. Expand **Review prepared fields**, verify each value, then download the checklist if needed. The downloaded .txt file is **unencrypted** and may contain personal information; store it securely.
7. Continue through the linked official portal, responsible department or authorized Common Service Centre. Complete identity verification, declarations, uploads and submission yourself. JanaSetu never clicks Submit or reports a government application as submitted.
8. Use the password-encrypted JanaSetu vault backup/restore controls to move the local workspace between devices. The active browser storage itself is not application-encrypted.

### Catalogue provenance and freshness

The built-in source register has 46 scheme references and 96 budget leads. Their JanaSetu source-register check dates range from 2 November to 12 November 2026. A source-check date is not a guarantee that a benefit, application window or department webpage is still current. Verify the exact linked authority before acting.

The separate 4,693-row SmartDuke CC BY 4.0 dataset is a third-party machine-parsed discovery snapshot collected 5 July 2026. It is older than the 90-day freshness policy and must not be used as eligibility evidence. It is now **opt-in** in the discovery screen; it is excluded from the default curated results until a citizen explicitly enables the supplementary dataset toggle.

The source-health endpoint intentionally continues to report an overall attention state while the supplemental snapshot is stale/upstream search is unavailable. It now reports the curated built-in catalogue independently so that a stale optional dataset is not confused with the state of the built-in register.

### Capability matrix

| Capability | Public-use release state |
|---|---|
| Public workspace and discovery | Available |
| 46 source-linked scheme references | Searchable; source/rule verification remains necessary |
| 4 deterministic eligibility prototypes | Preliminary checklists only; all pending independent approval |
| Local application preparation | Available for all 46 scheme references; not an official application |
| Document checklist and official handoff | Available where source records contain those links |
| Downloadable checklist | Available as an unencrypted text file after an explicit warning |
| 96 Karnataka budget leads | Discovery/research leads only; not citizen-facing schemes |
| 4,693-row third-party snapshot | Optional; stale; machine-parsed; not eligibility evidence |
| Local document storage | Browser-local; not malware-scanned; do not store sensitive identity documents |
| Server-persisted application preparation | Disabled until independently approved scheme versions and legal consent are active |
| Cloud document upload/scanning | Disabled until legal approval and persistent scanner worker deployment |
| Cross-device cloud sync | Disabled until privacy/legal approval and citizen consent |
| Government portal autofill/submission | Disabled pending written department authorization and route acceptance |

### Why the gates remain

- **Scheme publication:** requires distinct source reviewers, rule reviewers, legal review and a separate publisher. No approval is fabricated.
- **Server-side application cases:** depend on a currently published approved scheme version and exact purpose-specific consent.
- **Cloud documents:** require an approved document-storage policy and a persistent, tested malware-scanning service. A local ClamAV acceptance test does not establish production scanning.
- **Government actions:** require written department authorization, exact-route validation and scheme-specific acceptance tests. OTP, CAPTCHA, Aadhaar/eKYC, biometrics, payments, declarations and final submission remain citizen-controlled.

## Verification for this change

- npm run typecheck
- npm run test:unit — 174 tests
- npm run build
- Playwright suite: 68 passed, including the public-user flow from source-indexed scheme → local checklist → review fields/documents → download unencrypted checklist
- Readiness API separates public/local capabilities from gated server-persisted preparation.
- Source-health API separates the curated built-in register from the stale supplemental snapshot.

This is a controlled public-use navigator and local preparation tool, not a government portal, benefit authority or authorized submission agent.
