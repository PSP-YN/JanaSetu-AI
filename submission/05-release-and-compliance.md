# Release, privacy and compliance status

**Release decision:** a controlled public beta of the local-first experience may be considered only after the latest code is deployed and verified. Do not enable cloud citizen data, document uploads or government submission as part of this beta.

## Capability release matrix
| Capability | State | Beta decision |
|---|---|---|
| Landing page and responsive workspace | Implemented | Expose only after current-build deployment verification |
| Six-language interface | Implemented | Expose; native-speaker review recommended |
| Local profile, assessment and drafts | Implemented | Available with preliminary/not-submitted labels |
| Local JSON backup/restore | Implemented | Available with privacy warning |
| Scheme directory | Partial catalogue | Publish only independently reviewed records |
| Cloud accounts and sync | Foundation implemented; consent unapproved and lifecycle unverified | Disabled |
| Application-case persistence | Consent and published-scheme gated | Disabled |
| Document upload/scan/retrieval | Worker code exists; no scanner identity/host or deployed Edge Functions | Disabled |
| Internal reminder/checklist queue | Queue and cron implemented for safe internal tasks | Controlled; no external submission claim |
| Government integrations | No production-authorized adapters | Disabled |
| Automatic application submission | Not authorized or verified | Not available |

## Live release gates
As checked against Supabase on 12 November 2026:
- 4 scheme records; 0 independent approvals; 0 published scheme versions.
- 0 legally approved consent-policy versions.
- 0 scanner identities.
- 0 scheme reviewer role assignments.
- 0 citizen auth users.
- 0 deployed Supabase Edge Functions.

## Privacy/legal
The privacy/consent document is a draft, not an approved legal notice. It still requires the responsible legal entity, registered address, privacy contact, grievance process, retention periods, processor agreements and qualified Indian privacy/legal review. Do not activate cloud sync or document storage by inserting synthetic approvals.

A DPIA, data-flow review, processor inventory, retention/deletion validation and incident-response process are required before cloud personal-data features are enabled. No DPDP certification or legal compliance opinion is claimed.

## Scheme approval
Each exact scheme version requires current official evidence, source freshness, a valid supported rule set, two distinct source-accuracy approvals, two distinct eligibility-rule-accuracy approvals, one legal-review approval and publication by a separate publisher. Scheme-owner integration authorization is a separate gate. Do not fabricate reviewer identities or approvals.

## Document scanner
Provision a persistent scanner host only after billing approval and review of the service plan. Provision a dedicated least-privilege identity and secret storage, deploy the worker, then verify clean-file, EICAR test-file, timeout, retry, quarantine, revocation, deletion and retrieval behavior. Uploads stay disabled until end-to-end acceptance.

## Government integrations
- Obtain written myScheme authorization before automated access.
- Obtain publisher approvals and credentials for each API Setu integration.
- Obtain DigiLocker requester/partner approval before document retrieval.
- Obtain relevant UMANG/department service-owner approvals.
- Test each adapter in the official sandbox and complete security/acceptance review.
- Require citizen data preview and explicit point-of-action confirmation.
- Never bypass OTP, CAPTCHA, eSign, identity proofing, access controls or portal terms.
- Report submitted only after verifying an official receipt/reference.

## Production release decision
Vercel project metadata currently reports live=false. The latest listed preview is READY but was built from an older commit than the latest CI-tested branch head. Implementation PR #22 is open and unmerged. Do not route the primary production domain to an unverified deployment. First deploy the exact tested commit to preview, run visual/API smoke tests, then complete reviewed merge and protected-main production release.
