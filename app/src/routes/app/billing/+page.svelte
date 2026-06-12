<svelte:head>
  <title>Billing | ShipLog</title>
</svelte:head>

<section>
  <div class="mb-8">
    <h1 class="text-2xl font-semibold tracking-tight text-neutral">Billing</h1>
    <p class="mt-1 text-sm text-neutral/60">Choose a plan based on repositories and release-note volume.</p>
  </div>

  <div class="grid gap-4 lg:grid-cols-3">
    <article class="relative rounded-xl border-2 border-primary bg-base-100 p-6">
      <span class="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-content">
        Current plan
      </span>
      <p class="text-sm font-semibold text-primary">Free</p>
      <p class="mt-3 text-3xl font-semibold text-neutral">$0<span class="text-base font-normal text-neutral/50">/mo</span></p>
      <ul class="mt-4 space-y-2 text-sm text-neutral/65">
        <li>1 repository per month</li>
        <li>20 release notes per month</li>
      </ul>
      <button class="btn btn-primary mt-6 w-full" disabled>Current plan</button>
    </article>

    <article class="rounded-xl border border-base-300 bg-base-100 p-6">
      <p class="text-sm font-semibold text-neutral">Starter</p>
      <p class="mt-3 text-3xl font-semibold text-neutral">$5<span class="text-base font-normal text-neutral/50">/mo</span></p>
      <ul class="mt-4 space-y-2 text-sm text-neutral/65">
        <li>5 repositories per month</li>
        <li>100 release notes per month</li>
      </ul>
      <button class="btn btn-outline mt-6 w-full">Upgrade</button>
    </article>

    <article class="rounded-xl border border-base-300 bg-base-100 p-6">
      <p class="text-sm font-semibold text-neutral">Pro</p>
      <p class="mt-3 text-3xl font-semibold text-neutral">$15<span class="text-base font-normal text-neutral/50">/mo</span></p>
      <ul class="mt-4 space-y-2 text-sm text-neutral/65">
        <li>Unlimited repositories</li>
        <li>Unlimited release notes</li>
      </ul>
      <button class="btn btn-outline mt-6 w-full">Upgrade</button>
    </article>
  </div>
</section>
