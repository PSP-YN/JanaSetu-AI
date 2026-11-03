# Localization and source-language policy

## Supported locales
English (en-IN), Hindi (hi-IN), Kannada (kn-IN), Tamil (ta-IN), Telugu (te-IN) and Malayalam (ml-IN).

## UI translation requirements
Translate all application chrome and interaction copy: navigation, tabs, form labels, hints, validation, buttons, notices, empty/loading/error states, accessibility labels, backup/restore prompts, privacy/terms disclosures and extension UI. Locale changes must update the whole interface and document language. Translation keys must have exact parity across all locales; CI must fail for missing or duplicate keys. Never display raw translation keys.

## Scheme names and official material
- Preserve the issuing authority's canonical scheme name, acronym, department/ministry name, notification title, circular number, source URL, section references and quoted source text in the original publication language.
- A localized display name may be supplied separately and must be labelled as a JanaSetu translation; retain the canonical official name alongside it.
- Plain-language summaries are explanatory translations, not official scheme text. Label them accordingly and keep the official source and source date visible.
- Never machine-translate legal rules and present them as authoritative. Do not translate proper nouns, amounts, identifiers, URLs or legal citations in ways that change meaning.
- Quoted source excerpts remain verbatim. A separate human-reviewed translation may accompany them.
- No translation system may create or alter eligibility rules. Eligibility logic must remain deterministic and source-reviewed.

## Quality gates
1. Exact key parity across all six locales; no visible raw keys.
2. Preserve amounts, dates, names, URLs and identifiers.
3. Fluent reviewers validate scheme terminology, legal notices, errors and accessibility names.
4. Test Indic-script rendering, text expansion, narrow mobile screens and 200% zoom.
5. Keep original official sources accessible beside translations.
6. Unreviewed translations must be labelled draft/machine-assisted or not presented as official.

## Current implementation status
The application has automated six-locale checks for the main routes, privacy and terms pages, and extension popup. These checks establish locale rendering and key coverage only; they do not establish natural fluency, legal equivalence or culturally correct scheme terminology. Fluent-speaker review across English (en-IN), Hindi, Kannada, Tamil, Telugu and Malayalam remains a release gate. Review dynamic API messages, accessibility names, date/number formatting, official-source labels and extension workflows in addition to static page copy.
