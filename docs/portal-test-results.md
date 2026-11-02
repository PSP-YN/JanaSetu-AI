# Synthetic extension compatibility test results

## Execution result

**CI run 188: passed**

GitHub Actions run: https://github.com/PSP-YN/JanaSetu-AI/actions/runs/41477782192

The following local Playwright fixtures executed successfully using synthetic citizen data and local HTML. No real portal, account or citizen record was used.

- Basic labelled applicant name, age and district fields.
- State select and gender radio controls.
- Duplicate applicant labels skipped as ambiguous.
- Aadhaar, OTP, password, hidden, disabled and consent fields left untouched.
- React-style controlled input receives input/change events.
- Unknown portal labels remain unchanged.
- Additional extension safety and select mapping checks in the browser regression suite.

## Limitations

This is evidence for the tested synthetic DOM structures only. It does not validate any named live government portal, authentication, dynamic multi-step workflows, custom widgets, iframes, shadow DOM, browser-specific portal scripts or portal-specific legal requirements. Obtain written authorization and a dedicated test environment from each portal owner before attempting live portal tests.

The extension remains experimental and must not be represented as certified for any government portal.
