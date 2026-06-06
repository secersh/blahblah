create table if not exists public.repository_usage_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  repository_id uuid not null references public.repositories(id) on delete cascade,
  period_key text not null,
  first_activated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, repository_id, period_key)
);

alter table public.repository_usage_periods enable row level security;

grant select, insert, delete on public.repository_usage_periods to authenticated;

create policy "Users can read own repository usage periods"
  on public.repository_usage_periods
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own repository usage periods"
  on public.repository_usage_periods
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own repository usage periods"
  on public.repository_usage_periods
  for delete
  to authenticated
  using (auth.uid() = user_id);

insert into public.repository_usage_periods (user_id, repository_id, period_key)
select
  user_id,
  id,
  to_char(now(), 'YYYY-MM')
from public.repositories
where active = true
on conflict (user_id, repository_id, period_key) do nothing;
