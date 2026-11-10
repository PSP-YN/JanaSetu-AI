create table if not exists private.application_preparations (
  case_id uuid primary key references public.application_cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scheme_version_id uuid not null references public.scheme_versions(id) on delete restrict,
  prepared_fields jsonb not null check (jsonb_typeof(prepared_fields)='array'),
  required_documents jsonb not null default '[]'::jsonb check (jsonb_typeof(required_documents)='array'),
  status text not null default 'awaiting_citizen_review' check (status in ('awaiting_citizen_review','citizen_approved')),
  citizen_approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
revoke all on private.application_preparations from public,anon,authenticated,service_role;

create or replace function private.save_application_preparation(p_case_id uuid,p_fields jsonb,p_documents jsonb)
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_case public.application_cases%rowtype; v_version public.scheme_versions%rowtype; v_count integer;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  if p_fields is null or jsonb_typeof(p_fields)<>'array' or jsonb_array_length(p_fields)>100
     or octet_length(p_fields::text)>32768
     or p_documents is null or jsonb_typeof(p_documents)<>'array' or jsonb_array_length(p_documents)>100
     or octet_length(p_documents::text)>8192 then raise exception 'invalid_preparation_payload'; end if;
  if exists(
    select 1 from jsonb_array_elements(p_fields) f
    where jsonb_typeof(f)<>'object'
      or f->>'source' is distinct from 'citizen_profile'
      or f->>'requiresCitizenConfirmation' is distinct from 'true'
      or f->>'status' not in ('provided','missing')
      or f->>'key' ~* '(aadhaar|aadhar|bank|account_number|ifsc|otp|password|biometric|pin)'
      or jsonb_typeof(f->'value') not in ('string','number','boolean','null')
  ) then raise exception 'unsafe_preparation_field'; end if;
  if exists(select 1 from jsonb_array_elements(p_documents) d where jsonb_typeof(d)<>'string' or length(trim(d#>>'{}'))=0 or length(d#>>'{}')>240) then
    raise exception 'invalid_document_checklist';
  end if;
  select * into v_case from public.application_cases where id=p_case_id and user_id=v_user for update;
  if not found or v_case.status in ('closed','cancelled','submitted_externally','decision_received') then raise exception 'case_not_available'; end if;
  select sv.* into v_version
  from public.scheme_versions sv join public.schemes s on s.id=sv.scheme_id
  where sv.id=v_case.scheme_version_id and sv.verification_status='independently_approved'
    and s.publication_status='published' and s.current_version_id=sv.id
    and (sv.effective_from is null or sv.effective_from<=current_date)
    and (sv.effective_to is null or sv.effective_to>=current_date);
  if not found then raise exception 'scheme_not_published_or_approved'; end if;
  select count(distinct reviewer_id) into v_count from public.scheme_approvals
    where scheme_version_id=v_version.id and approval_type='source_accuracy' and decision='approved';
  if v_count<2 then raise exception 'scheme_not_published_or_approved'; end if;
  select count(distinct reviewer_id) into v_count from public.scheme_approvals
    where scheme_version_id=v_version.id and approval_type='eligibility_rule_accuracy' and decision='approved';
  if v_count<2 then raise exception 'scheme_not_published_or_approved'; end if;
  select count(distinct reviewer_id) into v_count from public.scheme_approvals
    where scheme_version_id=v_version.id and approval_type='legal_review' and decision='approved';
  if v_count<1 or exists(select 1 from public.scheme_approvals where scheme_version_id=v_version.id and decision in ('rejected','changes_requested')) then
    raise exception 'scheme_not_published_or_approved';
  end if;
  if not exists(
    select 1 from public.citizen_consents c
    join private.consent_policy_versions p on p.purpose=c.purpose and p.version=c.policy_version
      and p.active=true and p.approved_at is not null and p.legal_review_reference is not null
    where c.user_id=v_user and c.case_id is null and c.purpose='profile_storage'
      and c.granted=true and c.revoked_at is null and c.captured_at>now()-interval '365 days'
      and c.scope->>'action_type'='create_application_case'
      and c.scope->>'scheme_version_id'=v_version.id::text
  ) then raise exception 'profile_storage_consent_required' using errcode='42501'; end if;
  if exists(select 1 from private.application_preparations where case_id=p_case_id and status='citizen_approved') then
    raise exception 'preparation_already_approved';
  end if;
  insert into private.application_preparations(case_id,user_id,scheme_version_id,prepared_fields,required_documents,status,citizen_approved_at,updated_at)
  values(p_case_id,v_user,v_version.id,p_fields,p_documents,'awaiting_citizen_review',null,now())
  on conflict(case_id) do update set prepared_fields=excluded.prepared_fields,required_documents=excluded.required_documents,
    status='awaiting_citizen_review',citizen_approved_at=null,updated_at=now()
  where private.application_preparations.user_id=v_user and private.application_preparations.status='awaiting_citizen_review';
  insert into public.application_events(case_id,actor_id,event_type,details)
  values(p_case_id,v_user,'application_prepared',jsonb_build_object('field_count',jsonb_array_length(p_fields),'document_count',jsonb_array_length(p_documents),'submission_status','not_submitted'));
  return jsonb_build_object('case_id',p_case_id,'status','awaiting_citizen_review','field_count',jsonb_array_length(p_fields));
end;
$$;

create or replace function private.get_application_preparation(p_case_id uuid)
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_result jsonb;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select jsonb_build_object('case_id',p.case_id,'status',p.status,'fields',p.prepared_fields,
    'documents',p.required_documents,'citizen_approved_at',p.citizen_approved_at,'updated_at',p.updated_at)
  into v_result from private.application_preparations p
  where p.case_id=p_case_id and p.user_id=v_user;
  if v_result is null then raise exception 'preparation_not_found' using errcode='P0002'; end if;
  return v_result;
end;
$$;

create or replace function private.confirm_application_preparation(p_case_id uuid)
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_p private.application_preparations%rowtype;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select * into v_p from private.application_preparations where case_id=p_case_id and user_id=v_user for update;
  if not found or v_p.status<>'awaiting_citizen_review' then raise exception 'preparation_not_confirmable'; end if;
  if not exists(
    select 1 from public.citizen_consents c
    join private.consent_policy_versions p on p.purpose=c.purpose and p.version=c.policy_version
      and p.active=true and p.approved_at is not null and p.legal_review_reference is not null
    where c.user_id=v_user and c.case_id is null and c.purpose='profile_storage'
      and c.granted=true and c.revoked_at is null and c.captured_at>now()-interval '365 days'
      and c.scope->>'action_type'='create_application_case'
      and c.scope->>'scheme_version_id'=v_p.scheme_version_id::text
  ) then raise exception 'profile_storage_consent_required' using errcode='42501'; end if;
  update private.application_preparations set status='citizen_approved',citizen_approved_at=now(),updated_at=now() where case_id=p_case_id;
  insert into public.application_events(case_id,actor_id,event_type,details)
  values(p_case_id,v_user,'application_preparation_approved',jsonb_build_object('submission_status','not_submitted'));
  return jsonb_build_object('case_id',p_case_id,'status','citizen_approved','submission_status','not_submitted');
end;
$$;

revoke all on function private.save_application_preparation(uuid,jsonb,jsonb) from public,anon,service_role;
revoke all on function private.get_application_preparation(uuid) from public,anon,service_role;
revoke all on function private.confirm_application_preparation(uuid) from public,anon,service_role;
grant execute on function private.save_application_preparation(uuid,jsonb,jsonb) to authenticated;
grant execute on function private.get_application_preparation(uuid) to authenticated;
grant execute on function private.confirm_application_preparation(uuid) to authenticated;

create or replace function public.save_application_preparation(p_case_id uuid,p_fields jsonb,p_documents jsonb)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.save_application_preparation(p_case_id,p_fields,p_documents) $$;
create or replace function public.get_application_preparation(p_case_id uuid)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.get_application_preparation(p_case_id) $$;
create or replace function public.confirm_application_preparation(p_case_id uuid)
returns jsonb language sql security invoker set search_path=public,private,pg_temp
as $$ select private.confirm_application_preparation(p_case_id) $$;
revoke all on function public.save_application_preparation(uuid,jsonb,jsonb) from public,anon;
revoke all on function public.get_application_preparation(uuid) from public,anon;
revoke all on function public.confirm_application_preparation(uuid) from public,anon;
grant execute on function public.save_application_preparation(uuid,jsonb,jsonb) to authenticated;
grant execute on function public.get_application_preparation(uuid) to authenticated;
grant execute on function public.confirm_application_preparation(uuid) to authenticated;
