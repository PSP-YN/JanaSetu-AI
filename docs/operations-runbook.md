# JanaSetu production operations runbook

**Last reviewed:** 5 November 2026

## Canonical deployment

- Public production URL: https://jana-setu-ai.vercel.app
- GitHub source of truth: https://github.com/PSP-YN/JanaSetu-AI
- Production branch: `main`
- Framework/runtime: Next.js 16, Node.js 22
- Vercel project: `janasetu-ai`
- Region: Mumbai (`bom1`)

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
6. Merge only after all checks pass and any human review requirements are satisfied.
7. Confirm the production deployment is READY and serves the expected Git SHA.
8. Verify the canonical domain, avatar, health, schemes, local search, source health, Privacy and Terms.

## Current operational boundary

The production deployment is a public prototype, not an approved service for real citizen records. User profiles and drafts remain in browser local storage; there are no user accounts, server-side citizen database, authorized government APIs, legal approval, independent penetration-test sign-off or human-approved deterministic scheme rules. Do not add real citizen data or imply official eligibility, application submission or government affiliation.

The SmartDuke snapshot is stale under the 90-day policy. The latest observed publisher revision is the same as the bundled revision; the publisher's metadata and rows endpoints are available while its search endpoint is unavailable. The local snapshot remains available for discovery and is checked against a SHA-256 manifest before use.
