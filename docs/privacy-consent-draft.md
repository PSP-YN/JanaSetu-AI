# JanaSetu AI — privacy and consent policy draft

**Status: Draft for qualified Indian privacy/legal review. Not approved for publication or activation.**

This document is a working specification for the citizen-facing notice and consent flow. It is not legal advice and must not be represented as a final privacy notice. Complete the legal entity, contact, grievance, retention and statutory details before approval.

## 1. Service and controller identity

- Product: JanaSetu AI
- Data fiduciary / responsible legal entity: **[LEGAL ENTITY NAME — REQUIRED]**
- Registered address: **[ADDRESS — REQUIRED]**
- Privacy contact: **[PRIVACY EMAIL — REQUIRED]**
- Grievance / escalation contact: **[CONTACT AND PROCESS — REQUIRED]**
- Effective policy version: **[VERSION — REQUIRED]**
- Policy content SHA-256: **[GENERATE AFTER LEGAL APPROVAL]**

## 2. Purposes

JanaSetu may process citizen information only for the specific purpose selected and accepted by the citizen:

1. Profile snapshot storage inside a specific application case, only after profile-storage consent bound to that scheme version and action.
2. Cloud workspace synchronization across devices, only after separate cloud-workspace-sync consent.
3. Scheme discovery and preliminary eligibility screening.
4. Application preparation and document checklist generation.
5. In-app reminder scheduling.
6. Assisted navigation or form preparation for an identified official destination, only where permitted.
7. Submission to a government authority only through an approved integration, with separate purpose-specific consent and point-of-action confirmation.

A sign-in or account creation is not consent to every purpose above.

## 3. Data categories

Potential profile fields include name, age band/age, state, district, residence type, household income band/value, occupation and scheme-specific eligibility answers. The minimum necessary fields should be collected for each purpose.

Preparation records may include scheme references, application draft fields, checklist state, reminder dates and status history.

Document references may include original filename, MIME type, byte size, checksum, scan status and storage reference. **Document bytes are not currently uploaded by the application.**

JanaSetu must not collect Aadhaar numbers/images, biometric data, bank account numbers, portal passwords, OTPs or authentication secrets in the current prototype. Any future identity/document integration requires a separate approved design and explicit consent.

## 4. Data sharing

- JanaSetu must not sell citizen personal data.
- Infrastructure providers may process data only as documented service providers under approved contractual and security arrangements.
- Government authorities receive information only when a citizen requests a specific service and the integration is authorized.
- No external submission may occur merely because a citizen created an account or ran an eligibility assessment.

## 5. Storage, security and access

The dedicated JanaSetu Supabase project is in Mumbai, India. The application is designed to use authenticated, user-isolated access, least-privilege database grants, RLS and HttpOnly session cookies.

The current cloud workspace is disabled until the exact policy is approved and a citizen accepts the matching version. Local-only use remains available.

Document upload, malware scanning, quarantine, secure downloads, backup/restore verification and independent security review remain release gates.

## 6. Retention and deletion

- Proposed retention period: **[LEGAL/OPERATIONAL DECISION REQUIRED]**.
- The citizen must be able to withdraw consent and request account/data deletion through a documented process.
- Application records required by a government authority or law may need a separate lawful retention basis and clearly stated period.
- Backups, audit records and legal holds require an explicit retention schedule and deletion process.
- Do not claim complete deletion until primary storage, backups and all processors have been covered by a verified deletion workflow.

## 7. Citizen controls

The final product must provide:
- A clear notice before each purpose-specific collection.
- Separate opt-in controls for profile storage, document storage, reminders, assisted form filling, external portal navigation and automated submission.
- The exact scheme, action, destination, data categories and policy version in each relevant consent record.
- A way to review, withdraw and renew consent.
- A way to export, correct and request deletion of citizen information.
- A clear explanation that an eligibility match is not an official eligibility decision and a prepared draft is not a submitted application.

## 8. Government integration

JanaSetu will not bypass OTP, CAPTCHA, eSign, identity proofing or access controls. myScheme scraping/automation requires express written permission. API Setu, DigiLocker and individual department/UMANG integrations require their own registrations, approvals and acceptance tests.

## 9. Approval record required before activation

A policy version may be inserted into the private database consent registry as active only after all of the following are complete:

- Legal entity and privacy contact details are finalized.
- Qualified reviewer approves the complete notice and consent wording.
- Retention, deletion, processors and grievance procedures are specified.
- The exact final text is hashed with SHA-256.
- The approval reference and date are recorded.
- The version is activated for the relevant purpose.
- A citizen explicitly accepts that exact version before cloud storage or automation is enabled.

Until then, no consent policy version is active and cloud workspace synchronization remains disabled.
