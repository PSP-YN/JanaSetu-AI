# AgentX Hackathon 2026 — JanaSetu submission pack

## Form values

**Project name**  
JanaSetu AI — Benefit Readiness Agent

**Theme**  
Agentic AI / CivicTech / GovTech

**One-line pitch (under 140 characters)**  
A multilingual benefits agent that links scheme rules to citizen evidence and prepares human-reviewed application drafts.

**Description**  
Citizens often discover a public-benefit scheme but still struggle to interpret its rules, map their circumstances to eligibility conditions, identify missing documents and manage the next steps. JanaSetu AI is a multilingual, citizen-controlled benefits-readiness assistant. It helps users organise a profile, explore a source-aware scheme catalogue, run preliminary rule-based screening, see matched, not-matched and unknown conditions, identify evidence gaps, prepare an application draft and set follow-ups. Its local-first document workflow stores newly added document binaries in browser IndexedDB and supports a portable AES-256-GCM encrypted vault export/import. The system is designed to keep official departments authoritative: screening is preliminary, drafts are not submitted, and unknown facts are not treated as negative answers. The current prototype has a partial catalogue and four deterministic scheme prototypes pending independent human approval; it is not a government service or production eligibility authority.

**Tech stack**  
Next.js 16, React 19, TypeScript, Supabase, PostgreSQL, Supabase Auth, pgmq, pg_cron, Web Crypto API, IndexedDB, ClamAV, Playwright, Vercel

**Repository**  
https://github.com/PSP-YN/JanaSetu-AI

**Live demo**  
https://janasetu-dalm6g8nb-pspyn.vercel.app/app

**Pitch deck**  
https://janasetu-dalm6g8nb-pspyn.vercel.app/pitch-deck.html

**Demo video**  
Not yet recorded or uploaded. Use the two-minute recording script at [docs/hackathon-demo-script.md](hackathon-demo-script.md), then upload the actual screen recording to an accessible video host and replace the form field with that URL. Do not submit the script URL as if it were a video.

## Useful links

- Public preview home: https://janasetu-dalm6g8nb-pspyn.vercel.app/
- Citizen workspace: https://janasetu-dalm6g8nb-pspyn.vercel.app/app
- Privacy notice: https://janasetu-dalm6g8nb-pspyn.vercel.app/privacy
- Terms and limitations: https://janasetu-dalm6g8nb-pspyn.vercel.app/terms
- Interactive pitch deck: https://janasetu-dalm6g8nb-pspyn.vercel.app/pitch-deck.html
- Repository branch: https://github.com/PSP-YN/JanaSetu-AI/tree/backend/harden-supabase-access
- Pull request: https://github.com/PSP-YN/JanaSetu-AI/pull/22
- Latest CI run before this submission-pack commit: https://github.com/PSP-YN/JanaSetu-AI/actions/runs/43069709900

## How to test the live demo

1. Open the public preview home page and select the citizen workspace.
2. Use synthetic information only. Do not enter real Aadhaar, bank, caste, income, medical or other sensitive records.
3. Explore the scheme catalogue and open a scheme detail page. Follow the official source link rather than treating the JanaSetu summary as authoritative.
4. Open the citizen workspace. Create or edit a synthetic profile and select a State/UT and language.
5. Run a preliminary assessment. Inspect the condition-level result and source references. Confirm that missing facts remain unknown and that the result is not an official eligibility decision.
6. Prepare a draft/checklist and inspect the “not submitted” boundary.
7. Add a harmless sample PDF/JPEG/PNG in Documents. New file binaries are stored in this browser's IndexedDB.
8. Export a .janasetu vault with a unique demo-only passphrase of at least 12 characters. Try a wrong password on import and confirm that it is rejected; then import with the correct password.
9. State the limitations: the local IndexedDB copy is not app-level encrypted at rest; the export is encrypted; ClamAV scanning is a separate local CLI action and the app does not automatically mark files clean.

## Local development and verification

Requirements: Node.js 22.

```bash
git clone https://github.com/PSP-YN/JanaSetu-AI.git
cd JanaSetu-AI
git checkout backend/harden-supabase-access
npm ci
npm run check
npm run build
npm run dev
```

Open http://localhost:3000. For browser accessibility tests, install the project's Playwright Chromium browser and run the repository's CI browser test command (npx playwright test) after a successful production build.

Local ClamAV scanning on Fedora is optional and separate from the web UI:

```bash
sudo dnf install clamav clamav-update
sudo freshclam
chmod +x scripts/scan-local-document.sh
./scripts/scan-local-document.sh /path/to/synthetic-sample.pdf
```

Exit codes: 0 = no detection, 1 = detection, 2 = scanner unavailable/error. A scan failure is not a clean result.

## Current verification and boundaries

- The current code branch previously passed the full CI workflow (tests, type-check, scanner image build, database guardrails, browser accessibility tests, extension validation, dependency audit and production smoke test).
- Local Fedora verification on the connected workstation passed TypeScript, 127/127 unit tests and a production build.
- The public Vercel preview for commit e69aea3fc7860fa472ac51ba04f21223797b8d7b reached READY; HTTP 200 was verified for /, /app and /privacy.
- The pitch-deck page was added after that preview build; redeploy the newer commit before using the pitch-deck URL in the form.
- PR #22 is open and mergeable. It is not merged to main; production aliases and the current production site have not been changed.
- Four deterministic scheme records remain pending independent human approval; none is published. The legal consent-policy registry has zero approved policies. No government API submission adapter is authorised. The cloud scanner worker is not provisioned.
- JanaSetu must not be described as DPDP-certified, legally approved, independently security-audited, fully scheme-verified or capable of submitting government applications.

## Remaining before final form submission

1. Redeploy this newest commit and verify the interactive pitch deck URL.
2. Record a real 2-minute screen walkthrough using synthetic data and upload it to an accessible video host. The demo video field is the only submission URL not yet available.
3. Paste the form values above into the AgentX submission page and submit before the deadline.
4. Do not merge to production as part of the hackathon submission; the preview URL is the intended demo target.
