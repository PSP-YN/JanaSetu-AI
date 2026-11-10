# JanaSetu backend implementation status

Updated: 11 November 2026

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
- Private `citizen-documents` bucket configured. Upload API is consent-gated and fails closed until a legally approved policy and scanner acceptance are in place.
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
- Scanner service deployment, scanner identity provisioning, end-to-end malware scan acceptance, retention/deletion and clean-only document retrieval.
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
- Direct authenticated Data API access to `citizen_workspaces` has been revoked. Workspace reads/writes now go through private SECURITY DEFINER functions exposed only through public SECURITY INVOKER wrappers that enforce the separate `cloud_workspace_sync` consent.
- Remote probes confirm citizens cannot directly SELECT/INSERT the workspace table, can call only the consent-checked RPC wrappers, and cannot call the private consent-probe function.
- No active approved consent policies exist. Therefore cloud profile storage and cross-device synchronization are intentionally disabled. The account sign-in surface can be tested, but user data remains in browser-local storage until the privacy policy is approved and the citizen explicitly accepts it.
- Remote `citizen_workspaces` row count remains zero. No citizen account or personal data was created during implementation.


## Consent purpose separation

- `profile_storage` consent is required to create a normalized application case containing a profile snapshot. It is bound to the exact scheme version and `create_application_case` action.
- `cloud_workspace_sync` is a separate consent purpose for cross-device profile/draft synchronization. The workspace RPCs check only this purpose, not general profile-storage consent.
- `citizen_consents` no longer permits direct authenticated INSERT. Consent grants/revocations must pass through the guarded RPC; direct writes to profiles and reminders are also revoked.
- The private consent-policy registry has no active versions for either purpose. Both application-case persistence and cloud sync remain blocked until legal review and explicit consent.


## Latest remote verification — 9 November 2026

- Remote migration history includes the consent split and final guarded consent-capture migrations (`20261109135647`, `20261109135846`).
- 14/14 public tables have RLS enabled.
- Authenticated users have no direct SELECT on `citizen_workspaces`, no direct INSERT on `citizen_consents`, and no direct INSERT on `citizen_reminders`.
- Application-case RPC requires a separate `profile_storage` consent ID scoped to the exact scheme version and `create_application_case` action.
- Workspace RPCs require `cloud_workspace_sync` consent scoped to `workspace_sync`.
- The private consent-policy registry has zero active policies; workspace rows = 0; published schemes = 0; independently approved scheme versions = 0.
- The one-minute cron job has 18 successful executions. Empty queue processing is verified; no citizen-confirmed automation jobs exist.
- Security advisor has one INFO finding: `scheme_approvals` has RLS and intentionally no client policy. Performance advisor reports 19 unused indexes on the empty/new database; re-evaluate after representative traffic rather than removing useful FK indexes prematurely.


## Citizen workflow surfaces

- `/app/automation` now shows published scheme count, the citizen's application cases, automation history and in-app reminders.
- `GET /api/schemes/approved` returns only published schemes.
- `/api/applications` lists cases and creates a case only through the independent-approval and profile-consent RPC.
- `/api/consents` records/revokes purpose-specific consent through the guarded database function.
- `/api/automation/runs` requests and lists idempotent automation runs; `/api/automation/confirm` records point-of-action confirmation.
- `/api/reminders` exposes citizen-owned in-app reminders read-only. Reminder rows are created by the scheduled worker, not direct browser writes.
- Current state remains intentionally empty: 0 published schemes, 0 application cases, 0 automation runs and 0 active consent policies.


## Scheme source refresh — 9 November 2026

- Four records are now stored in the dedicated database with immutable content hashes and linked official source records: PM-KISAN, PMAY-U 2.0, PMUY 2.0 and PM-USP CSSS.
- All four are `source_checked` / `review_pending`; zero `scheme_approvals` records were inserted. No scheme was independently approved or published.
- The PMAY 2026 guideline index requires reconciliation; the CSSS NSP deadline conflict remains unresolved; PM-KISAN exclusion circulars require review; PMUY household category/biometric requirements need independent confirmation.
- Full reviewer evidence and unresolved questions: `docs/scheme-review-packets/2026-11-09-official-source-refresh.md`.


## Independent review and publication workflow

- Private reviewer-role registry and public invoker RPCs are installed.
- Review roles: source reviewer, eligibility-rule reviewer, legal reviewer, translation reviewer and scheme publisher.
- Review decisions are tied to the authenticated user; notes require evidence-based rationale.
- One reviewer cannot submit multiple review categories for the same scheme version. The publisher cannot be one of that version's reviewers.
- Publication requires two distinct source approvals, two distinct eligibility-rule approvals and one legal approval, followed by a separate publisher action.
- Application-case creation rechecks the same approval requirements and a scheme-scoped profile-storage consent.
- Reviewer queue and decision/publish APIs plus `/app/review` UI are implemented.
- No reviewer roles are assigned, no approval records exist, and no scheme is published. Role assignment instructions: `docs/scheme-reviewer-onboarding.md`.


## Document upload quarantine — 10 November 2026

- Added a private `citizen-documents` upload API limited to PDF, JPEG and PNG up to 12 MB.
- Upload initialization requires a citizen-owned application case, exact `document_storage` consent, exact scheme-version scope, `upload_document` action scope and an active legally approved consent-policy version.
- Uploads enter `quarantined`; the Storage SELECT policy exposes only documents with a `clean` scan attestation. Citizens can delete their own quarantined files.
- Scanner attestation is role-gated. No scanner role is assigned and no ClamAV/scanning service is deployed; therefore no upload can become downloadable yet. This is deliberate fail-closed behavior.
- Legal consent policy remains inactive, so live uploads are blocked. End-to-end upload and scanner acceptance tests remain outstanding pending legal approval and scanner deployment.
- Storage bucket is private, 12 MB limit, MIME allowlist PDF/JPEG/PNG. No Aadhaar or bank documents should be collected unless a separately approved purpose and retention policy explicitly require them.


## Leased ClamAV scanner implementation — 11 November 2026

- Applied and tracked migration `20261110185200_add_leased_clamav_document_scanner.sql` on the dedicated JanaSetu Supabase project.
- Added a private scanner worker built around ClamAV INSTREAM; it authenticates as a dedicated scanner Auth user and does not require the Supabase service-role key.
- Added database claims with `FOR UPDATE SKIP LOCKED`, bounded batches, 10-minute leases, five-attempt ceiling and authenticated scanner-role checks.
- Storage read policy now allows only the document owner after a clean attestation, or an explicitly active scanner identity while quarantined. Scanner access is not granted to ordinary citizens.
- Worker validates file signatures, size and MIME, computes SHA-256, scans locally, and only attests clean when ClamAV returns `OK`. Infected/invalid files are rejected; network, scanner and indeterminate failures leave files quarantined for lease-based retry.
- ClamAV daily signatures must be present and no older than 48 hours; otherwise the worker fails closed. No file bytes are sent to third-party scanning services.
- Added a hardened Docker Compose deployment, scanner provisioning/runbook and Python protocol/MIME tests; CI now runs the Python scanner test suite.
- Remote probes confirm both scanner RPCs exist, authenticated can execute them, anon cannot, and there are currently zero active scanner roles and zero citizen documents.
- **Not yet live:** no scanner Auth identity has been provisioned or assigned, no scanner host/container is deployed, no ClamAV/EICAR acceptance test has run against Supabase Storage, and the legal consent policy remains inactive. Therefore no citizen upload can yet become downloadable. Keep the upload gate closed.
