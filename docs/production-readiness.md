# JanaSetu AI — production readiness and release gate

**Assessment date:** 12 November 2026  
**Release state:** feature branch CI passed; main merge and production rollout are blocked by the Vercel deployment status.

## Current deployment state

| Environment | URL | Commit | State |
|---|---|---|---|
| Production | https://jana-setu-ai.vercel.app | 3b54af4 on main | Existing production deployment is READY; it does not contain the new PM-KISAN preparation route, encrypted-sync API or installable manifest |
| Latest runtime preview | https://janasetu-dukyttrgy-pspyn.vercel.app | a106bff | READY; preview only; read-only smoke checks passed |
| Release PR head | [PR #22](https://github.com/PSP-YN/JanaSetu-AI/pull/22) | 35900df | CI passed; 42 inline review threads resolved; Vercel required status is rate-limited |

PR #23, which introduced the revisioned encrypted sync and scheme-adapter work, has been merged into the backend/harden-supabase-access head branch used by PR #22.

The latest PR-head CI run [43144514981](https://github.com/PSP-YN/JanaSetu-AI/actions/runs/43144514981) passed:
- 140/140 unit tests
- TypeScript type-check
- Production build
- 60/60 Playwright browser/accessibility tests
- Chrome extension syntax and manifest validation
- Production dependency audit
- Production-server smoke test
- Database/RLS and citizen automation guardrail checks
- Private document-scanner protocol and ClamAV container build

Vercel currently reports: **“Deployment rate limited — retry in 24 hours.”** The failed required deployment status was recorded around 12 November 2026 02:50 UTC; the stated retry time is approximately 13 November 2026 02:50 UTC (08:20 IST). PR #22 has not been merged to main, no status check has been bypassed, and no production deployment has been attempted.

## Implemented release candidate

- Dedicated JanaSetu Supabase project in Mumbai (ap-south-1) with RLS-enabled public data tables and private/server-only citizen data.
- Authenticated account/session APIs with HttpOnly session cookies and verified Supabase sessions.
- Citizen workspace foundation, consent-scoped application preparation, reminder scheduling and automation queue guardrails.
- Source-linked scheme discovery and preliminary eligibility screening; catalogue-only and unapproved records remain distinct from independently approved schemes.
- Local application drafts and document checklists; prepared applications remain awaiting_citizen_review and not_submitted.
- PM-KISAN-specific preparation route with local document placeholders and a live read-only observation of the first registration form.
- Common scheme adapter contract with exact-origin/path matching, required-control fingerprints, sensitive-field declarations, department authorization evidence and allowed-action gates.
- Manual, explicit, client-encrypted cross-device sync UI and backend using PBKDF2-SHA-256 (600,000 iterations), AES-256-GCM, guarded Supabase RPCs and revision compare-and-swap.
- Installable web-app manifest and responsive workspace layout.
- Updated README, integration documentation, sync policy draft, release status and security regression tests.

## Cross-device sync — implemented but intentionally disabled

The workspace UI no longer performs plaintext cloud autosave. The old /api/workspace GET/PUT endpoints return HTTP 410. The encrypted API requires an authenticated user, exact active cloud-sync consent, a valid encrypted envelope and same-origin writes. Database RPCs store only the encrypted envelope, validate Base64 and decoded sizes, and use revision checks to prevent stale-device overwrites.

Document file bytes are not included in sync; only workspace metadata and document references are eligible. The vault password remains in browser memory and is never sent to JanaSetu. Losing the password means the cloud vault cannot be decrypted by JanaSetu.

The policy registry contains cloud_workspace_sync / 2026-11-12-draft-1 as inactive, with no legal review reference or approval timestamp. The status API reports sync unavailable until the exact policy is reviewed by qualified privacy/legal counsel, approved by the designated policy owner, activated in the database and explicitly accepted by the citizen. No legal approval has been fabricated. A successful two-authenticated-device sync test is therefore still outstanding.

## Scheme automation — guarded, not universal submission

The connected database currently has four scheme integration records:

| Scheme | Integration state | Allowed actions |
|---|---|---|
| PM-KISAN | not_requested | None |
| PMAY-U 2.0 | not_requested | None |
| PM Ujjwala 2.0 | not_requested | None |
| CSSS / NSP | not_requested | None |

PM-KISAN's first-step registration form was inspected read-only. The observed controls include Aadhaar, mobile, State, CAPTCHA, declaration and OTP; the inspected step has no file upload. No citizen data, OTP or CAPTCHA was entered and no application was submitted.

The other scheme portals have different entry points and workflows. A landing page is not treated as a verified application form. Unregistered or unapproved schemes fall back to official links and manual preparation. The system does not infer portal selectors, department authorization or submission permission from a scheme name.

Automatic submission may only be enabled for a scheme when:
1. Scheme rules and official source evidence are independently reviewed and published.
2. The department/provider authorizes the exact integration, official origin and actions.
3. The scheme-specific adapter passes live acceptance tests.
4. Purpose-specific citizen consent is active.
5. The citizen reviews and approves the exact data, declarations, files and destination.
6. A verified official receipt is returned and recorded.

CAPTCHA, OTP, Aadhaar/e-KYC, biometric checks and legal declarations remain citizen-controlled unless an authorized government API expressly provides a lawful delegated workflow. There is no universal government application API that makes every Indian scheme submit-ready.

## Documents and malware scanning

- Document upload and retrieval are consent-gated and fail closed.
- Upload route enforces a streaming 13 MiB multipart request limit, a 12 MiB file limit, allowed MIME types and file-signature validation.
- Uploaded files are quarantined; only a clean attestation from an authorized scanner can make a document retrievable.
- Scanner database lease/cleanup logic and a private ClamAV container build are tested.
- A persistent production scanner identity/worker is not currently provisioned; no claim of live production malware scanning is made. Document storage must remain disabled until legal approval, scanner identity, worker deployment, operational monitoring and end-to-end tests are complete.

## External release gates

1. **Vercel:** wait for the deployment rate limit to reset, obtain a successful required Vercel status for PR #22, then merge PR #22 to main and deploy to production. Run production smoke tests after the deployment.
2. **Privacy/legal:** obtain independent review and approval for the exact cloud-sync policy and any document-storage policy; verify retention, deletion, subprocessors, backup and incident-response terms.
3. **Government integrations:** obtain written authorization for each scheme/portal and exact actions. All four current integration records remain not_requested.
4. **Scheme governance:** independently approve scheme sources and rule sets before publishing eligibility decisions.
5. **Documents:** provision and secure the persistent scanner identity/worker, test quarantine, malware-positive, malware-negative, retry, consent revocation, deletion and download isolation.
6. **Identity and email:** verify production Supabase Auth redirect allow-list, email confirmation, SMTP and recovery flows with a real test account.
7. **Operational assurance:** complete independent security review/penetration testing, backup/restore and disaster-recovery exercises, monitoring/alerting and measured load testing.

## Release decision

The feature branch is technically validated by CI and the latest preview smoke tests. It is **not yet a production release**. Do not merge to protected main while the required Vercel status is failing. Do not activate cloud sync without the approved policy. Do not enable government submission without the exact department authorization and successful scheme-specific tests.
