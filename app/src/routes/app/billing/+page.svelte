<script lang="ts">
  let { data, form } = $props();

  let billingInterval = $state<'monthly' | 'yearly'>('monthly');
  let pendingBillingAction = $state<'cancel' | 'resume' | null>(null);
  let pendingPlanChange = $state<{ plan: 'starter' | 'pro'; interval: 'monthly' | 'yearly' } | null>(null);

  const currentPlan = $derived(data.billing.currentPlan);
  const currentInterval = $derived(data.billing.currentInterval);
  const starterIsCurrent = $derived(currentPlan === 'starter' && currentInterval === billingInterval);
  const proIsCurrent = $derived(currentPlan === 'pro' && currentInterval === billingInterval);
  const subscriptionCancelled = $derived(data.billing.subscription?.status === 'cancelled');
  const showCheckoutSuccess = $derived(data.checkoutSuccess && currentPlan === 'free');
  const showPlanChanged = $derived(
    data.planChanged &&
      (currentPlan !== data.requestedPlan || currentInterval !== data.requestedInterval)
  );
  const showCancellationRequested = $derived(data.cancellationRequested && !subscriptionCancelled);
  const showResumeRequested = $derived(data.resumeRequested && subscriptionCancelled);
  const subscriptionStatusLabel = $derived(
    data.billing.subscription?.status
      ? String(data.billing.subscription.status)
          .replaceAll('_', ' ')
          .replace(/\b\w/g, (character) => character.toUpperCase())
      : ''
  );
  const starterPrice = $derived(billingInterval === 'monthly' ? '$5' : '$50');
  const proPrice = $derived(billingInterval === 'monthly' ? '$15' : '$150');
  const priceSuffix = $derived(billingInterval === 'monthly' ? '/mo' : '/yr');
  const checkoutLabel = $derived(billingInterval === 'monthly' ? 'Upgrade monthly' : 'Upgrade yearly');
  const pendingPlanName = $derived(pendingPlanChange?.plan === 'pro' ? 'Pro' : 'Starter');
  const pendingIntervalName = $derived(pendingPlanChange?.interval === 'yearly' ? 'yearly' : 'monthly');
  const planChangeKind = $derived(
    !pendingPlanChange
      ? null
      : currentPlan === pendingPlanChange.plan
        ? 'interval'
        : currentPlan === 'starter' && pendingPlanChange.plan === 'pro'
          ? 'upgrade'
          : 'downgrade'
  );
  const planChangeTitle = $derived(
    planChangeKind === 'upgrade'
      ? 'Upgrade subscription?'
      : planChangeKind === 'downgrade'
        ? 'Downgrade subscription?'
        : 'Change billing interval?'
  );
  const planChangeDescription = $derived(
    planChangeKind === 'upgrade'
      ? 'ShipLog will submit this subscription change to the billing provider. The price difference may be invoiced immediately.'
      : planChangeKind === 'downgrade'
        ? 'ShipLog will submit this subscription change without requesting an immediate invoice. Limits may update after the change is confirmed.'
        : 'ShipLog will submit this billing interval change without requesting an immediate invoice.'
  );

  function openBillingDialog(action: 'cancel' | 'resume') {
    pendingBillingAction = action;
  }

  function closeBillingDialog() {
    pendingBillingAction = null;
  }

  function openPlanChangeDialog(plan: 'starter' | 'pro', interval: 'monthly' | 'yearly') {
    pendingPlanChange = { plan, interval };
  }

  function closePlanChangeDialog() {
    pendingPlanChange = null;
  }

  function formatInvoiceDate(value: string | null) {
    if (!value) return 'Not available';

    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatInvoiceAmount(value: string | null) {
    if (!value) return 'Not available';

    const creditMatch = value.match(/^\((.+)\)$/);

    return creditMatch ? `-${creditMatch[1]} credit` : value;
  }
</script>

<svelte:head>
  <title>Billing | ShipLog</title>
</svelte:head>

<section>
  <div class="mb-8">
    <h1 class="text-2xl font-semibold tracking-tight text-neutral">Billing</h1>
    <p class="mt-1 text-sm text-neutral/60">Choose a plan based on repositories and release note volume.</p>
  </div>

  {#if showCheckoutSuccess}
    <div class="alert alert-success mb-6 text-sm">
      Checkout completed. Your plan will update as soon as the subscription is confirmed.
    </div>
  {/if}

  {#if showPlanChanged}
    <div class="alert alert-success mb-6 text-sm">
      Plan change submitted. Your plan will update as soon as the subscription change is confirmed.
    </div>
  {/if}

  {#if showCancellationRequested}
    <div class="alert alert-success mb-6 text-sm">
      Cancellation submitted. Your paid access remains available until the subscription ends.
    </div>
  {/if}

  {#if showResumeRequested}
    <div class="alert alert-success mb-6 text-sm">
      Resume submitted. Your subscription will continue renewing after the change is confirmed.
    </div>
  {/if}

  {#if form?.message}
    <div class="alert alert-error mb-6 text-sm">{form.message}</div>
  {/if}

  {#if data.billing.hasPaymentIssue}
    <div class="alert alert-warning mb-6 text-sm">
      <div>
        <p class="font-medium">Payment failed</p>
        <p class="mt-1 text-xs">Update your payment method to keep the subscription active.</p>
      </div>
    </div>
  {/if}

  <div class="mb-4 flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p class="text-sm font-medium text-neutral">Billing interval</p>
      <p class="mt-1 text-xs text-neutral/55">Choose yearly to get two months free.</p>
    </div>
    <div class="join">
      <button
        class="btn join-item btn-sm {billingInterval === 'monthly' ? 'btn-primary' : 'btn-outline'}"
        type="button"
        onclick={() => (billingInterval = 'monthly')}
      >
        Monthly
      </button>
      <button
        class="btn join-item btn-sm {billingInterval === 'yearly' ? 'btn-primary' : 'btn-outline'}"
        type="button"
        onclick={() => (billingInterval = 'yearly')}
      >
        Yearly
        <span class="badge badge-sm ml-1 {billingInterval === 'yearly' ? 'badge-ghost' : 'badge-primary'}">
          Save 17%
        </span>
      </button>
    </div>
  </div>

  <div class="grid items-stretch gap-5 lg:grid-cols-3">
    <article class="relative flex min-h-[22rem] rounded-xl border bg-base-100 p-6 {currentPlan === 'free' ? 'border-2 border-primary' : 'border-base-300'} flex-col">
      {#if currentPlan === 'free'}
        <span class="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-content">
          Current plan
        </span>
      {/if}
      <p class="text-sm font-semibold text-primary">Free</p>
      <p class="mt-4 text-3xl font-semibold text-neutral">$0<span class="text-base font-normal text-neutral/50">/mo</span></p>
      <p class="mt-2 min-h-5 text-xs text-neutral/40">Always free</p>
      <ul class="mt-6 space-y-3 text-sm text-neutral/65">
        <li>1 repository per month</li>
        <li>20 release notes per month</li>
      </ul>
      <button class="btn btn-primary mt-auto w-full" disabled>
        {currentPlan === 'free' ? 'Current plan' : 'Included'}
      </button>
    </article>

    <article class="relative flex min-h-[22rem] rounded-xl border bg-base-100 p-6 {starterIsCurrent ? 'border-2 border-primary' : 'border-base-300'} flex-col">
      {#if starterIsCurrent}
        <span class="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-content">
          Current plan
        </span>
      {/if}
      <p class="text-sm font-semibold text-neutral">Starter</p>
      <p class="mt-4 text-3xl font-semibold text-neutral">{starterPrice}<span class="text-base font-normal text-neutral/50">{priceSuffix}</span></p>
      <p class="mt-2 min-h-5 text-xs {billingInterval === 'yearly' ? 'text-success' : 'text-neutral/40'}">
        {billingInterval === 'yearly' ? 'Save $10 per year' : 'Billed monthly'}
      </p>
      <ul class="mt-6 space-y-3 text-sm text-neutral/65">
        <li>5 repositories per month</li>
        <li>100 release notes per month</li>
      </ul>
      {#if starterIsCurrent}
        <button class="btn btn-primary mt-auto w-full" disabled>Current plan</button>
      {:else if subscriptionCancelled}
        <button class="btn btn-outline mt-auto w-full" disabled>Subscription cancelled</button>
      {:else if currentPlan !== 'free'}
        <div class="mt-auto grid gap-2">
          <button
            class="btn btn-outline w-full"
            type="button"
            onclick={() => openPlanChangeDialog('starter', billingInterval)}
          >
            {currentPlan === 'starter' ? `Switch to ${billingInterval}` : 'Switch to Starter'}
          </button>
        </div>
      {:else}
        <div class="mt-auto grid gap-2">
          <form method="POST" action="?/checkout">
            <input type="hidden" name="plan" value="starter" />
            <input type="hidden" name="interval" value={billingInterval} />
            <button class="btn btn-primary w-full" type="submit">{checkoutLabel}</button>
          </form>
        </div>
      {/if}
    </article>

    <article class="relative flex min-h-[22rem] rounded-xl border bg-base-100 p-6 {proIsCurrent ? 'border-2 border-primary' : 'border-base-300'} flex-col">
      {#if proIsCurrent}
        <span class="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-content">
          Current plan
        </span>
      {/if}
      <p class="text-sm font-semibold text-neutral">Pro</p>
      <p class="mt-4 text-3xl font-semibold text-neutral">{proPrice}<span class="text-base font-normal text-neutral/50">{priceSuffix}</span></p>
      <p class="mt-2 min-h-5 text-xs {billingInterval === 'yearly' ? 'text-success' : 'text-neutral/40'}">
        {billingInterval === 'yearly' ? 'Save $30 per year' : 'Billed monthly'}
      </p>
      <ul class="mt-6 space-y-3 text-sm text-neutral/65">
        <li>Unlimited repositories</li>
        <li>Unlimited release notes</li>
      </ul>
      {#if proIsCurrent}
        <button class="btn btn-primary mt-auto w-full" disabled>Current plan</button>
      {:else if subscriptionCancelled}
        <button class="btn btn-outline mt-auto w-full" disabled>Subscription cancelled</button>
      {:else if currentPlan !== 'free'}
        <div class="mt-auto grid gap-2">
          <button
            class="btn btn-primary w-full"
            type="button"
            onclick={() => openPlanChangeDialog('pro', billingInterval)}
          >
            {currentPlan === 'pro' ? `Switch to ${billingInterval}` : 'Switch to Pro'}
          </button>
        </div>
      {:else}
        <div class="mt-auto grid gap-2">
          <form method="POST" action="?/checkout">
            <input type="hidden" name="plan" value="pro" />
            <input type="hidden" name="interval" value={billingInterval} />
            <button class="btn btn-primary w-full" type="submit">{checkoutLabel}</button>
          </form>
        </div>
      {/if}
    </article>
  </div>

  {#if data.billing.subscription}
    <section class="mt-4 rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="font-semibold text-neutral">Subscription status</h2>
          <p class="mt-1 text-xs text-neutral/55">
            {subscriptionCancelled
              ? 'This subscription is cancelled. Paid access remains available until the end date.'
              : 'Plan changes and cancellation are handled in ShipLog. Payment method updates open the secure payment page.'}
          </p>
        </div>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <a class="btn btn-ghost btn-sm w-full border border-base-300 bg-base-200/60 text-neutral/70 hover:bg-base-200 hover:text-neutral sm:w-auto" href="/app/billing/portal" target="_blank" rel="noreferrer">
            Update payment method
          </a>
          {#if data.billing.currentPlan !== 'free' && data.billing.subscription.status !== 'cancelled'}
            <button
              class="btn btn-error btn-outline btn-sm w-full sm:w-auto"
              type="button"
              onclick={() => openBillingDialog('cancel')}
            >
              Cancel subscription
            </button>
          {:else if data.billing.currentPlan !== 'free' && data.billing.subscription.status === 'cancelled'}
            <button
              class="btn btn-primary btn-sm w-full sm:w-auto"
              type="button"
              onclick={() => openBillingDialog('resume')}
            >
              Resume subscription
            </button>
          {/if}
        </div>
      </div>
      <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt class="text-neutral/50">Status</dt>
          <dd class="mt-1">
            <span
              class="badge badge-lg {subscriptionCancelled
                ? 'badge-error'
                : data.billing.subscription.status === 'active'
                  ? 'badge-success'
                  : 'badge-warning'}"
            >
              {subscriptionStatusLabel}
            </span>
          </dd>
        </div>
        <div>
          <dt class="text-neutral/50">Renews</dt>
          <dd class="mt-1 font-medium text-neutral">
            {data.billing.subscription.renews_at
              ? new Date(data.billing.subscription.renews_at).toLocaleDateString()
              : 'Not available'}
          </dd>
        </div>
        <div>
          <dt class="text-neutral/50">Ends</dt>
          <dd class="mt-1 font-medium text-neutral">
            {data.billing.subscription.ends_at
              ? new Date(data.billing.subscription.ends_at).toLocaleDateString()
              : 'Not scheduled'}
          </dd>
        </div>
      </dl>
    </section>

    <section class="mt-4 rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="font-semibold text-neutral">Invoices</h2>
          <p class="mt-1 text-xs text-neutral/55">Recent subscription invoices and receipts.</p>
        </div>
      </div>

      {#if data.invoices.length > 0}
        <div class="mt-4 overflow-hidden rounded-lg border border-base-300">
          <div class="hidden grid-cols-[1.2fr_1fr_1fr_auto] gap-4 border-b border-base-300 bg-base-200/60 px-4 py-2 text-xs font-medium text-neutral/45 sm:grid">
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span class="text-right">Invoice</span>
          </div>
          <div class="divide-y divide-base-300">
            {#each data.invoices as invoice}
              <div class="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center sm:gap-4">
                <div>
                  <p class="font-medium text-neutral sm:hidden">Date</p>
                  <p class="text-neutral/70">{formatInvoiceDate(invoice.createdAt)}</p>
                </div>
                <div>
                  <p class="font-medium text-neutral sm:hidden">Amount</p>
                  <p class="text-neutral">{formatInvoiceAmount(invoice.totalFormatted)}</p>
                </div>
                <div>
                  <p class="font-medium text-neutral sm:hidden">Status</p>
                  <span
                    class="badge badge-sm {invoice.status === 'paid'
                      ? 'badge-success'
                      : invoice.status === 'refunded'
                        ? 'badge-neutral'
                        : 'badge-warning'}"
                  >
                    {invoice.statusFormatted ?? invoice.status ?? 'Unknown'}
                  </span>
                </div>
                <div class="sm:text-right">
                  {#if invoice.invoiceUrl}
                    <a
                      class="btn btn-ghost btn-xs border border-base-300 bg-base-200/60 text-neutral/70 hover:bg-base-200 hover:text-neutral"
                      href={invoice.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  {:else}
                    <span class="text-xs text-neutral/40">Unavailable</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="mt-4 rounded-lg border border-dashed border-base-300 bg-base-200/30 px-4 py-6 text-sm text-neutral/55">
          No invoices yet.
        </div>
      {/if}
    </section>
  {/if}
</section>

{#if pendingPlanChange}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="plan-change-title"
  >
    <div class="w-full max-w-lg rounded-xl border border-base-300 bg-base-100 p-6 shadow-glow">
      <h2 id="plan-change-title" class="text-lg font-semibold text-neutral">{planChangeTitle}</h2>
      <p class="mt-2 text-sm leading-6 text-neutral/65">{planChangeDescription}</p>

      <div class="mt-4 grid gap-3 rounded-lg border border-base-300 bg-base-200/50 p-3 text-sm sm:grid-cols-2">
        <div>
          <p class="text-xs font-medium text-neutral/50">Current</p>
          <p class="mt-1 font-medium text-neutral">
            {data.billing.currentPlanDefinition.name}
            {currentInterval ? ` - ${currentInterval}` : ''}
          </p>
        </div>
        <div>
          <p class="text-xs font-medium text-neutral/50">New</p>
          <p class="mt-1 font-medium text-neutral">{pendingPlanName} - {pendingIntervalName}</p>
        </div>
      </div>

      {#if planChangeKind === 'downgrade'}
        <div class="alert alert-warning mt-4 text-sm">
          Downgrading can reduce repository and release note limits after the change is confirmed.
        </div>
      {:else if planChangeKind === 'upgrade'}
        <div class="alert alert-info mt-4 text-sm">
          Upgrades may create an immediate prorated charge through the billing provider.
        </div>
      {:else}
        <div class="alert alert-info mt-4 text-sm">
          Billing interval changes are submitted without requesting an immediate invoice.
        </div>
      {/if}

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn btn-ghost btn-sm" type="button" onclick={closePlanChangeDialog}>Keep current plan</button>

        <form method="POST" action="?/changePlan">
          <input type="hidden" name="plan" value={pendingPlanChange.plan} />
          <input type="hidden" name="interval" value={pendingPlanChange.interval} />
          <button class="btn btn-primary btn-sm" type="submit">
            Confirm change
          </button>
        </form>
      </div>
    </div>

    <button
      class="absolute inset-0 -z-10 cursor-default"
      type="button"
      aria-label="Close plan change dialog"
      onclick={closePlanChangeDialog}
    ></button>
  </div>
{/if}

{#if pendingBillingAction}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="billing-action-title"
  >
    <div class="w-full max-w-lg rounded-xl border border-base-300 bg-base-100 p-6 shadow-glow">
      <h2 id="billing-action-title" class="text-lg font-semibold text-neutral">
        {pendingBillingAction === 'cancel' ? 'Cancel subscription?' : 'Resume subscription?'}
      </h2>
      <p class="mt-2 text-sm leading-6 text-neutral/65">
        {pendingBillingAction === 'cancel'
          ? 'ShipLog will stop renewing this subscription. Your paid access remains available until the end date.'
          : 'ShipLog will resume renewals for this subscription.'}
      </p>

      <div class="mt-4 rounded-lg border border-base-300 bg-base-200/50 p-3">
        <p class="text-sm font-medium text-neutral">
          {data.billing.currentPlanDefinition.name} plan
          {data.billing.currentInterval ? ` - ${data.billing.currentInterval}` : ''}
        </p>
        <p class="mt-1 text-xs text-neutral/55">
          {pendingBillingAction === 'cancel'
            ? `Access ends ${data.billing.subscription?.ends_at ? new Date(data.billing.subscription.ends_at).toLocaleDateString() : 'after the current billing period'}.`
            : 'Renewal will continue once the change is confirmed.'}
        </p>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn btn-ghost btn-sm" type="button" onclick={closeBillingDialog}>Keep current state</button>

        {#if pendingBillingAction === 'cancel'}
          <form method="POST" action="?/cancelSubscription">
            <button class="btn btn-error btn-sm" type="submit">Cancel subscription</button>
          </form>
        {:else}
          <form method="POST" action="?/resumeSubscription">
            <button class="btn btn-primary btn-sm" type="submit">Resume subscription</button>
          </form>
        {/if}
      </div>
    </div>

    <button
      class="absolute inset-0 -z-10 cursor-default"
      type="button"
      aria-label="Close billing confirmation dialog"
      onclick={closeBillingDialog}
    ></button>
  </div>
{/if}
