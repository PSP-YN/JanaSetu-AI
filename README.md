# JanaSetu AI

JanaSetu is an independent, source-aware public-benefits navigation and application-preparation project. It helps people explore scheme information, understand preliminary screening criteria and organise next steps while keeping official departments authoritative for eligibility and decisions.

- Public landing page: `/`
- Citizen workspace: `/app`
- Privacy: `/privacy`
- Terms and limitations: `/terms`

**Important:** the current citizen workspace is a browser-local prototype, not a complete government application submission service. It does not provide a JanaSetu citizen account database, secure server-side document storage, universal official portal integration or guaranteed benefit eligibility. Never treat a prepared draft as a submitted application.

## Development

- Node.js 22
- Install: `npm ci`
- Type-check: `npm run typecheck`
- Unit tests: `npm test`
- Browser and accessibility tests: `npm run test:e2e`
- Production build: `npm run build`

## Data integrity

The built-in catalogue, Karnataka budget-derived discovery leads and third-party machine-parsed dataset are distinct source classes. A catalogue record or budget lead is not necessarily a verified, active citizen scheme. Review `docs/source-verification-and-freshness.md`, `docs/scheme-review-workflow.md` and `docs/operations-runbook.md` before changing source records.

## Operations and release

See:
- `docs/production-readiness.md`
- `docs/landing-page-release.md`
- `docs/operations-runbook.md`
- `docs/security-threat-model.md`
- `docs/source-verification-and-freshness.md`

Production deployments are triggered by the protected main-branch release flow. Do not merge until CI and release review pass.

---

## Previous detailed project documentation

# JanaSetu AI

**Understand what you may qualify for. Prepare what comes next.**

Live prototype: https://jana-setu-ai.vercel.app

JanaSetu is an independent benefits-readiness prototype. It is designed to complement official discovery and service platforms by connecting a citizen's stated facts to source-linked screening conditions, evidence gaps, draft preparation and next actions.

> **Important:** JanaSetu is not a government website or an official eligibility authority. The current prototype contains 142 source-linked records: four Central records with deterministic rule prototypes, all pending two independent human approvals, 42 official-source catalogue records, and 96 Karnataka budget-derived discovery leads. The budget leads are model-classified and not human-reviewed; they are not verified eligibility records. Screening results are preliminary and must be verified with the relevant department. JanaSetu does not intentionally submit applications. The experimental extension dispatches field-change events; portal scripts may react, so inspect the page after filling.

## Product principles

- Evidence before recommendations: each screening result links to its source and rule conditions.
- Unknown is not false: missing or uncertain facts produce a verification state.
- Human control: JanaSetu does not intentionally submit application drafts. The experimental extension only fills fields after a click; portal-side scripts may still react to field changes.
- Minimal data: the prototype does not request Aadhaar numbers, bank account numbers or other high-risk identifiers.
- Honest coverage: all Indian States and Union Territories can be selected in a profile; this does **not** mean every state scheme is currently catalogued.

## Run locally

Requirements: Node.js 22 or later (matches CI and Vercel).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verify

```bash
npm test
npm run build
```

## Prototype capabilities

- Citizen profile for all 28 States and 8 Union Territories.
- Interface language selector: English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- 142 source-linked records: four Central records with deterministic rule prototypes (all pending two independent human approvals), 42 catalogue-only official-source records and 96 Karnataka FY 2026–27 budget-derived discovery leads.
- Server-side screening workflow exposed through `POST /api/agent/run`.
- Explicit planner, scheme retrieval, deterministic rule evaluation, evidence-link construction and next-action generation.
- Application draft endpoint and a local application tracker.
- Document checklist and local metadata-only document register.
- Multilingual deterministic text intake for English, Hindi, Kannada, Tamil, Telugu and Malayalam; optional browser speech recognition where supported. Extracted facts require review.
- Field-by-field application preparation sheet with missing-value markers and a citizen-review record.
- Official ecosystem links to myScheme, UMANG, DigiLocker and Common Service Centres; JanaSetu does not claim to replace or be integrated with them.
- Browser persistence for the demo profile, assessments, document metadata and draft records, plus versioned JSON backup/restore for cross-device transfer. Screening, text extraction and draft creation run in the browser in the current local-first version. Browser speech recognition may use the browser vendor's service; data entered into an external government portal is governed by that portal.

## Architecture and governance

See:
- [Architecture](docs/architecture.md)
- [Data provenance and rule notes](docs/data-provenance.md)
- [Source verification and freshness register](docs/source-verification-and-freshness.md)
- [Production readiness and release gates](docs/production-readiness.md)
- [Production operations runbook](docs/operations-runbook.md)
- [Privacy notice](app/privacy/page.tsx) · [Terms and limitations](app/terms/page.tsx)
- [Competitor landscape](docs/competitor-analysis.md)
- [Idea submission and six-slide narrative](docs/idea-submission.md)
- [Three-minute demo script](docs/demo-script.md)

## Data and integrations

The prototype uses a partial source-linked catalogue built from public official sources and public government pages. It does not bulk-copy myScheme, claim API access it does not have, or infer official application status. Four records have deterministic rule prototypes, all pending two independent human approvals; additional entries are catalogue-only and require manual verification. Scheme rules and deadlines can change; verify the linked official source before acting.


## Local continuity and portal form assistance

- **Backup / Restore:** export profile, language, assessments, drafts, document metadata and follow-up records as a versioned local JSON file. Keep it private; it contains personal profile data.
- **Experimental Chrome extension:** [installation and safety guide](docs/extension.md). It fills matching fields only after the citizen clicks and reviews the portal. It does not intentionally submit applications; portal scripts may react to field-change events, so check the page after filling.
- **Scheme catalogue coverage:** [coverage, source policy and expansion plan](docs/scheme-catalogue-coverage.md). The built-in catalogue has 142 records: 4 Central rule prototypes pending independent human approval, 42 catalogue-only official-source records and 96 Karnataka budget-derived discovery leads. The 96 budget leads are model-classified and not human-reviewed; they must be verified with the department. Only four records have deterministic prototype rules, and all remain pending independent human approval. Use [official myScheme search](https://search.myscheme.gov.in/) for the current full Central + State/UT catalogue.

## License

This project is licensed under the MIT License; see [LICENSE](LICENSE). No government affiliation or endorsement is implied.


## Open-data scheme catalogue

JanaSetu's Discover view includes paginated keyword/category search over a bundled 4,693-row snapshot of [SmartDuke Technologies — Indian Government Schemes Dataset 2026](https://huggingface.co/datasets/smartduketech/indian-government-schemes-2025), published under **CC BY 4.0**. Snapshot collection date: 5 July 2026; last publisher revision observed: 6 July 2026. The dataset card identifies myScheme as the source and SmartDuke's parser as the source of structured fields. These are **third-party machine-parsed discovery records**, not official JanaSetu rules. JanaSetu does not use imported eligibility fields to decide whether a person qualifies. The complete local index is searched without depending on the publisher's unavailable `/search` endpoint. The snapshot is stale under the 90-day policy; a daily workflow checks for publisher revisions and opens a draft review PR when a new validated revision appears. No dataset update is auto-merged or auto-approved. Users must verify current rules, benefits, application dates and destination URLs against the linked government department/myScheme page.

This open-data integration does not claim all 4,693 rows are current active schemes or officially verified. The row count reflects the dataset snapshot and can change.


## Release assurance and review packs

The current application is a prototype. Read the evidence and approval requirements before using it with any real citizen data:

- [Six-gate release evidence register](docs/release-gate-evidence.md)
- [Localization policy](docs/localization-policy.md)
- [Scheme source and rule approval workflow](docs/scheme-review-workflow.md)
- [Portal compatibility test matrix](docs/portal-test-matrix.md)
- [Privacy impact assessment draft](docs/privacy-impact-assessment.md)
- [Security threat model](docs/security-threat-model.md)
- [Security assessment and independent test scope](docs/security-assessment.md)

**Important:** the four deterministic scheme records are now fail-closed and remain blocked until human approval is explicitly recorded. Synthetic CI tests do not constitute portal compatibility certification, legal review, DPIA approval, manual accessibility sign-off or an independent penetration test.


## Project documentation

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [Project documentation](docs/)
