# JanaSetu private document scanner

Dedicated ClamAV worker for the private `citizen-documents` bucket. It runs outside the Next.js/Vercel app. Files are never made public or sent to third-party scanning services.

## Flow
1. Citizen upload validates ownership, purpose-specific consent, MIME and size; object is quarantined.
2. A dedicated Supabase Auth scanner identity atomically claims one object. The database records scanner identity and increments attempts.
3. Storage SELECT policy grants that scanner identity access only to quarantined/scanning/error objects. Citizens can read only clean objects.
4. Worker verifies object path, exact size and file signature, downloads to a private temporary directory, then runs ClamAV with size and recursion limits.
5. Worker records clean/rejected/scan_error, engine and content hash. Only clean objects are retrievable by their owner, and only while document-storage consent remains active.
6. Crashed claims can be retried after 15 minutes; each object is attempted at most five times.

## Deployment
Build this directory as a private persistent Docker background worker. Do not deploy it as a request/response serverless function.

Required secrets:
- `SUPABASE_URL`: dedicated JanaSetu Supabase project URL.
- `SUPABASE_ANON_KEY`: project publishable/anon key.
- `SCANNER_EMAIL` and `SCANNER_PASSWORD`: dedicated scanner Auth user credentials.

Do not use CareerOS, a service-role key, a citizen's account or a shared administrator identity.

Before enabling:
1. Apply migration `20261111101500_add_atomic_clamav_scan_claims.sql`.
2. Create a dedicated scanner Auth user in JanaSetu.
3. Privileged operator assigns only that user `private.document_scanner_roles`; the public app cannot assign roles.
4. Configure the four secrets on the private worker host and deploy one worker.
5. Test with a synthetic benign PDF/PNG/JPEG and the standard EICAR anti-malware test string in a controlled non-citizen object.
6. Verify quarantined/rejected objects cannot be read by citizens; clean objects are downloadable only while consent is active.
7. Measure memory, throughput and queue age before scaling. ClamAV signature databases are memory-intensive; a 512 MiB free container is not assumed sufficient.

The worker is not activated by this source change. No scanner identity, legal approval or worker host has been provisioned. Citizen uploads remain blocked until the document-storage policy is legally approved. Do not create real citizen document records during initial validation.
