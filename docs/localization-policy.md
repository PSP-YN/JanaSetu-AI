# JanaSetu localization policy

## Interface language versus source language

JanaSetu supports English (en), Hindi (hi), Kannada (kn), Tamil (ta), Telugu (te) and Malayalam (ml). This does not mean every government scheme has an official translation in all six languages.

Use three separate content classes:

1. **Interface copy** — navigation, controls, hints, form labels, errors, dialogs, status messages, accessibility labels, metadata and empty states. Translate all six locales; no hard-coded English fallback should silently appear in a non-English locale.
2. **Scheme metadata** — scheme title, department, summary, benefit, eligibility summary and application window. Preserve the official title as published. A translated display title/summary may be shown only when reviewed; label it as a JanaSetu translation and retain the original official title nearby.
3. **Primary-source material** — official notifications, rules, PDFs and portal content. Never silently translate or rewrite legal conditions. Link to the original, identify its language and publication/effective date, and label any translated explanation as an unofficial aid. Where an official translated version exists, link both language versions and identify the official version.

## Required data model

For every localized scheme field, retain:
- `originalText`, `originalLanguage`, `sourceUrl`, `sourceCheckedAt`
- optional `translations[locale]` with `text`, `translationType` (`official` or `janaSetu-reviewed`), `reviewedByRole`, `reviewedAt`, `sourceVersion`
- `translationStatus`: `untranslated`, `machine-draft`, `human-reviewed`, or `official`

Machine translation may help draft explanatory copy but must never be treated as an authoritative translation of eligibility rules. Machine-draft text must not drive screening, application field mapping or legal notices.

## Engineering requirements

- Keep interface strings in typed locale dictionaries, not JSX literals.
- Enforce identical keys across all locale dictionaries in CI.
- Use locale-aware number/date formatting; do not translate official scheme identifiers, acronyms, ministry names or legal notification numbers without a clear display convention.
- Set document `lang` to the active locale and use correct language tags (`hi`, `kn`, `ta`, `te`, `ml`).
- Add `dir` handling if a future RTL language is introduced.
- Test long strings, font fallback, line wrapping, keyboard focus and screen-reader pronunciation on mobile and desktop.
- Missing translation must be visibly marked for maintainers and should fall back to the original source with an explicit language label, not masquerade as translated copy.

## Current limitation

The current application has partial dictionaries and hard-coded English strings. This policy is a target contract, not evidence that full localization has been completed. Scheme titles and source material remain in their original source language unless a reviewed translation is explicitly available.
