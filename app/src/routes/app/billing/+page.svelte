<svelte:head>
  <title>Billing | ShipLog</title>
</svelte:head>

<section class="max-w-6xl">
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-neutral">Billing</h1>
    <p class="mt-1 text-sm text-neutral/65">Choose a plan based on the number of connected repositories.</p>
  </div>

  <div class="grid gap-4 lg:grid-cols-3">
    <article class="rounded-lg border border-primary bg-base-100 p-5">
      <p class="text-sm font-semibold text-primary">Free</p>
      <p class="mt-3 text-3xl font-semibold text-neutral">$0</p>
      <p class="mt-2 text-sm text-neutral/65">1 repository</p>
      <button class="btn btn-primary mt-5 w-full">Current plan</button>
    </article>
    <article class="rounded-lg border border-base-300 bg-base-100 p-5">
      <p class="text-sm font-semibold text-neutral">Starter</p>
      <p class="mt-3 text-3xl font-semibold text-neutral">$5</p>
      <p class="mt-2 text-sm text-neutral/65">5 repositories per month</p>
      <button class="btn btn-outline btn-primary mt-5 w-full">Upgrade</button>
    </article>
    <article class="rounded-lg border border-base-300 bg-base-100 p-5">
      <p class="text-sm font-semibold text-neutral">Pro</p>
      <p class="mt-3 text-3xl font-semibold text-neutral">$15</p>
      <p class="mt-2 text-sm text-neutral/65">Unlimited repositories per month</p>
      <button class="btn btn-outline btn-primary mt-5 w-full">Upgrade</button>
    </article>
  </div>
</section>
