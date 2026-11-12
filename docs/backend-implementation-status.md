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

JanaSetu's current release is a multilingual, local-first benefits discovery and application-preparation prototype with preliminary, non-authoritative scheme checklists. It is not a government service, eligibility authority, universal portal automation platform, cloud-sync service or production document-scanning service.


## Application automation planner and expanded citizen profile — feature branch

The feature branch adds a signed-in plan-only endpoint at `POST /api/automation/plan`, a dashboard view, four explicit scheme workflows and optional profile fields for contact, address, household, agriculture and education details. The server validates the submitted profile, derives preliminary eligibility from the currently published independently approved scheme version and does not persist the profile. Because the four seeded scheme integrations remain unauthorized and the current scheme versions remain pending independent approval, the planner produces verification/manual-handoff plans rather than enabling government portal form execution.

The browser extension can import a separately exported profile JSON and preview matching fields for citizen approval. The export is plaintext and is not a replacement for the password-encrypted local vault. OTP, CAPTCHA, Aadhaar/e-KYC, biometrics, declarations, payments, document uploads and final submission remain citizen-controlled.
