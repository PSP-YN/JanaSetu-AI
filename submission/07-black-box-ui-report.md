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

Corrected in commit e59dddad0810548367981a658ff5c36eb0cbf9d3:
- Reworded cards as rule prototypes with independent review pending.
- Reworded benefits as indicative and requiring department verification.
- Corrected catalogue metrics to count pending review accurately.
- Reworded the unpersonalized assessment notice to state that four rule prototypes are not eligibility decisions.
- Changed the pending-scheme action to “Prepare local checklist” and added an explicit note that this is local preparation only, not an application case.

The correction requires a fresh CI pass and deployment before it can be considered verified in the hosted UI.

## Remaining verification
- Re-run CI on the latest commit.
- Deploy the exact latest commit to a fresh Vercel preview and repeat the black-box test.
- Verify the local checklist appears with “Not submitted” and the scheme-review-pending status.
- Verify mobile layouts at 320, 360, 390, 430, 768, 1024 and 1366 CSS-pixel widths.
- Keep public application creation disabled until independently approved scheme versions exist.
