create or replace function private.get_scheme_review_queue()
returns jsonb language plpgsql security definer set search_path=public,private,pg_temp
as $$
declare v_user uuid:=auth.uid(); v_items jsonb; v_roles jsonb;
begin
  if v_user is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select coalesce(jsonb_agg(role order by role),'[]'::jsonb) into v_roles
  from private.scheme_reviewer_roles where user_id=v_user and active=true;
  if jsonb_array_length(v_roles)=0 then raise exception 'reviewer_access_required' using errcode='42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'scheme_version_id',sv.id,'scheme_id',s.id,'slug',s.slug,'name',s.name,
    'publication_status',s.publication_status,'version_number',sv.version_number,
    'verification_status',sv.verification_status,'content',sv.content,
    'rule_set',sv.rule_set,'content_sha256',sv.content_sha256,
    'source',jsonb_build_object('publisher',ss.publisher,'source_url',ss.source_url,'source_type',ss.source_type,'last_checked_at',ss.last_checked_at,'source_revision',ss.source_revision,'access_notes',ss.access_notes),
    'approvals',(select coalesce(jsonb_agg(jsonb_build_object('reviewer_id',a.reviewer_id,'approval_type',a.approval_type,'decision',a.decision,'notes',a.notes,'created_at',a.created_at)),'[]'::jsonb) from public.scheme_approvals a where a.scheme_version_id=sv.id)
  ) order by s.name),'[]'::jsonb)
  into v_items
  from public.schemes s
  join public.scheme_versions sv on sv.id=s.current_version_id
  join public.scheme_sources ss on ss.id=sv.source_id
  where s.publication_status in ('draft','review_pending');
  return jsonb_build_object('roles',v_roles,'items',v_items);
end;
$$;
