# JanaSetu private document scanner

Dedicated Python worker with a local ClamAV 1.4.6 daemon for the private `citizen-documents` bucket. It runs outside the Next.js/Vercel app. Files are never made public or sent to third-party scanning services.

## Flow
1. Citizen upload validates ownership, purpose-specific consent, MIME and size; object is quarantined.
2. A dedicated Supabase Auth scanner identity calls `claim_next_document_scan`. The database atomically claims one object, records the scanner identity and increments attempts.
3. Storage SELECT policy grants that scanner identity access only to quarantined/scanning/error objects. The separate owner-read predicate allows citizens to read only clean objects.
4. Worker verifies object path, exact size and file signature, downloads to memory, and streams bytes to the local ClamAV daemon using INSTREAM.
5. Worker records clean/rejected/scan_error, engine and SHA-256 content hash. Only clean objects are retrievable by their owner, and only while the exact document-storage consent and legal policy remain active.
6. Abandoned claims become retryable after 15 minutes. Transient scanner errors have a one-minute backoff. Each object is attempted at most five times; failures never become clean by default.

## Deployment
Build this directory as a private persistent Docker background worker. The image pins the official ClamAV 1.4.6 Debian 13 base image by digest; do not downgrade to the distribution's older ClamAV package. ClamAV's deployment guidance recommends 4 GB RAM, so the Render Blueprint uses the 2 CPU / 4 GB `2c-4g` plan rather than the previous 2 GB plan. The included Compose file mounts a persistent ClamAV signature volume, keeps the daemon bound to loopback, uses a read-only root filesystem, drops all Linux capabilities except the minimum startup capabilities (`CHOWN`, `SETUID`, `SETGID`), and exposes no scanner port. Do not deploy it as a request/response serverless function.

Required secrets in `.env`:
- `SUPABASE_URL`: dedicated JanaSetu Supabase project URL.
- `SUPABASE_ANON_KEY`: project publishable/anon key.
- `SCANNER_EMAIL` and `SCANNER_PASSWORD`: dedicated scanner Auth user credentials.

Do not use CareerOS, a service-role key, a citizen's account or a shared administrator identity.

## Activation checklist
1. Confirm the repository migration versions exactly match Supabase history. The scanner migrations already applied are `20261111125606_add_atomic_clamav_scan_claims.sql`, `20261111125926_harden_scanner_least_privilege.sql`, `20261111130024_backoff_scanner_retries.sql`, `20261111131254_enforce_document_consent_on_storage_reads.sql`, `20261111131521_bind_scanner_reads_to_claim_and_validate_attestations.sql`, `20261111133755_consent_aware_scanner_cleanup_and_citizen_document_deletion.sql`, and `20261111133809_complete_revoked_document_storage_cleanup.sql`. Follow-up hardening migrations `20261111161033_restore_scanner_cleanup_and_global_function_defaults.sql`, `20261111161048_restore_consent_and_review_invariants.sql` and `20261111161139_enable_private_schema_rls_defense_in_depth.sql` are also applied.
2. Create a dedicated scanner Auth user in JanaSetu.
3. A privileged operator assigns only that user `private.document_scanner_roles`; the public app cannot assign scanner roles.
4. Configure the four secrets in `.env`; keep the file out of Git.
5. Run `docker compose build` and `docker compose up -d`.
6. Test with a synthetic benign PDF/PNG/JPEG and the standard EICAR anti-malware test string in a controlled non-citizen object.
7. Verify citizens cannot read quarantined/rejected objects, the scanner cannot read clean objects unless separately claimed, and citizens can download clean objects only while consent is active.
8. Measure memory, throughput and queue age before scaling. ClamAV signature databases are memory-intensive; a 512 MiB free container is not assumed sufficient.

The Render `2c-4g` compute plan is currently listed at US$85/month and the 1 GB persistent disk at US$0.25/month, before taxes. Do not approve the Blueprint until the account owner has reviewed this recurring cost. The worker is not activated by this source change. No scanner identity, legal approval or worker host has been provisioned. Citizen uploads remain blocked until the document-storage policy is legally approved. Do not create real citizen document records during initial validation.


### Consent revocation and cleanup

The scanner claim RPC prioritises deletion-only jobs when the exact document-storage consent has expired or been revoked. These jobs return `cleanup_only: true`; the worker deletes the private Storage object without downloading or scanning it, then calls `complete_revoked_document_cleanup`. The database removes metadata only after the Storage object is absent. Cleanup leases expire and are safely retried. The worker never logs document contents or filenames.
