-- Defense in depth: private tables are never accessed directly through the Data API.
-- SECURITY DEFINER routines owned by the database owner retain their audited access.
alter table private.application_preparations enable row level security;
alter table private.citizen_documents enable row level security;
alter table private.consent_policy_versions enable row level security;
alter table private.document_scanner_roles enable row level security;
alter table private.scheme_reviewer_roles enable row level security;
