# JanaSetu production operations runbook

**Last reviewed:** 12 November 2026

## Canonical deployment

- Public production URL: https://jana-setu-ai.vercel.app
- GitHub source of truth: https://github.com/PSP-YN/JanaSetu-AI
- Production branch: `main`
- Current main commit: `d8928e8fc891a76f692cf4ba12e8d213d9d2b876`
- Current production deployment: `dpl_AtvjwMvehUtGwYgt9XXbpjRs2ie8` (READY; Mumbai `bom1`)
- Canonical domain binding: verified on the new Vercel project; live route/API and browser smoke checks passed 12 November 2026
- Framework/runtime: Next.js 16, Node.js 22
- Vercel project: `jana-setu-ai` (team/account: `psp-adb0`)
- Runtime: Node.js 22.x, Mumbai (`bom1`)
- Required public Supabase configuration: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable/anon key is public client configuration; never expose service-role credentials)
- Workstation `.env.local`: both expected variables are present; URL host matches the dedicated `qjiuclkhvxbnojdysmmp.supabase.co` project and `/auth/v1/health` returned HTTP 200. Secret values are not recorded in this runbook.
- Vercel environment: both variables are configured for production, preview and development, with no Vercel-reported security issues.
- Local Vercel CLI account: still authenticated as the old `pspyn` profile; `.vercel/project.json` now points to the new `psp-adb0` project. Reauthenticate the CLI to the new account before running local Vercel CLI deploy/inspect commands; the Git-linked deployment through the new Vercel project is already working.
- Deployment verification: PR preview is built and smoke-tested before merge; after merge, verify the production deployment Git SHA and canonical domain before declaring release complete. Current production SHA and deployment ID are recorded above.

Only the canonical domain above should be shared as the public website. Vercel preview URLs are for review and testing, not alternate public production addresses. A merge to `main` triggers the Git-linked Vercel production deployment. Keep pull-request previews enabled so changes can be tested before release.

## Automated checks

| Automation | Cadence | Behaviour |
|---|---|---|
| JanaSetu CI | Every push to `main`, every PR to `main`, manual | Catalogue audit, review-packet guard, unit tests, TypeScript, production build, Playwright/accessibility, extension validation, production dependency audit and HTTP smoke tests |
| Upstream dataset refresh | Daily at 03:17 UTC | Fetches the publisher's revision, validates all rows, regenerates the audit and opens a draft PR only when the dataset changes |
| Production monitor | Hourly at minute 23 UTC | Checks home page, health, catalogue counts, full-index search, bundled index integrity, avatar PNG, Privacy and Terms |
| Dependabot | Weekly on Monday | Proposes grouped npm and GitHub Actions dependency updates; TypeScript and Node type-definition major upgrades are held until an explicit runtime/toolchain migration |

### Data-refresh safety

The SmartDuke dataset is a third-party discovery index, not eligibility evidence. Refresh automation must never merge data, approve schemes, change deterministic rules or mark records verified. A new revision must pass the refresh script's row-count, unique-slug, HTTPS URL and collection-date checks, the reproducible quality audit, CI and human review. If a previous run pushed a branch but failed to open its PR, the next run restores only the generated files on `main`, recovers the existing branch, checks that its publisher revision matches, and regenerates the audit before attempting PR creation. Because PRs created with `GITHUB_TOKEN` do not trigger the normal `pull_request` workflow, the refresh workflow explicitly dispatches `ci.yml` using its `actions: write` permission.

The official myScheme portal must not be scraped without written authorization. Use an approved API/feed or manual source review.

### Production-monitor response

The monitor intentionally treats a stale third-party snapshot or unavailable publisher `/search` endpoint as a warning, not a website outage, provided the bundled local index is intact and search works. A failed production route, invalid catalogue metadata, broken avatar or missing local index causes one deduplicated GitHub issue labelled `ops:production-monitor`. The issue lookup is restricted to the exact monitor-generated title and `github-actions[bot]` author; manually created incidents are not selected. When a later hourly check passes, the monitor comments on and closes only that workflow-owned alert.

When an alert opens:
1. Inspect the linked GitHub Actions run and identify the exact failing route/check.
2. Inspect the current Vercel production deployment and function logs.
3. Compare the deployment's Git SHA with `main`.
4. If the latest deployment is faulty, use Vercel's deployment rollback/promote control to restore the last known-good production deployment.
5. Fix the cause in a branch, run CI and verify the Vercel preview before merging.

Do not close a manually created incident merely because one smoke check passes.

## Release procedure

1. Work on a short-lived branch; never commit directly to `main`.
2. Open a PR against `main`.
3. Require the full JanaSetu CI check and Vercel preview checks.
4. Review the preview on desktop and mobile; inspect console/network errors and the six supported locales.
5. Review source changes separately from code changes. Third-party catalogue records remain catalogue-only.
6. Merge only after all branch-protection-required checks pass and required human approvals are satisfied. Optional review-service checks that are not required by branch protection may be skipped only with explicit release-owner authorization; never disable protection or bypass required CI/Vercel checks.
7. Confirm the production deployment is READY and serves the expected Git SHA.
8. Verify the canonical domain, avatar, health, schemes, local search, source health, Privacy and Terms.

## Current operational boundary

JanaSetu is a tested public-benefits navigation and application-preparation product, but it is not an official government service and is not authorized to make eligibility decisions or submit applications. Supabase authentication and consent-gated server APIs exist; the main citizen profile, assessments and drafts remain local-first in the browser unless a separately approved, consented server workflow is used. Do not enter real sensitive identity, bank or credential data into demo workflows. Do not imply government affiliation, official eligibility, approval, or completed submission.

### Automation capability matrix (12 November 2026)

| Capability | Current state | Release boundary |
|---|---|---|
| Scheme discovery | Available from the bundled catalogue | The third-party SmartDuke snapshot is stale; catalogue records are not eligibility evidence |
| Eligibility assessment | Deterministic engine and review workflow implemented | All four initial scheme rule sets remain pending independent source/rule approval; no official decision |
| Application plan | Authenticated, same-origin, plan-only endpoint | Reads only a currently published independently approved scheme version; does not persist the submitted profile |
| Application preparation | Local draft and checklist workflow tested | Server persistence requires separate scheme-scoped consent and approved rules |
| Background automation worker | Queue and consent gates implemented | Internal preparation/reminder actions only; external government adapter execution is disabled |
| PM-KISAN / PMAY-U 2.0 / PMUY / NSP adapters | Four scheme-keyed registry records | All are `not_requested`; no authorized portal actions |
| Browser form assistant | MV3 extension import, field preview, field validation and user-selected fill logic tested on synthetic forms | All four live scheme routes are blocked until exact route review and written authorization; no live government form-fill claim |
| OTP / CAPTCHA / Aadhaar / e-KYC / biometrics / payment | Not automated | Must remain citizen-controlled; no bypass |
| Document upload | Consent, quarantine and scanner-attestation code paths exist | Production scanner service and deployment verification remain outstanding; do not claim live malware scanning |
| Final application submission | Not implemented | Citizen submits directly on the official portal; JanaSetu does not click Submit |
| Cross-device sync | Client-encrypted vault and guarded API/RPC foundations exist | Legal policy inactive; API remains fail-closed; two-device acceptance is outstanding |

The form assistant is intentionally fail-closed. A matching `.gov.in`/`.nic.in` suffix is insufficient: authorization must bind the exact HTTPS origin, path, action, current field contract, department reference and approval timestamp. Never change `not_requested` to `approved` without verifiable authorization and independent testing. Never enable worker execution by bypassing the database policy gate.

### Verified local release checks (12 November 2026)

- `npm run check`: TypeScript passed; 173/173 unit tests passed.
- `npm run build`: optimized Next.js production build passed.
- `npx playwright test`: 66/66 browser tests passed, including synthetic extension filling, identity-field safety, blocked PM-KISAN route and six-language/accessibility flows.
- `python3 tests/test_document_scanner.py`: 10/10 tests passed. These are scanner unit tests, not evidence of a deployed scanner service.
- `node --check extension/popup.js`, `node --check extension/fill.js`, and extension manifest JSON validation passed.
- `npm audit --audit-level=high`: zero reported vulnerabilities.
- Supabase migration reset/lint and linked migration reconciliation passed in the release verification workflow.

These checks establish code/build/test correctness for the exercised paths. They do not replace department authorization, legal review, two-device testing, independent penetration testing, or live government-portal acceptance testing.

The SmartDuke snapshot is stale under the 90-day policy. The latest observed publisher revision is the same as the bundled revision; the publisher's metadata and rows endpoints are available while its search endpoint is unavailable. The local snapshot remains available for discovery and is checked against a SHA-256 manifest before use.
