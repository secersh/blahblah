grant delete on public.github_installations to authenticated;
grant delete on public.repositories to authenticated;

create policy "Users can delete own github installations"
  on public.github_installations
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own repositories"
  on public.repositories
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.release_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  repository_id uuid not null references public.repositories(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'approved')),
  title text,
  tag_name text,
  previous_tag_name text,
  storage_bucket text not null default 'release-notes',
  storage_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.release_notes enable row level security;

grant select, insert, update, delete on public.release_notes to authenticated;

create policy "Users can read own release notes"
  on public.release_notes
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own release notes"
  on public.release_notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own release notes"
  on public.release_notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own release notes"
  on public.release_notes
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists set_release_notes_updated_at on public.release_notes;

create trigger set_release_notes_updated_at
  before update on public.release_notes
  for each row
  execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('release-notes', 'release-notes', false)
on conflict (id) do nothing;

create policy "Users can read own release note files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'release-notes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own release note files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'release-notes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own release note files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'release-notes'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'release-notes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
