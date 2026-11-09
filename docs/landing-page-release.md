# Landing page release notes

## Routing
- `/` is the public JanaSetu AI landing page.
- `/app` is the existing citizen workspace, retained without representing it as a fully integrated government application service.
- `/privacy` and `/terms` remain available on the same origin.
- `/api/*` remains application/API functionality.

## Public-facing claims
The landing page describes JanaSetu as an independent public-benefits navigator. It does not claim government ownership, official verification, universal scheme coverage, guaranteed eligibility, automatic government submission, real-time application tracking, a citizen count, or a number of supported schemes.

The public copy explains the current scope: discover, review preliminary criteria and prepare next steps. Government departments remain authoritative for current rules, eligibility and decisions.

## Brand assets
- `public/janasetu-mark.svg`: scalable brand mark used by the landing page and metadata.
- `public/janasetu-logo.png`: uploaded raster brand asset used in the existing workspace.
- `public/hero-citizen.svg`: lightweight, responsive vector illustration.
- `public/opengraph-image.svg`: social sharing preview.

## Search discovery
- Next.js metadata declares canonical origin, Open Graph and Twitter summary metadata.
- `/robots.txt` exposes the sitemap and excludes API and private workspace routes from indexing.
- `/sitemap.xml` lists the public landing, privacy and terms routes only.
- The workspace route is marked noindex.

## CI and monitoring
CI now verifies the landing route, workspace route, uploaded logo, hero illustration, robots, sitemap, existing API contracts, catalogue integrity, privacy and terms. The hourly production monitor performs corresponding public-route checks.

## Release scope and limitations
This release changes the public information architecture and presentation. It does **not** make the citizen workspace a fully production-integrated application service. The workspace still has browser-local data and no JanaSetu-owned authentication/database/document storage or universal official portal submission integration. Do not collect sensitive citizen identity documents or promise application submission until the relevant backend, security, legal and portal integration gates are independently completed.

## Rollback
Revert the landing-page routing commit or promote the previous Vercel production deployment. The prior workspace code is retained at `/app`; API routes and catalogue source files are not removed by this change.
