<script lang="ts">
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>{data.releaseNote.title} | ShipLog</title>
</svelte:head>

<section>
  <a class="inline-flex items-center gap-1.5 text-sm text-neutral/55 transition-colors hover:text-neutral" href="/app/release-notes">
    <ArrowLeft class="h-4 w-4" />
    Back to release notes
  </a>

  <div class="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="flex items-start gap-3">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary/10 text-secondary">
        <ScrollText class="h-5 w-5" />
      </span>
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-neutral">{data.releaseNote.title}</h1>
        <p class="mt-1 text-sm text-neutral/60">
          {data.releaseNote.repositoryFullName}
          · <span class="font-mono text-xs">{data.releaseNote.previous_tag_name} → {data.releaseNote.tag_name}</span>
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span class="badge {data.releaseNote.status === 'approved' ? 'badge-success' : 'badge-ghost'}">
        {data.releaseNote.status}
      </span>
      {#if data.releaseNote.status !== 'approved'}
        <form method="POST" action="?/approveReleaseNote">
          <button class="btn btn-sm btn-primary" type="submit">Approve</button>
        </form>
      {/if}
    </div>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-4 text-sm">{form.message}</div>
  {/if}

  {#if data.saved}
    <div class="alert alert-success mb-4 text-sm">Release note saved.</div>
  {/if}

  <form class="grid gap-4" method="POST" action="?/saveReleaseNote">
    <textarea
      class="textarea textarea-bordered min-h-[28rem] rounded-xl bg-base-100 font-mono text-sm leading-6"
      name="content"
      spellcheck="false"
    >{data.releaseNote.content}</textarea>
    <div class="flex justify-end">
      <button class="btn btn-primary" type="submit">Save changes</button>
    </div>
  </form>
</section>
