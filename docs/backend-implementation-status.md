# JanaSetu AI backend implementation status

**Updated:** 12 November 2026  
**Release candidate:** [PR #26](https://github.com/PSP-YN/JanaSetu-AI/pull/26)  
**Supabase project:** JanaSetu-AI · Mumbai (ap-south-1) · `qjiuclkhvxbnojdysmmp`

## Current release state

The current release candidate is local-first. Production still serves the older `main` commit `3b54af4`. PR #26 is open and must pass the latest GitHub Actions run and the required Vercel deployment check before it can be merged and deployed.

The previous GitHub Actions run failed two unit-test assertions after a migration change; 142/144 tests passed. The assertions were corrected in a later commit, but a complete passing run against the latest head has not yet been confirmed. Vercel's Hobby build-rate limit is blocking new preview/production builds. No branch protection check has been bypassed.

## Citizen-facing backend boundary

- Authenticated Supabase account/session routes exist, using verified sessions and HttpOnly cookies.
- Sensitive citizen table mutations use guarded, purpose-specific RPCs.
- Local profile, assessment and draft workflows remain usable without cloud sync.
- Local application preparation is a draft, not a government submission.
- Current scheme pathways remain pending independent review; no official eligibility decisions are issued.
- Four scheme integration records exist, but all remain `not_requested` with no allowed external actions or department authorization references.

## Cross-device sync — deferred, not in this release

- Cloud sync controls/status have been removed from the citizen workspace.
- The cloud-sync consent policy remains inactive and has no legal approval reference.
- No two-device sync acceptance test is claimed.
- The legacy plaintext workspace API remains retired (HTTP 410).
- A forward migration preserves existing workspace fields if sync is reconsidered: initial cutover blocks when legacy data exists, and later encrypted-vault writes merge only the vault key and revision. Profile, language, drafts, document references, reminders and assessments are not reset.
- Do not activate the sync policy or advertise cloud sync.

## Government scheme integrations

The current database has four seeded integration records:

| Scheme | Access state | Allowed actions |
|---|---|---|
| PM-KISAN | not_requested | None |
| PMAY-U 2.0 | not_requested | None |
| PM Ujjwala 2.0 | not_requested | None |
| CSSS / NSP | not_requested | None |

No scheme version has final independent publication approval. The scheme adapter registry is a guarded foundation, not a universal portal automation engine. PM-KISAN's first registration form was inspected read-only; no citizen data, OTP, CAPTCHA or submit action was entered. Other scheme landing pages are not treated as verified application workflows.

Unknown, unapproved or untested schemes must use official navigation and manual preparation. Do not enable submission without written department/provider authorization for the exact scheme, origin and actions, scheme-specific acceptance tests, active purpose-specific consent and citizen review of the exact payload.

## Documents and malware scanning — deferred

- Private quarantine and scanner protocol code/tests exist.
- The ClamAV container can be built and scanner protocol tests can run in CI.
- No persistent production scanner identity/worker is provisioned.
- Document upload and retrieval remain disabled; no live production scanning is claimed.

## Production operations still required

1. Passing CI and successful required Vercel check on the latest PR #26 head.
2. Merge to protected `main`, production deployment and live smoke/accessibility verification.
3. Real test-account lifecycle, SMTP delivery, redirect allow-list and recovery verification.
4. Independent scheme-source/rule approval and written department authorization before external integrations.
5. Independent security review, backup/restore and disaster-recovery exercises, monitoring and load testing.

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
- Added a clean-only download API: the database rechecks owner, scan status and active document-storage consent, and the server streams bytes from private storage with no-store, attachment, nosniff and size-integrity headers. No signed public URL is issued.
- Storage bucket is private, 12 MB limit, MIME allowlist PDF/JPEG/PNG. No Aadhaar or bank documents should be collected unless a separately approved purpose and retention policy explicitly require them.


## ClamAV scanner and clean-document retrieval — 11 November 2026

- Dedicated JanaSetu scanner protocol and private storage bucket are implemented; the Supabase project remains separate from CareerOS.
- The existing Python worker uses ClamAV INSTREAM, authenticates as a dedicated scanner Auth user, and does not require the Supabase service-role key.
- Applied migrations add atomic single-document claims, scanner identity binding, stale-claim recovery, a one-minute retry backoff and a five-attempt ceiling. A claim older than 15 minutes is recovered; scanner/network failures never produce a clean attestation.
- Storage access is separated: citizen read predicate allows only the document owner with a clean scan; scanner predicate allows only active scanner identities to read quarantined/scanning/error objects. The legacy broad scanner-read path and batch claim API have been removed.
- Worker validates object path, file signature, MIME and exact size, checks ClamAV signature freshness (48-hour maximum), streams content to a local ClamAV daemon and records a SHA-256 attestation. No document bytes are sent to third-party scanning services.
- Docker Compose uses a private loopback-only Clamd listener, persistent signature volume, read-only root filesystem, dropped capabilities and no exposed scanner port. The worker runs as a dedicated non-root user.
- Added authenticated clean-document retrieval through `app/api/documents/[documentId]`; database checks owner, clean state, exact upload consent scope, scheme version and active legal policy. Response is attachment-only, no-store and nosniff; no signed public URL is issued.
- Added Python protocol, MIME, object-path and claim-metadata tests plus TypeScript checks for storage policy and download authorization.
- Remote Supabase probes confirm scanner claim RPC is executable by authenticated users only, anonymous access is denied, scanner role count is zero, document count is zero, and there are four portal-only integration records. The scanner has not been provisioned.
- **Not yet live:** no scanner Auth identity has been created or assigned, no worker host/container is deployed, no ClamAV/EICAR acceptance test has run against Supabase Storage, and the legal document-storage policy remains inactive. Live uploads remain blocked until legal approval and scanner deployment. Do not enable uploads or make a document downloadable before those gates pass.


## Deterministic eligibility and application preparation — 11 November 2026

- Added `lib/eligibility-engine.ts`: strict version-1 rule-set validation, allowlisted profile fields/operators, official HTTPS evidence metadata, SHA-256 provenance, 90-day source freshness, missing-value handling and deterministic rule evaluation.
- Assessment states are deliberately limited to `potential_match`, `not_matched` and `needs_verification`. A potential match is not a government decision or guarantee.
- Added authenticated `POST /api/eligibility/assess`; it reads only the signed-in caller's published scheme and current version. It does not persist the submitted profile.
- Added `POST/GET /api/applications/prepare` and `POST /api/applications/prepare/confirm`. The preparation API requires an independently approved published scheme, a potential-match assessment, a complete reviewed field mapping and active scheme-scoped profile-storage consent.
- Added private `application_preparations` persistence with caller ownership, consent rechecks, field allowlist/size validation, citizen-review state and a separate citizen confirmation. Confirmation records only that the citizen approved the prepared fields; `submission_status` remains `not_submitted`.
- Added migrations `20261110190604_persist_citizen_application_preparations.sql` and `20261110190708_harden_application_preparation_consent_and_payload.sql`.
- Rule schema and reviewer contract: `docs/eligibility-rule-set-contract.md`.
- **Current gate:** the four seeded scheme versions still have draft rule notes and remain `review_pending`; zero schemes are published, zero are independently approved, zero citizen cases exist, and no active profile-storage consent policy exists. The engine correctly refuses to produce an automated potential match or save an application today. No automatic applicability claim is made.


## Private document read-path hardening — 11 November 2026

- Applied migration `20261111131254_enforce_document_consent_on_storage_reads` to the dedicated JanaSetu database.
- Direct Supabase Storage reads and the application download endpoint both require a clean scan, document ownership, the exact upload consent, matching case/scheme-version scope, a current active legal-approved document-storage policy, and no later consent revocation.
- Verified database function definitions and grants: authenticated callers can invoke the private predicates/download path; anon cannot. The storage SELECT policy delegates to the consent-aware predicate.
- Current database state remains fail-closed: zero document rows, zero active scanner identities and zero active legally approved document-storage policies. No citizen documents were created or accessed during this verification.


## Consent-revocation cleanup and citizen deletion — 11 November 2026

- Added an exact document-storage consent predicate binding the citizen, application case, captured consent ID, scheme version, action scope, active legal-approved policy and revocation history.
- The scanner claim path now re-checks consent before every scan; the Storage scanner-read policy also re-checks it. If consent expires or is revoked, the document moves to a deletion-only queue and can no longer be scanned or downloaded.
- The private scanner can delete only an object held under its active cleanup lease. It cannot delete ordinary citizen documents or other workers' objects. Metadata is removed only after Storage confirms the object is absent.
- Added a citizen-authenticated DELETE API for owned documents. It checks same-origin context, deletes the private Storage object first, and removes metadata only after confirming that the object no longer exists. This works for quarantined, rejected and clean records and does not require active consent.
- The worker's cleanup path never downloads or scans a consent-revoked document. Cleanup retries use a lease and treat Storage 404 as an idempotent success.
- This is implemented but not yet live: there are zero document rows, no scanner identity, and no active legally approved document-storage policy. The scanner container is built and its protocol tests pass; a persistent private worker host and authorised scanner credentials still need provisioning.


## Encrypted cross-device sync — 12 November 2026 update

The encrypted sync implementation supersedes the earlier last-write-wins description above.

- Browser encryption: PBKDF2-SHA-256 (600,000 iterations) and AES-256-GCM; vault password remains in browser memory.
- API validates the strict versioned envelope, request size, same-origin write and verified authenticated session.
- Reads and writes use guarded Supabase RPCs. Direct browser table writes remain revoked.
- The database checks the authenticated user, active cloud_workspace_sync consent and envelope structure.
- A monotonic revision with compare-and-swap rejects stale writes with HTTP 409.
- Encrypted payload is stored under profile_data.encrypted_workspace_v1; document bytes remain local.
- Existing legacy workspace fields are preserved by migration; encrypted sync refuses unsafe overwrite of incompatible legacy state.
- Legacy plaintext workspace endpoints are retired. Do not reintroduce plaintext sync.
- A cloud-sync policy draft is registered as inactive. It has no legal review reference and no approval timestamp. An authenticated citizen must not be shown an opt-in control until qualified review and policy-owner approval are recorded.
- CI on feature branch commit ddfe8b4 passed: unit tests, type-check, production build, browser/accessibility suite, extension validation, dependency audit and production smoke.

### Remaining live acceptance tests

- Two separately authenticated test accounts: account isolation and RLS.
- Two browsers/devices: sync, restore, wrong password, stale revision conflict and consent revocation.
- Controlled test account lifecycle: email confirmation, recovery, sign-out and session refresh.
- Production deployment and production-domain smoke after required Vercel status is green.

A passing CI run does not substitute for these live acceptance tests or the independent legal approval.
