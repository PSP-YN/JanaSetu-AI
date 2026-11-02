# JanaSetu privacy impact assessment — review draft

**Status: DRAFT FOR QUALIFIED REVIEW. Not a legal opinion, DPIA approval or compliance certification.**  
**Scope:** JanaSetu web prototype, browser storage, JSON backup/restore, APIs, browser speech recognition, open-data proxy and optional browser extension.

## 1. Product purpose and boundaries

JanaSetu is an independent government-benefits discovery and preparation prototype. It is not a government service, does not make official decisions and must not submit applications. No real citizen personal or sensitive information should be used before this assessment is reviewed and approved.

## 2. Data inventory and flows

| Data | Entry/source | Processing/storage | External recipient | Control / retention decision |
|---|---|---|---|---|
| Citizen profile (name, age, gender, state, district, residence, income, occupation and scheme answers) | User-entered or locally imported sample | Browser localStorage; sent in request body to deterministic screening endpoint when assessment runs | Hosting provider processes request; no intentional application database persistence documented | Minimize fields; user clear/export controls; verify hosting logs and retention before launch |
| Free-text intake description | User typed or dictated | POST to intake parser; deterministic pattern extraction | Hosting provider; browser speech provider may receive audio depending on browser implementation | 4,000-character application limit; no raw request-body logging; disclose speech-provider processing |
| Draft application fields | Profile-derived | Browser local state; draft API request | Hosting provider processes request | Never submit to government portals automatically; clear drafts on user request |
| Document metadata/reference | User-entered name/type/size/date | Browser localStorage | None intended | Do not upload document bytes; prevent sensitive filenames where possible |
| JSON backup | User export/import | User-controlled local file; extension local storage after explicit import | None intended | Warn that backups are unencrypted unless user encrypts them; user controls deletion |
| Scheme search query | Search input | Browser and open-data API | Hugging Face Dataset Viewer through JanaSetu server | Limit query length; avoid placing personal data in search |
| Source health metadata | Scheduled/user request | Server-side health route | Hugging Face metadata endpoint | No citizen profile should be included |
| Browser extension profile | User-selected backup | chrome.storage.local on device | Active tab receives selected mapped values after explicit action | Never fill credentials, identity numbers, OTP/CAPTCHA, bank details or files; never submit |

## 3. Data minimization and necessity

- Reassess whether full name, gender, exact district and occupation are necessary for each scheme; collect only when required by a reviewed rule.
- Never request Aadhaar number, bank account number, OTP, password, CAPTCHA response or document image in the prototype.
- Avoid sample real-person names/details in production demonstrations; use clearly synthetic profiles.
- Do not transmit the entire profile when a scheme-specific minimal subset is sufficient.

## 4. Threats and harms

Potential harms include exposure on shared devices, browser-profile compromise, malicious extensions, server/proxy logs retaining request data, third-party speech processing, accidental form population on a wrong portal, inaccurate scheme guidance, backups copied to shared storage and misleading translated legal/eligibility wording.

## 5. Controls to verify

- Browser storage inventory and clear/export behaviour.
- Network capture for every user journey to prove exactly which fields leave the browser.
- Hosting, CDN and observability log configuration; ensure request bodies and query strings do not contain citizen data.
- TLS, security headers, body limits, schema validation, rate controls and dependency/secret scanning.
- Explicit user consent and disclosure before any speech provider processes audio.
- Extension allowlist, field exclusions, explicit user click, field-by-field review and no submission.
- Data retention/deletion schedule covering provider logs, backups and support systems.
- Incident response, breach escalation, grievance contact and user rights process.

## 6. Retention and deletion — decisions required

The product owner and counsel must define retention periods for browser local data, user backups, hosting logs, security logs and support records. The current app's localStorage data persists until the user clears it or browser data is removed. Confirm that no deployment platform or analytics provider retains request data beyond the disclosed purpose. Document deletion limitations before launch.

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
