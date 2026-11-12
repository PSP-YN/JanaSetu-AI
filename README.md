# JanaSetu AI

**Understand what you may qualify for. Prepare what comes next.**

JanaSetu is an independent, multilingual public-benefits navigation and application-preparation platform. It helps citizens discover source-linked scheme information, review preliminary eligibility conditions, organise evidence and prepare application information while keeping official departments authoritative for eligibility and decisions.

- Public website: https://jana-setu-ai.vercel.app
- Citizen workspace: `/app`
- Privacy notice: `/privacy`
- Terms and limitations: `/terms`
- Repository: https://github.com/PSP-YN/JanaSetu-AI

> **Important:** JanaSetu is not a government service or eligibility authority. A preliminary assessment is not an eligibility decision. A prepared draft is not an application submission. Government portal automation is disabled unless a specific integration is formally authorized, independently reviewed, implemented and tested. Citizens remain responsible for protected verification and final submission.

## Current capability and release boundaries

- Multilingual citizen experience: English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- Scheme discovery and source-linked guidance, with separate labels for deterministic rule prototypes, catalogue-only records and third-party discovery data.
- Preliminary screening that treats unknown facts as unknown and directs citizens to official sources.
- Local application preparation, document checklists and versioned local backup/restore.
- Experimental browser form assistant: HTTPS `.gov.in` and `.nic.in` only; citizen previews and approves each suggested field. It does not upload documents or submit forms.
- Authenticated Supabase account and private citizen-workspace foundation.
- Client-side AES-256-GCM vault encryption and revision-aware sync API. Cloud sync is **fail-closed** until its exact consent policy has qualified privacy/legal approval and a citizen grants it.
- Scheme adapter registry and guarded automation queue. Current database records include four scheme integrations, all `not_requested`; no external government submission is enabled.

JanaSetu does not collect Aadhaar numbers, bank account numbers, OTPs, passwords or CAPTCHA answers as part of the general profile. Do not put these values into JanaSetu or upload identity documents unless a separately reviewed and lawful feature explicitly requires them.

## Cross-device encrypted workspace sync

See [Encrypted cross-device sync](docs/ENCRYPTED-CROSS-DEVICE-SYNC.md).

The browser encrypts the complete workspace before transmission using PBKDF2-SHA-256 (600,000 iterations) and AES-256-GCM. The server receives and stores only the encrypted envelope. The vault password is never sent to JanaSetu. A revision number prevents stale devices from silently overwriting newer data; a conflict requires restore and reconciliation.

Sync currently returns a consent-policy error because no active, legally reviewed cloud-sync policy exists. This is intentional. The code and database RPCs are implemented, but production use must wait for independent review and a citizen's opt-in. Keep a local encrypted export as a backup.

## Government application automation

See:
- [Portal adapter and integration access plan](docs/government-integration-access-plan.md)
- [Portal test matrix](docs/portal-test-matrix.md)
- [Scheme review workflow](docs/scheme-review-workflow.md)
- [Production readiness](docs/production-readiness.md)

There is no universal Indian government application API or common portal form. Each scheme may use a different department, portal, identity flow, CAPTCHA/OTP process, document requirements and submission receipt. JanaSetu therefore resolves automation per scheme and exact authorized portal. Unregistered, unapproved or untested schemes fall back to official manual navigation and preparation. It never guesses selectors or claims a submission without a verified receipt.

Final submission is enabled only when all of the following are true:
1. The scheme rules and source are independently reviewed and published.
2. The department has authorized the exact integration and actions.
3. The portal adapter matches the verified origin, route and form contract.
4. The citizen has granted the relevant purpose-specific consent.
5. The citizen has reviewed the exact values, files, declarations and destination.
6. The portal returns a verifiable receipt or reference after the citizen-approved action.

CAPTCHA, OTP, Aadhaar/e-KYC, biometric verification, legal declarations, payment and final submit remain citizen-controlled unless a department provides a lawful delegated API and expressly authorizes its use.

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

Do not put Supabase service-role or secret keys in `NEXT_PUBLIC_*` variables. Never commit `.env.local`.

## Architecture, operations and governance

- [Architecture](docs/architecture.md)
- [Target production architecture](docs/target-production-architecture.md)
- [Citizen data and automation policy](docs/citizen-data-and-automation-policy.md)
- [Security threat model](docs/security-threat-model.md)
- [Security assessment](docs/security-assessment.md)
- [Privacy impact assessment draft](docs/privacy-impact-assessment.md)
- [Source verification and freshness](docs/source-verification-and-freshness.md)
- [Scheme catalogue coverage](docs/scheme-catalogue-coverage.md)
- [Production operations runbook](docs/operations-runbook.md)
- [Release gate evidence](docs/release-gate-evidence.md)

## Contributing and governance

Read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md). All scheme data, policy changes and government integrations require review; CI passing does not constitute legal approval, government authorization or independent scheme verification.

## License

MIT. No government affiliation or endorsement is implied.
