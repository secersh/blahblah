<script lang="ts">
  import { page } from '$app/stores';
  import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
  import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import CreditCard from '@lucide/svelte/icons/credit-card';
  import Settings from '@lucide/svelte/icons/settings';
  import Brand from '$lib/components/Brand.svelte';

  let { children } = $props();

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

<div class="min-h-screen">
  <div class="drawer lg:drawer-open">
    <input id="app-nav" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content min-w-0">
      <header
        class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-base-300 bg-base-200/80 px-4 backdrop-blur lg:px-8"
      >
        <label
          for="app-nav"
          class="btn btn-square btn-ghost btn-sm lg:hidden"
          aria-label="Open navigation"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <div class="lg:hidden">
          <Brand size="sm" href="/app" />
        </div>
        <div class="ml-auto flex items-center gap-3">
          <a
            class="hidden items-center gap-1.5 text-sm text-neutral/55 transition-colors hover:text-neutral sm:inline-flex"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>
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

        <div class="mt-auto rounded-xl border border-base-300 bg-base-100/60 p-4">
          <p class="text-xs font-medium text-neutral/55">Free plan</p>
          <p class="mt-1 text-sm text-neutral/70">1 repository included.</p>
          <a class="btn btn-primary btn-sm mt-3 w-full" href="/app/billing">Upgrade</a>
        </div>
      </nav>
    </aside>
  </div>
</div>
