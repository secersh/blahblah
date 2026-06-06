-- Broadcast release_notes row changes over Realtime so the UI can react to a
-- note flipping generating -> draft/failed without polling. RLS still gates
-- which rows each user receives (see the existing select policy).
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'release_notes'
  ) then
    alter publication supabase_realtime add table public.release_notes;
  end if;
end $$;
