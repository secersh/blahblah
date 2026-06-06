create table if not exists public.repositories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  github_installation_id uuid not null references public.github_installations(id) on delete cascade,
  github_repository_id bigint not null unique,
  owner text not null,
  name text not null,
  full_name text not null,
  private boolean not null default false,
  html_url text not null,
  default_branch text,
  active boolean not null default false,
  first_activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.repositories enable row level security;

grant select, insert, update on public.repositories to authenticated;

create policy "Users can read own repositories"
  on public.repositories
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own repositories"
  on public.repositories
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own repositories"
  on public.repositories
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_repositories_updated_at on public.repositories;

create trigger set_repositories_updated_at
  before update on public.repositories
  for each row
  execute function public.set_updated_at();
