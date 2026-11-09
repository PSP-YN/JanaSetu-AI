# JanaSetu AI — target production architecture

## Architecture decision
The current Next.js application remains the public web edge and citizen experience. Citizen identity, durable records, consent, workflow state and private documents move to a managed PostgreSQL/Auth/Storage backend. Scheme ingestion and review remain a separate trusted publishing pipeline. Government portals are external systems and are never treated as if they expose a universal submission API.

### Target topology

```mermaid
flowchart TD
  C[Citizen browser / mobile web] --> E[CDN + WAF + rate limits]
  E --> N[Next.js stateless web/API on Vercel]
  N --> A[Supabase Auth]
  N --> P[(Postgres: profiles, cases, consent, reminders)]
  N --> S[Private object storage]
  N --> Q[Transactional automation outbox]
  Q --> W[Worker / scheduled job runner]
  W --> O[Authorised portal adapters]
  W --> M[Email / push / SMS providers]
  W --> L[Append-only audit events]
  R[Official source registry + human review] --> V[Versioned scheme catalogue]
  V --> P
  G[Government portals] <--> O
```

## Data boundaries
- Browser: ephemeral UI state only. The current application still persists profiles, drafts, reminders and document metadata in localStorage; this is a known pre-backend limitation, not durable or cross-device storage.
- Auth: Supabase Auth; user IDs are the ownership key. Authorization must be checked server-side on every record and action.
- Database: Postgres with RLS on every exposed table. Citizens may read only their own records and published scheme versions. Sensitive writes and workflow transitions are server-mediated.
- Files: private object bucket, random object keys, 12 MiB hard limit and MIME allowlist. Uploads remain disabled until a malware/content scanning pipeline and retention/deletion controls are operational. Never request Aadhaar, bank credentials, OTPs or passwords.
- Scheme catalogue: immutable versions, source provenance, freshness, content checksum and independent source/rule approvals. Budget allocations and third-party machine-parsed discovery records cannot be promoted to eligibility rules without evidence and review.
- Automation: transactional intent/outbox, idempotency keys, explicit purpose consent, per-action confirmation, short-lived authorization and a human-readable result. Never claim a portal submission succeeded without a verified receipt from that portal.
- Audit: record action type, actor, request ID, timestamp and non-sensitive metadata. Do not log profile values, document contents, access tokens, OTPs or full request bodies.

## Approval model
1. Citizen selects a scheme and sees the source, last-checked date, unknown conditions, missing information and likely next steps.
2. Citizen reviews the exact data to be used and grants purpose-specific consent.
3. JanaSetu prepares a draft; this is not a submission.
4. If an authorised portal adapter exists, show the destination domain, fields, files, legal declarations and any fee before action.
5. Ask for an explicit, time-bounded confirmation immediately before the consequential action. OTPs, CAPTCHA, identity proofing, declarations, payment and final submit remain citizen-controlled unless the portal provides a lawful delegated API and its terms expressly permit the integration.
6. Verify an external receipt/reference number and status. If verification is unavailable, label the outcome unverified and direct the citizen to the official portal.
7. Provide a revocation path and audit history.

## Capacity and scaling
The current Vercel + localStorage prototype is not engineered or load-tested for millions of concurrent users. A free-tier deployment cannot responsibly guarantee that capacity. The architecture is designed to scale horizontally, but actual capacity depends on provisioned database compute, connection pooling, storage, queue throughput, provider quotas, regional distribution and measured traffic.

Before making a million-user claim:
- Define workload targets (registered users, peak requests/second, concurrent sessions, read/write ratio, p95/p99 latency and availability objective).
- Keep Next.js handlers stateless; cache only public/versioned scheme data at the CDN.
- Use database connection pooling, bounded query timeouts, indexes and cursor pagination. Avoid per-request full-catalogue scans.
- Move long-running jobs to a durable queue with retries, dead-letter handling, idempotency and per-user quotas.
- Rate-limit by account, IP and action; protect expensive search/AI/portal adapters.
- Run realistic k6/Artillery tests with synthetic accounts and no production PII; test database saturation and recovery.
- Add observability for request latency, error rates, queue lag, database pool pressure, storage errors and external provider failures.
- Provision paid capacity only after measured need and a budget approval. Do not advertise a free-tier service as supporting millions of simultaneous users.

## Free-tier policy
Use free plans for development and a controlled pilot only. Do not promise a free production service at million-user scale. The currently connected Supabase account exposes one existing project named CareerOS, not a JanaSetu database. Do not reuse another product's database. Create a dedicated JanaSetu project only after the owner selects the organization and the quoted plan/cost is clear.

## Migration status
- Initial citizen-data schema drafted in `supabase/migrations/20261109122654_create_citizen_data_foundation.sql`.
- Includes profiles, source registry, immutable scheme versions, reviewer approvals, application cases/events, document metadata, purpose consents, reminders, automation runs and audit events.
- RLS is enabled on every public table. Citizen writes to cases, document metadata, automation and audit are server-mediated. Storage is private; browser uploads are intentionally not enabled before scanning exists.
- This migration has **not** been applied to a remote database. SQL execution, RLS tests, Auth integration, Storage policies and Supabase security/performance advisors remain release gates.

## Immediate implementation sequence
1. Create the dedicated JanaSetu backend project in the owner-selected organization.
2. Apply migration and test RLS using two unrelated test users plus anon/service contexts.
3. Add Supabase SSR Auth, email verification, recovery, session rotation and account deletion.
4. Replace localStorage as source of truth with authenticated server persistence; retain explicit encrypted export/import for user portability.
5. Add consent ledger, append-only case events, idempotent automation outbox and reminder scheduler.
6. Add safe private file upload, scanning/quarantine, retention and deletion workflow.
7. Add independently reviewed scheme publication and freshness workflows.
8. Add only permitted portal integrations, with confirmation gates and receipt verification.
9. Run security, privacy, accessibility, disaster-recovery and load tests before expanding public access.
