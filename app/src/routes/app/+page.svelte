<script lang="ts">
  let { data, form } = $props();

  const hasGithubInstallation = $derived(Boolean(data.githubInstallation));
  const hasActiveRepository = $derived(data.activeRepositoryCount > 0);
  const setupComplete = $derived(hasGithubInstallation && hasActiveRepository);
</script>

<svelte:head>
  <title>Dashboard | ShipLog</title>
</svelte:head>

<section class="max-w-6xl">
  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold text-neutral">Dashboard</h1>
      <p class="mt-1 text-sm text-neutral/65">Track connected repositories and generated drafts.</p>
    </div>
    <a class="btn btn-primary" href={setupComplete ? '/app/release-notes' : '/app/repositories'}>
      {setupComplete ? 'View release notes' : 'Finish setup'}
    </a>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-4 text-sm">{form.message}</div>
  {/if}

  {#if !setupComplete}
    <div class="mb-6 rounded-lg border border-base-300 bg-base-100 p-5">
      <div class="mb-5">
        <h2 class="text-lg font-semibold text-neutral">Setup</h2>
        <p class="mt-1 text-sm text-neutral/65">
          Install the GitHub App, allow repository access on GitHub, then choose which repository
          ShipLog should generate release notes for.
        </p>
      </div>

      <div class="grid gap-3">
        <div class="flex flex-col gap-3 rounded-lg border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-semibold text-neutral">Install GitHub App</p>
            <p class="mt-1 text-sm text-neutral/65">
              {hasGithubInstallation ? 'GitHub is connected.' : 'Allow ShipLog to access selected repositories.'}
            </p>
          </div>
          {#if hasGithubInstallation}
            <span class="badge badge-success">Connected</span>
          {:else}
            <form method="POST" action="?/installGithubApp">
              <button class="btn btn-primary" type="submit">Install GitHub App</button>
            </form>
          {/if}
        </div>

        <div class="flex flex-col gap-3 rounded-lg border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-semibold text-neutral">Select active repository</p>
            <p class="mt-1 text-sm text-neutral/65">
              {hasActiveRepository
                ? `${data.activeRepositoryCount} active repository ready for release notes.`
                : 'Sync repositories, then activate the repo that should generate release notes.'}
            </p>
          </div>
          <a class="btn btn-outline btn-primary" class:btn-disabled={!hasGithubInstallation} href="/app/repositories">
            {hasActiveRepository ? 'Manage repos' : 'Select repos'}
          </a>
        </div>
      </div>
    </div>
  {/if}

  <div class="mb-6 grid gap-4 md:grid-cols-3">
    <article class="rounded-lg border border-base-300 bg-base-100 p-5">
      <p class="text-sm text-neutral/55">Plan usage</p>
      <p class="mt-2 text-2xl font-semibold text-neutral">
        {data.usedRepositorySlotCount} / {data.repositoryLimit} repos
      </p>
      <p class="mt-1 text-xs text-neutral/50">{data.repositoryUsagePeriod}</p>
    </article>
    <article class="rounded-lg border border-base-300 bg-base-100 p-5">
      <p class="text-sm text-neutral/55">Drafts</p>
      <p class="mt-2 text-2xl font-semibold text-neutral">{data.draftCount}</p>
    </article>
    <article class="rounded-lg border border-base-300 bg-base-100 p-5">
      <p class="text-sm text-neutral/55">Active repositories</p>
      <p class="mt-2 text-2xl font-semibold text-neutral">{data.activeRepositoryCount}</p>
    </article>
  </div>

  <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <section class="rounded-lg border border-base-300 bg-base-100 p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-neutral">Active repositories</h2>
          <p class="mt-1 text-sm text-neutral/65">Repositories currently generating release notes.</p>
        </div>
        <a class="btn btn-sm btn-outline btn-primary" href="/app/repositories">Manage</a>
      </div>

      {#if data.activeRepositories.length === 0}
        <p class="rounded-lg border border-dashed border-base-300 p-5 text-sm text-neutral/60">
          No active repositories yet.
        </p>
      {:else}
        <div class="grid gap-3">
          {#each data.activeRepositories as repository}
            <article class="rounded-lg border border-base-300 p-4">
              <p class="font-semibold text-neutral">{repository.full_name}</p>
              <p class="mt-1 text-sm text-neutral/60">
                {repository.private ? 'Private' : 'Public'} · {repository.default_branch ?? 'default branch unknown'}
              </p>
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <section class="rounded-lg border border-base-300 bg-base-100 p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-neutral">Recent release notes</h2>
          <p class="mt-1 text-sm text-neutral/65">Latest drafts and approved notes.</p>
        </div>
        <a class="btn btn-sm btn-outline btn-primary" href="/app/release-notes">View all</a>
      </div>

      {#if data.recentReleaseNotes.length === 0}
        <div class="rounded-lg border border-dashed border-base-300 p-5">
          <p class="text-sm text-neutral/60">No release notes created yet.</p>
          {#if setupComplete}
            <a class="btn btn-sm btn-primary mt-4" href="/app/release-notes">Generate release notes</a>
          {/if}
        </div>
      {:else}
        <div class="overflow-hidden rounded-lg border border-base-300">
          <table class="table">
            <tbody>
              {#each data.recentReleaseNotes as releaseNote}
                <tr>
                  <td>
                    <a class="font-semibold text-primary" href={`/app/release-notes/${releaseNote.id}`}>
                      {releaseNote.title}
                    </a>
                    <p class="text-xs text-neutral/55">{releaseNote.repositoryFullName}</p>
                  </td>
                  <td>{releaseNote.previous_tag_name} -> {releaseNote.tag_name}</td>
                  <td>
                    <span class="badge {releaseNote.status === 'approved' ? 'badge-success' : 'badge-outline'}">
                      {releaseNote.status}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  </div>
</section>
