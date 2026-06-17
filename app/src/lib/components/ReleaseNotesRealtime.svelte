<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { env } from '$env/dynamic/public';
  import { createBrowserClient } from '@supabase/ssr';

  let {
    accessToken,
    userId
  }: { accessToken: string | null | undefined; userId: string | null | undefined } = $props();

  $effect(() => {
    if (!accessToken || !userId) return;

    const supabase = createBrowserClient(
      env.PUBLIC_SUPABASE_URL,
      env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    supabase.realtime.setAuth(accessToken);

    const channel = supabase
      .channel(`app-changes-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'release_notes', filter: `user_id=eq.${userId}` },
        () => invalidateAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'billing_subscriptions', filter: `user_id=eq.${userId}` },
        () => invalidateAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });
</script>
