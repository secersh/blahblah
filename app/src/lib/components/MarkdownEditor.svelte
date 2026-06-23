<script lang="ts">
  import { tick } from 'svelte';
  import MarkdownIt from 'markdown-it';
  import Bold from '@lucide/svelte/icons/bold';
  import Italic from '@lucide/svelte/icons/italic';
  import Code from '@lucide/svelte/icons/code';
  import Heading from '@lucide/svelte/icons/heading';
  import Link from '@lucide/svelte/icons/link';
  import List from '@lucide/svelte/icons/list';
  import ListOrdered from '@lucide/svelte/icons/list-ordered';
  import TextQuote from '@lucide/svelte/icons/text-quote';
  import Eye from '@lucide/svelte/icons/eye';
  import Pencil from '@lucide/svelte/icons/pencil';

  let {
    value = $bindable(''),
    name = 'content',
    placeholder = 'Write release notes in Markdown…',
    minHeight = '24rem'
  }: { value?: string; name?: string; placeholder?: string; minHeight?: string } = $props();

  let mode = $state<'write' | 'preview'>('write');
  let textarea = $state<HTMLTextAreaElement | null>(null);

  // html:false escapes raw HTML and markdown-it validates link protocols,
  // so user content renders without an XSS surface.
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
  const rendered = $derived(value.trim() ? md.render(value) : '');

  async function wrap(token: string) {
    const el = textarea;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    value = value.slice(0, start) + token + selected + token + value.slice(end);
    await tick();
    el.focus();
    el.setSelectionRange(start + token.length, end + token.length);
  }

  async function linePrefix(prefix: string) {
    const el = textarea;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    value = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    await tick();
    el.focus();
    el.setSelectionRange(start + prefix.length, end + prefix.length);
  }

  async function insertLink() {
    const el = textarea;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const label = value.slice(start, end) || 'text';
    const snippet = `[${label}](https://)`;
    value = value.slice(0, start) + snippet + value.slice(end);
    await tick();
    el.focus();
    const urlStart = start + label.length + 3; // past "[label]("
    el.setSelectionRange(urlStart, urlStart + 'https://'.length);
  }

  const tools = [
    { icon: Bold, label: 'Bold', run: () => wrap('**') },
    { icon: Italic, label: 'Italic', run: () => wrap('_') },
    { icon: Code, label: 'Inline code', run: () => wrap('`') },
    { icon: Heading, label: 'Heading', run: () => linePrefix('### ') },
    { icon: Link, label: 'Link', run: () => insertLink() },
    { icon: List, label: 'Bullet list', run: () => linePrefix('- ') },
    { icon: ListOrdered, label: 'Numbered list', run: () => linePrefix('1. ') },
    { icon: TextQuote, label: 'Quote', run: () => linePrefix('> ') }
  ];
</script>

<div class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-300 bg-base-200/40 px-2 py-1.5">
    <div role="tablist" class="flex gap-2">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'write'}
        class="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors {mode ===
        'write'
          ? 'bg-base-100 text-neutral shadow-sm'
          : 'text-neutral/55 hover:text-neutral'}"
        onclick={() => (mode = 'write')}
      >
        <Pencil class="h-3.5 w-3.5" />
        Write
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'preview'}
        class="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors {mode ===
        'preview'
          ? 'bg-base-100 text-neutral shadow-sm'
          : 'text-neutral/55 hover:text-neutral'}"
        onclick={() => (mode = 'preview')}
      >
        <Eye class="h-3.5 w-3.5" />
        Preview
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-2 transition-opacity" class:invisible={mode === 'preview'}>
      {#each tools as tool}
        <button
          type="button"
          class="btn btn-square btn-ghost btn-sm text-neutral/60 hover:text-neutral"
          title={tool.label}
          aria-label={tool.label}
          tabindex={mode === 'preview' ? -1 : 0}
          onclick={tool.run}
        >
          <tool.icon class="h-4 w-4" />
        </button>
      {/each}
    </div>
  </div>

  <div class="p-3">
    <textarea
      bind:this={textarea}
      bind:value
      {name}
      {placeholder}
      spellcheck="false"
      class="block w-full resize-y bg-transparent p-1 font-mono text-sm leading-6 text-neutral placeholder:text-neutral/35 focus:outline-none"
      class:hidden={mode === 'preview'}
      style={`min-height:${minHeight}`}
    ></textarea>

    {#if mode === 'preview'}
      {#if rendered}
        <div
          class="markdown-preview prose max-w-none px-1 prose-headings:font-semibold prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-base-300 prose-pre:bg-base-200/70"
          style={`min-height:${minHeight}`}
        >
          {@html rendered}
        </div>
      {:else}
        <p class="px-1 py-8 text-sm text-neutral/45" style={`min-height:${minHeight}`}>
          Nothing to preview yet.
        </p>
      {/if}
    {/if}
  </div>
</div>

<style>
  .markdown-preview,
  .markdown-preview :global(*) {
    color: #11100d;
  }

  .markdown-preview :global(a) {
    color: #6d4aff;
  }

  .markdown-preview :global(code) {
    border: 2px solid #11100d;
    border-radius: 0.25rem;
    background: #fff4a8;
    padding: 0.05rem 0.3rem;
  }
</style>
