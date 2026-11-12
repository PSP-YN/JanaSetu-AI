# JanaSetu AI — production readiness and release gate

**Assessment date:** 12 November 2026
**Merged release:** PR #29 plus CI/action, Playwright and production dependency updates (#18, #19, #15).
**Production main SHA:** `d8928e8fc891a76f692cf4ba12e8d213d9d2b876`.
**Release state:** merged to protected main; refreshed production deployment READY; canonical-domain smoke and browser checks passed.

## Deployment state

| Environment | URL | State |
|---|---|---|
| Canonical production | https://jana-setu-ai.vercel.app | READY · deployment `dpl_AtvjwMvehUtGwYgt9XXbpjRs2ie8` · main SHA `d8928e8fc891a76f692cf4ba12e8d213d9d2b876` · alias verified |
| New-account preview | https://jana-setu-grubsq4ns-psp-adb0.vercel.app | READY · deployment dpl_w6L5tdjRaXcC8MwdaF6HLseXUcmu · preview bypass revoked |
| New Vercel project | psp-adb0 / jana-setu-ai | Supabase URL and public anon key configured for production, preview and development |
| GitHub source | https://github.com/PSP-YN/JanaSetu-AI | PR #29 and dependency/CI PRs #18, #19, #15 merged · current main `d8928e8fc891a76f692cf4ba12e8d213d9d2b876` |

PR #29 merged normally after all required CI and Vercel checks passed and all seven CodeRabbit review threads were resolved. Maintenance PRs #18, #19 and #15 also passed required checks and merged. Octopus Review was skipped where it was not required by branch protection. No administrator merge override was used and branch protection was not disabled. The canonical domain serves the READY deployment built from main SHA `d8928e8fc891a76f692cf4ba12e8d213d9d2b876`.

## Verification completed for the merged release

| Check | Result |
|---|---:|
| TypeScript | Passed |
| Unit tests | 173/173 |
| Next.js production build | Passed |
| Playwright E2E | 66/66 |
| Document scanner protocol/unit tests | 10/10 |
| Extension JavaScript syntax | Passed |
| Extension manifest JSON | Passed |
| npm high-severity audit | 0 vulnerabilities |
| Supabase local migrations | 49/49 applied |
| Supabase local schema lint | Passed |
| Linked migration reconciliation/schema lint | Passed |
| New Vercel production route/API smoke | 18 endpoints returned HTTP 200 |
| Live browser smoke | 9 routes returned HTTP 200; Kannada profile/export and automation disclosures verified; zero console errors |
| Supabase Auth readiness | Production `/api/ready` returned ready with database connectivity; local `.env.local` Auth health returned HTTP 200 |
| Automation security boundary | Cross-origin POST blocked (403); same-origin unauthenticated planner blocked (401); no published schemes |

These results verify the exercised code paths. They do not establish legal authorization, external portal compatibility, live scanner operation, two-device sync, independent penetration-test completion or high-load capacity.

## Current product capabilities

- Multilingual public-benefits discovery and source-linked guidance in English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- Citizen profile, local assessments, scheme discovery, evidence checklists and application-preparation drafts.
- Deterministic eligibility engine that requires independently approved, current scheme versions before returning a potential match.
- Authenticated, same-origin application planning endpoint. It accepts only a scheme slug and citizen profile, reads a currently published independently approved version, and does not persist the submitted profile.
- Supabase authentication and guarded, purpose-specific server APIs.
- Consent-gated application preparation, automation-run queue and reminder foundations.
- Client-side encrypted vault and guarded revision-aware sync API; cloud sync remains inactive.
- MV3 Form Assistant with import, safe field matching, preview and explicit per-field selection; live scheme routes are blocked.

## Automation: tested behaviour and exact limits

**The automation pipeline is not universal government-portal automation.** It is currently a safety-gated planning and preparation system.

| Workflow | Verified state | Not enabled |
|---|---|---|
| Profile validation and plan generation | Unit/API tests; authenticated same-origin request | Persisting the request profile |
| Scheme eligibility gate | Reads only published, independently approved version | No approved scheme versions currently exist |
| Application preparation | Local draft/checklist; consent-gated persistence code | No approval/submission claim |
| Queue/worker | Consent, expiry, idempotency and revocation gates; internal preparation/reminders | External portal execution |
| PM-KISAN adapter | Exact first-step route observed read-only; adapter registered | Authorization and form filling |
| PMAY-U 2.0 adapter | Official landing route registered | Verified application form, authorization and form filling |
| PM Ujjwala adapter | Official landing route registered | Verified application form, authorization and form filling |
| NSP/CSSS adapter | Official landing route registered | Verified application form, authorization and form filling |
| Browser extension | Synthetic field preview/fill and safety tests pass | All four live routes are blocked (not_requested) |
| OTP/CAPTCHA/Aadhaar/e-KYC/biometrics/payment | Citizen-controlled manual handoff | No bypass or automation |
| Final submission | Citizen submits on official portal | JanaSetu never clicks Submit/Apply |

Live filling requires a verified exact HTTPS origin and path, independently reviewed field contract, written department authorization, permitted action, authorization reference, approval timestamp, citizen consent and scheme-specific acceptance tests. A government-domain suffix is not authorization. Protected identity and challenge controls remain citizen-controlled. A portal may react to dispatched input/change events, so the citizen must inspect the page after any approved fill.

## Data, privacy and security gates

### Scheme catalogue and eligibility

- Four initial scheme rule/source packets remain pending independent review and publication.
- Zero scheme versions are independently approved and published.
- The SmartDuke dataset is third-party discovery data and stale under the 90-day policy. It is not eligibility evidence.
- No automated source refresh may approve a scheme or modify deterministic rules without human review.

### Cross-device sync

- Client-side PBKDF2-SHA-256 (600,000 iterations) and AES-256-GCM vault encryption are implemented.
- Authenticated sync API uses guarded RPCs, ownership checks and compare-and-swap revisions.
- The exact cloud-sync policy is inactive and has no legal approval reference/timestamp.
- Two-device acceptance, revocation, wrong-password, conflict and deletion tests remain outstanding.
- Do not activate cloud sync or expose a citizen opt-in until legal/policy approval and explicit consent are recorded.

### Documents and malware scanning

- Private quarantine, consent checks, scanner attestation protocol and ClamAV worker code exist.
- Scanner unit tests pass.
- No persistent production scanner identity/worker is provisioned; no live ClamAV/EICAR acceptance against production storage has been completed.
- Live document upload/retrieval must remain blocked until legal approval and scanner deployment/verification.

### Operational security

- No service-role credential is exposed to browser code.
- Authenticated APIs derive ownership from verified sessions and use caller JWTs/guarded RPCs.
- Independent penetration test, legal/privacy sign-off, production SMTP lifecycle verification, backup/restore exercise and measured load test remain outstanding.
- Review the current CSP report-only configuration and complete enforcement rollout after validating application compatibility.

## Remaining release work

1. Verify controlled production account email confirmation, recovery, redirects and sign-out with a dedicated test account.
2. Obtain independent source/rule/legal approvals before publishing any of the four schemes.
3. Obtain written department authorization and exact route acceptance before enabling any external portal action.
4. Provision and test a persistent private document-scanner worker before enabling uploads.
5. Complete legal approval and two-device acceptance before enabling cloud sync.
6. Complete independent penetration testing, backup/restore, disaster recovery, deeper accessibility testing and measured load testing.

## Release decision boundary

The current verified build is suitable for a controlled public prototype/beta focused on discovery and application preparation, provided the limitations above are clearly disclosed. It is **not** a fully production-authorized benefits application service. Never claim official eligibility, universal portal automation, live document scanning, active cross-device sync, government affiliation or completed government submissions.
