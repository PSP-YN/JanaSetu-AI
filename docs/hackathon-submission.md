# AgentX Hackathon 2026 — JanaSetu AI

## Submission identity

- **Theme:** Artificial Intelligence & Machine Learning (AI/ML)
- **Sub-theme:** Agentic AI for CivicTech / GovTech
- **Problem statement:** PS-01 — Scheme Saathi
- **Project title:** JanaSetu AI — Benefit Readiness Agent
- **One-line pitch:** A multilingual AI benefits agent that links scheme rules to citizen evidence and prepares explainable, human-reviewed next steps.

## Submission links

- **GitHub repository (main):** https://github.com/PSP-YN/JanaSetu-AI
- **Live demo:** https://jana-setu-ai.vercel.app/app
- **Landing page:** https://jana-setu-ai.vercel.app/
- **Interactive six-slide pitch deck:** https://htmlpreview.github.io/?https://github.com/PSP-YN/JanaSetu-AI/blob/main/public/pitch-deck.html
- **Demo video (MP4):** https://raw.githubusercontent.com/PSP-YN/JanaSetu-AI/main/submission/JanaSetu_AI_Demo.mp4

Full copy-ready form values and the detailed project description are in [submission/AGENTX_SUBMISSION_FIELDS.md](../submission/AGENTX_SUBMISSION_FIELDS.md).

## Project summary

JanaSetu AI is an India-wide, multilingual benefits-readiness workspace. It connects source-linked scheme information, citizen-stated facts, deterministic preliminary eligibility checks, evidence gaps, local preparation drafts and follow-up actions.

Its central innovation is the **Benefit Readiness Graph**, an inspectable chain connecting scheme conditions to their official sources, citizen facts, evidence state, missing information and next preparation action. The agent-style workflow coordinates retrieval, rule evaluation, evidence mapping and preparation. Unknown information remains unknown rather than being guessed.

## Current prototype and validation boundaries

- Six interface languages: English, Hindi, Kannada, Telugu, Tamil and Malayalam.
- The scheme catalogue contains 142 references; four rule-screened prototype scheme records remain pending independent review.
- Preliminary screening is not an official eligibility decision.
- A preparation draft is not a submitted government application.
- No government department approval, production-authorized government API, or automatic government submission is claimed.
- Production document scanning is not enabled; the scanner worker is not deployed.
- The prototype is not DPDP-certified and has not been represented as independently penetration-tested.

Use synthetic information only in the demo. Do not enter real Aadhaar, bank, caste, income, medical or other sensitive records.

## Demo video

The 1 minute 47 second MP4 is a browser recording of the live preview with synthetic citizen data, offline Piper narration and burned-in captions. The voice is synthetic, not cloned. It demonstrates scheme discovery, preliminary assessment, a preparation draft marked **Not submitted**, privacy information and the pitch deck.

## Local verification

The submission implementation is consolidated into protected `main` and deployed at `https://jana-setu-ai.vercel.app`. The demo recording was captured against the earlier preview environment; the canonical production deployment is now live. The public site remains a controlled prototype/beta: no scheme is independently approved or published, and government portal automation, document scanning and cross-device sync remain gated.
