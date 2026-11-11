# Technical architecture and workflow

## Stack
- Next.js App Router, React and TypeScript.
- Dedicated Supabase Postgres/Auth/private-storage foundation in Mumbai (ap-south-1).
- Postgres RLS and least-privilege grants.
- Supabase pgmq durable queue and pg_cron scheduling for consent-gated internal tasks.
- Vercel hosting and preview deployments.
- Playwright and axe-core browser/accessibility checks.

## Citizen workflow
Profile → Scheme discovery → Preliminary assessment → Evidence gaps → Draft preparation → Citizen review → Follow-up.

A positive preliminary screen is not an official eligibility decision. Draft preparation does not submit an application.

## Trust boundaries
- Browser-local profile, assessment, reminders and draft records are available in local-first mode. Browser local storage is not encrypted storage; exported backups contain personal data.
- Supabase account routes and workspace sync exist, but cloud synchronization remains disabled until a legally approved purpose-specific consent policy is active and account lifecycle is verified.
- Private document bucket and ClamAV worker code exist, but no scanner identity or persistent scanner host is provisioned. Uploads/downloads remain fail-closed.
- Scheme versions require independent source, eligibility-rule and legal review, followed by publication by a separate publisher.
- A public portal URL is not evidence that automated access or submission is permitted.

## Automation boundary
Internal workflow automation is designed for approved-scheme checklist preparation and in-app reminder scheduling. Requests are idempotent and remain awaiting confirmation until the exact run is confirmed. External government actions are rejected until an authorized scheme-specific adapter exists. OTP, CAPTCHA, identity proofing, eSign, payments and final declarations remain citizen-controlled unless an authority explicitly provides a lawful delegated API.

## Security controls implemented
- RLS enabled on all 14 public tables in the connected database.
- Private preparation, consent, reviewer and scanner tables are not directly exposed through the Data API.
- Purpose-specific consent and revocation are enforced through guarded routines.
- Session tokens are designed for HttpOnly cookies; API routes verify the Supabase session.
- No service-role key is intended for browser exposure.
- Private document storage and scanner routes fail closed until prerequisites are satisfied.

These are implementation facts, not independent security certification.

## Scaling
The system has not been load-tested for high concurrency. Do not represent it as supporting millions of concurrent users. Capacity requires measured workload targets, appropriate infrastructure, connection pooling, caching, queue controls, rate limits, observability, load tests and disaster recovery.
