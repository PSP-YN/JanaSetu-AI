# JanaSetu architecture

## Current implementation

The current application is a Next.js App Router application with a small server-side deterministic agent workflow.

```text
Browser workspace
  ├─ Citizen profile (localStorage)
  ├─ Scheme discovery and results
  ├─ Document metadata register (localStorage; no binary upload)
  ├─ Application drafts and reminders (localStorage)
  └─ Language selector
        |
        v
Next.js Route Handlers
  ├─ POST /api/agent/run
  │    ├─ Planner: selects likely scheme domains
  │    ├─ Scheme tool: searches curated catalogue
  │    ├─ Eligibility tool: executes deterministic rules
  │    ├─ Evidence tool: links conditions to profile fields
  │    └─ Workflow tool: generates next actions
  ├─ POST /api/applications/draft
  ├─ POST /api/tools/follow-up
  ├─ GET  /api/schemes
  └─ GET  /api/health
        |
        v
Curated source-linked rule catalogue
```

## Important implementation distinction

The prototype's "agents" are explicit software roles and tool functions coordinated by a deterministic planner. It does **not** currently call an external LLM. This keeps the demo reproducible and prevents generated text from deciding legal eligibility. A future LLM can be used for multilingual intake, plain-language explanations and task planning, but the final rule evaluation must remain constrained by versioned deterministic rules and authoritative data.

## Multilingual citizen intake\n\nThe current prototype includes a conservative deterministic pattern extractor for selected profile facts in English, Hindi, Kannada, Tamil, Telugu and Malayalam. It can suggest selected facts such as age, income expressed in lakh, State/UT aliases, gender, farmer/student occupation, rural/urban residence and selected household indicators. This is not open-ended language understanding and does not infer facts outside its patterns. The UI requires the citizen to review the extracted values before running an assessment. Optional voice capture uses the browser SpeechRecognition API where available; browser voice providers and language availability vary.\n\n## Core execution

1. Validate and normalize the submitted profile.
2. Planner chooses domains based on declared attributes.
3. Scheme retrieval returns only records in the curated catalogue.
4. Rule evaluator executes the scheme-specific checks.
5. Evidence linker attaches each check to an input field and rule statement.
6. Workflow agent returns next actions.
7. Application draft endpoint creates a preparation record.
8. Browser stores the draft and reminders locally.

Every tool step appears in an execution trace. The trace is a workflow trace, not proof of a live government API call.

## Evidence state model

- `matched`: a supplied profile value agrees with the encoded screening condition.
- `not_matched`: a supplied value conflicts with the encoded screening condition.
- `unknown`: the relevant value is missing or not sufficiently verified.

Assessment states:
- `potential_match`: no encoded condition conflicts; still preliminary.
- `not_matched`: at least one encoded condition conflicts; not an official rejection.
- `needs_verification`: missing facts, complex criteria or source-period limitations prevent a conclusion.

The current code deliberately sets the four assessments to require official verification because the catalogue is incomplete and does not authenticate evidence.

## Target production architecture

```text
Citizen web / Android / assisted-service interface
  |
API gateway + identity + consent
  |
Agent orchestrator (bounded plans, typed tool contracts, timeouts)
  |---- Scheme catalogue retrieval
  |---- Versioned deterministic eligibility engine
  |---- Evidence extraction and validation service
  |---- Document checklist / form mapping
  |---- Application state adapter
  |---- Reminder / notification adapter
  |
PostgreSQL + encrypted object storage + audit event log
  |
Official department portals / authorised APIs (where available)
```

### Production controls required before real citizens use it

- Verified and versioned scheme rules for all supported States/UTs, with source owner, effective date, supersession date and reviewer.
- Data governance: consent, purpose limitation, retention/deletion, data minimisation and access logs.
- Authentication and role-based access for citizens and authorised helpers.
- Encryption in transit and at rest; managed key rotation and secrets management.
- File scanning, OCR isolation, malware handling and human confirmation of extracted fields.
- Idempotent application actions, retries, observability and audit logs.
- Official API/portal agreements and a per-integration support/availability model.
- Accessibility, assisted workflows and robust low-bandwidth/mobile experience.
- Security testing, privacy impact assessment, legal review and incident response.

## Current limitations

- No user accounts or cross-device sync.
- No production database; user state lives in browser localStorage.
- File binaries are not uploaded or parsed.
- No LLM inference, speech recognition or text-to-speech.
- No live myScheme, UMANG, DigiLocker or department API integration.
- No application submission or authoritative status lookup.
- Only four curated Central scheme records are encoded.
