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

<div class="min-h-screen">
  <ReleaseNotesRealtime accessToken={data.session?.access_token} userId={data.user?.id} />

  <div class="drawer lg:drawer-open">
    <input id="app-nav" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content min-w-0">
      <header
        class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-base-300 bg-base-200/80 px-4 backdrop-blur lg:hidden"
      >
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
      <nav class="flex min-h-full w-72 flex-col border-r border-base-300 bg-base-200 px-4 py-5">
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
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors {active
                  ? 'bg-primary/12 text-primary'
                  : 'text-neutral/65 hover:bg-base-100 hover:text-neutral'}"
              >
                <item.icon class="h-5 w-5 shrink-0" />
                {item.label}
              </a>
            </li>
          {/each}
        </ul>

        <div class="mt-auto space-y-3 pt-6">
          <div class="rounded-xl border border-base-300 bg-base-100/60 p-4">
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

          <div class="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100/60 p-2.5">
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
                class="btn btn-square btn-ghost btn-sm text-neutral/55 hover:bg-error/10 hover:text-error"
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
