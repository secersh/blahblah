<script lang="ts">
  import MessageCircle from '@lucide/svelte/icons/message-circle';

  let {
    size = 'md',
    href = null,
    showWordmark = true
  }: { size?: 'sm' | 'md' | 'lg'; href?: string | null; showWordmark?: boolean } = $props();

  const mark = {
    sm: 'h-8 w-8 rounded-md',
    md: 'h-9 w-9 rounded-md',
    lg: 'h-11 w-11 rounded-lg'
  } as const;

  const glyph = { sm: 'h-5 w-5', md: 'h-5 w-5', lg: 'h-6 w-6' } as const;
  const word = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' } as const;
</script>

{#snippet inner()}
  <span
    class="brand-mark grid place-items-center border-[3px] border-[#11100d] bg-white text-[#11100d] {mark[
      size
    ]}"
  >
    <MessageCircle class={glyph[size]} strokeWidth={3} />
  </span>
  {#if showWordmark}
    <span class="font-display font-black uppercase tracking-tight text-[#11100d] {word[size]}">
      Blah Blah!
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

<style>
  .font-display {
    font-family:
      "Arial Black", "Arial Rounded MT Bold", Impact, ui-sans-serif, system-ui,
      sans-serif;
  }

  .brand-mark {
    box-shadow: 4px 4px 0 #11100d;
    transform: rotate(-3deg);
  }
</style>
