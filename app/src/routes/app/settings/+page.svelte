<script lang="ts">
  let { data, form } = $props();
</script>

<svelte:head>
  <title>Settings | ShipLog</title>
</svelte:head>

<section class="max-w-3xl">
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-neutral">Settings</h1>
    <p class="mt-1 text-sm text-neutral/65">Manage account and GitHub connection settings.</p>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-4 text-sm">{form.message}</div>
  {/if}

  {#if data.removed}
    <div class="alert alert-success mb-4 text-sm">GitHub connection data was removed.</div>
  {/if}

  <div class="rounded-lg border border-base-300 bg-base-100 p-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="font-semibold text-neutral">GitHub installation</h2>
        {#if data.githubInstallation}
          <p class="mt-2 text-sm leading-6 text-neutral/65">
            Connected installation #{data.githubInstallation.installation_id}. Removing it deletes
            locally stored repositories and release notes.
          </p>
          <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-neutral/55">Repositories</dt>
              <dd class="font-semibold text-neutral">{data.repositoryCount}</dd>
            </div>
            <div>
              <dt class="text-neutral/55">Release notes</dt>
              <dd class="font-semibold text-neutral">{data.releaseNoteCount}</dd>
            </div>
          </dl>
        {:else}
          <p class="mt-2 text-sm leading-6 text-neutral/65">
            No GitHub App installation is connected.
          </p>
        {/if}
      </div>

      {#if data.githubInstallation}
        <form method="POST" action="?/removeGithubConnection">
          <button class="btn btn-error btn-outline" type="submit">
            Remove connection
          </button>
        </form>
      {/if}
    </div>
  </div>

  <div class="mt-4 rounded-lg border border-base-300 bg-base-100 p-5">
    <h2 class="font-semibold text-neutral">Release note storage</h2>
    <p class="mt-2 text-sm leading-6 text-neutral/65">
      Generated release notes will be stored securely and tracked as draft or approved records.
    </p>
  </div>
</section>
