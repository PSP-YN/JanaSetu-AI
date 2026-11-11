# JanaSetu release readiness — 11 November 2026

## Scope

This report reflects direct inspection of the connected JanaSetu Supabase project, GitHub branch `backend/harden-supabase-access`, PR #22 and the linked Vercel project. It does not certify legal compliance, independent scheme accuracy, penetration testing or government authorization.

## Completed in this hardening pass

- Reconciled all 40 repository migration filenames with the 40 migration versions recorded by Supabase. The three scanner migration timestamps were corrected to their already-applied database versions; two follow-up migrations and the private-schema RLS migration were recorded and renamed to their exact applied versions.
- Applied `restore_scanner_cleanup_and_global_function_defaults`, `restore_consent_and_review_invariants` and `enable_private_schema_rls_defense_in_depth` to the connected database.
- Enabled RLS on private `application_preparations`, `citizen_documents`, `consent_policy_versions`, `document_scanner_roles` and `scheme_reviewer_roles`. No direct table privileges are granted to `anon` or `authenticated`; audited SECURITY DEFINER routines retain their narrowly scoped access.
- Corrected the scanner public deletion wrappers to SECURITY INVOKER. Verified the three wrappers are no longer SECURITY DEFINER and are not executable by `anon`.
- Added the missing private foreign-key indexes reported by Supabase Performance Advisors.
- Updated scanner deployment instructions to use the exact applied migration versions.
- Updated CI's Playwright installation to avoid the apt-based `--with-deps` step. The previous run failed because the GitHub runner could not resolve Ubuntu package mirrors; unit tests and type-checking had passed before that infrastructure failure.

## Live Supabase findings

- 40/40 migration versions match the repository filenames.
- Four schemes exist; all four remain `review_pending`; none is published.
- The consent-policy registry contains zero legally approved policies.
- The scanner role registry contains zero active scanner identities.
- The scheme integration registry contains four portal-only records and zero production-authorized adapters.
- The automation queue has an active one-minute cron schedule.
- Security Advisor no longer reports the three SECURITY DEFINER public wrappers. Six INFO notices now report RLS-enabled tables without direct table policies: five private-schema tables (deliberately deny direct access; direct DML privileges are absent) and `public.scheme_approvals` (review operations are exposed through role-checked RPCs rather than direct table reads). These are intentional fail-closed controls, not permission grants.
- Performance Advisor's unindexed foreign-key findings were addressed. Remaining unused-index notices are informational and should be evaluated after real traffic exists.

## CI and preview deployment

- Latest CI run before the Playwright workflow adjustment failed at `npx playwright install --with-deps chromium` because apt mirror DNS resolution failed. Unit tests and TypeScript passed; subsequent browser, extension, dependency-audit and smoke-test steps were skipped.
- CI run #585 for the current branch head is queued/pending. Do not treat it as passed until every required step completes.
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
