# Government integration access and automation plan

Updated: 9 November 2026

## Non-negotiable rule

JanaSetu may automate a government workflow only through an API, partner integration or portal automation path that the relevant authority has expressly permitted. A public website URL is not evidence that automated access or submission is authorized.

Never bypass OTP, CAPTCHA, identity proofing, eSign, consent, access controls, rate limits or portal terms. Do not use a citizen's portal password or session without the citizen's direct control. Never report "submitted" without a verifiable official acknowledgement.

## Official integration findings

### myScheme
- The official Terms of Use prohibit bots, scraper tools and other automatic devices used to access, monitor or copy platform pages unless myScheme expressly authorizes the activity in writing.
- Do not crawl myScheme pages or use a headless browser to collect or submit data without written authorization.
- Request an official data/API feed and written permission from the myScheme/NeGD team. Contact published by API Setu: `myscheme@digitalindia.gov.in`.
- Existing snapshots and local catalogues remain discovery references only. They are not a current authoritative status feed.

Official sources:
- https://www.myscheme.gov.in/terms-of-use
- https://apisetu.gov.in/contact

### API Setu
- API Setu is the Government of India's API marketplace, but individual APIs have publishers and access controls.
- Consumers register, identify an approved use case, discover and subscribe to the relevant API, and wait for publisher approval before credentials and access are issued.
- API Setu's published SOP lists organization/entity proof and use-case information as part of onboarding. The precise documentation must be confirmed with API Setu before applying.
- API Setu terms require lawful authorized use, valid issued credentials, purpose-specific permissions, informed consent for personal data, and compliance with publisher conditions.
- A listing in the directory does not mean JanaSetu is entitled to use it.

Official sources:
- https://docs.apisetu.gov.in/document-central/explore-apisetu/Introduction.html
- https://docs.apisetu.gov.in/document-central/explore-apisetu/Overview.html
- https://docs.apisetu.gov.in/document-central/terms-of-use/
- https://www.apisetu.gov.in/sop

### DigiLocker
- JanaSetu must apply as a registered requester/partner if it intends to request citizen documents.
- API access requires partner registration, API credentials, integration, testing/audit and go-live approval.
- Implement OAuth and document-level citizen consent only after credentials and the current requester specification are issued to the approved organization.
- Do not ask citizens to provide DigiLocker passwords or OTPs to JanaSetu.

Official sources:
- https://api.apisetu.gov.in/
- https://apisetu.gov.in/digilocker
- https://www.digilocker.gov.in/web/architecture

### UMANG and department portals
- UMANG exposes individual department/service integrations. Each service has its own API, owner, authorization and onboarding requirements.
- A UMANG API listing does not imply permission to submit another department's scheme application.
- Identify scheme owner and exact service API per application journey; request provider approval and sandbox access.

Official sources:
- https://directory.apisetu.gov.in/
- https://negd.gov.in/wp-content/uploads/2025/04/UMANG-RFP-Final.pdf

## Adapter registry contract

Each scheme/department integration must have a reviewed manifest with:

- Scheme ID and official department owner
- Official application and status URLs
- API Setu/API publisher reference, if available
- Access status: `not_requested`, `requested`, `approved`, `sandbox_available`, `sandbox_tested`, `production_approved`, `suspended`
- Written permission / agreement reference and validity period
- OAuth scopes, data fields, purpose and consent version
- Field mapping version and schema hash
- Supported actions: discovery, eligibility verification, document retrieval, draft preparation, submission, acknowledgement, status tracking
- Human confirmation requirement for each consequential action
- Rate limits, retry rules, idempotency key and audit events
- Evidence of sandbox tests and production acceptance

An adapter cannot move to production unless its access status is `production_approved`, its credentials are stored as server-only secrets, the exact citizen consent is valid, and a named owner has accepted the release evidence.

## Current JanaSetu status

- No myScheme written automation permission or production API credentials have been provided.
- No API Setu consumer subscription or publisher approvals have been provided.
- No DigiLocker requester partner approval or OAuth credentials have been provided.
- No UMANG department API approval or sandbox credentials have been provided.
- No government submission adapter is production-approved.
- Therefore, JanaSetu must not claim that it can currently submit a scheme application automatically.

## Build sequence

1. Finish citizen accounts, cloud workspace and privacy/security tests.
2. Stabilize the source catalogue and independently verify each scheme record.
3. Identify the owning department and application process for each prioritized scheme.
4. Submit formal API/partner access requests with a documented use case and privacy safeguards.
5. Build adapter contracts and mock/sandbox tests while approvals are pending.
6. Implement each approved adapter separately; never infer support from a portal's HTML.
7. Test end-to-end with synthetic data in official sandbox environments.
8. Obtain department/provider acceptance and legal/privacy approval.
9. Enable the specific adapter in production behind explicit citizen consent and point-of-action confirmation.

Until those steps are complete, the safe product can automate scheme discovery, preliminary eligibility checks for independently approved rules, checklists, document preparation, reminders and permitted form assistance. It must label all drafts as not submitted.
