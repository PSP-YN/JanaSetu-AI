# JanaSetu AI — pre-production system audit

**Audit date:** 24 November 2026  
**Disposition:** **NOT APPROVED for general-public production launch**  
**Scope:** application/API code, Next.js build, browser extension, voice intake, Supabase project and schema, Vercel deployment/firewall, document-scanner service, release workflows and operational controls.

This is an engineering audit of the repository and connected deployment. It is not an independent penetration test, legal opinion, DPDP compliance certification, government authorization, or a capacity certification.

## Executive assessment

JanaSetu has useful fail-closed controls: published-scheme review gates, user-scoped database access, private document storage, explicit consent purposes, safe portal-fill boundaries, encrypted backup export, and a separate readiness endpoint. The project is still a controlled beta/prototype. It must not be represented as an official government service or as an automated government-application submission system.

The live Supabase project was found inactive during this audit and was restored. The live readiness endpoint now reports database connectivity. A Vercel firewall rate-limit rule is active. The code fixes in this audit branch are **not yet deployed**; production continues to run the previously deployed revision until the pull request is merged and its deployment is verified.

## Changes implemented in the audit branch

| Finding | Change | Verification |
|---|---|---|
| GitHub Actions dependency installation attempted to fetch an unavailable optional CUDA binary on CPU-only runners | CI now skips the optional Node CUDA execution provider while retaining CPU ONNX Runtime | CPU-only install workflow guard test; remote CI run pending |
| Public scheme pages could abort a production build when Supabase was unavailable | Public catalogue reads now have a bounded timeout and fail closed to an empty guide list; partial/unverified data is not published | Offline-dependency build and regression test |
| JSON API handlers read unbounded request streams before checking byte length | Added a shared streaming JSON-object parser and migrated write routes to explicit byte limits, including the 8 MB encrypted-sync endpoint | Chunked oversized-body, malformed JSON, scalar/array and route tests |
| Liveness endpoint returned `status: prototype` | Liveness now reports `status: ok`, uses the correct service identifier and `Cache-Control: no-store` | Health-route unit test |
| Hourly monitor could pass while the database was unavailable | Monitor now checks `/api/ready` and asserts database readiness separately from liveness | Workflow change reviewed; live monitor run pending merge |
| Local Whisper could append cross-script or repeated decoding output | Added a transcript guard for writing-system mismatch and repetitive loops; user review remains mandatory | Unit tests and browser smoke test; semantic transcription accuracy is not certified |

## Live infrastructure and database findings

- Supabase project: `JanaSetu-AI`, Mumbai region; restored to `ACTIVE_HEALTHY` on 24 November 2026.
- Remote migration history: 51 migrations, matching the 51 SQL migration files in the audited repository.
- Four initial scheme records, four scheme-version records and four source records exist. **Zero schemes are published/independently approved.**
- 14 public tables have Row Level Security enabled. Private tables and scheme approvals are intentionally deny-all to direct clients; direct `anon`/`authenticated` table privileges were not granted for private document records.
- 34 `SECURITY DEFINER` functions have an explicit `search_path`.
- The `citizen-documents` storage bucket is private, with a 12 MB limit and PDF/JPEG/PNG allowlist.
- The internal one-minute automation worker is active; its recent post-restoration runs succeeded and the queue was empty at audit time.
- The database contained no authenticated users, application cases, citizen workspaces, automation runs or citizen documents at audit time. There is therefore no production two-user isolation test with real tenant data.
- Supabase advisors reported six `RLS enabled, no policy` informational notices. These correspond to deny-all tables by design; adding permissive policies to silence them would weaken security. The performance advisor reported 27 unused indexes; with effectively no user traffic, this is not evidence that those indexes should be dropped.
- The connected Supabase organization is on the Free plan. Free-tier pause behavior caused the outage observed during this audit. Free-tier backup and compute limits are not an adequate high-availability commitment for a public citizen service.

## Vercel and edge protection

- Canonical production hostname verified: `https://jana-setu-ai.vercel.app`.
- A production WAF fixed-window rate-limit rule is active for `POST /api/agent/run`, `POST /api/intake/parse` and `POST /api/applications/draft`: **120 requests per source IP per 60 seconds**, deny on limit. A single normal request passed. Vercel documents 1,000,000 allowed rate-limited requests included and $0.50 per additional million; monitor usage. This is an edge abuse guard, not a substitute for authenticated authorization or distributed application-level quotas. Users behind the same campus/mobile NAT share an IP bucket and may need a higher limit.
- The repository is linked to two Vercel projects in separate teams. The `jana-setu-ai` project in the PSP team serves the canonical production hostname; the other `janasetu-ai` project is a duplicate deployment surface. Consolidate deliberately after confirming no external aliases or workflows depend on it.
- The Vercel team plan was not confirmed from the available project metadata. Confirm commercial-use eligibility and function/build quotas in the Vercel billing dashboard before launch.

## Release-blocking findings

### P1 — Citizen data protection

- Profile state is stored in browser `localStorage`; local documents use browser storage. The encrypted vault protects exported backup files, not every live browser-stored record. This is not equivalent to an encrypted server-side citizen-data vault and does not protect against same-origin script compromise.
- The Content Security Policy is report-only and includes permissive inline/eval allowances. A tested nonce/hash-based enforced CSP is still required.
- Complete a privacy impact assessment, retention/deletion policy, consent wording and legal review under applicable Indian data-protection requirements before collecting real citizen data. Do not collect Aadhaar, bank credentials, OTPs or identity documents through an unapproved workflow.

### P1 — Identity and account lifecycle

- The database has zero real/test accounts. Signup, email confirmation, SMTP delivery, password recovery, password change, session expiry/refresh, account deletion and two-user tenant isolation have not been verified end to end against the live identity provider.
- The committed local Supabase config previously allowed 6-character passwords, disabled email confirmation and secure password change, and allowed 1-second email resend intervals. The audit branch now sets a 12-character minimum, mixed-case/digit requirements, email confirmation, secure password changes and a 60-second resend interval.
- SMTP is not configured in the repository. Create dedicated non-production test accounts, configure a verified SMTP provider and mirror these settings in the hosted Supabase Auth dashboard; then verify signup, confirmation, recovery, password change, session expiry/refresh and deletion before enabling public registration.

### P1 — Scheme publication and government authorization

- Four seed schemes remain pending review; zero are approved and published. The catalogue contains discovery references, not a verified eligibility or application decision for every record.
- Persisted application preparation is gated. Cloud document storage, cloud sync and government-portal automation remain disabled pending their specific legal consent and department authorization. These gates must not be bypassed in code.
- Independent source/rule/legal/publisher review and department authorization are operational prerequisites, not engineering tasks that can be simulated.

### P1 — Resilience, backups and scale

- No production-like load test, multi-region failover test, backup restore drill, incident exercise or measured RPO/RTO has been completed. A staging-only k6 scenario and execution plan are provided in [load-test-plan.md](load-test-plan.md); they have not been run against production.
- Supabase Free is a development/beta tier with small shared compute, limited storage/egress and inactivity pausing. Upgrade to an always-on production tier and configure/verify backups before real users.
- No capacity claim should be made until concurrent-user tests cover login, catalogue search, application preparation, database contention, rate limiting and recovery at the intended peak load.

### P1 — Content and speech quality

- The on-device Whisper smoke test is not a word-error-rate benchmark. Script/repetition guards prevent some obvious bad decodes, but semantic accuracy for Kannada, Tamil, Telugu, Malayalam, Hindi and English has not been certified. Users must review and correct every transcript; provide manual text entry as the reliable fallback.
- Scheme source freshness and legal publication remain separate from application availability. Stale or unreviewed source data must never be presented as a current approved rule.

### P2 — Operational hardening

- Enforce CSP after collecting/analysing report-only violations.
- Add structured, privacy-safe request correlation and alerting for readiness failures, auth abuse, queue failures and scanner errors.
- Consolidate duplicate Vercel projects and verify plan/quotas.
- Run the production monitor after the readiness change is merged; verify it fails when `/api/ready` is deliberately unavailable in staging.
- Deploy and operate the document-scanner worker only after consent policy, scanner identity, object access and malware-signature update procedures are approved.

## Verified tests

The audited source revision is expected to pass the following gates before merge:

- `npm run check` — 187 unit tests plus TypeScript checking.
- `npm run build` — including a build with Supabase configured to an intentionally unreachable local endpoint, proving public scheme rendering no longer requires a live database during build.
- `npx playwright test --workers=1` — full browser E2E suite, including extension, voice, portal safety and citizen workflows.
- `python3 -m unittest discover -s tests -p 'test_*.py' -v` — document-scanner unit tests.
- `python scripts/validate_database_migration.py` and `python scripts/validate_scheme_review_packets.py` — migration/review packet validation.
- `npm audit --omit=dev --audit-level=high` — dependency audit.

A passing automated suite does not close the legal, identity, data-protection, load, backup or government-authorization gates above.

## Go-live checklist

- [ ] Upgrade to an always-on production database plan; configure daily backups and complete a restore drill.
- [ ] Confirm Vercel commercial-use plan, quotas and production/preview project ownership.
- [ ] Complete PIA, privacy notice, consent policy, retention/deletion and incident-response approval.
- [ ] Move sensitive citizen records to a reviewed encrypted storage design; enforce CSP and complete XSS/CSRF review.
- [ ] Verify signup, confirmation, recovery, MFA policy, session rotation, account deletion and two-user isolation.
- [ ] Independently approve and publish scheme sources, eligibility rules, document checklists and application mappings.
- [ ] Obtain department authorization before enabling any government portal adapter or cloud document/sync workflow.
- [ ] Deploy and verify scanner worker, malware signatures, quarantine, deletion and incident handling before document uploads.
- [ ] Run staged load tests at the agreed peak concurrency and validate autoscaling, database pool limits, latency and error budgets.
- [ ] Complete backup restore, outage, queue-recovery and incident-response exercises.
- [ ] Merge the audit branch, verify production deployment, then run the live readiness monitor and citizen acceptance tests.

**Release decision:** keep JanaSetu in controlled beta. Do not onboard the general public or claim production-scale capacity until every P1 gate is closed and independently verified.
