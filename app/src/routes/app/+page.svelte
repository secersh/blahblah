<script lang="ts">
  import Ship from '@lucide/svelte/icons/ship';
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
  import CreditCard from '@lucide/svelte/icons/credit-card';

  let { data, form } = $props();

  const hasGithubInstallation = $derived(Boolean(data.githubInstallation));
  const hasActiveRepository = $derived(data.activeRepositoryCount > 0);
  const setupComplete = $derived(hasGithubInstallation && hasActiveRepository);
</script>

<svelte:head>
  <title>Dashboard | ShipLog</title>
</svelte:head>

<section>
  <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-neutral">Dashboard</h1>
      <p class="mt-1 text-sm text-neutral/60">Track connected repositories and generated drafts.</p>
    </div>
    <a class="btn btn-primary gap-2" href={setupComplete ? '/app/release-notes' : '/app/repositories'}>
      {setupComplete ? 'View release notes' : 'Finish setup'}
    </a>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-6 text-sm">{form.message}</div>
  {/if}

  {#if !setupComplete}
    <div class="mb-8 rounded-xl border border-base-300 bg-base-100 p-6">
      <div class="mb-5 flex items-start gap-3">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Ship class="h-5 w-5" />
        </span>
        <div>
          <h2 class="text-lg font-semibold text-neutral">Get set up</h2>
          <p class="mt-1 text-sm text-neutral/60">
            Install the GitHub App, allow repository access, then choose which repository ShipLog
            should generate release notes for.
          </p>
        </div>
      </div>

      <div class="grid gap-3">
        <div class="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-medium text-neutral">1. Install GitHub App</p>
            <p class="mt-1 text-sm text-neutral/60">
              {hasGithubInstallation ? 'GitHub is connected.' : 'Allow ShipLog to access selected repositories.'}
            </p>
          </div>
          {#if hasGithubInstallation}
            <span class="badge badge-success gap-1">Connected</span>
          {:else}
            <form method="POST" action="?/installGithubApp">
              <button class="btn btn-primary btn-sm" type="submit">Install GitHub App</button>
            </form>
          {/if}
        </div>

        <div class="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-medium text-neutral">2. Select active repository</p>
            <p class="mt-1 text-sm text-neutral/60">
              {hasActiveRepository
                ? `${data.activeRepositoryCount} active repository ready for release notes.`
                : 'Sync repositories, then activate the repo that should generate release notes.'}
            </p>
          </div>
          <a class="btn btn-outline btn-sm" class:btn-disabled={!hasGithubInstallation} href="/app/repositories">
            {hasActiveRepository ? 'Manage repos' : 'Select repos'}
          </a>
        </div>
      </div>
    </div>
  {/if}

  <div class="mb-8 grid gap-4 md:grid-cols-3">
    <article class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-neutral/55">Plan usage</p>
        <CreditCard class="h-4 w-4 text-neutral/40" />
      </div>
      <p class="mt-3 text-2xl font-semibold text-neutral">
        {data.usedRepositorySlotCount} / {data.repositoryLimit} <span class="text-base font-normal text-neutral/50">repos</span>
      </p>
      <p class="mt-1 text-xs text-neutral/45">{data.repositoryUsagePeriod}</p>
    </article>
    <article class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-neutral/55">Drafts</p>
        <ScrollText class="h-4 w-4 text-neutral/40" />
      </div>
      <p class="mt-3 text-2xl font-semibold text-neutral">{data.draftCount}</p>
    </article>
    <article class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-neutral/55">Active repositories</p>
        <FolderGit2 class="h-4 w-4 text-neutral/40" />
      </div>
      <p class="mt-3 text-2xl font-semibold text-neutral">{data.activeRepositoryCount}</p>
    </article>
  </div>

  <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <section class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-neutral">Active repositories</h2>
          <p class="mt-1 text-sm text-neutral/60">Currently generating release notes.</p>
        </div>
        <a class="btn btn-sm btn-outline" href="/app/repositories">Manage</a>
      </div>

      {#if data.activeRepositories.length === 0}
        <div class="rounded-lg border border-dashed border-base-300 p-6 text-center">
          <FolderGit2 class="mx-auto h-7 w-7 text-neutral/30" />
          <p class="mt-2 text-sm text-neutral/55">No active repositories yet.</p>
        </div>
      {:else}
        <div class="grid gap-3">
          {#each data.activeRepositories as repository}
            <article class="rounded-lg border border-base-300 bg-base-200/40 p-4">
              <p class="font-medium text-neutral">{repository.full_name}</p>
              <p class="mt-1 text-sm text-neutral/55">
                {repository.private ? 'Private' : 'Public'} · {repository.default_branch ?? 'default branch unknown'}
              </p>
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <section class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-neutral">Recent release notes</h2>
          <p class="mt-1 text-sm text-neutral/60">Latest drafts and approved notes.</p>
        </div>
        <a class="btn btn-sm btn-outline" href="/app/release-notes">View all</a>
      </div>

      {#if data.recentReleaseNotes.length === 0}
        <div class="rounded-lg border border-dashed border-base-300 p-6 text-center">
          <ScrollText class="mx-auto h-7 w-7 text-neutral/30" />
          <p class="mt-2 text-sm text-neutral/55">No release notes created yet.</p>
          {#if setupComplete}
            <a class="btn btn-sm btn-primary mt-4" href="/app/release-notes">Generate release notes</a>
          {/if}
        </div>
      {:else}
        <div class="overflow-hidden rounded-lg border border-base-300">
          <table class="table">
            <tbody>
              {#each data.recentReleaseNotes as releaseNote}
                <tr class="border-base-300">
                  <td>
                    <a class="font-medium text-neutral transition-colors hover:text-primary" href={`/app/release-notes/${releaseNote.id}`}>
                      {releaseNote.title}
                    </a>
                    <span class="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-md border border-base-300 bg-base-200/60 px-2 py-0.5 font-mono text-xs text-neutral/75">
                      <FolderGit2 class="h-3.5 w-3.5 shrink-0 text-neutral/45" />
                      <span class="truncate">{releaseNote.repositoryFullName}</span>
                    </span>
                  </td>
                  <td class="font-mono text-xs text-neutral/60">{releaseNote.previous_tag_name} → {releaseNote.tag_name}</td>
                  <td>
                    <span class="badge {releaseNote.status === 'approved' ? 'badge-success' : 'badge-ghost'}">
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
