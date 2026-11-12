# JanaSetu AI — 2-minute hackathon demo script

## Before recording
- Open the deployed JanaSetu app over HTTPS.
- Use synthetic profile data and harmless sample files only. Never use real Aadhaar, bank, caste, income or medical documents.
- Keep passwords and credentials out of the recording.
- For voice input, allow microphone access in a browser that supports SpeechRecognition. The browser speech service produces the transcript; JanaSetu receives the transcript only. Keep text input available as fallback.
- For portal filling, use the extension's synthetic form test fixture or a non-submitting test page. Do not submit a real government application.

## Recording flow (about 2 minutes)
**0:00–0:15 — Problem**

"Eligible citizens can miss support because scheme information is fragmented and applications are difficult to prepare. JanaSetu brings discovery, evidence checks, document preparation, form assistance and follow-ups into one citizen-controlled workflow."

**0:15–0:35 — Hindi/Kannada voice or text intake**

"A citizen can describe their situation in Hindi or a supported regional language by typing or using browser voice input. JanaSetu extracts suggested profile facts. The citizen reviews and corrects every field before using it."

Show a synthetic Kannada or Hindi sentence and the extracted profile fields. Point out that voice transcription depends on browser support and microphone permission.

**0:35–1:00 — Actual tool calls and eligibility checks**

"The local agent dispatcher calls four tools: scheme catalogue search, eligibility rule evaluation, document checklist generation and safe form-prefill preparation. The trace shows the tools that ran. The four current rule prototypes remain pending independent review, so results are preliminary and do not become official eligibility decisions."

Show the execution trace and one possible-match signal plus an unknown or conflicting condition. Point to the review disclaimer.

**1:00–1:25 — Documents and form preparation**

"JanaSetu builds a scheme-specific document checklist and a profile-to-prefill bundle. The browser helper then previews visible matching fields on a citizen-verified government page. The citizen approves each safe field before it is filled. This is citizen-directed assistance, not a department-authorized API adapter."

Show checklist source links and the synthetic extension preview/approval. Do not enter real citizen data into a live portal.

**1:25–1:45 — Human confirmation and follow-ups**

"The assistant stops after filling. It never clicks Next, Apply, Save or Submit, and it does not handle OTP, CAPTCHA, Aadhaar/e-KYC, biometrics, payment or document upload. The citizen remains in control of every protected step. Follow-up reminders are stored locally in this browser and survive reloads on this device."

Show the reminder in the follow-up list and the explicit no-submit boundary.

**1:45–2:00 — Scope and trust**

"JanaSetu currently screens four curated rule prototypes; all await independent review. Its wider catalogue is discovery-only, and the third-party snapshot is stale. There are zero independently approved published schemes and no department-authorized API integrations. This is a working citizen-side preparation workflow—not an official eligibility authority or submission agent."

## On-screen demo checklist
1. Select Hindi or Kannada.
2. Enter a synthetic situation by voice or text.
3. Review extracted facts.
4. Run assessment and show all four tool calls.
5. Show preliminary rule evidence and independent-review status.
6. Show document checklist and official source link.
7. Show safe form-prefill bundle and individual field approval in the extension fixture.
8. Show that no final portal action is automated.
9. Create a follow-up reminder.

## Capability boundary
- **Working in this release:** local multilingual text intake; browser voice transcription where supported; deterministic preliminary rule checks for four prototype schemes; source-note document checklists; safe profile prefill bundle; citizen-approved field filling in the browser extension; local browser reminders.
- **Not represented as complete:** official eligibility decisions; independent scheme-rule approval; all-India eligibility scoring for the catalogue-only records; certified portal-specific field maps; department API authorization; cross-device reminder sync; cloud document uploads; automated identity verification; final application submission.
