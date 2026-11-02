# JanaSetu AI

**Understand what you may qualify for. Prepare what comes next.**\n\nLive prototype: https://janasetu-ai-pspyn.vercel.app

JanaSetu is an independent benefits-readiness prototype. It is designed to complement official discovery and service platforms by connecting a citizen's stated facts to source-linked screening conditions, evidence gaps, draft preparation and next actions.

> **Important:** JanaSetu is not a government website or an official eligibility authority. The current prototype contains a small, curated set of Central Government scheme references. Screening results are preliminary and must be verified with the relevant department. It does not submit applications to government systems.

## Product principles

- Evidence before recommendations: each screening result links to its source and rule conditions.
- Unknown is not false: missing or uncertain facts produce a verification state.
- Human control: application drafts are never submitted automatically.
- Minimal data: the prototype does not request Aadhaar numbers, bank account numbers or other high-risk identifiers.
- Honest coverage: all Indian States and Union Territories can be selected in a profile; this does **not** mean every state scheme is currently catalogued.

## Run locally

Requirements: Node.js 20 or later.

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
- Partial source-linked catalogue with Central scheme references, National Scholarship Portal AY 2026–27 entries and a Karnataka State starter set; only four records currently have deterministic eligibility screening.
- Server-side screening workflow exposed through `POST /api/agent/run`.
- Explicit planner, scheme retrieval, deterministic rule evaluation, evidence-link construction and next-action generation.
- Application draft endpoint and a local application tracker.
- Document checklist and local metadata-only document register.
- Multilingual deterministic text intake for English, Hindi, Kannada, Tamil, Telugu and Malayalam; optional browser speech recognition where supported. Extracted facts require review.\n- Field-by-field application preparation sheet with missing-value markers and a citizen-review record.
- Official ecosystem links to myScheme, UMANG, DigiLocker and Common Service Centres; JanaSetu does not claim to replace or be integrated with them.\n- Browser persistence for the demo profile, assessments, document metadata and draft records, plus versioned JSON backup/restore for cross-device transfer. Screening, text extraction and draft creation run in the browser in the current local-first version. Browser speech recognition may use the browser vendor's service; data entered into an external government portal is governed by that portal.

## Architecture and governance

See:
- [Architecture](docs/architecture.md)
- [Data provenance and rule notes](docs/data-provenance.md)
- [Competitor landscape](docs/competitor-analysis.md)
- [Idea submission and six-slide narrative](docs/idea-submission.md)
- [Three-minute demo script](docs/demo-script.md)

## Data and integrations

The prototype uses a partial source-linked catalogue built from public official sources and public government pages. It does not bulk-copy myScheme, claim API access it does not have, or infer official application status. Four records have deterministic prototype screening; additional entries are catalogue-only and require manual verification. Scheme rules and deadlines can change; verify the linked official source before acting.


## Local continuity and portal form assistance

- **Backup / Restore:** export profile, language, assessments, drafts, document metadata and follow-up records as a versioned local JSON file. Keep it private; it contains personal profile data.
- **Experimental Chrome extension:** [installation and safety guide](docs/extension.md). It fills matching fields only after the citizen clicks and reviews the portal. It does not submit applications.
- **Scheme catalogue coverage:** [coverage, source policy and expansion plan](docs/scheme-catalogue-coverage.md). The built-in catalogue is a partial Central + Karnataka starter set, including AY 2026–27 NSP entries. Only four records are rule-screened. Use [official myScheme search](https://search.myscheme.gov.in/) for the current full Central + State/UT catalogue.

## License

All rights reserved. This repository is published for evaluation and demonstration. No government affiliation or endorsement is implied.
