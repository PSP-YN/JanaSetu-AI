# Reusable application automation engine

## Scope

JanaSetu uses a deterministic, scheme-specific planner rather than a universal government-portal robot. The signed-in dashboard sends a citizen-reviewed profile to `POST /api/automation/plan`. The endpoint validates the profile, verifies the Supabase session, loads only the currently published scheme version and derives a preliminary assessment on the server. It does not accept an eligibility claim from the browser, persist the submitted profile, create an application case or perform a portal action.

## Citizen profile and form assistant

The local citizen profile includes contact, address, household, agriculture and education fields. A citizen can explicitly export a profile-only JSON file after a warning. This export is plaintext and is separate from the password-encrypted JanaSetu vault. The Chrome extension imports the file and previews matching fields; each field requires citizen approval before it is filled. Portal matching uses conservative label aliases and supported official HTTPS domains.

## Scheme adapter contract

The adapter registry contains four explicit records:

- PM-KISAN Samman Nidhi
- PMAY-U 2.0
- PM Ujjwala Yojana 2.0
- PM-USP CSSS / NSP Scholarships

Each adapter declares its official origin, known landing/application route, selectors, sensitive fields, citizen-gated controls, authorization status and permitted actions. Unknown schemes never inherit another adapter. Landing-page links are not represented as tested application forms.

## Current activation state

All four database integration records remain `not_requested`, with no allowed actions or department authorization references. Their seeded scheme versions remain pending independent review. Consequently, the planner returns verification/manual-handoff plans and does not enable automatic form filling on the live portals. The PM-KISAN first-step route has a read-only observed control contract, but its protected identity/OTP/CAPTCHA fields remain citizen-controlled. The other three routes are official landing pages only.

## Safety invariants

- Eligibility is derived server-side from the current published, independently approved rule set; the browser cannot submit an eligibility result.
- Profile values are validated against a strict allowlist. Aadhaar, bank account, IFSC, OTP, passwords, biometrics and authentication PINs are excluded.
- Portal assistance is disabled unless an exact route, adapter, department authorization and action scope are all approved and tested.
- CAPTCHA, OTP, Aadhaar/e-KYC, biometrics, legal declarations, payments and final submission remain citizen-controlled.
- Document upload and scanner-dependent storage remain disabled while no production scanner worker is available.
- The planner is plan-only and never records an application as submitted without official acknowledgement evidence.

## Free operating model

The planner and profile workflow run on the existing Next.js/Vercel and Supabase setup. No paid scanner worker or new recurring service is provisioned. Cloud sync remains disabled pending separate legal/privacy approval.

## Validation

CI covers planner decision logic, profile validation, export validation, portal adapter matching, extension field-fill safety, API guardrails, type-checking, production build, browser accessibility and production smoke checks. Synthetic fixtures validate software behavior; they do not certify compatibility with live government portals or confer department authorization.
