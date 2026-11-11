-- Bind approvals to the exact structured eligibility rules and make reviewed versions immutable.
create or replace function private.enforce_scheme_version_integrity()
returns trigger
language plpgsql
security definer
set search_path=pg_catalog,public,private,pg_temp
as $body$
declare
  v_expected_hash text;
begin
  if TG_OP='UPDATE' and exists(
    select 1 from public.scheme_approvals a where a.scheme_version_id=OLD.id
  ) and row(
    NEW.scheme_id,NEW.version_number,NEW.source_id,NEW.source_url,
    NEW.source_published_at,NEW.effective_from,NEW.effective_to,NEW.content,NEW.rule_set
  ) is distinct from row(
    OLD.scheme_id,OLD.version_number,OLD.source_id,OLD.source_url,
    OLD.source_published_at,OLD.effective_from,OLD.effective_to,OLD.content,OLD.rule_set
  ) then
    raise exception 'scheme_version_immutable_after_review' using errcode='55000';
  end if;

  v_expected_hash:=encode(
    extensions.digest(
      convert_to(jsonb_build_object('content',NEW.content,'rule_set',NEW.rule_set)::text,'UTF8'),
      'sha256'
    ),
    'hex'
  );
  NEW.content_sha256:=v_expected_hash;
  return NEW;
end;
$body$;

revoke all on function private.enforce_scheme_version_integrity() from public,anon,authenticated,service_role;

drop trigger if exists scheme_versions_integrity_guard on public.scheme_versions;
create trigger scheme_versions_integrity_guard
before insert or update on public.scheme_versions
for each row execute function private.enforce_scheme_version_integrity();

-- Recompute unreviewed records under the content + rule-set hash.
update public.scheme_versions set content_sha256=content_sha256;

alter table public.scheme_versions
  drop constraint if exists scheme_versions_content_sha256_integrity_check;
alter table public.scheme_versions
  add constraint scheme_versions_content_sha256_integrity_check
  check (
    content_sha256=encode(
      extensions.digest(
        convert_to(jsonb_build_object('content',content,'rule_set',rule_set)::text,'UTF8'),
        'sha256'
      ),
      'hex'
    )
  );
