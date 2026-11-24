# JanaSetu load-test plan

**Status:** script prepared; no capacity test has been executed.  
**Target:** isolated staging deployment backed by a production-like Supabase project and synthetic data only.

## Run

Install k6, deploy the current release to staging, then run:

```bash
k6 run -e BASE_URL=https://<staging-host> -e ALLOW_STAGING_LOAD_TEST=true scripts/load/janasetu-public.js
```

The script refuses the canonical production hostname unless `ALLOW_PRODUCTION_LOAD_TEST=true` is explicitly set. Do not set that flag without an approved maintenance window and a rollback contact.

## Current scenario

- 2-minute ramp to 10 virtual users.
- 3-minute ramp to 25 virtual users.
- 5-minute ramp to 50 virtual users.
- 5-minute ramp to 100 virtual users.
- 3-minute ramp down.
- Requests cover liveness, public scheme catalogue and public catalogue search. They do not create or mutate citizen data.

## Initial acceptance thresholds

- Failed requests below 0.5%.
- p95 request latency below 750 ms and p99 below 1.5 s for the public read endpoints.
- No unhandled function exceptions, memory exhaustion, deployment restarts or data leakage.
- Readiness remains healthy; check `/api/ready` separately at low frequency to avoid turning a load test into a database health-check storm.
- Vercel function usage, Supabase CPU/memory, database connections and egress remain within the subscribed plan's limits.

## Required staged scenarios before public launch

1. Add authenticated synthetic users and test profile, consent, application-preparation and reminder RPCs with two-user isolation assertions.
2. Ramp to 200, 500 and the forecast peak concurrency only after upgrading the database to an always-on production tier and agreeing on a spend cap.
3. Test queue backlog, retry/idempotency, worker restarts and scanner backpressure with synthetic documents after scanner consent and deployment gates are approved.
4. Test rate-limit behavior from multiple source IPs and shared-NAT cohorts. The production anonymous POST rule is 120 requests/IP/minute; do not use a single-IP load generator to infer multi-user capacity.
5. Run a 30-minute soak test and a controlled dependency outage/recovery test.

A passing public-read test does not certify authenticated workflows, document scanning, government adapters, database failover or the capacity of the subscribed plan. Record p50/p95/p99, error rate, Vercel invocation/CPU usage, Supabase CPU/memory/connections, egress, queue depth and the exact commit for every run.
