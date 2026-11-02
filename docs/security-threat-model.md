# JanaSetu security threat model (initial)

**Status: preliminary engineering model; not an independent security assessment.**

## Assets and trust boundaries

- Citizen profile, assessments, draft application fields and document metadata in browser local storage.
- JSON backup files and imported extension profile.
- Server request bodies for intake parsing, assessment and draft generation.
- Scheme catalogue and rule definitions.
- Browser extension content execution on active tabs.
- External speech-recognition provider and government portals.

## Threats and required controls

| Threat | Attack path / impact | Required control and verification |
|---|---|---|
| XSS | Untrusted scheme/source text or user input executes in application origin and reads local profile | React escaping; no unsafe HTML; CSP; dependency review; stored/reflected XSS tests |
| CSRF / cross-origin abuse | Third-party site triggers state-changing requests | No state-changing unauthenticated endpoints; origin/CSRF protections if sessions are introduced; cross-origin API tests |
| Injection | Malformed input reaches parsers or data access | Runtime schemas, length bounds, safe parsing, malformed and boundary tests |
| SSRF | User-controlled URL causes server-side fetch to internal resources | Do not fetch arbitrary user URLs; strict allowlist and redirect/IP validation for any future fetch |
| Data leakage | Profile fields appear in logs, errors, analytics or third-party speech processing | Redaction, no body logging, explicit speech disclosure, inspect production telemetry |
| Extension abuse | Malicious page tricks extension into filling sensitive fields | Explicit user gesture; HTTPS government host restriction; never fill credentials, OTP/CAPTCHA, identity/bank numbers or files; no submit; fixture-based portal tests |
| Supply-chain compromise | Vulnerable or compromised package/build action | Lockfile, pinned CI actions, audit, secret scanning, update policy and provenance |
| Resource exhaustion | Oversized or repeated API requests | Request-size limits, schema limits, rate limits, timeouts and abuse tests |
| Stale/incorrect scheme rules | Old or misread rules cause harmful eligibility guidance | Two-person review, versioned sources, unknown state, stale suppression and regression fixtures |
| Local-device exposure | Shared browser profile or malware reads localStorage/backups | Warn users about shared devices; minimize fields; clear/export controls; do not represent localStorage as encrypted |

## Minimum test scope

- Inventory every route, method, request schema, data sink and outbound network call.
- Test unauthenticated access, malformed JSON, oversized bodies, repeated requests, origin manipulation, error leakage and unknown scheme IDs.
- Test all user-controlled text paths for HTML/script injection.
- Inspect browser storage and network requests with synthetic data.
- Inspect extension permissions and test hostile pages, iframes, shadow DOM, dynamically inserted fields and misleading labels.
- Verify security headers against the deployed response, not only configuration.
- Run independent penetration testing on staging and retest every finding.

## Known gaps

This threat model has not been independently reviewed. The application has no independent penetration-test report. Existing CI checks are not a substitute for manual security testing, runtime configuration review or incident-response exercises. Do not enter real citizen data.
