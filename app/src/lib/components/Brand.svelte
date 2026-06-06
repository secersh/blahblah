<script lang="ts">
  import Ship from '@lucide/svelte/icons/ship';

  let {
    size = 'md',
    href = null,
    showWordmark = true
  }: { size?: 'sm' | 'md' | 'lg'; href?: string | null; showWordmark?: boolean } = $props();

  const mark = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-9 w-9 rounded-lg',
    lg: 'h-11 w-11 rounded-xl'
  } as const;

  const glyph = { sm: 'h-5 w-5', md: 'h-5 w-5', lg: 'h-6 w-6' } as const;
  const word = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' } as const;
</script>

{#snippet inner()}
  <span
    class="grid place-items-center bg-gradient-to-br from-primary to-secondary text-primary-content shadow-glow {mark[
      size
    ]}"
  >
    <Ship class={glyph[size]} strokeWidth={2} />
  </span>
  {#if showWordmark}
    <span class="font-semibold tracking-tight text-neutral {word[size]}">
      Ship<span class="text-primary">Log</span>
    </span>
  {/if}
{/snippet}

{#if href}
  <a {href} class="inline-flex items-center gap-2.5">
    {@render inner()}
  </a>
{:else}
  <span class="inline-flex items-center gap-2.5">
    {@render inner()}
  </span>
{/if}
