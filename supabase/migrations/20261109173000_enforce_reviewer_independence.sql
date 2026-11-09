create or replace function private.submit_scheme_review(
  p_scheme_version_id uuid,p_approval_type text,p_decision text,p_notes text
) returns uuid
language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_role text; v_approval_id uuid; v_source_count integer; v_rule_count integer; v_legal_count integer;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  v_role:=case p_approval_type when 'source_accuracy' then 'source_reviewer' when 'eligibility_rule_accuracy' then 'rules_reviewer' when 'legal_review' then 'legal_reviewer' when 'translation_quality' then 'translation_reviewer' else null end;
  if v_role is null or p_decision not in ('approved','rejected','changes_requested') then raise exception 'invalid_review_decision'; end if;
  if p_notes is null or length(trim(p_notes)) < 20 or length(p_notes) > 4000 then raise exception 'review_notes_required'; end if;
  if not exists(select 1 from private.scheme_reviewer_roles where user_id=v_user and role=v_role and active=true) then raise exception 'reviewer_role_required' using errcode='42501'; end if;
  if not exists(select 1 from public.scheme_versions sv join public.schemes s on s.id=sv.scheme_id where sv.id=p_scheme_version_id and s.current_version_id=sv.id and s.publication_status in ('draft','review_pending')) then raise exception 'scheme_version_not_reviewable'; end if;
  if exists(select 1 from public.scheme_approvals where scheme_version_id=p_scheme_version_id and reviewer_id=v_user) then raise exception 'reviewer_role_separation_violation'; end if;

  insert into public.scheme_approvals(scheme_version_id,reviewer_id,approval_type,decision,notes)
  values(p_scheme_version_id,v_user,p_approval_type,p_decision,trim(p_notes))
  returning id into v_approval_id;

  select count(distinct reviewer_id) filter(where approval_type='source_accuracy' and decision='approved'),
         count(distinct reviewer_id) filter(where approval_type='eligibility_rule_accuracy' and decision='approved'),
         count(distinct reviewer_id) filter(where approval_type='legal_review' and decision='approved')
  into v_source_count,v_rule_count,v_legal_count
  from public.scheme_approvals where scheme_version_id=p_scheme_version_id;

  if exists(select 1 from public.scheme_approvals where scheme_version_id=p_scheme_version_id and decision in ('rejected','changes_requested')) then
    update public.scheme_versions set verification_status='stale' where id=p_scheme_version_id;
  elsif v_source_count>=2 and v_rule_count>=2 and v_legal_count>=1 then
    update public.scheme_versions set verification_status='independently_approved',reviewed_at=now() where id=p_scheme_version_id;
  elsif v_source_count>=2 and v_rule_count>=2 then
    update public.scheme_versions set verification_status='rule_checked',reviewed_at=now() where id=p_scheme_version_id;
  elsif v_source_count>=2 then
    update public.scheme_versions set verification_status='source_checked',reviewed_at=now() where id=p_scheme_version_id;
  end if;
  return v_approval_id;
end;
$$;;

create or replace function private.publish_scheme_version(p_scheme_version_id uuid)
returns uuid language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_scheme_id uuid;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  if not exists(select 1 from private.scheme_reviewer_roles where user_id=v_user and role='scheme_publisher' and active=true) then raise exception 'publisher_role_required' using errcode='42501'; end if;
  if exists(select 1 from public.scheme_approvals where scheme_version_id=p_scheme_version_id and reviewer_id=v_user) then raise exception 'publisher_must_be_independent'; end if;
  select sv.scheme_id into v_scheme_id from public.scheme_versions sv join public.schemes s on s.id=sv.scheme_id and s.current_version_id=sv.id and s.publication_status in ('draft','review_pending')
  where sv.id=p_scheme_version_id and sv.verification_status='independently_approved'
    and (select count(distinct reviewer_id) from public.scheme_approvals where scheme_version_id=sv.id and approval_type='source_accuracy' and decision='approved')>=2
    and (select count(distinct reviewer_id) from public.scheme_approvals where scheme_version_id=sv.id and approval_type='eligibility_rule_accuracy' and decision='approved')>=2
    and (select count(distinct reviewer_id) from public.scheme_approvals where scheme_version_id=sv.id and approval_type='legal_review' and decision='approved')>=1
    and not exists(select 1 from public.scheme_approvals where scheme_version_id=sv.id and decision in ('rejected','changes_requested'));
  if v_scheme_id is null then raise exception 'scheme_not_ready_for_publication'; end if;
  update public.schemes set current_version_id=p_scheme_version_id,publication_status='published',updated_at=now() where id=v_scheme_id;
  return v_scheme_id;
end;
$$;;
