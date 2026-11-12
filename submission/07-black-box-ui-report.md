# 7. Black-box UI acceptance report

## Test method
A live browser agent exercised the hosted Vercel preview through the rendered UI using synthetic citizen data only. No account was created, no real personal information was entered, no file was uploaded and no government portal was opened or submitted to.

Test runs:
- General UI acceptance: https://agent.tinyfish.ai/runs/7299141f-791c-4724-b5b7-9a57e1ae4f08
- Focused scheme-state and draft-boundary follow-up: https://agent.tinyfish.ai/runs/8ac1779a-7484-47e2-9d47-64ebed956518

Tested preview: https://janasetu-8qlb5584m-pspyn.vercel.app

## Results observed
- Landing page and internal routes rendered: /, /app, /auth, /privacy, /terms, /schemes and /app/automation.
- All six language routes were reachable.
- Synthetic profile data was accepted and the benefit-assessment workflow ran.
- The execution trace exposed five workflow steps.
- The UI displayed four built-in rule-prototype records and 4,693 third-party open-data rows.
- The open-data rows were explicitly discovery-only; they were not eligibility-scored.
- The application workspace and public scheme directory correctly reported zero independently approved/published schemes.
- Attempting to prepare an application for a pending scheme reached the application-creation lock. No government submission occurred.
- No visible technical errors or broken page renders were reported.
- Desktop viewport was inspected at 1366×900. Mobile 390×844 could not be set by the browser agent and remains unverified by this particular black-box run.

## Defect found and code correction
The assessment cards used the label “Rule-screened · source linked” and the benefit label “Published benefit” even while all four rule prototypes were pending independent approval. This was misleading even though the engine itself returned a pending-review state and the application-creation gate blocked the next step.

Corrected in commit e66314cd2be48d045e4bac10bd23cd61a6cb3d31:
- Reworded cards as rule prototypes with independent review pending.
- Reworded benefits as indicative and requiring department verification.
- Corrected catalogue metrics to count pending review accurately.
- Reworded the unpersonalized assessment notice to state that four rule prototypes are not eligibility decisions.
- Changed the pending-scheme action to “Prepare local checklist” and added an explicit note that this is local preparation only, not an application case.
- Added a localized status note to every preparation record stating it is not an eligibility decision or submitted application.

## Final hosted verification — 12 November 2026
Exact preview: https://janasetu-6r56lvi89-pspyn.vercel.app
Exact commit: e66314cd2be48d045e4bac10bd23cd61a6cb3d31
Black-box run: https://agent.tinyfish.ai/runs/a4a89586-d618-464d-bbee-3f04c2e9795c

The final black-box run passed the profile/assessment, corrected rule and benefit labels, review-pending explanation, local checklist, Not submitted badge, scheme approval warning, non-eligibility disclaimer, automation lock and all seven public/workspace routes. No visible console or network errors were reported. The external browser could not set a mobile viewport; the local Playwright suite passed the 390×844 mobile citizen journey and mobile navigation/viewport checks.

Local verification for the same commit: 131/131 unit tests, 49/49 Playwright tests, TypeScript and production build passed. The application-preparation E2E verifies the local checklist, Not submitted status, review-pending status and submission disclaimer.

## Remaining verification
- Merge the reviewed implementation PR only after required repository checks/approvals are satisfied.
- Promote through the protected main-branch production flow and verify the production domain.
- Keep cloud sync, cloud document storage and government integrations disabled until their separate legal, scanner and department gates are satisfied.
- Keep public application creation disabled until independently approved scheme versions exist.
