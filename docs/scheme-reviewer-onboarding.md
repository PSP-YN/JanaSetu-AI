# JanaSetu scheme reviewer onboarding

**Status: Workflow implemented; no reviewer roles are assigned.**

The database currently contains four scheme versions with `source_checked` / `review_pending` status. No approval rows exist. Scheme review and publication are intentionally unavailable until trusted people are assigned.

## Required independent roles

For each version to be published:
- Two distinct users with `source_reviewer` must approve `source_accuracy`.
- Two distinct users with `rules_reviewer` must approve `eligibility_rule_accuracy`.
- One user with `legal_reviewer` must approve `legal_review`.
- A separate user with `scheme_publisher` must publish the version.

The same reviewer cannot submit more than one review category for the same version. A publisher cannot be one of that version's reviewers. A rejected or changes-requested version becomes stale and must be corrected as a new version before a new review cycle.

## Onboarding steps

1. Each reviewer creates their own JanaSetu account using the normal sign-up flow.
2. Confirm their identity and authority outside the application.
3. Retrieve the exact `auth.users.id` for each approved account through the Supabase SQL editor. Do not copy passwords, access tokens or refresh tokens.
4. Have an authorized project administrator assign only the required roles.
5. Give reviewers the `/app/review` URL and the review packet in `docs/scheme-review-packets/2026-11-09-official-source-refresh.md`.
6. Require evidence-based notes (minimum 20 characters) for every decision.
7. Keep the publisher separate from all reviewers.

## Role assignment SQL template

Run in the Supabase SQL editor only after the reviewer accounts exist and their identities have been verified. Replace every placeholder. The `assigned_by` value must be the authenticated administrator's actual `auth.users.id`.

```sql
insert into private.scheme_reviewer_roles(user_id, role, assigned_by)
values
  ('<SOURCE_REVIEWER_1_USER_UUID>', 'source_reviewer', '<ADMIN_USER_UUID>'),
  ('<SOURCE_REVIEWER_2_USER_UUID>', 'source_reviewer', '<ADMIN_USER_UUID>'),
  ('<RULES_REVIEWER_1_USER_UUID>', 'rules_reviewer', '<ADMIN_USER_UUID>'),
  ('<RULES_REVIEWER_2_USER_UUID>', 'rules_reviewer', '<ADMIN_USER_UUID>'),
  ('<LEGAL_REVIEWER_USER_UUID>', 'legal_reviewer', '<ADMIN_USER_UUID>'),
  ('<PUBLISHER_USER_UUID>', 'scheme_publisher', '<ADMIN_USER_UUID>');
```

Do not run this template with placeholders. Use real user UUIDs only after identity verification. The role table is in the private schema and has no client Data API access.

## Review workflow

1. Authorized reviewer opens `/app/review`.
2. Reviewer inspects the immutable content hash, official source, source revision, rule set and existing approvals.
3. Reviewer selects their assigned review category, decision and evidence-based notes.
4. The database records the review under the authenticated user ID.
5. Once two distinct source approvals, two distinct eligibility-rule approvals and one legal approval exist, the version becomes `independently_approved`.
6. A separate publisher may publish the exact version.
7. Application-case creation checks the published version and all required approvals again; it also requires a separate citizen profile-storage consent.

No roles have been assigned and no scheme has been published.
