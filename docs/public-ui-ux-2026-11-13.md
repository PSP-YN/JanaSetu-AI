# Public website UI/UX update — 13 November 2026

## Purpose

This update improves the public landing page's information hierarchy, catalogue transparency, navigation integrity and footer alignment. It does not change eligibility rules, scheme publication status, citizen-data storage, browser-helper permissions or government integration gates.

## Why the public page contains eligibility and government-status disclosures

The FAQ and footer disclosures are intentional. JanaSetu is an independent public-benefits preparation project, not a government department or eligibility authority. Users must be told that a preliminary screen is not an official decision and that the application is not submitted by the workspace. These statements are product-safety and trust disclosures, not errors.

The public copy was tightened to match the current implementation:
- Four deterministic rule prototypes exist and all await independent source, rule and legal review.
- The built-in inventory has 46 source-linked scheme references: four rule prototypes and 42 catalogue-only references.
- The 96 Karnataka FY 2026–27 budget records are discovery leads, not confirmed citizen-facing schemes.
- The optional 4,693-row third-party dataset is machine-parsed, stale and not eligibility evidence.
- The workspace does not submit applications. The optional browser helper can fill only safe visible fields individually approved by the citizen; it does not submit or bypass protected checks.
- Local next-step reminders exist. Department grievance registration and live grievance-resolution tracking do not.

## UI changes

1. Added a current-coverage panel with distinct labels for source-linked references, preliminary rule prototypes, catalogue-only records and budget-derived leads.
2. Added an explicit trust-principles section, fixing the previously broken #principles navigation target.
3. Added a clear workspace call-to-action before the FAQ.
4. Updated FAQ copy to describe the current implementation precisely and disclose that grievance tracking is not yet implemented.
5. Rebuilt the footer into two intentional desktop columns: project identity and grouped navigation/language links. At narrow widths, it stacks into one column with consistent spacing.
6. Added focus-visible styling for interactive controls in the public landing page.
7. Corrected narrow-screen header and long-word wrapping on the five regional-language landing pages, including Tamil and Kannada trust cards.
8. Kept the warm amber/orange brand palette and existing page content; no project files or user submission assets were removed.

## Verification

Run the following commands:
- npm run typecheck
- npm run test:unit
- npm run build
- npx playwright test tests/e2e/landing-page.spec.ts
- npx playwright test tests/e2e/accessibility.spec.ts

The landing-page E2E coverage checks:
- current catalogue counts and truthful FAQ statements;
- all in-page navigation anchors resolve;
- footer navigation and language links are accessible;
- footer columns remain aligned on desktop and stack on mobile;
- all five regional-language landing pages fit widths from 320 to 1024 CSS pixels without horizontal scrolling;
- no horizontal overflow at 320, 360, 390, 430, 600, 760, 768, 900, 1024, 1280 and 1440 CSS pixels;
- public SEO routes and workspace noindex behavior remain intact.

## Non-goals

This update does not claim official scheme approval, a complete India-wide catalogue, grievance integrations, universal government portal automation, cloud document scanning, cross-device reminder sync or automatic application submission.
