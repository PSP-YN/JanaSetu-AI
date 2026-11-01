# JanaSetu AI

**Understand what you may qualify for. Prepare what comes next.**\n\nLive prototype: https://janasetu-ai-pspyn.vercel.app

JanaSetu is an independent, India-wide benefits navigation prototype. It combines a citizen profile, source-linked scheme screening, explainable rule checks, document checklists, application-draft preparation and persistent follow-up tasks.

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
- Curated national scheme catalogue with official source links and source-period labels.
- Server-side screening workflow exposed through `POST /api/agent/run`.
- Explicit planner, scheme retrieval, deterministic rule evaluation, evidence-link construction and next-action generation.
- Application draft endpoint and a local application tracker.
- Document checklist and local metadata-only document register.
- Multilingual deterministic text intake for English, Hindi, Kannada, Tamil, Telugu and Malayalam; optional browser speech recognition where supported. Extracted facts require review.\n- Field-by-field application preparation sheet with missing-value markers and a citizen-review record.\n- Browser persistence for the demo profile, assessments, document metadata and draft records. Relevant profile fields are sent to the app server when an assessment or draft is requested; they are not intentionally persisted server-side.

## Architecture and governance

See:
- [Architecture](docs/architecture.md)
- [Data provenance and rule notes](docs/data-provenance.md)
- [Competitor landscape](docs/competitor-analysis.md)
- [Idea submission and six-slide narrative](docs/idea-submission.md)
- [Three-minute demo script](docs/demo-script.md)

## Data and integrations

The prototype uses a small, explicitly curated catalogue based on public official sources. It does not scrape government portals, claim API access it does not have, or infer official application status. Scheme rules can change; verify the linked official source and current application window before acting.

## License

All rights reserved. This repository is published for evaluation and demonstration. No government affiliation or endorsement is implied.
