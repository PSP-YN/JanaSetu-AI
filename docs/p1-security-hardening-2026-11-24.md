# P1 security hardening — 24 November 2026

## Scope

This change set addresses two release gates: enforceable browser content policy and stronger email-confirmation handling. It does not close the entire P1 data-protection programme and is not yet deployed to production.

## Implemented in this branch

- Next.js 16 `proxy.ts` generates a fresh cryptographic nonce for each HTML request and forwards the same nonce and enforced `Content-Security-Policy` to Next.js rendering and the browser response.
- Production `script-src` requires the nonce and `strict-dynamic`; it does not allow `unsafe-inline` or `unsafe-eval`. Development-only eval support is isolated to development.
- HTML routes render dynamically so Next.js can nonce framework scripts. This removes static HTML/ISR for those routes; production performance and CDN behaviour must be measured after deployment.
- API and static asset paths are excluded from the page CSP proxy matcher. Existing non-CSP security headers remain in `next.config.ts`.
- Authentication callback and password sign-in paths now require Supabase's verified `email_confirmed_at` value before a session cookie is established.
- `npm run audit:auth` checks hosted Supabase Auth configuration through the Management API. It reads `SUPABASE_ACCESS_TOKEN` or the Supabase CLI token file and never prints the token or SMTP credential values.

## Verification recorded

- `npm run check`: 193 unit tests passed; TypeScript passed.
- `npm run build`: passed. The build reports HTML routes as dynamic and identifies the Next.js Proxy.
- Playwright: 88 browser tests reported passing; one test remained unresolved when the run was stopped. The focused enforced-CSP response/nonce test passed separately.
- The hosted Auth audit could not be executed because no Management API token was available on this workstation. No hosted Auth setting or SMTP credential was changed.

## Extension update

- Added an explicit one-click `Autofill safe fields` action to the unpacked Chromium extension. It only fills a hard-coded allowlist of non-sensitive, visible, empty controls on an exact HTTPS host allowlist.
- Aadhaar, contact details, income/certificate/identity identifiers, declarations, document uploads, CAPTCHA, OTP and all Next/Proceed/Verify/Apply/Save/Submit actions remain citizen-controlled.
- The separate field-by-field preview flow remains available. Exact page URL confirmation is required for each popup session.
- Extension browser tests: 14/14 passed, including a real DOM test proving that CAPTCHA, OTP, Aadhaar, contact, consent, file upload and form submission controls are not changed by safe autofill.
- Full Playwright suite: 93/93 browser tests passed, including accessibility, citizen journey, extension, sync and voice tests.
- The extension ZIP is rebuilt from the tested source and included in the branch. This is not a live-portal end-to-end acceptance test; only synthetic DOM and popup flows were exercised.

## Still open

1. Deploy this branch and verify nonce/header matching on production HTML, hydration, fonts, voice worker, model downloads and every interactive route. Recheck CSP console violations and response headers.
2. Run `npm run audit:auth` after Supabase CLI login. Require all checks to pass before account onboarding. Perform a controlled signup, email confirmation, sign-in, recovery, password update, refresh and sign-out with a dedicated test account.
3. Encrypt the live browser workspace and IndexedDB document binaries. Today the profile, drafts, assessments and reminders remain plaintext in `localStorage`, and document binaries remain plaintext in IndexedDB. The encrypted `.janasetu` export does not encrypt live browser storage.
4. Test storage migration and recovery against existing synthetic workspaces before changing the storage format. Never clear or overwrite legacy data until encrypted write/read verification succeeds.
5. Complete independent scheme review, legal/privacy approval, independent penetration testing, backup restore and staging load test.

## Release decision

This is a code-hardening branch, not a production launch approval. Keep JanaSetu in controlled beta. Do not invite real citizens to enter sensitive documents or identifiers. No scheme is approved by this change set, and no government portal action is enabled.
