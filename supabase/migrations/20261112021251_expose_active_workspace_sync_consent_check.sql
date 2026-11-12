create or replace function public.has_active_workspace_sync_consent()
returns boolean
language sql
stable
security invoker
set search_path = public, private, pg_temp
as $$
  select coalesce(
    auth.uid() is not null
    and private.has_active_citizen_consent(auth.uid(), 'cloud_workspace_sync', null),
    false
  );
$$;
revoke all on function public.has_active_workspace_sync_consent() from public, anon;
grant execute on function public.has_active_workspace_sync_consent() to authenticated;
