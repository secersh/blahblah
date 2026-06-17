<script lang="ts">
  import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
  import CircleHelp from '@lucide/svelte/icons/circle-help';
  import RefreshCw from '@lucide/svelte/icons/refresh-cw';

  let { data, form } = $props();

  let repositoryPendingDeactivation = $state<{ id: string; full_name: string } | null>(null);

  const repositories = $derived(data.repositories);
  const isAtRepositoryLimit = $derived(
    data.repositoryLimit !== null && data.usedRepositorySlotCount >= data.repositoryLimit
  );
  const repositoryLimitLabel = $derived(data.repositoryLimit === null ? 'Unlimited' : data.repositoryLimit);
  const planName = $derived(data.billing.currentPlanDefinition.name);

  function openDeactivateDialog(repository: { id: string; full_name: string }) {
    repositoryPendingDeactivation = repository;
  }

  function closeDeactivateDialog() {
    repositoryPendingDeactivation = null;
  }
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
    <div class="mb-4 rounded-xl border border-base-300 bg-base-100 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-1.5">
            <p class="text-sm font-medium text-neutral">{planName} plan repositories</p>
            <span
              class="tooltip tooltip-right inline-flex h-6 w-6 items-center justify-center rounded-full text-neutral/55 transition-colors hover:bg-base-200 hover:text-neutral"
              data-tip={`${planName} plan repository usage is tracked monthly. Deactivating a repo pauses generation but does not remove this month's usage record.`}
            >
              <CircleHelp class="h-4 w-4" />
            </span>
          </div>
          <p class="mt-1 text-xs text-neutral/55">{data.periodKey}</p>
        </div>
        <p class="text-sm text-neutral/65">
          <span class="font-semibold text-neutral">{data.usedRepositorySlotCount}</span> / {repositoryLimitLabel} used
        </p>
      </div>
    </div>

    <p class="mb-4 text-sm text-neutral/55">
      If you change repository access on GitHub, sync again.
    </p>

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
            {@const activationBlocked = !repository.active && !repository.usedThisPeriod && isAtRepositoryLimit}
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
                {#if repository.active}
                  <button
                    class="btn btn-sm btn-primary"
                    type="button"
                    onclick={() => openDeactivateDialog(repository)}
                  >
                    Active
                  </button>
                {:else}
                  <form method="POST" action="?/toggleRepositoryActive">
                    <input type="hidden" name="repositoryId" value={repository.id} />
                    <input type="hidden" name="nextActive" value="true" />
                    {#if activationBlocked}
                      <button
                        class="btn btn-sm btn-outline"
                        type="submit"
                        disabled
                        aria-label="Activate unavailable: monthly repository quota reached"
                      >
                        Activate
                      </button>
                    {:else}
                      <button class="btn btn-sm btn-outline" type="submit">
                        Activate
                      </button>
                    {/if}
                  </form>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if isAtRepositoryLimit}
      <div class="alert alert-warning mt-4 text-sm">
        {planName} plan monthly repository quota reached. Upgrade to enable more repositories.
      </div>
    {/if}
  {/if}
</section>

{#if repositoryPendingDeactivation}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="deactivate-repository-title"
  >
    <div class="w-full max-w-lg rounded-xl border border-base-300 bg-base-100 p-6 shadow-glow">
      <h2 id="deactivate-repository-title" class="text-lg font-semibold text-neutral">Deactivate repository?</h2>
      <p class="mt-2 text-sm leading-6 text-neutral/65">
        ShipLog will stop processing webhook events and generating release notes for this repository.
      </p>

      <div class="mt-4 rounded-lg border border-base-300 bg-base-200/50 p-3">
        <p class="font-mono text-sm font-medium text-neutral">
          {repositoryPendingDeactivation.full_name}
        </p>
      </div>

      {#if data.billing.currentPlan === 'free'}
        <div class="alert alert-warning mt-4 text-sm">
          On the free plan, deactivating this repository does not free this month's repository slot.
        </div>
      {/if}

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn btn-ghost btn-sm" type="button" onclick={closeDeactivateDialog}>Cancel</button>

        <form method="POST" action="?/toggleRepositoryActive">
          <input type="hidden" name="repositoryId" value={repositoryPendingDeactivation.id} />
          <input type="hidden" name="nextActive" value="false" />
          <button class="btn btn-error btn-sm" type="submit">Deactivate repository</button>
        </form>
      </div>
    </div>

    <button
      class="absolute inset-0 -z-10 cursor-default"
      type="button"
      aria-label="Close deactivation dialog"
      onclick={closeDeactivateDialog}
    ></button>
  </div>
{/if}
