<script lang="ts">
  let { form } = $props();
</script>

<svelte:head>
  <title>ShipLog</title>
</svelte:head>

<main class="grid min-h-screen bg-base-200 lg:grid-cols-[1.15fr_0.85fr]">
  <section class="flex items-center px-6 py-12 sm:px-10 lg:px-16">
    <div class="max-w-2xl">
      <p class="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">ShipLog</p>
      <h1 class="text-4xl font-semibold leading-tight text-neutral sm:text-5xl">
        Release notes generated from your GitHub tags.
      </h1>
      <p class="mt-6 max-w-xl text-lg leading-8 text-neutral/70">
        Connect a repository, listen for new tags, and turn the commits between releases into a
        clean markdown draft.
      </p>
    </div>
  </section>

  <section class="flex items-center justify-center bg-base-100 px-6 py-12">
    <div class="w-full max-w-sm rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-neutral">Sign in</h2>
      <p class="mt-2 text-sm leading-6 text-neutral/65">
        Continue with GitHub to start setting up your release workflow.
      </p>

      <form class="mt-6" method="POST">
        <button class="btn btn-primary w-full" type="submit">Continue with GitHub</button>
      </form>

      {#if form?.message}
        <div class="alert alert-error mt-4 text-sm">{form.message}</div>
      {/if}

      <p class="mt-4 text-xs leading-5 text-neutral/50">
        ShipLog will redirect back here after GitHub approval.
      </p>
    </div>
  </section>
</main>
