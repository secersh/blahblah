create table if not exists public.github_installations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  installation_id bigint not null unique,
  setup_action text,
  account_login text,
  account_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.github_installations enable row level security;

create policy "Users can read own github installations"
  on public.github_installations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own github installations"
  on public.github_installations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own github installations"
  on public.github_installations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_github_installations_updated_at on public.github_installations;

create trigger set_github_installations_updated_at
  before update on public.github_installations
  for each row
  execute function public.set_updated_at();
