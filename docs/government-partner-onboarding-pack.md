# Government partner onboarding pack — draft requests

**Status: Prepared for owner/legal review. Not sent.**

JanaSetu has not been granted any government API or portal automation permissions. These drafts are requests for information and access only; they do not assert an existing partnership or approval.

Before sending, fill the legal entity, authorized representative, registered address, privacy contact, security contact and use-case details. If JanaSetu is not yet represented by an eligible legal entity, confirm the correct applicant structure with each program before submitting.

## 1. myScheme / NeGD — request approved scheme data access and written automation permission

**To:** myscheme@digitalindia.gov.in  
**Subject:** Request for authorized scheme data feed/API and written permission for JanaSetu AI integration

Dear myScheme / NeGD Team,

We are developing JanaSetu AI, a citizen-facing service intended to help residents discover government schemes, understand eligibility conditions, prepare application checklists and track application progress.

We are requesting guidance on:
1. Whether an official API, bulk data feed or approved partner integration is available for current scheme metadata, eligibility rules, official source links and update notifications.
2. The formal process, eligibility criteria, documentation and technical requirements for authorized access.
3. Whether a permitted integration may support automated retrieval or preparation of scheme application data, and the exact written authorization required for any such activity.
4. Whether sandbox data and a test environment are available.
5. Attribution, caching, update-frequency, freshness, rate-limit and retention requirements.

We will not scrape or automate myScheme pages without express written authorization. We will preserve source attribution, show official destinations and distinguish discovery guidance from an official eligibility decision.

**Applicant legal entity:** [REQUIRED]  
**Authorized representative:** [REQUIRED]  
**Official email / phone:** [REQUIRED]  
**Product website / demo:** [ADD WHEN READY]  
**Privacy notice:** [LEGAL-APPROVED LINK REQUIRED]

Please advise the appropriate onboarding process and required documents.

Regards,  
[AUTHORIZED REPRESENTATIVE]  
[JANASETU LEGAL ENTITY]

## 2. API Setu — consumer registration and publisher subscriptions

**Subject:** JanaSetu AI — consumer onboarding and scheme/service API subscription guidance

Dear API Setu Team,

We are preparing a citizen-service application that helps users discover schemes, assess preliminary eligibility, prepare application information and track authorized government-service workflows.

Please guide us through:
- Consumer registration and entity verification.
- Use-case approval and data-protection/security documentation.
- Discovering APIs published by relevant central and state departments.
- Subscription and publisher-approval procedures for scheme eligibility, application intake and status tracking APIs.
- Sandbox credentials, testing requirements, rate limits, consent requirements and production onboarding.
- Whether a service-provider/aggregator model is permitted for our use case.

We understand that API listing does not itself grant access and that each API publisher's approval and terms apply. We will request only the minimum scopes needed for a named workflow.

**Applicant legal entity:** [REQUIRED]  
**Organization identifier / registration:** [REQUIRED IF APPLICABLE]  
**Authorized representative:** [REQUIRED]  
**Use-case description:** [ATTACH APPROVED DATA-FLOW DIAGRAM]  
**Privacy/security contact:** [REQUIRED]

Regards,  
[AUTHORIZED REPRESENTATIVE]  
[JANASETU LEGAL ENTITY]

## 3. DigiLocker — requester/partner onboarding

**Subject:** Request for DigiLocker requester integration onboarding for JanaSetu AI

Dear DigiLocker / NeGD Integration Team,

We are evaluating a citizen-authorized document retrieval workflow for JanaSetu AI. The intended use is to help a citizen retrieve only the specific supporting documents required for a selected government scheme and attach them to a draft application, subject to the approved requester model and purpose-specific consent.

Please confirm:
- Requester/partner eligibility and registration requirements.
- Entity documentation, authorization letters and privacy/security review requirements.
- OAuth scopes, consent screens, document URI access and permitted data retention.
- Sandbox/test credentials and integration certification.
- Security audit, production go-live approval and periodic compliance requirements.
- Whether the proposed use case is permitted for a citizen-assistance platform.

JanaSetu will not collect DigiLocker passwords or OTPs, impersonate the citizen, or retrieve documents without a valid authorization flow.

**Applicant legal entity:** [REQUIRED]  
**Authorized representative:** [REQUIRED]  
**Privacy notice:** [LEGAL-APPROVED LINK REQUIRED]  
**Security contact:** [REQUIRED]

Regards,  
[AUTHORIZED REPRESENTATIVE]  
[JANASETU LEGAL ENTITY]

## 4. UMANG / department service owner — individual service integration

**Subject:** Request for approved API/sandbox access for [DEPARTMENT] — [SCHEME/SERVICE]

Dear [DEPARTMENT / UMANG SERVICE OWNER],

We are requesting information on the authorized digital integration path for [SCHEME/SERVICE]. The proposed workflow is to prepare citizen-provided information and, if explicitly permitted, submit it to the official department service and reconcile the official acknowledgement/status.

Please provide:
- API specification and service owner.
- Eligibility and application field schema.
- Authentication, consent and authorization model.
- Sandbox/test access and test cases.
- Submission idempotency, receipt/acknowledgement and status query mechanism.
- Rate limits, data retention, audit, error handling and operational support.
- Written confirmation of whether third-party citizen-assistance integration and automated form preparation/submission are permitted.

We will not automate the public portal or bypass OTP/CAPTCHA/eSign/identity proofing. If no API is available, please advise the permitted assisted-submission process.

**Department / scheme:** [REQUIRED]  
**Applicant legal entity:** [REQUIRED]  
**Authorized representative:** [REQUIRED]  
**Privacy/security contact:** [REQUIRED]

Regards,  
[AUTHORIZED REPRESENTATIVE]  
[JANASETU LEGAL ENTITY]

## Evidence tracker

| Partner | Request status | Evidence needed before implementation |
|---|---|---|
| myScheme / NeGD | Not sent | Written permission and official data/API feed |
| API Setu | Not sent | Consumer approval, API subscriptions and publisher approvals |
| DigiLocker | Not sent | Requester registration, credentials, audit and go-live approval |
| UMANG / department | Not sent | Named department API approval and sandbox acceptance |

## Sending checklist

- [ ] Confirm the legal entity eligible to apply.
- [ ] Appoint an authorized representative and privacy/security contacts.
- [ ] Complete the privacy notice and data-flow diagram.
- [ ] Obtain qualified legal review of consent and retention.
- [ ] Confirm the exact scheme/department APIs needed; avoid broad, unnecessary scopes.
- [ ] Send each request from an official organization email.
- [ ] Store written approvals, credentials metadata, expiry and permitted scopes in the adapter registry.
- [ ] Do not activate any adapter until sandbox tests and provider acceptance are documented.
