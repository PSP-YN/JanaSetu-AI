# AgentX idea-round submission copy

Use this copy in the team workspace's idea-submission fields. Keep the deck link public and accessible to judges.

## Project name
JanaSetu AI

## Selected problem statement
Scheme Saathi — welfare-scheme discovery, eligibility support, application preparation and follow-up.

## One-line description
An evidence-backed, multilingual benefits-navigation agent that turns a citizen's circumstances into traceable scheme screening, a personalized document-readiness plan and a human-reviewed application draft.

## Problem
Citizens may need to navigate several government departments and portals to understand the benefits relevant to their household. Scheme eligibility conditions, supporting evidence, application channels and follow-up requirements are distributed across different information sources. Citizens often have to interpret policy language, determine which facts apply to them, collect certificates and re-enter the same information in multiple forms. A discovery link alone does not preserve the citizen's evidence, show which rule remains unverified or guide the next action across the full preparation journey. Existing public platforms already improve scheme discovery and service access; JanaSetu addresses the gap between identifying a possible benefit and being ready to approach the responsible authority.

## Proposed solution
JanaSetu is an independent, India-wide benefits-navigation workspace. A citizen creates a reusable, consent-bound profile and receives a preliminary assessment of potentially relevant schemes from a source-linked catalogue. The system evaluates encoded conditions using deterministic rules, links each condition to the citizen's stated fact or supporting evidence, and distinguishes matched, not-matched and unknown conditions. It generates a personalized missing-information and document checklist, prepares a draft from the information already provided, and preserves next actions and reminders so the citizen can return later. The citizen reviews all consequential steps and uses the official government portal or authorized service channel for any actual application.

## What is innovative
The central innovation is the **Benefit Readiness Graph**: an inspectable chain connecting an official scheme condition, its source and verification period, citizen-provided evidence, the state of that evidence, the missing information and the next application-preparation action. Evidence can be reused across relevant assessments with citizen consent. Unknown facts remain unknown instead of being guessed by an LLM. The system therefore explains not only which schemes may be relevant, but exactly what evidence is still needed and why.

## Why an agent is needed
A simple chatbot can explain a scheme but cannot reliably manage a multi-step workflow that changes state. JanaSetu plans and executes a bounded sequence of tool operations: read the citizen profile, retrieve relevant scheme records and rules, evaluate conditions, build evidence links, identify missing documents, prepare a draft, save workflow state and schedule a follow-up. Each operation has a typed input/output and an observable execution record. An approval checkpoint separates preparation from external or irreversible actions.

## Agent and tool design
- Planner/orchestrator: chooses applicable workflow steps and delegates to specialized roles.
- Scheme retrieval: searches the curated catalogue and fetches the linked official rule record.
- Eligibility evaluator: executes deterministic conditions; missing or uncertain facts return unknown.
- Evidence linker: maps profile fields and document references to rule conditions.
- Application-preparation tool: maps known information to a draft and highlights unresolved fields.
- Follow-up tool: persists a next-action reminder and retrieves the workflow on return.

The current working prototype implements a deterministic server-side planner and executable tools with an inspectable tool trace. The conversational intake uses multilingual phrase/pattern extraction; it is not an external LLM. It does not claim external LLM inference or live government API integration.

## Target users
Citizens across all Indian States and Union Territories, including farmers, women and households exploring clean-cooking support, urban households exploring housing pathways, and students exploring scholarship pathways. Assisted-service workers can use the checklist as a preparation aid.

## Geographic and language scope
Designed for all 28 States and 8 Union Territories. Interface languages in the prototype: English, Hindi, Kannada, Tamil, Telugu and Malayalam. The catalogue currently contains four curated Central Government scheme references only; state-specific schemes will be added after their official rules and current implementation details are verified.

## Safety and trust
- The prototype asks for no Aadhaar number or bank-account number. Profiles and drafts persist in browser localStorage; relevant profile fields are sent to JanaSetu server routes when screening or preparing a draft and are not intentionally persisted server-side.
- User-entered screening answers are not treated as authenticated government records.
- Each record links to an official source and identifies the rule period or verification caveat.
- Unknown or unverified evidence prevents a positive eligibility conclusion.
- JanaSetu does not intentionally submit applications or fabricate government application IDs/status. The experimental extension fills fields only after a user click; portal scripts may react to those field changes.
- Human review is required before any consequential external action.
- Prototype profile, document references, drafts and reminders are browser-local; relevant profile fields are sent to the app server for assessment/draft processing. File binaries are not uploaded or parsed.

## Technical feasibility
Next.js and TypeScript provide the responsive interface; Python-style deterministic rule logic is implemented in TypeScript server modules; Next.js route handlers expose the tools; browser storage persists the demo journey; and Vercel deploys the prototype. The initial catalogue is purposefully small so every encoded rule can be inspected against an official source.

## Impact and evaluation
The pilot will measure:
1. Rule-level precision and recall against a source-reviewed synthetic test set.
2. Percentage of screening conditions with traceable rule and evidence references.
3. Accuracy of unknown/missing-evidence identification.
4. Completion rate of profile → screening → draft → follow-up journeys.
5. Time taken by pilot users to prepare a correct checklist compared with their unassisted baseline.

No impact percentages or accuracy claims are asserted before evaluation.

## Links
- Repository: https://github.com/PSP-YN/JanaSetu-AI
- Website: https://janasetu-ai-pspyn.vercel.app (production deployment verified)
- Six-slide idea deck: attach the supplied PowerPoint file or host an accessible share link.

## Submission note
Do not describe the current prototype as production-ready or as having complete India-wide scheme coverage. The product architecture and profile scope are national; the current verified-rule catalogue is a limited central-scheme pilot. The next milestone is governed ingestion and review of State/UT rule packs, secure citizen accounts, document extraction and authorized department integrations.
