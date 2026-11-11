# Validation and evidence register

## Automated verification
Latest recorded GitHub Actions run for commit 38f0a8efb1b2f8d58f37de9ec491f81002f028df:
- Workflow: JanaSetu CI
- Run: #615
- Result: success
- URL: https://github.com/PSP-YN/JanaSetu-AI/actions/runs/43087222726

The CI workflow exercises unit tests, type-checking, database guardrails, production build, browser/accessibility tests, extension checks, dependency audit and production-server smoke tests. The run itself is authoritative for individual jobs and steps.

Preceding local verification recorded:
- 131 unit tests passed.
- TypeScript check passed.
- Next.js production build passed.
- 49 Playwright end-to-end tests passed.
- axe-core WCAG 2.1 AA serious/critical scans passed on eight configured routes after contrast fixes.

Refresh these counts after any subsequent code changes.

## Database evidence inspected 12 November 2026
Connected Supabase project qjiuclkhvxbnojdysmmp, region ap-south-1:
- Database status: ACTIVE_HEALTHY.
- Scheme records: 4.
- Independent scheme approvals: 0.
- Legally approved consent-policy versions: 0.
- Active document-scanner identities: 0.
- Scheme reviewer role assignments: 0.
- Citizen auth users: 0.
- Deployed Supabase Edge Functions: 0.

The four seeded schemes remain unpublished/review-pending. These are intentional release gates, not demo data to fabricate.

## Hosting evidence
Vercel project uses Next.js and Node.js 22. The latest verified preview is READY at:
https://janasetu-6r56lvi89-pspyn.vercel.app

Deployment commit: e66314cd2be48d045e4bac10bd23cd61a6cb3d31 (the exact implementation and UI-correction commit). Deployment target is Preview, not Production. The Vercel project metadata reports live=false. No production alias or production release is claimed.

## Manual verification limitations
Automated browser tests and viewport checks are not a substitute for a screen-reader user study, formal localization review, penetration test, disaster-recovery exercise or production load test.

## Evidence policy
Use CI run URLs, exact commit hashes and deployment metadata. Never turn a test pass into a claim of legal compliance, scheme accuracy, production capacity or government approval.
