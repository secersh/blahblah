<script lang="ts">
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import Plus from '@lucide/svelte/icons/plus';
  import X from '@lucide/svelte/icons/x';
  import SquarePen from '@lucide/svelte/icons/square-pen';
  import Check from '@lucide/svelte/icons/check';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import CircleHelp from '@lucide/svelte/icons/circle-help';

  let { data, form } = $props();

  let dialog: HTMLDialogElement;
  let selectedRepositoryId = $state('');
  let selectedStartTag = $state('');
  let selectedEndTag = $state('');
  let tags = $state<Array<{ name: string; sha: string }>>([]);
  let tagsLoading = $state(false);
  let tagsError = $state('');

  const hasActiveRepositories = $derived(data.activeRepositories.length > 0);
  const hasReleaseNoteQuota = $derived(
    data.releaseNoteLimit === null || data.usedReleaseNoteCount < data.releaseNoteLimit
  );
  const releaseNoteLimitLabel = $derived(data.releaseNoteLimit === null ? 'Unlimited' : data.releaseNoteLimit);
  const planName = $derived(data.billing.currentPlanDefinition.name);
  const startTagIndex = $derived(tags.findIndex((tag) => tag.name === selectedStartTag));
  const endTagIndex = $derived(tags.findIndex((tag) => tag.name === selectedEndTag));
  const canChooseTags = $derived(hasActiveRepositories && tags.length >= 1);
  const hasValidTagRange = $derived(
    canChooseTags &&
      endTagIndex > -1 &&
      (!selectedStartTag || (startTagIndex > -1 && startTagIndex > endTagIndex))
  );
  const canGenerate = $derived(hasReleaseNoteQuota && hasValidTagRange);
  const tagRangeError = $derived(
    selectedStartTag && selectedEndTag && !hasValidTagRange
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

      if (tags.length < 1) {
        tagsError = 'This repository needs at least one tag.';
      } else {
        selectedEndTag = tags[0].name;
        selectedStartTag = tags[1]?.name ?? '';
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
    <button
      class="btn btn-primary gap-2"
      disabled={!hasActiveRepositories || !hasReleaseNoteQuota}
      onclick={() => dialog.showModal()}
    >
      <Plus class="h-4 w-4" />
      Generate release notes
    </button>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-4 text-sm">{form.message}</div>
  {/if}

  {#if data.queued}
    <div class="alert alert-info mb-4 text-sm">
      <LoaderCircle class="h-4 w-4 animate-spin" />
      Generating release notes — this usually takes under a minute.
    </div>
  {/if}

  {#if !hasActiveRepositories}
    <div class="alert alert-warning mb-4 text-sm">
      Activate a repository before generating release notes.
    </div>
  {/if}

  <div class="mb-4 rounded-xl border border-base-300 bg-base-100 p-4">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-1.5">
          <p class="text-sm font-medium text-neutral">{planName} plan release notes</p>
          <span
            class="tooltip tooltip-right inline-flex h-6 w-6 items-center justify-center rounded-full text-neutral/55 transition-colors hover:bg-base-200 hover:text-neutral"
            data-tip={`${planName} plan release-note usage is tracked monthly. Failed generations still count because they consume generation work.`}
          >
            <CircleHelp class="h-4 w-4" />
          </span>
        </div>
        <p class="mt-1 text-xs text-neutral/55">{data.releaseNoteUsagePeriod}</p>
      </div>
      <p class="text-sm text-neutral/65">
        <span class="font-semibold text-neutral">{data.usedReleaseNoteCount}</span> / {releaseNoteLimitLabel} generated
      </p>
    </div>
  </div>

  {#if !hasReleaseNoteQuota}
    <div class="alert alert-warning mb-4 text-sm">
      {planName} plan monthly release-note quota reached. Upgrade to generate more.
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
        <option value="failed" selected={data.filters.status === 'failed'}>Failed</option>
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
        Generate release notes from an active repository and release tag.
      </p>
    </div>
  {:else}
    <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <table class="table">
        <thead>
          <tr class="border-base-300 text-neutral/55">
            <th>Repository</th>
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
                <span class="inline-flex max-w-full items-center gap-2 font-mono text-sm font-medium text-neutral">
                  <FolderGit2 class="h-4 w-4 shrink-0 text-primary" />
                  <span class="truncate">{releaseNote.repositoryFullName}</span>
                </span>
              </td>
              <td>
                {#if releaseNote.status === 'generating'}
                  <span class="font-medium text-neutral/50">{releaseNote.title}</span>
                {:else}
                  <a class="font-medium text-neutral transition-colors hover:text-primary" href={`/app/release-notes/${releaseNote.id}`}>
                    {releaseNote.title}
                  </a>
                {/if}
              </td>
              <td class="font-mono text-xs text-neutral/60">{releaseNote.previous_tag_name ?? 'Initial'} → {releaseNote.tag_name}</td>
              <td>
                {#if releaseNote.status === 'generating'}
                  <span class="badge badge-ghost gap-1.5">
                    <LoaderCircle class="h-3 w-3 animate-spin" />
                    generating
                  </span>
                {:else if releaseNote.status === 'failed'}
                  <span class="badge badge-error gap-1.5" title={releaseNote.error_message ?? undefined}>
                    <TriangleAlert class="h-3 w-3" />
                    failed
                  </span>
                {:else if releaseNote.status === 'approved'}
                  <span class="badge badge-success">approved</span>
                {:else}
                  <span class="badge badge-ghost">draft</span>
                {/if}
              </td>
              <td class="text-sm text-neutral/60">{new Date(releaseNote.created_at).toLocaleDateString()}</td>
              <td>
                <div class="flex items-center justify-end gap-0.5">
                  {#if releaseNote.status !== 'generating'}
                    <a
                      class="btn btn-square btn-ghost btn-sm text-neutral/55 hover:text-neutral"
                      href={`/app/release-notes/${releaseNote.id}`}
                      aria-label="View and edit"
                      title="View / edit"
                    >
                      <SquarePen class="h-4 w-4" />
                    </a>
                  {/if}
                  {#if releaseNote.status === 'draft'}
                    <form method="POST" action="?/approveReleaseNote">
                      <input type="hidden" name="releaseNoteId" value={releaseNote.id} />
                      <button
                        class="btn btn-square btn-ghost btn-sm text-neutral/55 hover:bg-success/10 hover:text-success"
                        type="submit"
                        aria-label="Approve release note"
                        title="Approve"
                      >
                        <Check class="h-4 w-4" />
                      </button>
                    </form>
                  {/if}
                  <form
                    method="POST"
                    action="?/deleteReleaseNote"
                    onsubmit={(event) => {
                      if (!confirm(`Delete "${releaseNote.title}"? This cannot be undone.`)) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="releaseNoteId" value={releaseNote.id} />
                    <button
                      class="btn btn-square btn-ghost btn-sm text-neutral/55 hover:bg-error/10 hover:text-error"
                      type="submit"
                      aria-label="Delete release note"
                      title="Delete"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
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
      Choose an active repository, an end tag, and optionally a previous tag.
    </p>
    <p class="mt-2 text-xs text-neutral/50">
      {data.usedReleaseNoteCount} / {releaseNoteLimitLabel} release notes used this month.
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
          >
            <option value="">Initial release</option>
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
