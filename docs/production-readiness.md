# JanaSetu AI — production readiness and release gate

**Assessment date:** 12 November 2026  
**Release candidate:** [PR #26](https://github.com/PSP-YN/JanaSetu-AI/pull/26)  
**Release state:** NOT DEPLOYED TO PRODUCTION — protected release is waiting on CI and Vercel build availability.

## Deployment state

| Environment | URL | Commit | State |
|---|---|---|---|
| Production | https://jana-setu-ai.vercel.app | `3b54af4` on `main` | Existing deployment is READY but does not contain the current release candidate |
| Latest successful preview | https://janasetu-pok0k21pv-pspyn.vercel.app | `7ed3e5b` | READY; earlier preview only, not the latest branch commit |
| Release candidate | [PR #26](https://github.com/PSP-YN/JanaSetu-AI/pull/26) | `release/janasetu-demo-hardening` | Open; latest commit requires fresh validation |

The latest checked Vercel status is failing with the Hobby build-rate-limit response. The current release candidate cannot receive a new preview build or production build until Vercel permits another build. The previous successful preview is not being promoted as a substitute for the latest code.

The latest recorded GitHub Actions run for the release branch failed in the unit-test step: 142/144 tests passed. The two failures were stale assertions for the new migration's preservation comment and SQL predicate. Those assertions have since been corrected in commit `324f4960afade7b0c8f41aa95c8b789a2d3ad112`; a fresh complete CI run against the corrected head has not yet been confirmed. Do not describe CI as green until that run completes.

## Current release candidate capabilities

- Responsive multilingual citizen workspace in English, Hindi, Kannada, Tamil, Telugu and Malayalam.
- Source-linked scheme discovery, including 42 source-indexed discovery references and 96 Karnataka budget-line discovery leads. Discovery references and budget lines are not necessarily verified schemes or individual benefits.
- Local profile intake and citizen-reviewed suggested field extraction.
- Preliminary checklists for four prototype scheme pathways. Pending schemes remain `needs_verification`; no official eligibility decision or rejection is produced.
- Local application preparation, evidence checklist and official-portal handoff. Drafts remain explicitly **Not submitted**.
- Browser-local workspace storage and password-encrypted local backup/restore.
- Experimental browser form assistant that previews proposed field values for citizen approval on supported official domains. It does not upload documents or submit applications.

## Explicitly excluded from this release

### Cross-device sync
Cloud sync is not part of the release. The citizen workspace UI/status controls are removed, and the cloud-sync policy remains inactive. The API/migration work is deferred. Do not activate the policy or claim two-device synchronization.

A forward migration was added to preserve profile fields, preferred language, drafts, document references, reminders and assessments if encrypted sync is reconsidered later. Legacy workspace data blocks initial cutover; subsequent vault writes merge only the encrypted-vault key and do not clear the other workspace fields.

### Document scanning
Production document upload and malware scanning are deferred. The private scanner protocol and ClamAV container are testable, but no persistent production scanner identity/worker is provisioned. No live scanning capability is claimed.

### Government portal automation and scheme approval
There is no universal Indian government application API or common portal workflow. The four seeded integration records remain `not_requested`, with no authorized actions or department authorization references. No scheme rule set has independent publication approval. Portal automation is limited to citizen-controlled field assistance; no government submission action is enabled.

CAPTCHA, OTP, Aadhaar/e-KYC, biometrics, declarations, payment and final submission remain on official department/provider portals under citizen control unless a department explicitly authorizes a lawful delegated API.

## External release gates

1. **CI:** obtain a complete passing GitHub Actions run on the latest PR #26 head, including unit tests, typecheck, production build, browser/accessibility tests, extension validation, dependency audit and production smoke.
2. **Vercel:** wait for the Hobby build-rate limit to reset. Obtain a successful required Vercel status for the latest commit. Do not bypass branch protection or promote an older preview. Merge PR #26 to protected `main` only after required checks pass.
3. **Production:** deploy the merged `main` commit, then verify the live domain, workspace routes, six language routes, manifest, authentication boundary and critical APIs.
4. **Scheme governance:** independently review official source evidence and rule sets before publishing eligibility decisions.
5. **Government integrations:** obtain written department/provider authorization and portal-specific acceptance evidence for each exact integration before enabling external actions.
6. **Authentication operations:** verify production email confirmation, SMTP, redirect allow-list and password recovery with a controlled test account.
7. **Operational assurance:** complete independent security review, backup/restore and disaster-recovery exercises, monitoring and measured load testing.

## Release decision

The previous preview passed route and synthetic-workflow smoke checks, but it is not the latest branch commit. The production domain still serves the older `main` commit. PR #26 must pass CI and the required Vercel status before merge and production deployment.

The release can be presented as a **multilingual, local-first benefits discovery and application-preparation prototype with preliminary, non-authoritative scheme checklists**. Do not present universal government automation, approved eligibility decisions, live cross-device sync, document scanning or submitted applications as current capabilities.
