# Reusable government application automation engine

## Purpose

JanaSetu separates a shared citizen application workflow from scheme-specific portal adapters. The shared engine is responsible for sequencing and safety gates; an adapter describes only a verified portal contract. A scheme without an adapter remains usable for discovery and manual application preparation.

## Shared workflow

1. Validate the citizen profile and preserve unknown facts.
2. Evaluate eligibility only against an independently approved, effective scheme version. Pending or expired rules block application preparation.
3. Build a scheme-versioned document checklist. Missing evidence is an explicit citizen task.
4. Resolve the scheme-specific adapter by exact scheme slug.
5. Inspect only the registered HTTPS origin and exact reviewed application path.
6. Permit assisted field filling only when the adapter is approved, its exact controls match, the citizen has approved the field values, and no protected verification or declaration gate is being automated.
7. Require citizen review of all fields, documents, declarations and destination.
8. Keep final submission with the citizen unless an authorized department API explicitly grants a specific operation. This engine does not click Submit or bypass OTP, CAPTCHA, Aadhaar/e-KYC, biometrics, payments or declarations.
9. Record a submitted state only after a verifiable official receipt or acknowledgement is captured.
10. Track status only through a verified, permitted API or citizen-provided official status evidence.

## Planner API and profile flow

The signed-in Applications & automation dashboard reads the citizen's browser-local profile and calls `POST /api/automation/plan`. The API validates the profile, loads the current published scheme version using the authenticated Supabase session, derives the preliminary assessment server-side and returns a plan-only response. It does not persist the submitted profile, create an application case or execute a portal action. The profile-only export for the browser extension is a separate plaintext JSON file created only after the citizen confirms the warning.

The four seeded schemes currently have no independently approved versions or department-authorized portal actions. Their planner output therefore remains a preparation/manual-handoff plan; no production government form autofill is enabled by these adapter records.

## Adapter contract

Every adapter is keyed by an exact scheme slug and must declare:
- official HTTPS origin and exact application path;
- reviewed control selectors and required control fingerprints;
- sensitive fields and citizen-gated controls;
- allowed actions;
- department/provider authorization reference, approval timestamp and expiry;
- compatibility-test evidence and last verified timestamp.

Missing values fail closed. A landing page is not an application route. A selector observation is not authorization. A synthetic fixture is not live portal certification.

## Current scheme coverage

| Scheme | Adapter state | Runtime behavior |
|---|---|---|
| PM-KISAN | Read-only first-step route observed; no department authorization | Manual handoff; protected identity/OTP/CAPTCHA remain citizen-controlled |
| PMAY-U 2.0 | Official eligibility-entry route observed; Aadhaar/OTP and beneficiary survey follow later | Manual handoff; no form selectors or authorization |
| PM Ujjwala 2.0 | Official Ujjwala information page verified; it links to three separate OMC portals | Manual handoff; provider selection and KYC stay with the citizen |
| PM-USP CSSS / NSP | Official scholarship login route observed; OTR and Aadhaar/APAAR login precede application | Manual handoff; protected identity and application controls remain citizen-controlled |

These four records are the current seeded integration set, not all schemes in the wider discovery catalogue.

## Free operating model

- Next.js application and API on the existing Vercel project, subject to its free plan limits.
- Supabase Auth/Postgres/RLS for authenticated cases and audit records, subject to free project quotas.
- GitHub Actions for scheduled source refresh, CI and synthetic regression tests, subject to Actions quotas.
- Chromium extension for citizen-triggered form preview and selected field filling on supported domains.
- Browser-local document vault and encrypted backup/restore instead of paid cloud scanning infrastructure.
- No always-on paid worker, no third-party paid AI API requirement and no secret-key exposure in browser code.

Free-tier quotas, sleep behavior, storage limits and execution limits still apply. The app must report unavailable services honestly rather than claiming the automation completed.

## Validation

```bash
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

The pure automation planner tests cover unknown schemes, pending eligibility, missing profile/document data, unapproved adapters, protected verification gates and citizen-controlled submission. CI must pass before the changes are treated as integrated. Passing synthetic tests does not prove a live portal works.

## Activation policy

Do not change a scheme integration to approved by editing a client-side registry or adding a test fixture. Record authorization only after the responsible department/provider grants it in writing. Do not activate sync or cloud document policies without the required privacy/legal approval. Do not claim universal portal automation or official eligibility decisions.


## Read-only portal route evidence (12 November 2026)

- PMAY-U 2.0: the official MIS homepage links to the eligibility-entry route `/PMAYMIS2_2024/PMAY_SURVEY/EligiblityCheck.aspx`. The official beneficiary manual describes subsequent Aadhaar authentication and OTP before the survey form; those steps are not automated. See [PMAY-U 2.0 MIS](https://pmaymis.gov.in/PMAYMIS2_2024/PmayDefault.aspx) and [beneficiary application manual](https://pmaymis.gov.in/PMAYMIS2_2024/PDF/UserManual/BeneficairyApplication_for_SoP_27_12_24.pdf).
- PM Ujjwala 2.0: the official page links to three OMC portals (IndianOil, Bharatgas and HP Gas). Their routes and forms differ; the registry therefore keeps the scheme-level application path unset until a citizen chooses a provider and a provider-specific adapter is reviewed. See [PMUY application information](https://pmuy.gov.in/Ujjwala2.html).
- NSP: the official Students page links to the `/ApplicationForm/` login route and separately to OTR registration. OTR is identity-bound; the extension does not fill those controls. See [NSP Students](https://scholarships.gov.in/Students) and [NSP OTR](https://scholarships.gov.in/otrapplication/).

These are route observations, not department authorization. All four integration records remain `not_requested`, with no permitted external actions.
