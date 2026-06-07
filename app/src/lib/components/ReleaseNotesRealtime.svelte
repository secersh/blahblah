<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { env } from '$env/dynamic/public';
  import { createBrowserClient } from '@supabase/ssr';

  let { userId }: { userId: string | null | undefined } = $props();

  $effect(() => {
    if (!userId) return;

    const supabase = createBrowserClient(
      env.PUBLIC_SUPABASE_URL,
      env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    const channel = supabase
      .channel(`release-notes-changes-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'release_notes', filter: `user_id=eq.${userId}` },
        () => invalidateAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });
</script>
