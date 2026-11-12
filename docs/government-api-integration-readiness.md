# Government application API integration readiness

## Decision

No scheme is marked as automatically applicable or automatically submitted. The current four integration records are deliberately `not_requested`, have no allowed API actions, no authorization reference and no approval timestamp. They expose no write capability.

The official API Setu consumer SOP requires a valid use case, organizational identity/authority material, organization PAN, GST registration, certificate of incorporation and a domain-registered email. API Setu and the API provider evaluate the request; provider approval is required before credentials, documentation and permissions are issued. The SOP also assigns consent capture to the API consumer and requires secure data exchange. See the [API Setu consumer SOP](https://cdn.apisetu.gov.in/portal/assets/SOP-APISETU.pdf) and [API Setu portal](https://apisetu.gov.in/).

## Scheme-specific findings

| Scheme | Official application route | Verified workflow constraints | JanaSetu integration state |
|---|---|---|---|
| PM-KISAN | [pmkisan.gov.in](https://pmkisan.gov.in/) | NIC describes farmer/CSC registration, State/UT eligibility validation and portal-side Aadhaar authentication/eKYC, including OTP/biometric paths. This is a government/state workflow, not an unrestricted third-party write endpoint. | Portal handoff only; API access not requested |
| PMAY-U 2.0 | [PMAY-U 2.0](https://pmay-urban.gov.in/) | The official application path includes a scheme eligibility check, citizen consent for Aadhaar authentication and a beneficiary survey. | Portal handoff only; API access not requested |
| PMUY 2.0 | [PMUY official application information](https://www.pmuy.gov.in/ujjwala2.html) | Official guidance lists KYC, Aadhaar, household composition proof, bank details and a deprivation declaration, with submission through an online OMC portal or distributor. JanaSetu must not collect or proxy identity/bank credentials without a separate approved legal and security basis. | Portal handoff only; API access not requested |
| PM-USP CSSS / NSP | [National Scholarship Portal](https://scholarships.gov.in/) | NIC describes student registration, Aadhaar demographic authentication, mobile authentication, institute/department verification and two-factor verification. Historical API documents do not establish current third-party production authorization. | Portal handoff only; API access not requested |

Official references:
- [NIC — PM-KISAN system and process](https://www.nic.gov.in/project/pm-kisan/)
- [MyScheme — PMAY-U scheme and application process](https://www.myscheme.gov.in/schemes/pmay-u)
- [PMUY — official eligibility, documents and application routes](https://www.pmuy.gov.in/ujjwala2.html)
- [NIC — National Scholarships Portal process](https://www.nic.gov.in/project/national-scholarships-portal/)

## Required path to an authorised integration

1. Establish the legal entity/authority required by the API provider. Do not submit another entity's PAN, GST, incorporation certificate or authority letter.
2. Register the exact JanaSetu use case through the official API Setu channel or the department's designated API manager.
3. Obtain written provider approval for the exact scheme, API product, operations, environments, data fields, retention, rate limits and permitted user journey.
4. Receive the official API specification, sandbox credentials, production credentials and security requirements from the provider.
5. Complete a data-protection impact assessment, purpose-specific citizen consent, security review, key management, audit logging and incident response.
6. Implement a scheme-specific adapter with strict request/response schemas, idempotency, replay protection, timeouts, retry policy, rate limiting, correlation IDs and acknowledgement verification.
7. Pass provider sandbox certification and department acceptance tests. Production access remains disabled until written production approval is recorded.
8. Add the exact authorization reference, approved actions, approved timestamp and expiry to `scheme_integrations`. The adapter must fail closed when authorization is absent, expired or suspended.
9. Require the citizen to review the exact final payload and approve the submission action. Never bypass OTP, CAPTCHA, biometric authentication, payment authorization or portal access controls.
10. Record a submission only after the provider returns a verifiable acknowledgement/receipt. A browser fill, redirect, HTTP 200, screenshot or click is not proof of submission.

## Technical gate

The integration registry supports the lifecycle states `not_requested`, `requested`, `approved`, `sandbox_available`, `sandbox_tested`, `production_approved` and `suspended`. No state may be advanced by a developer convenience flag. The runtime must require `production_approved`, an unexpired approval, a non-empty authorization reference and an explicit allowed action before any production write call.

## Current live registry

The four seeded scheme versions currently have:
- `access_status = not_requested`
- `allowed_actions = []`
- `authorization_reference = null`
- `approved_at = null`

This is the correct state until provider access is formally granted. No application submission API is configured or called.
