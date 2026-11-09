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
