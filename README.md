# JanaSetu AI

**Understand what you may qualify for. Prepare what comes next.**

JanaSetu is an independent, multilingual public-benefits discovery and application-preparation workspace. It helps citizens explore source-linked scheme information, compare their circumstances against preliminary checklist rules, identify missing evidence and prepare the next step while official departments remain authoritative.

- Live website: https://jana-setu-ai.vercel.app
- Citizen workspace: https://jana-setu-ai.vercel.app/app
- Repository: https://github.com/PSP-YN/JanaSetu-AI
- Privacy: https://jana-setu-ai.vercel.app/privacy
- Terms: https://jana-setu-ai.vercel.app/terms

> **Important:** JanaSetu is not a government service or eligibility authority. The current scheme checklists are preliminary prototypes awaiting independent review. They are not official eligibility decisions. A preparation draft is not a government application and has not been submitted.

## What the current release candidate does

- Multilingual citizen experience: English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- Scheme discovery and source-linked guidance, with separate labels for deterministic rule prototypes, catalogue-only records and third-party discovery data.
- Preliminary screening that treats unknown facts as unknown and directs citizens to official sources.
- Local application preparation, document checklists and versioned local backup/restore.
- Expanded citizen profile for contact, address, household, agriculture and education details; a separate, citizen-triggered profile-only JSON export supports the browser assistant. That export is plaintext, not an encrypted backup.
- Signed-in application planner in the Applications & automation dashboard. It checks published scheme rules, identifies missing profile information and documents, and produces a plan without persisting the submitted profile.
- Browser Form Assistant: imports a citizen-confirmed profile export and previews selected fields. Live portal filling is blocked unless an exact route has independent review and department authorization; none of the four initial scheme routes is currently authorized. It never uploads documents or submits applications.
- Authenticated Supabase account and private citizen-workspace foundation.
- Client-side AES-256-GCM vault encryption and revision-aware sync API. Cloud sync is **fail-closed** until its exact consent policy has qualified privacy/legal approval and a citizen grants it.
- Scheme adapter registry and guarded automation queue. Current database records include four scheme integrations, all `not_requested`; no external government submission is enabled.

## What is intentionally not in this release

- **No universal government-portal automation.** Government portals use different workflows and protected verification. The browser assistant is a citizen-controlled form-filling aid only; no department-authorized submission integration is active.
- **No approved scheme eligibility decisions.** The four prototype pathways remain pending independent source, rule and legal review. All results remain preliminary and require verification.
- **No cross-device cloud sync.** The workspace is local-first. Cloud sync is deferred and its consent policy remains inactive.
- **No document upload or production malware scanning.** Scanning is deferred; uploaded identity documents are not part of the demo.
- **No automated CAPTCHA, OTP, Aadhaar/e-KYC, biometrics, legal declarations, payments or final submission.** Complete protected steps on the official department/provider portal.

## Privacy and safety

The current demo stores profile information, checklists and drafts in the browser. Browser storage is not the same as encrypted local storage. A separately exported backup can be password-encrypted; keep the password safe because JanaSetu cannot recover it. Do not enter Aadhaar numbers, bank-account numbers, OTPs, passwords or CAPTCHA answers into the general profile.

## Hackathon demo flow

1. Open the citizen workspace and select a supported language.
2. Use synthetic profile details only.
3. Review extracted profile facts before saving.
4. Run the preliminary scheme checklist and show the **Needs verification** status.
5. Prepare a local draft and show **Not submitted**.
6. Open the official source link without entering personal information.

The demo demonstrates discovery, preliminary screening, evidence-gap identification and application preparation—not official approval or government submission.

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
