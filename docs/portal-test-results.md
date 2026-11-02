# Synthetic extension compatibility test results

The Playwright suite uses local synthetic HTML and synthetic citizen data only. It does not contact government portals, use real accounts or submit forms.

Cases added:
- Applicant name, age and district fields.
- State select and gender radio controls.
- Ambiguous duplicate labels skipped.
- Aadhaar, OTP, password, hidden, disabled and consent fields untouched.
- React-style controlled input receives input/change events.
- Unknown labels remain unchanged.

The suite is included in `npm run test:e2e`. It is marked **awaiting CI execution** until a CI run after the fixture commit passes.

Passing synthetic fixtures validates only those DOM structures. It does not validate named live portals, authentication, dynamic workflows, custom widgets, iframes, shadow DOM or portal-specific legal requirements. Obtain written portal-owner authorization and a dedicated test environment before testing any live portal.
