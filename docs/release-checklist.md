# Release checklist — JanaSetu AI landing page

## Included
- [x] Public landing page at `/`.
- [x] Existing citizen workspace moved to `/app`.
- [x] Existing privacy and terms pages retained.
- [x] Responsive layout and keyboard skip navigation.
- [x] JanaSetu logo mark and custom vector hero artwork.
- [x] Open Graph/Twitter metadata and canonical URL.
- [x] robots.txt and sitemap.xml generation.
- [x] CI smoke coverage for landing, workspace, assets, SEO and API routes.
- [x] Production monitor updated for the new route structure.

## Required verification before merge
- [x] `npm ci` completes from the lockfile.
- [x] `npm run typecheck` passes.
- [x] `npm test` passes.
- [x] `npm run test:e2e` passes, including axe accessibility scans.
- [x] `npm run build` passes.
- [x] Local production smoke tests pass for `/`, `/app`, assets, `/robots.txt`, `/sitemap.xml`, APIs, privacy and terms.
- [ ] GitHub Actions CI passes on the pull request.
- [ ] Preview deployment is visually checked at desktop and mobile widths.
- [ ] Production monitor workflow is green after the release.

## Explicitly not completed by this landing-page release
- JanaSetu citizen authentication and persistent accounts.
- Secure citizen document upload, malware scanning, OCR review and retention controls.
- Durable application records, queues, idempotent worker execution and cross-device synchronization.
- Independently verified, current scheme coverage across all States/UTs.
- Authorized, tested government API integrations and portal-specific adapters.
- End-to-end application submission or official application status synchronization.
- Independent penetration test, privacy/legal review and disaster-recovery exercise.
- Evidence-backed load test and infrastructure capacity for very high concurrency.

## Release status
This document is a checklist, not a claim that unchecked gates have passed. The landing page may be released independently, but the overall citizen application must not be marketed as fully production-ready until the outstanding controls are implemented and verified.


## Government portal automation
- [ ] myScheme written permission / approved API feed obtained before automated access.
- [ ] API Setu consumer and provider subscriptions approved for each required API.
- [ ] DigiLocker requester/partner approval, OAuth credentials and audit completed if document retrieval is required.
- [ ] UMANG/department service owner has approved each application/status API.
- [ ] Per-scheme adapter passes official sandbox and production acceptance tests.
- [ ] Submission acknowledgement and status reconciliation are proven before any adapter is labeled automated.


## Consent-gated automation
- [ ] Two-person source-accuracy and eligibility-rule approvals completed for each scheme version.
- [ ] Scheme version published only after source, rule and legal review.
- [ ] Consent scope and policy version reviewed by privacy/legal owners.
- [ ] Application case creation and idempotency tested with two unrelated users.
- [ ] Confirmed automation runs tested end-to-end through pgmq and pg_cron.
- [ ] In-app reminder scheduling tested; email/SMS/push delivery remains disabled until providers and consent are configured.
- [ ] External portal actions remain blocked until each adapter is production-approved and has passed official sandbox and acceptance tests.
