# JanaSetu release readiness — 11 November 2026

## Scope

This report reflects direct inspection of the connected JanaSetu Supabase project, GitHub branch `backend/harden-supabase-access`, PR #22 and the linked Vercel project. It does not certify legal compliance, independent scheme accuracy, penetration testing or government authorization.

## Completed in this hardening pass

- Reconciled all 41 repository migration filenames with the 41 migration versions recorded by Supabase. The three scanner migration timestamps were corrected to their already-applied database versions; two follow-up migrations and the private-schema RLS migration were recorded and renamed to their exact applied versions.
- Applied `restore_scanner_cleanup_and_global_function_defaults`, `restore_consent_and_review_invariants` and `enable_private_schema_rls_defense_in_depth` to the connected database.
- Enabled RLS on private `application_preparations`, `citizen_documents`, `consent_policy_versions`, `document_scanner_roles` and `scheme_reviewer_roles`. No direct table privileges are granted to `anon` or `authenticated`; audited SECURITY DEFINER routines retain their narrowly scoped access.
- Corrected the scanner public deletion wrappers to SECURITY INVOKER. Verified the three wrappers are no longer SECURITY DEFINER and are not executable by `anon`.
- Added the missing private foreign-key indexes reported by Supabase Performance Advisors.
- Added a database trigger and check constraint binding each scheme-version SHA-256 to both its content and structured rule set; reviewed scheme-version evidence fields become immutable after the first review approval. Recomputed and verified all four pending scheme hashes.
- Updated scanner deployment instructions to use the exact applied migration versions.
- Updated CI's Playwright installation to avoid the apt-based `--with-deps` step. The previous run failed because the GitHub runner could not resolve Ubuntu package mirrors; unit tests and type-checking had passed before that infrastructure failure.

## Live Supabase findings

- 41/41 migration versions match the repository filenames.
- Four schemes exist; all four remain `review_pending`; none is published.
- The consent-policy registry contains zero legally approved policies.
- The scanner role registry contains zero active scanner identities.
- The scheme integration registry contains four portal-only records and zero production-authorized adapters.
- The automation queue has an active one-minute cron schedule.
- Security Advisor no longer reports the three SECURITY DEFINER public wrappers. Six INFO notices now report RLS-enabled tables without direct table policies: five private-schema tables (deliberately deny direct access; direct DML privileges are absent) and `public.scheme_approvals` (review operations are exposed through role-checked RPCs rather than direct table reads). These are intentional fail-closed controls, not permission grants.
- Performance Advisor's unindexed foreign-key findings were addressed. Remaining unused-index notices are informational and should be evaluated after real traffic exists.

## CI and preview deployment

- Latest CI run before the Playwright workflow adjustment failed at `npx playwright install --with-deps chromium` because apt mirror DNS resolution failed. Unit tests and TypeScript passed; subsequent browser, extension, dependency-audit and smoke-test steps were skipped.
- The current branch's latest CI run is queued/pending. Do not treat it as passed until every required step completes; check the latest run in GitHub Actions because each new commit supersedes the previous PR run.
- Vercel deployment `dpl_AZpuSRmbsE2BiZbqJVzw4yHv4TQ4` is READY, but it was built from older commit `2ef5b6a`, not the current branch head.
- A new preview deployment request was blocked by Vercel's account API deployment quota (`api-deployments-free-per-day`, retry after 24 hours). No production deployment or alias change was attempted.

## External approvals and provisioning still required

These cannot be truthfully completed by code changes or synthetic records:

1. **Legal approval:** A qualified reviewer must approve the purpose-specific privacy notice, consent text, retention schedule, data-flow map and DPIA. Until then, the consent-policy registry must remain empty and cloud/document storage disabled.
2. **Scheme verification:** Recruit and verify distinct human source reviewers, distinct eligibility-rule reviewers, a legal reviewer and a separate publisher. Review evidence for each exact scheme version; no synthetic approvals.
3. **Scanner identity:** Create a dedicated JanaSetu Supabase Auth user, assign only the scanner role through a privileged operator, and store its credentials in the worker host's secret manager. No identity or password has been created by this change.
4. **Scanner host:** A Render Blueprint and `render.yaml` now define the correct persistent Docker background worker in Singapore, with a 2 GB RAM plan, 1 GB signature disk, no public port, and secret placeholders. The Blueprint was created, but its first plan failed with `need_payment_info`; no worker service was created and no billing was initiated. Add a valid payment method in Render, then review the proposed plan and explicitly approve it before provisioning. A dedicated scanner identity and its secrets are still required.
5. **Government integration:** Obtain written authorization, supported API documentation, security requirements and a department test environment before enabling any portal adapter or submission workflow.

## Release decision

**Not production-ready for real citizen data or government submissions.**

The database migration history and several backend security controls are reconciled and applied. The remaining blockers require real external people, authorization, credentials, a persistent worker host and a successful current-commit CI/preview verification. The existing public production site remains untouched.


## Hackathon local-first vault update — 11 November 2026

- Added a browser-local document store backed by IndexedDB. Newly added PDF, JPEG and PNG binaries remain on the device; the workspace sync path receives document metadata only, not the binary.
- Added a portable `.janasetu` export/import format using AES-256-GCM with a per-export random salt and nonce and PBKDF2-HMAC-SHA-256 (600,000 iterations). Passwords are prompted locally and are not sent to the application server. Incorrect passwords and ciphertext tampering fail authentication.
- Added bounds: 12 MB per document, 25 MB aggregate document payload, 40 MB encrypted vault import, and a 12-character minimum password.
- Added unit coverage for round-trip decryption, plaintext non-disclosure, incorrect-password rejection and minimum password length.
- Added a local ClamAV CLI helper. Malware scanning remains distinct from encryption; an unavailable or failed scan is not a clean verdict. No paid hosted worker or scanner Auth identity is required for this local demo path.
- Local verification on the connected Fedora workstation: `npm run check` passed (TypeScript plus 127/127 unit tests); `npm run build` passed.
- GitHub Actions run [#603](https://github.com/PSP-YN/JanaSetu-AI/actions/runs/43069185681) completed successfully, including scanner image build, tests, type-check, browser accessibility tests, extension validation, dependency audit and production smoke test.
- Local production server started at `http://127.0.0.1:3100/app` for the hackathon walkthrough.
- Vercel preview deployment remains blocked by the account's daily deployment rate limit. No merge to `main`, production deployment, paid Render worker, legal consent approval, independent scheme approvals or government API authorization has been performed.

The local-first vault is a hackathon demo capability, not a completed independent security audit or a declaration of production readiness. Older document checklist entries created before this feature may contain metadata only; newly added documents are stored as local binary files and included in encrypted exports.

## Zero-cost continuation update — 12 November 2026

The account owner declined paid infrastructure. No payment method was added, no Render charge was approved, and no paid service or persistent disk was provisioned. The Render Blueprint remains `autoSync: false`, status `created`, with an empty resource list. The ClamAV worker remains locally tested only; it is not a live Supabase Storage scanner.

The no-cost operating boundary is local-first: keep documents in the browser's IndexedDB vault and encrypted local backup/restore. Do not activate cloud document upload or claim malware scanning for cloud objects. The free Render web-service tier is not an acceptable substitute for the 4 GB persistent ClamAV worker. Revisit hosted scanning only when a suitable funded host or a separately validated managed scanning architecture is available.

### Live application submission verification

On 12 November 2026, the live Supabase database was inspected. All four scheme records remain `review_pending`; there are zero approved consent-policy versions, zero active scanner identities, zero automation runs and no production-authorized government adapter. The `private.confirm_automation_run` function rejects every external portal action, including `submit_application`, with `government_adapter_execution_not_enabled`. It only queues `prepare_documents` and `schedule_reminder` after fresh, purpose-specific consent and citizen confirmation.

The application preparation endpoint returns `awaiting_citizen_review`; the citizen's confirmation endpoint explicitly returns `submissionStatus: not_submitted`. JanaSetu therefore prepares and waits for citizen review; it does **not** automatically submit an application. A later external submission capability requires a separately authorized government integration and a fresh point-of-submission confirmation. See `docs/citizen-data-and-automation-policy.md` for the verified workflow.

### CI

GitHub Actions run #627 (commit `4d7800c6139bfdf83ca3f03d9cc54d220b139355`) completed successfully. Its required test, type, security and production-smoke job passed, including the ClamAV image build, scheme-review guardrails, consent/automation checks, browser tests, dependency audit and production route smoke tests. This is branch CI evidence, not a production deployment or a live Supabase Storage scanner test.
