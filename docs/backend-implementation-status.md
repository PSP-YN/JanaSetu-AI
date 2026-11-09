# JanaSetu backend implementation status

Updated: 9 November 2026

## Dedicated infrastructure

- Supabase project: `JanaSetu-AI`
- Organization: `Projects`
- Region: `ap-south-1` (Mumbai)
- Project creation quote: $0/month
- Project reference: `qjiuclkhvxbnojdysmmp`
- Existing CareerOS project remains separate and unchanged.

## Applied database foundation

- `20261109130314_create_citizen_data_foundation.sql`
- `20261109130423_harden_api_grants_and_index_foreign_keys.sql`
- 12 public tables created; RLS enabled on all 12.
- Explicit least-privilege Data API grants; future default privileges revoked for anon/authenticated/PUBLIC.
- Private `citizen-documents` bucket configured. Browser upload is not enabled.
- Foreign-key indexes added after Supabase advisor review.

## Initial verification

- Migration history contains both applied versions.
- Table inventory confirms all 12 tables and RLS enabled.
- Privilege probes confirm anon cannot read citizen data or truncate tables; authenticated cannot insert application cases, update automation runs, read reviewer approvals or delete document metadata; server role retains case-write access.
- Security advisor reports one informational finding: `scheme_approvals` has RLS and intentionally has no client policy because review writes/reads are admin/server-only.
- Performance advisor no longer reports unindexed foreign keys. Unused-index notices are expected on a new database with no workload and should be re-evaluated after representative traffic.

## Not yet implemented or independently verified

- Supabase Auth integration in the Next.js workspace; current profile, drafts, assessments, reminders and document metadata still persist in browser localStorage.
- Two-independent-user RLS tests and end-to-end account lifecycle.
- Server-side application-case APIs, automation outbox/worker, idempotent transitions and reminder scheduler.
- Document byte upload, malware scanning/quarantine, retention/deletion and signed download flow.
- Verified full scheme catalogue, two-person scheme reviews and freshness automation across all records.
- Authorised government portal adapters and official acknowledgement/receipt verification.
- Independent privacy/legal/security review, disaster recovery and load testing.

## Automation policy

Automate discovery, eligibility screening, checklist creation, document preparation and safe form assistance where permitted. Each consequential external action must be bound to a specific purpose, citizen consent, exact destination and data preview, and point-of-action confirmation. Never bypass OTP, CAPTCHA, identity proofing, access controls or portal terms. Never label a prepared draft as submitted without a verified official receipt.

## Release boundary

The database foundation is applied, but the application is not production-ready. No public deployment, domain change, merge to `main`, or production release is authorised by this status update. Continue on reviewed branches until the release gates are independently verified and explicit release approval is given.


## Authenticated cloud workspace implementation — 9 November 2026

- Applied migration `20261109131533_add_authenticated_citizen_workspace` to the dedicated remote project and tracked it in the repository.
- `citizen_workspaces` has RLS enabled with own-user SELECT/INSERT/UPDATE policies using `auth.uid()`; no anon privileges.
- Implemented password sign-up/sign-in, sign-out, confirmation callback, password recovery request and password update API routes.
- Session access and refresh tokens are stored in HttpOnly cookies; API handlers verify the access token against Supabase Auth and rotate expired sessions using the refresh token.
- Workspace API derives `user_id` from the verified Auth session, rejects cross-origin writes, enforces a 256 KiB request limit, and uses the caller's JWT against PostgREST so RLS remains active. No service-role key is used.
- Added profile, language, preparation drafts, document references (metadata only), reminders and assessment synchronization with a remote-first load. If the remote load fails, the client deliberately does not overwrite remote state.
- Configured the dedicated JanaSetu Supabase URL and publishable key in the Vercel `janasetu-ai` project for production, preview and development. No CareerOS project or credentials are used.

### Auth/cloud limitations still requiring live verification

- Vercel preview deployment must build and pass browser tests before this code is considered operational.
- Supabase Auth email confirmation, allowed redirect URLs and SMTP delivery settings have not been independently verified in the remote project. Password recovery delivery depends on a configured email provider.
- No real test account was created. Sign-up, email confirmation, recovery and sign-out require end-to-end testing with a controlled test address.
- Cross-device conflict resolution is currently last-write-wins at the whole-workspace row level. It is not a collaborative/offline merge engine.
- The workspace sync stores document references only. File bytes are not uploaded. Malware scanning, quarantine and secure download remain separate gates.
- This sync layer does not yet create normalized `application_cases`, application event records or durable automation runs. Those need the reviewed scheme catalogue and consent-backed workflow APIs.

### Deployment boundary

The branch deploys only to Vercel preview URLs. The production target/domain has not been changed or redeployed. Public production release remains blocked until the authentication configuration and end-to-end security checks pass.
