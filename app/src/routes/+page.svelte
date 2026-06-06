<script lang="ts">
  import { page } from '$app/stores';
  import Ship from '@lucide/svelte/icons/ship';
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import { SiGithub } from '@icons-pack/svelte-simple-icons';
  import Brand from '$lib/components/Brand.svelte';

  let { form } = $props();

  const siteName = 'ShipLog';
  const title = 'ShipLog — Automated GitHub release notes';
  const description =
    'ShipLog turns the commits between two GitHub tags into a clean, editable changelog. Connect a repository, watch for new tags, and ship release notes your users actually read.';
  const keywords =
    'release notes generator, GitHub release notes, automated changelog, changelog generator, GitHub tags, release automation, draft release notes, GitHub App';

  const origin = $derived($page.url.origin);
  const canonical = $derived(origin + '/');
  const ogImage = $derived(origin + '/og-image.png');

  const jsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: siteName,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      description,
      url: canonical,
      image: ogImage,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    })
  );

  const features = [
    {
      icon: Ship,
      title: 'Ship on every tag',
      body: 'Connect a repo once. ShipLog watches for new tags and drafts notes the moment you cut a release.'
    },
    {
      icon: ScrollText,
      title: 'A clean log, every time',
      body: 'Commits between releases become a structured markdown changelog you can edit and approve.'
    }
  ];
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <link rel="canonical" href={canonical} />
  <meta name="robots" content="index, follow" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  {@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<div class="min-h-screen">
  <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
    <Brand size="md" href="/" />
    <a class="btn btn-sm btn-ghost gap-2" href="#signin">
      Sign in
    </a>
  </header>

  <main class="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pt-16">
    <section>
      <span class="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/60 px-3 py-1 text-xs font-medium text-neutral/70">
        <span class="h-1.5 w-1.5 rounded-full bg-success"></span>
        Built for solo devs and small teams
      </span>

      <h1 class="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-neutral sm:text-5xl lg:text-6xl">
        Release notes,
        <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          generated from your tags.
        </span>
      </h1>

      <p class="mt-6 max-w-xl text-lg leading-8 text-neutral/65">
        ShipLog turns the commits between two GitHub tags into a clean, editable changelog —
        so every release ships with notes your users actually read.
      </p>

      <p class="mt-6 text-sm text-neutral/50">Free for 1 repository · no card required</p>

      <div class="mt-12 grid gap-5 sm:grid-cols-2">
        {#each features as feature}
          <div class="rounded-xl border border-base-300 bg-base-100/60 p-5">
            <span class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <feature.icon class="h-5 w-5" />
            </span>
            <h3 class="mt-4 font-semibold text-neutral">{feature.title}</h3>
            <p class="mt-1.5 text-sm leading-6 text-neutral/60">{feature.body}</p>
          </div>
        {/each}
      </div>
    </section>

    <section id="signin" class="lg:justify-self-end">
      <!-- Floating preview behind the sign-in card -->
      <div class="relative">
        <div class="pointer-events-none absolute -top-6 right-4 hidden w-72 rotate-2 rounded-xl border border-base-300 bg-base-100 p-4 shadow-glow lg:block">
          <div class="flex items-center gap-2 text-xs text-neutral/50">
            <ScrollText class="h-4 w-4 text-secondary" />
            <span class="font-mono">v1.4.0 → v1.5.0</span>
          </div>
          <div class="mt-3 space-y-2">
            <div class="h-2.5 w-3/4 rounded bg-base-300"></div>
            <div class="h-2.5 w-full rounded bg-base-300/70"></div>
            <div class="h-2.5 w-5/6 rounded bg-base-300/50"></div>
          </div>
        </div>

        <div class="relative w-full max-w-sm rounded-2xl border border-base-300 bg-base-100 p-6 shadow-glow lg:ml-auto">
          <div class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-content">
              <Ship class="h-5 w-5" strokeWidth={2} />
            </span>
            <h2 class="text-lg font-semibold text-neutral">Sign in to ShipLog</h2>
          </div>
          <p class="mt-3 text-sm leading-6 text-neutral/60">
            Continue with GitHub to connect a repository and start drafting release notes.
          </p>

          <form class="mt-6" method="POST">
            <button class="btn btn-primary w-full gap-2" type="submit">
              <SiGithub class="h-5 w-5" title="GitHub" />
              Continue with GitHub
            </button>
          </form>

          {#if form?.message}
            <div class="alert alert-error mt-4 text-sm">{form.message}</div>
          {/if}

          <p class="mt-4 text-xs leading-5 text-neutral/45">
            ShipLog will redirect back here after GitHub approval. We only request access to the
            repositories you choose.
          </p>
        </div>
      </div>
    </section>
  </main>
</div>
