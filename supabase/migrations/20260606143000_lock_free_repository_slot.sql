alter table public.repositories
add column if not exists first_activated_at timestamptz;

update public.repositories
set first_activated_at = coalesce(first_activated_at, updated_at, now())
where active = true;
