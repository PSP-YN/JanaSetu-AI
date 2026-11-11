# Citizen data and automation policy

## Data minimisation
JanaSetu should collect only fields needed to explain a scheme's published criteria and prepare a citizen-reviewed checklist. Do not collect Aadhaar number/images, PAN, bank account details, passwords, OTPs, biometrics or payment-card data. Do not ask a citizen to upload sensitive identity evidence to the current prototype.

## Consent
Consent is purpose-specific, versioned, revocable and recorded with a timestamp. Profile storage, document storage, reminders, assisted form filling, portal navigation and automated submission are separate purposes. Consent for one purpose does not imply consent for another. Revocation stops future processing where technically possible; legal retention exceptions must be disclosed.

## Automation boundary
A click on an "Approve" control must not silently submit a government application. The UI must show the exact action, destination, data, documents, declarations, fee (if any), consequences and whether the external portal supports automation. Ask for a fresh confirmation at the point of submission. Never bypass CAPTCHA, OTP, identity proofing, rate limits, access controls or portal terms. A prepared draft is not a submitted application.

## Data security
- Use Auth identity plus row-level security for tenant isolation.
- Keep service-role keys server-only; never use NEXT_PUBLIC_ for privileged keys.
- Private storage only, random object names, size/type validation, malware scanning and short retention.
- Do not log PII, uploaded file contents, tokens, OTPs or request bodies.
- Support account export and deletion, subject to disclosed legal retention requirements.
- Encrypt transport; use provider-managed encryption at rest and evaluate application-level encryption for high-risk fields before storing them.

## Current state
The existing workspace still stores profiles, assessments, drafts, reminder records and document metadata in browser localStorage. It does not upload document bytes. This is not cross-device persistence, a secure document vault or an account-backed workflow. The citizen-data foundation and hardened Data API grants have been applied to the dedicated JanaSetu Supabase project in Mumbai. The frontend is not yet integrated with this backend; until integration and cross-user security tests pass, the workspace must still be treated as browser-local prototype data.


## Cloud workspace boundary

Authenticated citizens can synchronize their profile and preparation metadata to a dedicated JanaSetu Supabase project. Session tokens are held in HttpOnly cookies and every workspace request derives the citizen ID from a verified Supabase Auth session. The cloud workspace stores document references only; it does not store document bytes. Cloud synchronization is not yet a substitute for the encrypted document-storage, malware-scanning, retention and deletion controls described in the production architecture. If cloud synchronization cannot load the remote workspace, the client must not overwrite it with local data.


## Cloud storage activation status

The cloud workspace API is technically implemented but is not enabled for citizen data yet. Direct table access is revoked and all workspace reads/writes pass through a consent-checking database function. The private consent-policy registry currently has no active approved policy versions. Until a named privacy/legal reviewer approves the exact policy text and its hash is recorded, the API rejects cloud storage and the application stays in local-only mode. Sign-in does not imply consent to store profile or application data.

## Verified application automation boundary — 12 November 2026

The current application does **not** automatically submit government applications. Its workflow is:

1. Discover a scheme and show its source/review state.
2. Run a preliminary assessment only against an independently approved and published scheme version.
3. Prepare a draft/checklist and mark it `awaiting_citizen_review`.
4. Require the citizen to review and explicitly confirm the prepared fields. This confirmation approves the preparation record only; the response remains `submissionStatus: not_submitted`.
5. External portal navigation, assisted filling and submission remain disabled until a scheme-specific integration has documented production authorization, a valid destination, and the required separate purpose-specific consent.
6. The database automation queue records `requires_human_confirmation=true`. Even after a confirmation request, the current database function permits only `prepare_documents` and `schedule_reminder`; it rejects `submit_application` and other external portal actions with `government_adapter_execution_not_enabled`.

The latest live database inspection on 12 November 2026 found four scheme records (PM-KISAN, PM-USP CSSS, PMAY-U 2.0 and PMUY 2.0), all `review_pending`; zero approved consent-policy versions; zero scanner identities; and zero automation runs. No government integration is production-authorized. Therefore no citizen application can currently be submitted by JanaSetu, automatically or manually through its backend.

A future submission feature must show the exact portal, fields, declarations, attachments, fees and consequences, obtain a fresh citizen confirmation immediately before the external submit action, and preserve a verifiable receipt. A generic approval, saved draft or earlier consent must never authorize a later submission.
