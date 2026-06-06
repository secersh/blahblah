-- Release note generation runs asynchronously in an edge function, so a note
-- can be in-flight ('generating') or have failed before any draft file exists.
alter table public.release_notes
  drop constraint if exists release_notes_status_check;

alter table public.release_notes
  add constraint release_notes_status_check
  check (status in ('generating', 'draft', 'approved', 'failed'));

alter table public.release_notes
  add column if not exists error_message text;
