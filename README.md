# JanaSetu AI

**Understand what you may qualify for. Prepare what comes next.**

JanaSetu is an independent, multilingual public-benefits discovery and application-preparation workspace. It helps citizens explore source-linked scheme information, compare their circumstances against preliminary checklist rules, identify missing evidence and prepare the next step while official departments remain authoritative.

- Live website: https://jana-setu-ai.vercel.app
- Citizen workspace: https://jana-setu-ai.vercel.app/app
- Repository: https://github.com/PSP-YN/JanaSetu-AI
- Privacy: https://jana-setu-ai.vercel.app/privacy
- Terms: https://jana-setu-ai.vercel.app/terms

> **Important:** JanaSetu is not a government service or eligibility authority. The current scheme checklists are preliminary prototypes awaiting independent review. They are not official eligibility decisions. A preparation draft is not a government application and has not been submitted.

## Public-use release — 12 November 2026

The public browser-local workflow now lets anyone prepare a local checklist for any of the 46 source-linked scheme references, review the source-linked document list and download an unencrypted checklist for offline use. The 4,693-row third-party dataset is opt-in because its 5 July 2026 snapshot is stale and machine-parsed. The 96 Karnataka budget records remain budget leads, not citizen-facing schemes. See [Public-use release notes](docs/public-use-release-2026-11-12.md) for the exact capability matrix and citizen workflow. This does not activate unapproved eligibility rules, server-persisted application cases, cloud uploads or government submissions.

## Public website UI/UX update — 13 November 2026

The public landing page now presents the current catalogue coverage explicitly, distinguishes preliminary rule prototypes from catalogue-only references and budget-derived leads, explains the citizen-control boundary, and discloses that official grievance registration/status tracking is not yet available. The trust-principles navigation target is live, the workspace call-to-action is clearer, and the footer uses aligned desktop columns with a responsive mobile stack, and regional-language landing pages wrap safely on narrow screens. See [Public website UI/UX update](docs/public-ui-ux-2026-11-13.md) for the change record and responsive/accessibility verification plan. These changes do not change scheme approval or government integration status.

## What the current release candidate does

- Multilingual citizen experience: English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- Scheme discovery and source-linked guidance, with separate labels for deterministic rule prototypes, catalogue-only records and third-party discovery data.
- Multilingual intake in English, Hindi, Kannada, Tamil, Telugu and Malayalam. Text extraction is local; voice input uses the browser speech-recognition service where supported and falls back to typing.
- A visible local tool-dispatch trace: `search_scheme_catalog`, `evaluate_scheme_rules`, `build_document_checklist` and `prepare_form_filling`. The rule engine preserves unknown facts and shows preliminary match signals without turning pending rules into official eligibility decisions.
- Per-scheme document checklists and a citizen-review prefill bundle. Checklist items remain citizen-to-verify; form values are not represented as a certified government form mapping.
- Local application preparation, document checklists and versioned local backup/restore.
- Expanded citizen profile for contact, address, household, agriculture and education details; a separate, citizen-triggered profile-only JSON export supports the browser assistant. That export is plaintext, not an encrypted backup.
- Signed-in application planner in the Applications & automation dashboard. It checks published scheme rules, identifies missing profile information and documents, and produces a plan without persisting the submitted profile.
- Citizen-directed Browser Form Assistant: opens a government page after the citizen verifies the exact HTTPS URL, previews visible matching fields, and fills only fields the citizen individually approves. This is not a department-authorized API integration or a certified scheme-specific form adapter. It never uploads documents, bypasses protected checks or clicks Next, Apply, Save or Submit.
- Authenticated Supabase account and private citizen-workspace foundation.
- Client-side AES-256-GCM vault encryption and revision-aware sync API. Cloud sync is **fail-closed** until its exact consent policy has qualified privacy/legal approval and a citizen grants it.
- Follow-up tracking: reminders are stored in the browser and survive reloads on that device. Cross-device reminder sync remains disabled until the reminder consent policy and an approved application case are available.
- Scheme adapter registry and guarded automation queue. Current database records include four scheme integrations, all `not_requested`; no external government API integration or submission is enabled.

## What is intentionally not in this release

- **No universal government-portal automation.** Government portals use different workflows and protected verification. The browser assistant is a citizen-controlled form-filling aid only; no department-authorized submission integration is active.
- **No approved scheme eligibility decisions.** The four prototype pathways remain pending independent source, rule and legal review. All results remain preliminary and require verification.
- **No cross-device cloud sync.** The workspace is local-first. Cloud sync is deferred and its consent policy remains inactive.
- **No document upload or production malware scanning.** Scanning is deferred; uploaded identity documents are not part of the demo.
- **No automated CAPTCHA, OTP, Aadhaar/e-KYC, biometrics, legal declarations, payments or final submission.** Complete protected steps on the official department/provider portal.

## Privacy and safety

The current demo stores profile information, checklists and drafts in the browser. Browser storage is not the same as encrypted local storage. A separately exported backup can be password-encrypted; keep the password safe because JanaSetu cannot recover it. Do not enter Aadhaar numbers, bank-account numbers, OTPs, passwords or CAPTCHA answers into the general profile.

## Hackathon demo flow

1. Open the citizen workspace and select Hindi or Kannada (or another supported language).
2. Use the text box or the browser voice-input control with synthetic profile details only; review the extracted transcript and every suggested field.
3. Run the benefit assessment and show the four executed tool calls in the trace.
4. Inspect preliminary rule signals, matched/unknown checks and the independent-review disclaimer.
5. Open the generated document checklist and verify the source link.
6. Inspect the safe form-prefill bundle, then use the Browser Form Assistant on a test page to preview and individually approve safe fields.
7. Show the explicit human-confirmation boundary: no OTP/CAPTCHA/e-KYC, upload, Apply or Submit action is automated.
8. Add a follow-up reminder and show that it survives a browser reload on the same device.

The demo demonstrates a working citizen-side workflow for the four rule-screened prototype schemes. Their rules remain pending independent review, so the workflow does not claim official eligibility. The other catalogue-only records are not eligibility-scored. Government authorization, official scheme approval and final submission are external dependencies, not software toggles.

## Development

Requirements: Node.js 22.

```bash
npm ci
cp .env.example .env.local
# Configure the dedicated JanaSetu Supabase URL and publishable key.
npm run dev
```

Useful commands:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Never put Supabase service-role or secret keys in `NEXT_PUBLIC_*` variables. Never commit `.env.local`.

## Governance and architecture

- [Architecture](docs/architecture.md)
- [Government integration access plan](docs/government-integration-access-plan.md)
- [Scheme review workflow](docs/scheme-review-workflow.md)
- [Source verification and freshness](docs/source-verification-and-freshness.md)
- [Scheme catalogue coverage](docs/scheme-catalogue-coverage.md)
- [Security threat model](docs/security-threat-model.md)
- [Privacy impact assessment draft](docs/privacy-impact-assessment.md)
- [Production readiness and release gates](docs/production-readiness.md)
- [Production operations runbook and current automation capability matrix](docs/operations-runbook.md)
- [Form Assistant installation, route authorization and safety limits](docs/extension.md)
- [Backend implementation status](docs/backend-implementation-status.md)
- [Hackathon demo script](docs/hackathon-demo-script.md)

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md). Scheme data and government integrations require independent review and written authorization. A green CI build does not constitute legal approval, government authorization or official scheme verification.

## License

MIT. No government affiliation or endorsement is implied.


## Localized landing and voice-input hardening

The regional landing-page header and browser voice-error handling were hardened on 13 November 2026. See [the implementation note](docs/localized-landing-and-voice-fix-2026-11-13.md) for the root cause, verification coverage and the remaining browser speech-service limitation.


## On-device voice intake and portal autofill

- Voice intake offers both a browser speech-service mode and an optional local multilingual Whisper mode. Local mode records in the browser, transcribes in a dedicated worker using WebGPU when an adapter is available and WebAssembly otherwise, and keeps the recording on-device. The first run downloads and caches the quantized model files; the transcript remains a citizen-reviewed draft.
- Start browser autofill from Workspace > Applications & automation > Start portal autofill in four steps. Complete the profile, download the profile-only JSON after the plaintext warning, download the extension ZIP from the automation page, extract it, and load the extracted folder as an unpacked extension in Brave/Chrome, open a citizen-verified government portal, import the JSON, preview fields, and approve only the values you want filled.
- The extension is generic visible-field assistance, not a government integration. For the exact Karnataka SSP page only, it can fill a one-session value typed in the extension popup into an explicitly labelled Aadhaar-number field after individual approval; the value is never stored in the profile/export/extension storage and is not identity verification. It never clicks Proceed, Verify, Next, Apply, Save or Submit or performs OTP, CAPTCHA, e-KYC, document upload or final submission.
- See docs/voice-and-autofill-quickstart-2026-11-13.md for setup, privacy and verification details.
