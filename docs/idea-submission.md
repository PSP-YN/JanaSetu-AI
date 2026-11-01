# JanaSetu — Idea Submission

## One-line pitch

**JanaSetu turns fragmented benefit discovery into an evidence-backed action plan: one reusable citizen profile, explainable scheme screening, a document-readiness graph and human-approved application preparation.**

## Executive summary

Citizens often have to translate their circumstances into the language of multiple scheme rules, assemble documents from different sources and move between department portals. JanaSetu is an independent, multilingual benefits-navigation agent designed to bridge that gap.

A citizen creates a consent-bound profile once. The system identifies potentially relevant schemes, evaluates published screening conditions, links each condition to the profile field or supporting evidence used, identifies unknowns and missing documents, prepares an application draft and remembers the next action. The citizen reviews every consequential step.

The initial product is designed for all Indian States and Union Territories. The working prototype uses a small curated set of Central Government schemes and clearly labels each source and rule period. It does not claim complete national/state coverage or submit to government portals.

## The differentiation: Benefit Readiness Graph

JanaSetu's core interaction is not a chatbot transcript or a flat list of schemes. It is a Benefit Readiness Graph that links:

1. A published scheme condition.
2. The official source and the version/date checked.
3. The citizen-profile field or document that can support the condition.
4. The state of evidence: matched, not matched or unknown.
5. The missing evidence or verification action.
6. The application field and next step that depend on it.

Evidence can be reused across scheme assessments with the citizen's consent. Unknown information is never silently converted into a negative answer. A screen that appears positive is still labelled preliminary until the competent department verifies it.

## Who it serves

- Households navigating multiple welfare and public-benefit pathways.
- Farmers and agricultural households.
- Women and households exploring clean-cooking support.
- Urban households exploring affordable housing routes.
- Students exploring merit-cum-means scholarship pathways.
- Assisted-service workers who help citizens prepare information and checklists.

## Why an agent, not only a chatbot?

A chatbot can explain a scheme. JanaSetu must maintain a workflow across several operational steps: retrieve a source, select relevant rules, evaluate structured conditions, connect evidence, identify unknowns, generate a checklist, create a draft and schedule a follow-up. Each step changes the state of the work. The agent has tools and an audit trail; the citizen remains the approval authority.

## Six-slide deck content

### Slide 1 — JanaSetu: From discovery to readiness
**Understand what you may qualify for. Prepare what comes next.**  
A multilingual, evidence-backed benefits navigation agent for citizens across India.

### Slide 2 — The access gap is a workflow gap
- Scheme rules, evidence requirements and application channels are distributed across portals and departments.
- Citizens must repeatedly interpret eligibility language and map personal facts to official conditions.
- Missing, inconsistent or outdated documents create avoidable rework.
- A list of links does not maintain a citizen's next steps or application-readiness state.

### Slide 3 — One profile, a traceable path to action
- Create a consent-bound citizen profile.
- Discover relevant central and State/UT schemes.
- Evaluate published conditions without inventing missing facts.
- Link rule → evidence → status → next action.
- Prepare an application draft and a human-review checklist.
- Remember follow-ups across sessions.

### Slide 4 — Agent design and tool use
Planner/orchestrator → scheme retrieval agent → deterministic rule evaluator → evidence-linking agent → application-preparation agent → follow-up agent.

Tools: scheme search, source/rule retrieval, eligibility evaluation, evidence extraction, checklist generation, draft preparation, application-state retrieval and reminder creation.

Human approval is required before any external or irreversible action.

### Slide 5 — Differentiation, feasibility and trust
- Existing platforms already provide scheme discovery, language support and broad government-service access.
- JanaSetu focuses on the execution gap: evidence traceability, cross-scheme reuse, unknown-state handling and persistent readiness.
- Initial prototype: four curated Central Government scheme references, all 36 State/UT profile choices, six interface languages and a local application workflow.
- Success is measured through rule-test accuracy, evidence traceability, missing-document detection and successful completion of end-to-end test journeys.

### Slide 6 — Demonstration and impact
A synthetic citizen profile is screened against the curated catalogue. The agent produces a tool trace, condition-level results, source links and next actions, then prepares a local draft and follow-up reminder.

**North star:** fewer avoidable handoffs between “I may qualify” and “I know exactly what to verify and do next.”

## Prototype scope and honesty statement

The current repository prototype implements a deterministic planner and server-side tool workflow over a curated central-scheme catalogue. It is a working prototype, not a production government integration. It does not connect to live citizen databases, authenticate official records, read uploaded document contents, submit applications or determine legal eligibility.

The production roadmap adds verified State/UT catalogues, controlled source ingestion, secure encrypted storage, role-based access, consent and retention controls, document extraction with human verification, monitored integrations and independent security/privacy review.
