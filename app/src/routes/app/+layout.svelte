<script lang="ts">
  import { page } from '$app/stores';
  import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
  import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import CreditCard from '@lucide/svelte/icons/credit-card';
  import Settings from '@lucide/svelte/icons/settings';
  import Menu from '@lucide/svelte/icons/menu';
  import LogOut from '@lucide/svelte/icons/log-out';
  import Brand from '$lib/components/Brand.svelte';
  import ReleaseNotesRealtime from '$lib/components/ReleaseNotesRealtime.svelte';

  let { children, data } = $props();

  const meta = $derived((data.user?.user_metadata ?? {}) as Record<string, string | undefined>);
  const avatarUrl = $derived(meta.avatar_url);
  const displayName = $derived(meta.user_name || meta.full_name || meta.name || data.user?.email || 'Account');
  const email = $derived(data.user?.email ?? '');
  const repositoryLimitLabel = $derived(
    data.billing.limits.repositories === null ? 'Unlimited repositories' : `${data.billing.limits.repositories} repositories`
  );
  const releaseNoteLimitLabel = $derived(
    data.billing.limits.releaseNotes === null
      ? 'unlimited release notes'
      : `${data.billing.limits.releaseNotes} release notes`
  );
  const billingIntervalLabel = $derived(
    data.billing.currentInterval ? `${data.billing.currentInterval} subscription` : 'subscription'
  );

  const navItems = [
    { href: '/app', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/app/repositories', icon: FolderGit2, label: 'Repositories' },
    { href: '/app/release-notes', icon: ScrollText, label: 'Release Notes' },
    { href: '/app/billing', icon: CreditCard, label: 'Billing' },
    { href: '/app/settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (href: string, pathname: string) =>
    href === '/app' ? pathname === '/app' : pathname.startsWith(href);
</script>

<svelte:head>
  <!-- Private application area: keep it out of search indexes. -->
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="app-shell min-h-screen bg-[#f8f1dd] text-[#11100d]">
  <ReleaseNotesRealtime accessToken={data.session?.access_token} userId={data.user?.id} />

  <div class="drawer lg:drawer-open">
    <input id="app-nav" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content min-w-0">
      <header class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b-4 border-[#11100d] bg-[#ffe34f] px-4 lg:hidden">
        <label
          for="app-nav"
          class="btn btn-square btn-ghost btn-sm"
          aria-label="Open navigation"
        >
          <Menu class="h-5 w-5" />
        </label>
        <Brand size="sm" href="/app" />
      </header>

      <main class="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
        {@render children()}
      </main>
    </div>

    <aside class="drawer-side z-30">
      <label for="app-nav" aria-label="Close navigation" class="drawer-overlay"></label>
      <nav class="flex min-h-full w-72 flex-col border-r-4 border-[#11100d] bg-[#ffe34f] px-4 py-5">
        <div class="px-2 pb-6">
          <Brand size="md" href="/app" />
        </div>
        <ul class="space-y-1">
          {#each navItems as item}
            {@const active = isActive(item.href, $page.url.pathname)}
            <li>
              <a
                href={item.href}
                aria-current={active ? 'page' : undefined}
                class="app-nav-link flex items-center gap-3 px-3 py-2.5 text-sm font-black transition-colors {active
                  ? 'is-active'
                  : ''}"
              >
                <item.icon class="h-5 w-5 shrink-0" />
                {item.label}
              </a>
            </li>
          {/each}
        </ul>

        <div class="mt-auto space-y-3 pt-6">
          <div class="rounded-lg border-[3px] border-[#11100d] bg-white p-4 shadow-[5px_5px_0_#11100d]">
            <p class="text-xs font-medium text-neutral/55">
              {data.billing.currentPlanDefinition.name} plan
              {#if data.billing.currentPlan !== 'free'}
                <span class="text-neutral/40"> / {billingIntervalLabel}</span>
              {/if}
            </p>
            <p class="mt-1 text-sm leading-5 text-neutral/70">
              {repositoryLimitLabel} and {releaseNoteLimitLabel} per month.
            </p>
            {#if data.billing.hasPaymentIssue}
              <div class="mt-3 rounded-lg border border-warning/40 bg-warning/15 p-3">
                <p class="text-xs font-semibold text-neutral">Payment needs attention</p>
                <a class="btn btn-warning btn-xs mt-2 w-full" href="/app/billing">
                  Review billing
                </a>
              </div>
            {/if}
            <a class="btn btn-primary btn-sm mt-3 w-full" href="/app/billing">
              {data.billing.currentPlan === 'free' ? 'Upgrade' : 'Billing'}
            </a>
          </div>

          <div class="flex items-center gap-3 rounded-lg border-[3px] border-[#11100d] bg-white p-2.5 shadow-[4px_4px_0_#11100d]">
            {#if avatarUrl}
              <img
                src={avatarUrl}
                alt=""
                referrerpolicy="no-referrer"
                class="h-9 w-9 shrink-0 rounded-full border border-base-300 object-cover"
              />
            {:else}
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-content">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
            {/if}
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-neutral">{displayName}</p>
              {#if email}
                <p class="truncate text-xs text-neutral/50">{email}</p>
              {/if}
            </div>
            <form method="POST" action="/auth/logout">
              <button
                class="btn btn-square btn-error btn-sm"
                type="submit"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut class="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </nav>
    </aside>
  </div>
</div>

<style>
  .app-shell :global(.font-display),
  .app-shell :global(h1),
  .app-shell :global(h2) {
    font-family:
      "Arial Black", "Arial Rounded MT Bold", Impact, ui-sans-serif, system-ui,
      sans-serif;
    letter-spacing: 0;
  }

  .app-shell {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .app-shell :global(p),
  .app-shell :global(span),
  .app-shell :global(td),
  .app-shell :global(label),
  .app-shell :global(input),
  .app-shell :global(select),
  .app-shell :global(textarea) {
    letter-spacing: 0;
  }

  .app-shell :global(h1) {
    color: #11100d;
    font-weight: 900;
    text-transform: uppercase;
  }

  .app-shell :global(h2) {
    color: #11100d;
    font-weight: 900;
  }

  .app-shell :global(.btn) {
    min-height: 2.5rem;
    border: 3px solid #11100d;
    border-radius: 0.45rem;
    background: #ffffff;
    color: #11100d;
    font-weight: 900;
    box-shadow: 4px 4px 0 #11100d;
    transition:
      box-shadow 120ms ease,
      transform 120ms ease;
  }

  .app-shell :global(.btn:hover:not(:disabled)) {
    transform: translate3d(-2px, -2px, 0);
    box-shadow: 6px 6px 0 #11100d;
  }

  .app-shell :global(.btn-primary) {
    background: #6d4aff;
    color: #ffffff;
  }

  .app-shell :global(.btn-primary:hover:not(:disabled)) {
    background: #5d38f2;
    color: #ffffff;
  }

  .app-shell :global(.btn-error) {
    background: #ff5b5b;
    color: #11100d;
  }

  .app-shell :global(.btn-error:hover:not(:disabled)) {
    background: #ff7777;
    color: #11100d;
  }

  .app-shell :global(.btn-warning) {
    background: #ffe34f;
    color: #11100d;
  }

  .app-shell :global(.btn-ghost) {
    background: transparent;
    box-shadow: none;
  }

  .app-shell :global(.btn-ghost:hover:not(:disabled)) {
    background: #ffffff;
    color: #11100d;
    box-shadow: 4px 4px 0 #11100d;
  }

  .app-shell :global(.btn-disabled),
  .app-shell :global(.btn:disabled) {
    opacity: 0.55;
    box-shadow: none;
  }

  .app-shell :global(.badge) {
    min-height: 1.65rem;
    border: 2px solid #11100d;
    border-radius: 999px;
    background: #ffffff;
    color: #11100d;
    font-weight: 900;
  }

  .app-shell :global(.badge-success) {
    background: #7fe0a7;
  }

  .app-shell :global(.badge-error) {
    background: #ff5b5b;
  }

  .app-shell :global(.badge-warning),
  .app-shell :global(.badge-primary) {
    background: #ffe34f;
  }

  .app-shell :global(.alert) {
    border: 3px solid #11100d;
    border-radius: 0.5rem;
    background: #ffffff;
    color: #11100d;
    font-weight: 800;
    box-shadow: 4px 4px 0 #11100d;
  }

  .app-shell :global(.alert-success) {
    background: #dff8e8;
  }

  .app-shell :global(.alert-warning) {
    background: #fff4a8;
  }

  .app-shell :global(.alert-error) {
    background: #ffe0e0;
  }

  .app-shell :global(.alert-info) {
    background: #dff0ff;
  }

  .app-shell :global(.rounded-xl.border),
  .app-shell :global(.rounded-lg.border),
  .app-shell :global(dialog > div),
  .app-shell :global(.modal-box) {
    border: 3px solid #11100d !important;
    border-radius: 0.5rem !important;
    background: #ffffff !important;
    color: #11100d;
    box-shadow: 6px 6px 0 #11100d;
  }

  .app-shell :global(.border-base-300),
  .app-shell :global(.divide-base-300 > :not([hidden]) ~ :not([hidden])) {
    border-color: #11100d !important;
  }

  .app-shell :global(.bg-base-100),
  .app-shell :global(.bg-base-100\/60) {
    background-color: #ffffff !important;
  }

  .app-shell :global(.bg-base-200),
  .app-shell :global(.bg-base-200\/40),
  .app-shell :global(.bg-base-200\/50),
  .app-shell :global(.bg-base-200\/60),
  .app-shell :global(.bg-base-200\/70) {
    background-color: #f8f1dd !important;
  }

  .app-nav-link {
    position: relative;
    border: 3px solid transparent;
    border-radius: 0.5rem;
    color: #11100d;
  }

  .app-nav-link:hover {
    border-color: transparent;
    background: transparent;
    color: #6d4aff;
  }

  .app-nav-link.is-active {
    border-color: #11100d;
    background: #ff5bbd;
    color: #ffffff;
    box-shadow: 4px 4px 0 #11100d;
  }

  .app-shell :global(.table thead tr) {
    border-bottom: 3px solid #11100d;
    background: #ffe34f;
    color: #11100d;
    font-weight: 900;
  }

  .app-shell :global(.table tbody tr) {
    border-color: #11100d;
  }

  .app-shell :global(.input),
  .app-shell :global(.select),
  .app-shell :global(.textarea) {
    border: 3px solid #11100d;
    border-radius: 0.45rem;
    background: #ffffff;
    color: #11100d;
    font-weight: 800;
    box-shadow: none;
  }

  .app-shell :global(.select) {
    min-height: 2.75rem;
    padding-inline: 0.85rem 2.5rem;
    line-height: 1.2;
    appearance: none;
    background-image:
      linear-gradient(45deg, transparent 50%, #11100d 50%),
      linear-gradient(135deg, #11100d 50%, transparent 50%);
    background-position:
      calc(100% - 1.15rem) 50%,
      calc(100% - 0.8rem) 50%;
    background-repeat: no-repeat;
    background-size:
      0.35rem 0.35rem,
      0.35rem 0.35rem;
  }

  .app-shell :global(.select-sm) {
    min-height: 2.4rem;
    height: 2.4rem;
    padding-inline: 0.75rem 2.25rem;
  }

  .app-shell :global(.join .btn) {
    border-radius: 0;
  }

  .app-shell :global(.label-text) {
    color: #11100d !important;
    font-weight: 900;
  }

  .app-shell :global(.select option) {
    background: #ffffff;
    color: #11100d;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 800;
  }

  .app-shell :global(.select option:checked) {
    background: #ff5bbd;
    color: #ffffff;
  }

  .app-shell :global(.select option:hover) {
    background: #ffe34f;
    color: #11100d;
  }

  .app-shell :global(svg text),
  .app-shell :global(.fill-neutral\/35),
  .app-shell :global(.fill-neutral\/45) {
    fill: #11100d !important;
  }

  .app-shell :global(.stroke-base-300\/70) {
    stroke: #11100d !important;
    opacity: 0.3;
  }

  .app-shell :global(.repo-visibility-badge),
  .app-shell :global(.neo-plan-label) {
    border: 3px solid #11100d !important;
    background: #ff5bbd !important;
    color: #ffffff !important;
    font-weight: 900;
    box-shadow: 3px 3px 0 #11100d;
  }

  .app-shell :global(.repo-private-badge) {
    background: #ff5b5b !important;
    color: #11100d !important;
  }

  .app-shell :global(.repo-public-badge) {
    background: #7fe0a7 !important;
    color: #11100d !important;
  }

  .app-shell :global(.panel-flat) {
    box-shadow: none !important;
  }

  .app-shell :global(.failed-summary-card) {
    background: #ffe0e0 !important;
    box-shadow: 6px 6px 0 #11100d !important;
  }

  .app-shell :global(a.text-primary),
  .app-shell :global(.text-primary) {
    color: #6d4aff !important;
  }

  .app-shell :global(a:not(.btn):not(.app-nav-link)) {
    color: #11100d;
    font-weight: 800;
    text-decoration: none;
  }

  .app-shell :global(a:not(.btn):not(.app-nav-link):hover) {
    color: #6d4aff !important;
    background: transparent;
    text-decoration: none;
  }

  .app-shell :global(.text-neutral),
  .app-shell :global(.text-neutral\/80),
  .app-shell :global(.text-neutral\/75),
  .app-shell :global(.text-neutral\/70),
  .app-shell :global(.text-neutral\/65),
  .app-shell :global(.text-neutral\/60),
  .app-shell :global(.text-neutral\/55),
  .app-shell :global(.text-neutral\/50),
  .app-shell :global(.text-neutral\/45),
  .app-shell :global(.text-neutral\/40),
  .app-shell :global(.text-neutral\/35),
  .app-shell :global(.text-neutral\/30),
  .app-shell :global(.text-error\/80) {
    color: #11100d !important;
  }

  .app-shell :global(.text-white),
  .app-shell :global(.text-primary-content),
  .app-shell :global(.text-secondary),
  .app-shell :global(.text-success),
  .app-shell :global(.text-error),
  .app-shell :global(.text-warning) {
    color: #11100d !important;
  }

  .app-shell :global(.btn-primary),
  .app-shell :global(.btn-primary *),
  .app-nav-link.is-active,
  .app-nav-link.is-active :global(*) {
    color: #ffffff !important;
  }

  .app-shell :global(.btn-primary .badge),
  .app-shell :global(.btn-primary .badge *) {
    background: #ffe34f !important;
    color: #11100d !important;
  }
</style>
