# AgentX Hackathon 2026 — JanaSetu AI submission fields

Use these values in the submission form. Replace the team-name and member placeholders with the exact registered details.

## Theme
**Artificial Intelligence & Machine Learning (AI/ML)**

## Sub-theme / domain
**Agentic AI for CivicTech and GovTech — public-benefits navigation**

## Project title
**JanaSetu AI — Benefit Readiness Agent**

## One-line pitch
A multilingual agentic-AI benefits assistant that maps scheme rules to citizen evidence and prepares explainable, human-reviewed next steps.

## Full description
Citizens across India often discover a government welfare scheme but still struggle to understand whether it may apply to them, which facts and documents matter, and what to do next. Scheme conditions, official sources, application channels and supporting evidence are spread across different portals and documents. A directory or generic chatbot does not preserve the relationship between a rule, a citizen's evidence, missing information and the next preparation action.

JanaSetu AI is an India-wide, multilingual benefits-readiness workspace designed to bridge that gap. It helps citizens organise a reusable profile, explore source-linked scheme information, inspect preliminary eligibility conditions, identify missing facts and evidence, prepare a local application checklist and draft, and manage follow-up actions. The prototype supports English, Hindi, Kannada, Telugu, Tamil and Malayalam.

Its core innovation is the **Benefit Readiness Graph**: an inspectable chain connecting each scheme condition to its official source and review status, citizen-stated facts, evidence state, unknowns and recommended next action. The workflow is agent-oriented: scheme retrieval, deterministic rule evaluation, evidence mapping and application preparation are coordinated as explicit steps with observable state. Unknown information remains unknown instead of being guessed by a generative model. This makes the output more explainable and reviewable than a free-form chatbot answer.

The current implementation combines a Next.js and React interface, TypeScript services and deterministic rule evaluation, Supabase/PostgreSQL integration where configured, browser-local storage, IndexedDB document handling, Web Crypto encrypted vault export/import, and automated testing. It is designed around privacy boundaries and citizen approval: preliminary screening is not an official eligibility decision, preparation drafts are not government submissions, and external government actions require the responsible authority's official channel and authorization.

**Current prototype scope:** the public preview is working; the scheme catalogue contains 142 references, with four rule-screened prototype scheme records still pending independent review. The prototype does not claim complete India-wide verified scheme coverage, government approval, live department API integration, production cloud document scanning, DPDP certification, or automatic application submission. The responsible department remains the final decision-maker.

## Innovation / uniqueness
- Benefit Readiness Graph linking official rule → source/review state → citizen fact → evidence status → missing information → next action.
- Deterministic condition evaluation with matched, not-matched and unknown states; missing facts are not guessed.
- Agent-style, stateful workflow rather than a one-shot chatbot response.
- Multilingual, citizen-controlled preparation with explicit boundaries around external actions.
- Local-first document handling and password-protected encrypted vault export/import.

## Target users
Citizens across India's States and Union Territories, including students, farmers, women, senior citizens and households exploring public welfare benefits. Assisted-service workers may also use the preparation checklist as a guide.

## Technology stack
Next.js, React, TypeScript, Supabase, PostgreSQL, browser Web Crypto API, IndexedDB, Vercel, Playwright and ClamAV tooling. Do not describe external LLM inference as an implemented dependency in the current prototype.

## Links
- **GitHub repository:** https://github.com/PSP-YN/JanaSetu-AI
- **Live demo — citizen workspace:** https://janasetu-qfjrr4m63-pspyn.vercel.app/app
- **Live demo — landing page:** https://janasetu-qfjrr4m63-pspyn.vercel.app/
- **Pitch deck — interactive six-slide deck:** https://htmlpreview.github.io/?https://github.com/PSP-YN/JanaSetu-AI/blob/backend/harden-supabase-access/public/pitch-deck.html
- **Demo video — direct MP4:** https://raw.githubusercontent.com/PSP-YN/JanaSetu-AI/backend/harden-supabase-access/submission/JanaSetu_AI_Demo.mp4
- **Demo video — GitHub preview:** https://github.com/PSP-YN/JanaSetu-AI/blob/backend/harden-supabase-access/submission/JanaSetu_AI_Demo.mp4

## Team fields
- **Team name:** [Enter the exact team name registered for AgentX]
- **Team leader:** [Enter registered leader details]
- **Team members:** [Enter the exact registered roster]

## Demo video notes
The 1 minute 47 second demo is a real browser recording of the live JanaSetu preview using synthetic citizen data. It has offline-generated Piper narration (en_GB-alba-medium) and burned-in captions. The voice is synthetic and is not a voice clone. The video shows the landing page, citizen workspace, scheme discovery, preliminary rule-screening, a local preparation draft marked **Not submitted**, privacy information and the pitch deck.

## Claims and declarations
Do not claim official government affiliation, full scheme verification, official eligibility decisions, production-ready government integrations, hosted malware scanning, DPDP certification or automatic government application submission. Do not use real citizen personal data in the demo. Review all eligibility, originality, team and consent declarations personally before submission.
