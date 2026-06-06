<script lang="ts">
  import { SiGithub } from '@icons-pack/svelte-simple-icons';
  import LogOut from '@lucide/svelte/icons/log-out';

  let { data, form } = $props();

  const meta = $derived((data.user?.user_metadata ?? {}) as Record<string, string | undefined>);
  const avatarUrl = $derived(meta.avatar_url);
  const displayName = $derived(meta.user_name || meta.full_name || meta.name || data.user?.email || 'Account');
  const email = $derived(data.user?.email ?? '');
</script>

<svelte:head>
  <title>Settings | ShipLog</title>
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
          <button class="btn btn-outline btn-sm gap-2" type="submit">
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
            <SiGithub class="h-5 w-5" />
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
          <form method="POST" action="?/removeGithubConnection" class="shrink-0">
            <button class="btn btn-error btn-outline btn-sm" type="submit">Remove connection</button>
          </form>
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
