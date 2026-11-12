# JanaSetu backend implementation status

**Updated:** 12 November 2026  
**Supabase project:** JanaSetu-AI · Mumbai (ap-south-1) · ref qjiuclkhvxbnojdysmmp  
**Release PR:** [#22](https://github.com/PSP-YN/JanaSetu-AI/pull/22)  
**Current release branch head:** 35900df41a64e513f624f5aae19249a3e70dc800

## Current release state

The feature branch and current PR head pass CI. PR #23, which adds revisioned encrypted sync and scheme adapter gates, was merged into PR #22's backend/harden-supabase-access head branch. All 42 inline review threads on PR #22 have been resolved.

Latest PR-head CI run [43144514981](https://github.com/PSP-YN/JanaSetu-AI/actions/runs/43144514981) passed 140/140 unit tests, TypeScript, production build, 60/60 Playwright tests, extension validation, dependency audit, database/security guardrails, ClamAV container build and production-server smoke.

The required Vercel status currently fails with “Deployment rate limited — retry in 24 hours.” PR #22 has not been merged to main and no production deployment has been made. See [production readiness](production-readiness.md) for the current environment URLs and release gates.

## Dedicated infrastructure and database

- Dedicated Supabase project JanaSetu-AI in the Projects organization, region ap-south-1 (Mumbai).
- CareerOS remains separate and unchanged.
- 14 public tables are present; RLS is enabled on all 14. Private scanner, consent and application-preparation tables are not exposed through the Data API.
- Direct authenticated writes to sensitive citizen tables are revoked; citizen mutations use authenticated, purpose-checked RPCs.
- Global default EXECUTE on future postgres functions is revoked from PUBLIC; required functions receive explicit grants.
- Private citizen-documents bucket is configured. Storage reads re-check ownership, exact consent scope and active policy.
- Foreign-key indexes and database security hardening are applied.
- Supabase security advisor's remaining finding is the intentional admin/server-only scheme_approvals table with RLS and no client policy.

## Authentication and citizen workspace

- Sign-up/sign-in, sign-out, email confirmation callback, password recovery and password update routes exist.
- Access/refresh tokens are stored in HttpOnly cookies; API handlers verify Supabase sessions.
- A real test-account lifecycle, SMTP delivery and production redirect allow-list still require end-to-end verification.
- Local workspace data remains usable without cloud sync.
- The legacy plaintext /api/workspace GET/PUT endpoint is retired with HTTP 410; no automatic plaintext cloud autosave remains.

## Encrypted cross-device sync

Implementation is present in the release branch:
- Client-side PBKDF2-SHA-256 (600,000 iterations) and AES-256-GCM encryption with a random salt and IV.
- The vault password remains in browser memory and is never sent to JanaSetu.
- Manual citizen-initiated sync UI; the citizen must sign in, accept the exact active approved policy and enter the vault password.
- Strict encrypted-envelope validation, 8 MiB API limit, same-origin writes, authenticated sessions, no-store responses and guarded Supabase RPCs.
- Revision compare-and-swap; stale devices receive HTTP 409 rather than silently overwriting newer data.
- Encrypted envelope only is stored. Document file bytes remain device-local; document references/metadata may be included.
- Existing legacy plaintext cloud data is preserved; sync refuses to overwrite it and reports a migration-required error.

The policy registry has one inactive draft: cloud_workspace_sync / 2026-11-12-draft-1. It has no legal review reference or approval timestamp. The active sync-policy check returns false, so the sync API remains fail-closed. Do not activate the draft until qualified privacy/legal review and designated policy-owner approval are recorded. A successful two-authenticated-device test remains outstanding because the approved policy is not active.

See [Encrypted cross-device sync](ENCRYPTED-CROSS-DEVICE-SYNC.md).

## Consent and automation engine

- Private consent-policy registry and purpose-specific consent grants/revocations.
- Consent cannot be granted against an unapproved policy version.
- Revocation invalidates earlier active grants for the same user/purpose/scope.
- Supabase pgmq durable queue janasetu_automation and pg_cron one-minute worker are configured; previous empty-queue execution checks passed.
- Citizen application preparation remains a draft and requires the exact published scheme version and matching purpose consent.
- Current internal actions are checklist preparation and in-app reminder scheduling.
- External government submission is not enabled by the worker; a verified, authorized adapter and citizen approval are mandatory.

## Scheme catalogue and government portal adapters

The database currently contains four integration records:

| Scheme | Access state | Allowed actions |
|---|---|---|
| PM-KISAN | not_requested | None |
| PMAY-U 2.0 | not_requested | None |
| PM Ujjwala 2.0 | not_requested | None |
| CSSS / NSP | not_requested | None |

No scheme version is independently approved/published, and no department integration has an authorization reference or approved action.

The adapter contract matches exact official origin and application path, verified controls, protected fields, allowed actions and department authorization evidence. PM-KISAN's first registration form was inspected read-only; observed controls include Aadhaar, mobile, State, CAPTCHA, declaration and OTP. The inspected first step has no file-upload control. No personal data, OTP, CAPTCHA or submit action was entered.

Other portals are not assumed to share the PM-KISAN flow. Unknown, unapproved or untested schemes fall back to official navigation and manual preparation. The system must not claim universal automated submission across the scheme catalogue.

See [government integration access plan](government-integration-access-plan.md) and [portal adapter status](PORTAL-ADAPTER-AND-SYNC-STATUS.md).

## Documents and malware scanning

- Upload and retrieval routes are consent-gated and fail closed.
- Uploads enforce a streaming 13 MiB multipart request limit, 12 MiB file limit, allowed MIME types and file-signature validation.
- Uploaded documents enter private quarantine; only an authorized clean scanner attestation can make an object retrievable.
- Scanner lease, retry, consent-revocation cleanup and download ownership checks are implemented and database-tested.
- Private ClamAV container build and scanner protocol tests pass.
- A persistent production scanner identity/worker is not provisioned. There are no active scanner identities and no active document-storage policy. Document uploads must remain disabled until legal approval, worker deployment, operational monitoring and end-to-end malware/cleanup tests pass.

## Remaining release gates

1. Wait for Vercel deployment rate limit reset and a successful required Vercel status. Merge PR #22 to main only after the required checks pass.
2. Deploy the merged main commit to production and run live production smoke/accessibility tests.
3. Obtain independent privacy/legal approval for the exact cloud-sync and document-storage policies, including retention, deletion, subprocessors and backup terms.
4. Activate the approved policy versions and test authenticated two-device sync, wrong password, stale revision conflict, revocation and deletion.
5. Obtain written department/provider authorization for each scheme and exact portal actions. No current integration is authorized.
6. Independently approve scheme source evidence and eligibility rule sets before publishing.
7. Provision the persistent scanner identity/worker and complete malware-positive, malware-negative, retry, revocation, deletion and secure-download acceptance tests.
8. Verify production Auth email confirmation, SMTP and recovery with a controlled test account.
9. Complete independent penetration/security review, backup/restore and disaster-recovery exercises, monitoring and load testing.

## Release boundary

The backend foundation and release-candidate code are implemented and CI-verified. The current production deployment still runs the older main commit and does not contain the new PM-KISAN route, encrypted-sync API or installable manifest. No production release is claimed. Cloud sync and government application submission remain disabled until their external approval gates are satisfied.
