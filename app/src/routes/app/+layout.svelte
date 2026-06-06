<script lang="ts">
  let { children } = $props();

  const navItems = [
    { href: '/app', label: 'Dashboard' },
    { href: '/app/repositories', label: 'Repositories' },
    { href: '/app/release-notes', label: 'Release Notes' },
    { href: '/app/billing', label: 'Billing' },
    { href: '/app/settings', label: 'Settings' }
  ];
</script>

<div class="min-h-screen bg-base-200">
  <div class="drawer lg:drawer-open">
    <input id="app-nav" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <header class="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-base-300 bg-base-100 px-4 lg:px-8">
        <label for="app-nav" class="btn btn-square btn-ghost lg:hidden" aria-label="Open navigation">
          <span class="text-xl">=</span>
        </label>
        <div>
          <p class="text-sm font-semibold text-neutral">ShipLog</p>
          <p class="text-xs text-neutral/55">Release workflow</p>
        </div>
      </header>

      <main class="px-4 py-6 lg:px-8">
        {@render children()}
      </main>
    </div>

    <aside class="drawer-side">
      <label for="app-nav" aria-label="Close navigation" class="drawer-overlay"></label>
      <nav class="min-h-full w-72 border-r border-base-300 bg-base-100 px-4 py-5">
        <a href="/app" class="mb-6 block text-lg font-semibold text-neutral">ShipLog</a>
        <ul class="space-y-1">
          {#each navItems as item}
            <li>
              <a class="btn btn-ghost w-full justify-start" href={item.href}>{item.label}</a>
            </li>
          {/each}
        </ul>
      </nav>
    </aside>
  </div>
</div>
