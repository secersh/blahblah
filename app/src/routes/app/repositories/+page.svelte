<script lang="ts">
  import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
  import RefreshCw from '@lucide/svelte/icons/refresh-cw';

  let { data, form } = $props();

  const repositories = $derived(data.repositories);
  const isAtRepositoryLimit = $derived(data.usedRepositorySlotCount >= data.repositoryLimit);
</script>

<svelte:head>
  <title>Repositories | ShipLog</title>
</svelte:head>

<section>
  <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-neutral">Repositories</h1>
      <p class="mt-1 text-sm text-neutral/60">Enable repositories after the GitHub App is installed.</p>
    </div>
    <form method="POST" action="?/syncGithubRepos">
      <button class="btn btn-primary gap-2" type="submit" disabled={!data.hasGithubInstallation}>
        <RefreshCw class="h-4 w-4" />
        Sync GitHub repos
      </button>
    </form>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-4 text-sm">{form.message}</div>
  {/if}

  {#if data.syncStatus === 'success'}
    <div class="alert alert-success mb-4 text-sm">Repositories synced from GitHub.</div>
  {/if}

  {#if !data.hasGithubInstallation}
    <div class="alert alert-warning mb-4 text-sm">
      Connect the GitHub App before syncing repositories.
    </div>
  {/if}

  {#if repositories.length === 0}
    <div class="rounded-xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
      <FolderGit2 class="mx-auto h-10 w-10 text-neutral/30" />
      <h2 class="mt-4 text-lg font-semibold text-neutral">No repositories connected</h2>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral/60">
        Install the GitHub App and sync repositories to start generating release notes.
      </p>
    </div>
  {:else}
    <div class="mb-4 flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="font-medium text-neutral">Active repositories</p>
        <p class="mt-1 text-sm text-neutral/60">
          Free plan includes {data.repositoryLimit} repository per month. If you change repository
          access on GitHub, sync again.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="badge badge-primary badge-lg">
          {data.usedRepositorySlotCount} / {data.repositoryLimit} used
        </div>
        <a class="btn btn-sm btn-outline" href="/app/billing">Upgrade</a>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <table class="table">
        <thead>
          <tr class="border-base-300 text-neutral/55">
            <th>Repository</th>
            <th>Visibility</th>
            <th>Default branch</th>
            <th class="text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each repositories as repository}
            <tr class="border-base-300">
              <td>
                <a class="font-medium text-primary hover:underline" href={repository.html_url} target="_blank" rel="noreferrer">
                  {repository.full_name}
                </a>
              </td>
              <td>
                <span class="badge badge-ghost badge-sm">{repository.private ? 'Private' : 'Public'}</span>
              </td>
              <td class="font-mono text-xs text-neutral/60">{repository.default_branch ?? 'unknown'}</td>
              <td class="text-right">
                <form method="POST" action="?/toggleRepositoryActive">
                  <input type="hidden" name="repositoryId" value={repository.id} />
                  <input type="hidden" name="nextActive" value={String(!repository.active)} />
                  <button
                    class={repository.active ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline'}
                    type="submit"
                    disabled={!repository.active && !repository.usedThisPeriod && isAtRepositoryLimit}
                    title={!repository.active && !repository.usedThisPeriod && isAtRepositoryLimit ? 'Free plan limit reached' : undefined}
                  >
                    {repository.active ? 'Active' : 'Activate'}
                  </button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if isAtRepositoryLimit}
      <p class="mt-3 text-sm text-neutral/55">
        Monthly limit reached for {data.periodKey}. Upgrade to enable more repositories.
      </p>
    {/if}
  {/if}
</section>
