# Fluent-language review plan

**Status:** Prepared for human review; no fluent-speaker sign-off recorded.  
**Locales:** English (en-IN), Hindi (hi-IN), Kannada (kn-IN), Tamil (ta-IN), Telugu (te-IN), Malayalam (ml-IN).

## Objective

Validate that every user-facing string is accurate, natural, culturally appropriate and consistent across the six locales. Automated key-parity, route-rendering and accessibility checks are necessary but do not establish fluency or legal equivalence.

## Required review scope

Review the complete application, not only the landing page:
- Navigation, tabs, buttons, headings, form labels, hints, validation and helper text.
- Scheme cards, benefits, eligibility summaries, source-language notices and source dates.
- Assessment states: potential match, not matched, needs verification, human review pending, catalogue-only and official verification required.
- Notifications, loading/empty/error states, import/export, backups and document metadata.
- Extension popup, permissions, supported-domain notice, fill warnings and field-level review.
- Privacy notice and Terms pages, including all disclaimers and data-flow descriptions.
- Dynamic API errors, source-health warnings, fallback-search warnings and scheme-source text.
- Screen-reader names, tooltips, accessible descriptions and focus announcements.

## Terminology and semantic safeguards

Reviewers must ensure translations do not change legal or operational meaning:
- “Potential match” must not read as approved, eligible, entitled or guaranteed.
- “Needs verification” must not read as rejected or ineligible.
- “Pending human review” must not imply a government review or approval.
- “Catalogue-only” must not imply eligibility has been assessed.
- “Poor household” must follow the exact scheme source wording; do not invent a universal income definition.
- Preserve official scheme names, ministry/department names, notification identifiers, dates, monetary amounts, URLs and quoted source text. A localized explanatory name must be labelled as a JanaSetu translation.
- Preserve distinctions between family, household, applicant, beneficiary, landholder, allotment, ownership, subsidy, grant, scholarship, renewal and fresh application.
- Keep legal terms such as consent, purpose, retention, deletion, data fiduciary and data principal consistent with the approved legal glossary.

## Review method

1. Freeze the English source copy for this review round and assign a version.
2. For each locale, a fluent reviewer reads the complete interface in context, not isolated translation strings.
3. Reviewer records the exact route/component/key, current wording, proposed correction, rationale and approval status.
4. Scheme-critical and legal wording receives a second independent check by a qualified reviewer.
5. Run all locale routes on desktop and narrow mobile widths; check Indic font rendering, clipping, text expansion, date/number/currency formatting, punctuation and line breaks.
6. Test keyboard navigation, screen-reader announcements and 200% zoom in every locale.
7. Re-run automated locale parity, route, axe and E2E tests after corrections.
8. Preserve original official-source language and link beside any JanaSetu translation.

## Reviewer register

| Locale | Reviewer name / qualification | Date | Status |
|---|---|---|---|
| English (en-IN) | Not assigned | — | Pending |
| Hindi (hi-IN) | Not assigned | — | Pending |
| Kannada (kn-IN) | Not assigned | — | Pending |
| Tamil (ta-IN) | Not assigned | — | Pending |
| Telugu (te-IN) | Not assigned | — | Pending |
| Malayalam (ml-IN) | Not assigned | — | Pending |

## Release gate

No locale is considered fluent-approved until a named reviewer has checked the full scope and recorded sign-off. Legal pages require qualified legal review in addition to translation review. Machine translation, automated tests and an AI-generated glossary are not substitutes for human approval.


## Coverage gap against the official myScheme portal

The myScheme portal advertises 15 supported languages (homepage/FAQ checked 4 November 2026). JanaSetu currently exposes six UI locales: English, Hindi, Kannada, Tamil, Telugu and Malayalam. This is a six-locale product scope, not parity with the official portal's language coverage. The remaining nine myScheme languages are not in this review round. Scheme source text may still be in its original language; translated UI copy must not be represented as a certified translation of official source material.
