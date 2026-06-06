<script lang="ts">
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import Plus from '@lucide/svelte/icons/plus';
  import X from '@lucide/svelte/icons/x';

  let { data, form } = $props();

  let dialog: HTMLDialogElement;
  let selectedRepositoryId = $state('');
  let selectedStartTag = $state('');
  let selectedEndTag = $state('');
  let tags = $state<Array<{ name: string; sha: string }>>([]);
  let tagsLoading = $state(false);
  let tagsError = $state('');

  const hasActiveRepositories = $derived(data.activeRepositories.length > 0);
  const startTagIndex = $derived(tags.findIndex((tag) => tag.name === selectedStartTag));
  const endTagIndex = $derived(tags.findIndex((tag) => tag.name === selectedEndTag));
  const canChooseTags = $derived(hasActiveRepositories && tags.length >= 2);
  const canGenerate = $derived(
    canChooseTags && startTagIndex > -1 && endTagIndex > -1 && startTagIndex > endTagIndex
  );
  const tagRangeError = $derived(
    selectedStartTag && selectedEndTag && !canGenerate
      ? 'Start tag must be older than end tag.'
      : ''
  );

  async function loadTags() {
    tags = [];
    tagsError = '';
    selectedStartTag = '';
    selectedEndTag = '';

    if (!selectedRepositoryId) {
      return;
    }

    tagsLoading = true;

    try {
      const response = await fetch(
        `/app/release-notes/tags?repositoryId=${encodeURIComponent(selectedRepositoryId)}`
      );

      if (!response.ok) {
        throw new Error('Could not load tags.');
      }

      const data = (await response.json()) as { tags: Array<{ name: string; sha: string }> };
      tags = data.tags;

      if (tags.length < 2) {
        tagsError = 'This repository needs at least two tags.';
      } else {
        selectedEndTag = tags[0].name;
        selectedStartTag = tags[1].name;
      }
    } catch {
      tagsError = 'Tags could not be loaded. Try syncing repositories or checking GitHub access.';
    } finally {
      tagsLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Release Notes | ShipLog</title>
</svelte:head>

<section>
  <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-neutral">Release Notes</h1>
      <p class="mt-1 text-sm text-neutral/60">Create and review release note drafts.</p>
    </div>
    <button class="btn btn-primary gap-2" disabled={!hasActiveRepositories} onclick={() => dialog.showModal()}>
      <Plus class="h-4 w-4" />
      Generate release notes
    </button>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-4 text-sm">{form.message}</div>
  {/if}

  {#if data.generated}
    <div class="alert alert-success mb-4 text-sm">Release note draft created.</div>
  {/if}

  {#if !hasActiveRepositories}
    <div class="alert alert-warning mb-4 text-sm">
      Activate a repository before generating release notes.
    </div>
  {/if}

  <form class="mb-4 grid gap-3 rounded-xl border border-base-300 bg-base-100 p-4 sm:grid-cols-[1fr_12rem_auto]" method="GET">
    <label class="form-control">
      <span class="label py-1">
        <span class="label-text">Repository</span>
      </span>
      <select class="select select-bordered select-sm" name="repositoryId">
        <option value="">All repositories</option>
        {#each data.activeRepositories as repository}
          <option value={repository.id} selected={data.filters.repositoryId === repository.id}>
            {repository.full_name}
          </option>
        {/each}
      </select>
    </label>

    <label class="form-control">
      <span class="label py-1">
        <span class="label-text">Status</span>
      </span>
      <select class="select select-bordered select-sm" name="status">
        <option value="">All statuses</option>
        <option value="draft" selected={data.filters.status === 'draft'}>Draft</option>
        <option value="approved" selected={data.filters.status === 'approved'}>Approved</option>
      </select>
    </label>

    <div class="flex items-end gap-2">
      <button class="btn btn-primary btn-sm" type="submit">Apply</button>
      <a class="btn btn-ghost btn-sm" href="/app/release-notes">Reset</a>
    </div>
  </form>

  {#if data.releaseNotes.length === 0}
    <div class="rounded-xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
      <ScrollText class="mx-auto h-10 w-10 text-neutral/30" />
      <h2 class="mt-4 text-lg font-semibold text-neutral">No release notes yet</h2>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral/60">
        Generate release notes from an active repository and tag range.
      </p>
    </div>
  {:else}
    <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <table class="table">
        <thead>
          <tr class="border-base-300 text-neutral/55">
            <th>Release</th>
            <th>Range</th>
            <th>Status</th>
            <th>Created</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.releaseNotes as releaseNote}
            <tr class="border-base-300">
              <td>
                <p class="font-medium text-neutral">{releaseNote.title}</p>
                <p class="text-xs text-neutral/50">{releaseNote.repositoryFullName}</p>
              </td>
              <td class="font-mono text-xs text-neutral/60">{releaseNote.previous_tag_name} → {releaseNote.tag_name}</td>
              <td>
                <span class="badge {releaseNote.status === 'approved' ? 'badge-success' : 'badge-ghost'}">
                  {releaseNote.status}
                </span>
              </td>
              <td class="text-sm text-neutral/60">{new Date(releaseNote.created_at).toLocaleDateString()}</td>
              <td>
                <div class="flex flex-wrap justify-end gap-2">
                  <a class="btn btn-sm btn-outline" href={`/app/release-notes/${releaseNote.id}`}>View / edit</a>
                  {#if releaseNote.status !== 'approved'}
                    <form method="POST" action="?/approveReleaseNote">
                      <input type="hidden" name="releaseNoteId" value={releaseNote.id} />
                      <button class="btn btn-sm btn-primary" type="submit">Approve</button>
                    </form>
                  {/if}
                  <form method="POST" action="?/deleteReleaseNote">
                    <input type="hidden" name="releaseNoteId" value={releaseNote.id} />
                    <button class="btn btn-sm btn-outline btn-error" type="submit">Delete</button>
                  </form>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<dialog class="modal" bind:this={dialog}>
  <div class="modal-box max-w-2xl">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-4 top-4" aria-label="Close">
        <X class="h-4 w-4" />
      </button>
    </form>

    <h2 class="text-lg font-semibold text-neutral">Generate release notes</h2>
    <p class="mt-1 text-sm text-neutral/65">
      Choose an active repository and the tag range for the draft.
    </p>

    <form class="mt-6 grid gap-4" method="POST" action="?/generateReleaseNotes">
      <label class="form-control">
        <span class="label">
          <span class="label-text">Repository</span>
        </span>
        <select
          class="select select-bordered"
          name="repositoryId"
          bind:value={selectedRepositoryId}
          onchange={loadTags}
          required
        >
          <option value="" disabled>Choose repository</option>
          {#each data.activeRepositories as repository}
            <option value={repository.id}>{repository.full_name}</option>
          {/each}
        </select>
      </label>

      {#if tagsLoading}
        <div class="alert text-sm">Loading tags...</div>
      {/if}

      {#if tagsError}
        <div class="alert alert-warning text-sm">{tagsError}</div>
      {/if}

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="form-control">
          <span class="label">
            <span class="label-text">Start tag</span>
          </span>
          <select
            class="select select-bordered"
            name="startTag"
            bind:value={selectedStartTag}
            disabled={!canChooseTags}
            required
          >
            <option value="" disabled>Choose start tag</option>
            {#each tags as tag, index}
              {@const canUseAsStart = !selectedEndTag || index > endTagIndex}
              <option value={tag.name} disabled={!canUseAsStart}>{tag.name}</option>
            {/each}
          </select>
        </label>

        <label class="form-control">
          <span class="label">
            <span class="label-text">End tag</span>
          </span>
          <select
            class="select select-bordered"
            name="endTag"
            bind:value={selectedEndTag}
            disabled={!canChooseTags}
            required
          >
            <option value="" disabled>Choose end tag</option>
            {#each tags as tag, index}
              {@const canUseAsEnd = !selectedStartTag || index < startTagIndex}
              <option value={tag.name} disabled={!canUseAsEnd}>{tag.name}</option>
            {/each}
          </select>
        </label>
      </div>

      {#if tagRangeError}
        <div class="alert alert-warning text-sm">{tagRangeError}</div>
      {/if}

      <div class="modal-action">
        <button class="btn btn-primary" type="submit" disabled={!canGenerate}>Generate draft</button>
      </div>
    </form>
  </div>
  <form class="modal-backdrop" method="dialog">
    <button>close</button>
  </form>
</dialog>
