create or replace function public.queue_release_note_generation(
  repository_id uuid,
  title text,
  previous_tag_name text,
  tag_name text,
  storage_path text,
  free_monthly_limit integer default 20
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_period_key text := to_char(now(), 'YYYY-MM');
  used_count integer;
  created_release_note_id uuid;
  owns_repository boolean;
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select exists (
    select 1
    from public.repositories
    where id = queue_release_note_generation.repository_id
      and user_id = current_user_id
      and active = true
  )
  into owns_repository;

  if not owns_repository then
    raise exception 'repository_not_found' using errcode = 'P0001';
  end if;

  if queue_release_note_generation.storage_path not like current_user_id::text || '/%' then
    raise exception 'invalid_storage_path' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtext(current_user_id::text || ':' || current_period_key));

  select count(*)
  into used_count
  from public.release_note_usage_periods
  where user_id = current_user_id
    and period_key = current_period_key;

  if free_monthly_limit is not null and used_count >= free_monthly_limit then
    raise exception 'release_note_quota_exceeded' using errcode = 'P0001';
  end if;

  insert into public.release_notes (
    user_id,
    repository_id,
    status,
    title,
    previous_tag_name,
    tag_name,
    storage_path
  )
  values (
    current_user_id,
    queue_release_note_generation.repository_id,
    'generating',
    queue_release_note_generation.title,
    queue_release_note_generation.previous_tag_name,
    queue_release_note_generation.tag_name,
    queue_release_note_generation.storage_path
  )
  returning id into created_release_note_id;

  insert into public.release_note_usage_periods (
    user_id,
    release_note_id,
    period_key
  )
  values (
    current_user_id,
    created_release_note_id,
    current_period_key
  );

  return created_release_note_id;
end;
$$;
