# Qualified Indian legal and privacy review plan

**Status:** Prepared for qualified counsel; no legal opinion or compliance sign-off recorded.  
**Review date:** 4 November 2026.  
**Product boundary:** Independent public-benefit discovery and preparation prototype; not a government service, eligibility authority or application portal.

## 1. Primary legal materials to review

- [Digital Personal Data Protection Act, 2023 — official Gazette PDF](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
- [MeitY DPDP Rules 2025 page](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa)
- [Digital Personal Data Protection Rules, 2025 — Gazette PDF](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)
- [DPDP Rules corrigendum, 16 December 2025](https://www.meity.gov.in/static/uploads/2025/12/3c7ebbae0e5456f493f486e6845df86b.pdf)
- [Official DPDP Act enforcement timeline](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)

The official notification uses phased commencement. The extracted schedule states that specified provisions commenced on publication on 13 November 2025; section 6(9) and section 27(1)(d) commence one year after publication (13 November 2026); and the remaining listed substantive provisions commence eighteen months after publication (13 May 2027). The Rules notification similarly states Rules 1, 2 and 17–21 commence on publication, Rule 4 one year later, and Rules 3, 5–16, 22 and 23 eighteen months later. Counsel must verify the Gazette text, corrigendum, commencement status and any later notifications as at the date of advice. Do not describe the entire Act or all Rules as fully in force on 4 November 2026.

## 2. Data-flow and role assessment

Use the current privacy impact assessment draft and inspect the exact deployed commit. Confirm:
- Data fields collected: name, age, gender, state, district, residence type, income, occupation, scheme answers, free-text intake, draft records, document metadata and imported/exported backups.
- Browser localStorage persistence and the user-controlled JSON backup/import process.
- Main-interface screening, intake parsing and draft preparation are browser-side; separately callable API routes can receive profile/text payloads from other clients. Verify request-body logging and provider retention.
- Open-data search terms are forwarded to Hugging Face; confirm whether query terms can contain personal data and whether logs retain them.
- Browser speech recognition may involve the browser/OS speech provider; determine notice and consent requirements.
- Hosting/CDN/security logs, analytics, error monitoring, regions, retention, subprocessors and cross-border transfers.
- Extension data stored in chrome.storage.local and values intentionally filled into a third-party government website after user action. Review risk of portal scripts reacting to input/change events.
- Whether any children’s personal data could be processed, including profiles for minors or family members; determine age-gating, parental consent and other applicable obligations.

## 3. Counsel questions

### DPDP Act and Rules
- Identify the data fiduciary, data processor and any joint/independent fiduciary roles for the product owner, hosting provider, speech provider, dataset provider and other integrations.
- Determine which provisions and Rules are in force on the review date and the future implementation deadlines.
- Validate notice, lawful purpose, consent or other permitted grounds, withdrawal, data principal rights, grievance handling, erasure, retention, security safeguards, breach notification and processor contracts.
- Determine whether a Data Protection Officer, Significant Data Fiduciary obligations, impact assessment or other enhanced duties apply; do not assume they apply or do not apply without analysis.
- Review children’s data and whether any exemption or parental-consent condition is relevant.
- Verify whether the product must support correction, erasure, access, grievance and nomination requests, and define an operational contact and response process.

### Aadhaar and government-service boundaries
- Confirm that JanaSetu must not collect or store Aadhaar numbers, Aadhaar images, OTPs, bank credentials or biometric data.
- Review any extension autofill, Aadhaar-related wording and external portal links against the Aadhaar Act, UIDAI directions and current authentication/e-KYC rules.
- Confirm the app does not imply government affiliation, official eligibility, entitlement, approval or guaranteed benefit.
- Review disclaimers, scheme summaries, application guidance, complaints routing and any future monetisation or referral arrangements.

### Other applicable Indian law and standards
- Assess applicable Information Technology Act 2000 provisions and rules, including any transitional interaction with DPDP commencement and amendments.
- Assess consumer-protection / misleading-advertising exposure for scheme claims, benefits, deadlines and product marketing.
- Assess copyright, database rights, attribution and source-site terms for third-party datasets and official content; myScheme access must remain manual or use an authorized API unless written permission permits automation.
- Assess accessibility obligations and relevant Indian standards for public-facing digital services.
- Review security incident response, cybercrime reporting, records preservation and contractual obligations with vendors.

## 4. Documents for counsel

- docs/privacy-impact-assessment.md
- docs/source-verification-and-freshness.md
- docs/scheme-review-workflow.md
- docs/scheme-reviews/*.json and corresponding Markdown briefs
- docs/localization-policy.md
- docs/extension.md and docs/security-threat-model.md
- Current privacy and Terms pages in all six locales
- Hosting provider, DNS/CDN, monitoring and speech-provider contracts/settings
- Current deployment commit and network-capture evidence for the real production flows

## 5. Required deliverables from counsel

1. Written applicability analysis with statutory provisions, commencement dates and effective obligations.
2. Approved data-flow diagram and controller/processor role matrix.
3. Revised Privacy Notice and Terms in English, with approved translation source text.
4. Lawful-purpose/consent and retention/deletion schedule, including local backups and provider logs.
5. Data-subject rights and grievance operating procedure with a real contact channel.
6. Security and breach-response requirements, vendor clauses and cross-border assessment.
7. Written go/no-go decision for use with real citizen data, with unresolved risks listed.

**No legal approval is implied by preparing this checklist.** Until counsel signs off, keep the prototype-only disclaimer, avoid real sensitive citizen data, do not collect Aadhaar or bank details, and do not market this as an approved eligibility service.
