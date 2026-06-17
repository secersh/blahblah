-- Broadcast billing subscription changes over Realtime so plan/status updates
-- from Lemon Squeezy webhooks refresh the app without a manual page reload.
-- RLS still gates which rows each user receives.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'billing_subscriptions'
  ) then
    alter publication supabase_realtime add table public.billing_subscriptions;
  end if;
end $$;
