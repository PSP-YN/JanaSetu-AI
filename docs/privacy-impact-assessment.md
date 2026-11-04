# JanaSetu privacy impact assessment — review draft

**Status: DRAFT FOR QUALIFIED REVIEW. Not a legal opinion, DPIA approval or compliance certification.**  
**Scope:** JanaSetu web prototype, browser storage, JSON backup/restore, callable API routes, browser speech recognition, open-data proxy and optional browser extension.  
**Implementation review date:** 4 November 2026. Re-check against the exact deployed commit before relying on this inventory.

## 1. Product purpose and boundaries

JanaSetu is an independent government-benefits discovery and preparation prototype. It is not a government service, does not make official decisions and must not submit applications. No real citizen personal or sensitive information should be used before this assessment is reviewed and approved.

## 2. Data inventory and flows

Important distinction: the current main web interface performs benefit screening with `runBenefitsAgent`, text intake with `parseCitizenMessage`, and draft preparation with `createDraftRecord` in browser-side code. The main interface does not call the corresponding screening, intake or draft API routes for these actions. Those API routes nevertheless exist and accept programmatic requests; any separate client that calls them transmits the submitted profile/text to the application server.

| Data | Entry/source | Processing/storage | External recipient | Control / retention decision |
|---|---|---|---|---|
| Citizen profile (name, age, gender, state, district, residence, income, occupation and scheme answers) | User-entered or locally imported | Main UI: browser memory and localStorage; screening/draft logic runs in the browser. Separate API routes accept profile bodies if called by another client. | Main UI screening/draft: no profile payload sent to JanaSetu API routes. API callers: application host receives request body; provider log handling must be verified. | Minimize fields; user clear/export controls; test network traffic; verify hosting logs and retention before launch. |
| Free-text intake description | User typed or dictated | Main UI: deterministic `parseCitizenMessage` runs in browser. Separate `/api/intake/parse` route accepts text if called by another client. | Main UI text extraction: no text payload sent to JanaSetu API route. API callers: application host receives submitted text. Browser speech provider may receive audio. | Keep the 4,000-character server-route limit; do not log request bodies; disclose speech-provider processing. |
| Draft application fields | Profile-derived | Main UI: `createDraftRecord` runs in browser and draft is kept in local state/localStorage. Separate `/api/applications/draft` route accepts a profile if called. | Main UI: no draft/profile request sent to JanaSetu API route. API callers: application host receives submitted profile. | Never submit to government portals automatically; clear drafts on user request. |
| Document metadata/reference | User-entered filename/type/size/date | Browser localStorage | None intended | Do not upload document bytes; warn against sensitive filenames. |
| JSON backup | User export/import | User-controlled local file; extension local storage after explicit import | None intended by the export/import flow | Warn that backups are not encrypted by JanaSetu; user controls file storage/deletion. |
| Scheme search query | Search input | Browser calls JanaSetu open-data route; server searches the bundled SmartDuke snapshot locally. | JanaSetu host receives the search query; the current search implementation does not forward query text to Hugging Face. The source-health monitor separately checks publisher metadata and endpoint availability. | Limit query to 120 characters; tell users not to enter personal data in search. |
| Source health metadata | Health-route request | Server-side health route | Hugging Face dataset metadata endpoint | No citizen profile should be included. |
| Browser extension profile | User-selected backup | Extension stores imported profile in `chrome.storage.local`; selected values are sent to the active tab after explicit Fill action. | Active website receives selected mapped values and dispatched input/change events; the extension does not intentionally submit forms, but portal scripts may react to field changes. | Restrict supported origins; never fill credentials, identity numbers, OTP/CAPTCHA, bank details or files; review every field. |
| Website request metadata | Browser page/API requests | Hosting/CDN/network infrastructure | Hosting and infrastructure providers | Actual provider logs, retention, region and access must be reviewed; this repository cannot prove provider-side deletion. |

## 3. Data minimization and necessity

- Reassess whether full name, gender, exact district and occupation are necessary for each scheme; collect only when required by a reviewed rule.
- Never request Aadhaar number, bank account number, OTP, password, CAPTCHA response or document image in the prototype.
- Avoid sample real-person names/details in production demonstrations; use clearly synthetic profiles.
- Do not transmit the entire profile when a scheme-specific minimal subset is sufficient. The current main UI keeps screening and draft processing local; preserve that boundary unless a documented privacy review approves a change.

## 4. Threats and harms

Potential harms include exposure on shared devices, browser-profile compromise, malicious extensions, API request bodies or infrastructure logs retaining profile/text data when separate API clients call the routes, third-party speech processing, personal data entered into the scheme-search field, accidental form population on a wrong portal, inaccurate scheme guidance, backups copied to shared storage and misleading translated legal/eligibility wording.

## 5. Controls to verify

- Browser storage inventory and clear/export behaviour.
- Network capture for every user journey to prove exactly which fields leave the browser; verify the main UI does not send profile/text bodies to screening, intake or draft routes.
- Test callable API routes separately; confirm request bodies are not logged and provider retention is documented.
- Hosting, CDN and observability log configuration; ensure request bodies and query strings do not contain citizen data except the intentionally forwarded non-personal scheme search term.
- TLS, security headers, body limits, schema validation, rate controls and dependency/secret scanning.
- Explicit user disclosure before any speech provider processes audio.
- Extension allowlist, field exclusions, explicit user click and field-by-field review. The extension has no direct form-submission API calls, but dispatched input/change events may trigger portal-side reactions.
- Data retention/deletion schedule covering browser local data, user backups, provider logs and support systems.
- Incident response, breach escalation, grievance contact and user rights process.

## 6. Retention and deletion — decisions required

The current app's localStorage data persists until the user deletes it or clears browser site data. Exported backups are controlled by the user and may remain in downloads, cloud backup or shared storage. The product owner and counsel must define retention periods for hosting logs, security logs and support records. Confirm that no deployment platform or analytics provider retains request data beyond the disclosed purpose. Document deletion limitations before launch.

## 7. Legal questions for qualified Indian counsel

- Applicability and role allocation under the DPDP Act 2023 and DPDP Rules 2025.
- Whether JanaSetu is a Data Fiduciary for each processing purpose and what notice/consent is required.
- Children/minors: age handling, verifiable parental consent obligations and whether minors should be excluded from the prototype.
- Lawful purpose, minimization, withdrawal, access/correction/erasure, grievance and breach obligations.
- Processor contracts, hosting region, cross-border transfer, third-party speech services and government portal interactions.
- Accessibility and consumer-protection representations; avoid claims of government affiliation or guaranteed eligibility.
- Extension distribution/privacy disclosures and Chrome Web Store requirements.

## 8. Approval record — intentionally blank

- Qualified counsel / organization:
- Reviewer credentials:
- Assessment version and date:
- Data-flow evidence reviewed:
- Open issues and mitigations:
- Approval scope:
- Signed decision:
- Next review date:

No approval is implied until this section is completed by the qualified reviewer and the actual production deployment is checked against the assessment.


## DPDP legal review preparation — 4 November 2026

The official MeitY source page now lists the Digital Personal Data Protection Rules, 2025, a corrigendum dated 16 December 2025 and the official enforcement timeline. The Act and Rules have phased commencement dates; the legal-review plan records the extracted dates and primary Gazette links. Counsel must verify the exact current Gazette/corrigendum position and later notifications before giving advice.

This PIA remains a draft. It is not a DPIA approval, legal opinion or compliance certification. See docs/review-plans/legal-review.md for the required counsel deliverables and docs/review-plans/language-review.md for the six-locale human review plan.
