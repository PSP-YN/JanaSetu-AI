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


## Government integration discovery — 9 November 2026

Official-source review confirmed that myScheme prohibits unauthorized bot/scraper access unless expressly authorized in writing; API Setu uses consumer registration, API subscriptions and publisher approval; DigiLocker requester access requires partner registration, credentials, testing/audit and go-live approval; UMANG service integrations are individual department APIs. The detailed access plan and per-adapter approval contract are in `docs/government-integration-access-plan.md`.

No permission, partner approval, production API credentials or portal sandbox credentials have been obtained for JanaSetu. Consequently, no automatic government submission is enabled or claimed. This is an external authorization gate, not a coding task that can be bypassed.

## Consent-gated automation engine — 9 November 2026

- Enabled Supabase `pgmq` durable queue and `pg_cron` scheduler.
- Created `janasetu_automation` queue and active one-minute cron job `janasetu-automation-worker`.
- Cron execution history confirms successful runs; an explicit empty-queue worker invocation returned 0 processed jobs.
- Citizen application creation is exposed only through an RPC that requires a published scheme version marked `independently_approved`, at least two distinct source-accuracy approvals and two distinct eligibility-rule approvals, with no rejected/changes-requested review.
- Purpose-specific consent is captured with a policy version and scope. Automation requests are idempotent and remain `awaiting_confirmation` until the citizen confirms the exact run.
- Only internal actions `prepare_documents` and `schedule_reminder` can currently enter the queue. The worker prepares a checklist from the approved scheme version or creates an in-app reminder.
- External portal actions require a production-approved scheme adapter, a valid authorization reference, an exact destination match in consent scope and a separate human confirmation. The current worker intentionally rejects external execution even if a registry entry is created; a real adapter implementation and acceptance tests are required first.
- Privileged database functions were moved to the non-exposed `private` schema; public RPC wrappers are invoker-security. The queue processor is executable by the database scheduler only.
- Supabase security advisor now reports only the intentional `scheme_approvals` table with RLS and no client policy. The `scheme_integrations` table has a service-role read policy and no citizen access.
- Remote inventory: 14 public tables, 14 with RLS enabled. Published schemes: 0. Independently approved scheme versions: 0. No real application case or automation job can currently be created until human scheme review and publication are complete.


## Privacy consent gate — 9 November 2026

- Added a private consent-policy registry. It contains zero active policies until the actual policy text has passed legal/privacy review and an approval reference/hash is recorded.
- Purpose-specific consent cannot be granted against an unapproved policy version.
- Revoking a purpose marks all earlier active grants for that user/case/purpose as revoked.
- Automation requests and point-of-action confirmation re-check that the exact purpose policy remains active and that scope matches the action and scheme version.
- Direct authenticated Data API access to `citizen_workspaces` has been revoked. Workspace reads/writes now go through private SECURITY DEFINER functions exposed only through public SECURITY INVOKER wrappers that enforce `profile_storage` consent.
- Remote probes confirm citizens cannot directly SELECT/INSERT the workspace table, can call only the consent-checked RPC wrappers, and cannot call the private consent-probe function.
- No active approved consent policies exist. Therefore cloud profile storage and cross-device synchronization are intentionally disabled. The account sign-in surface can be tested, but user data remains in browser-local storage until the privacy policy is approved and the citizen explicitly accepts it.
- Remote `citizen_workspaces` row count remains zero. No citizen account or personal data was created during implementation.
