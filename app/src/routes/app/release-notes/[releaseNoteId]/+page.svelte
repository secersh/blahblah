<script lang="ts">
  let { data, form } = $props();
</script>

<svelte:head>
  <title>{data.releaseNote.title} | ShipLog</title>
</svelte:head>

<section class="max-w-6xl">
  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <a class="text-sm text-primary" href="/app/release-notes">Back to release notes</a>
      <h1 class="mt-2 text-2xl font-semibold text-neutral">{data.releaseNote.title}</h1>
      <p class="mt-1 text-sm text-neutral/65">
        {data.releaseNote.repositoryFullName} · {data.releaseNote.previous_tag_name} -> {data.releaseNote.tag_name}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <span class="badge {data.releaseNote.status === 'approved' ? 'badge-success' : 'badge-outline'}">
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
      class="textarea textarea-bordered min-h-[28rem] font-mono text-sm leading-6"
      name="content"
      spellcheck="false"
    >{data.releaseNote.content}</textarea>
    <div class="flex justify-end">
      <button class="btn btn-primary" type="submit">Save changes</button>
    </div>
  </form>
</section>
