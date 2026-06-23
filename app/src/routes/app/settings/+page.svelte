<script lang="ts">
  import LogOut from '@lucide/svelte/icons/log-out';

  let { data, form } = $props();

  let removeGithubDialogOpen = $state(false);

  const meta = $derived((data.user?.user_metadata ?? {}) as Record<string, string | undefined>);
  const avatarUrl = $derived(meta.avatar_url);
  const displayName = $derived(meta.user_name || meta.full_name || meta.name || data.user?.email || 'Account');
  const email = $derived(data.user?.email ?? '');

  function openRemoveGithubDialog() {
    removeGithubDialogOpen = true;
  }

  function closeRemoveGithubDialog() {
    removeGithubDialogOpen = false;
  }
</script>

<svelte:head>
  <title>Settings | Blah Blah</title>
</svelte:head>

<section>
  <div class="mb-8">
    <h1 class="text-2xl font-semibold tracking-tight text-neutral">Settings</h1>
    <p class="mt-1 text-sm text-neutral/60">Manage your account and GitHub connection.</p>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-4 text-sm">{form.message}</div>
  {/if}

  {#if data.removed}
    <div class="alert alert-success mb-4 text-sm">GitHub connection data was removed.</div>
  {/if}

  <div class="space-y-4">
    <!-- Account -->
    <div class="rounded-xl border border-base-300 bg-base-100 p-6">
      <h2 class="font-semibold text-neutral">Account</h2>
      <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          {#if avatarUrl}
            <img
              src={avatarUrl}
              alt=""
              referrerpolicy="no-referrer"
              class="h-12 w-12 shrink-0 rounded-full border border-base-300 object-cover"
            />
          {:else}
            <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-semibold text-primary-content">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          {/if}
          <div class="min-w-0">
            <p class="truncate font-medium text-neutral">{displayName}</p>
            {#if email}
              <p class="truncate text-sm text-neutral/55">{email}</p>
            {/if}
          </div>
        </div>
        <form method="POST" action="/auth/logout" class="shrink-0">
          <button class="btn btn-error btn-sm gap-2" type="submit">
            <LogOut class="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>

    <!-- GitHub installation -->
    <div class="rounded-xl border border-base-300 bg-base-100 p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-3">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-base-200 text-neutral">
            <svg class="h-5 w-5" viewBox="0 0 98 96" aria-hidden="true" fill="currentColor">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M48.9 0C21.9 0 0 22 0 49.1c0 21.7 14 40.1 33.5 46.6 2.4.5 3.3-1.1 3.3-2.4 0-1.2-.1-5.2-.1-9.5-13.6 3-16.5-5.9-16.5-5.9-2.2-5.7-5.4-7.2-5.4-7.2-4.4-3 .3-3 .3-3 4.9.3 7.5 5.1 7.5 5.1 4.3 7.5 11.4 5.3 14.2 4.1.4-3.2 1.7-5.3 3.1-6.5-10.9-1.2-22.3-5.5-22.3-24.4 0-5.4 1.9-9.8 5-13.2-.5-1.2-2.2-6.3.5-13 0 0 4.1-1.3 13.4 5 3.9-1.1 8-1.6 12.2-1.6 4.1 0 8.3.5 12.2 1.6 9.3-6.3 13.4-5 13.4-5 2.7 6.7 1 11.8.5 13 3.1 3.4 5 7.8 5 13.2 0 18.9-11.5 23.1-22.4 24.3 1.8 1.6 3.3 4.6 3.3 9.3 0 6.7-.1 12.1-.1 13.7 0 1.3.9 2.9 3.4 2.4C84 89.2 98 70.8 98 49.1 97.8 22 75.9 0 48.9 0Z"
              />
            </svg>
          </span>
          <div>
            <h2 class="font-semibold text-neutral">GitHub installation</h2>
            {#if data.githubInstallation}
              <p class="mt-1 text-sm leading-6 text-neutral/60">
                Connected installation
                <span class="font-mono text-neutral/80">#{data.githubInstallation.installation_id}</span>.
                Removing it deletes locally stored repositories and release notes.
              </p>
            {:else}
              <p class="mt-1 text-sm leading-6 text-neutral/60">
                No GitHub App installation is connected.
              </p>
            {/if}
          </div>
        </div>

        {#if data.githubInstallation}
          <button class="btn btn-error btn-outline btn-sm shrink-0" type="button" onclick={openRemoveGithubDialog}>
            Remove connection
          </button>
        {/if}
      </div>

      {#if data.githubInstallation}
        <dl class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg border border-base-300 bg-base-200/40 p-4">
            <dt class="text-sm text-neutral/55">Repositories</dt>
            <dd class="mt-1 text-xl font-semibold text-neutral">{data.repositoryCount}</dd>
          </div>
          <div class="rounded-lg border border-base-300 bg-base-200/40 p-4">
            <dt class="text-sm text-neutral/55">Release notes</dt>
            <dd class="mt-1 text-xl font-semibold text-neutral">{data.releaseNoteCount}</dd>
          </div>
        </dl>
      {/if}
    </div>

    <!-- Release note storage -->
    <div class="rounded-xl border border-base-300 bg-base-100 p-6">
      <h2 class="font-semibold text-neutral">Release note storage</h2>
      <p class="mt-2 text-sm leading-6 text-neutral/60">
        Generated release notes are stored securely and tracked as draft or approved records.
      </p>
    </div>
  </div>
</section>

{#if removeGithubDialogOpen}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="remove-github-title"
  >
    <div class="w-full max-w-lg rounded-xl border border-base-300 bg-base-100 p-6 shadow-glow">
      <h2 id="remove-github-title" class="text-lg font-semibold text-neutral">Remove GitHub connection?</h2>
      <p class="mt-2 text-sm leading-6 text-neutral/65">
        This removes the connected GitHub installation from Blah Blah and deletes locally stored repositories and release notes.
      </p>

      {#if data.githubInstallation}
        <div class="panel-flat mt-4 rounded-lg border border-base-300 bg-base-200/50 p-3">
          <p class="text-sm font-medium text-neutral">
            Installation <span class="font-mono">#{data.githubInstallation.installation_id}</span>
          </p>
        </div>
      {/if}

      <div class="alert alert-error mt-4 text-sm">
        This cannot be undone from Blah Blah.
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn btn-ghost btn-sm" type="button" onclick={closeRemoveGithubDialog}>Keep connection</button>

        <form method="POST" action="?/removeGithubConnection">
          <button class="btn btn-error btn-sm" type="submit">Remove connection</button>
        </form>
      </div>
    </div>

    <button
      class="absolute inset-0 -z-10 cursor-default"
      type="button"
      aria-label="Close remove GitHub connection dialog"
      onclick={closeRemoveGithubDialog}
    ></button>
  </div>
{/if}
