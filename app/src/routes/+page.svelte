<script lang="ts">
  import Clipboard from '@lucide/svelte/icons/clipboard';
  import MessageCircle from '@lucide/svelte/icons/message-circle';
  import SquarePen from '@lucide/svelte/icons/square-pen';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import { SITE_URL } from '$lib/config';

  let { form } = $props();

  const brand = {
    name: 'Blah Blah',
    eyebrow: 'turn GitHub chatter into release notes',
    headlineA: 'We handle the',
    headlineB: 'blah blah.',
    headlineC: 'You ship the rest.',
    subhead:
      'Point it at a repo. We read the tags, commits, and changed files, then hand back a release note that does not read like a robot wrote it.',
    primaryCta: 'Connect GitHub'
  };

  const siteName = brand.name;
  const title = 'Blah Blah | GitHub release notes without the busywork';
  const description =
    'Blah Blah turns GitHub tags, commits, and changed files into clean, editable release notes.';
  const keywords =
    'release notes generator, GitHub release notes, automated changelog, changelog generator, GitHub tags, release automation, indie dev tools';

  const canonical = SITE_URL + '/';
  const ogImage = SITE_URL + '/og-image.png';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteName,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description,
    url: canonical,
    image: ogImage,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  });

  const navItems = [
    { label: 'How it works', href: '#how' },
    { label: 'Pricing', href: '#pricing' }
  ];

  const chatter = [
    {
      text: 'feat: add hosted checkout',
      className: 'left-[2%] top-[8%] -rotate-3 bg-[#7fe0a7] animate-float-a'
    },
    {
      text: 'webhook: sync subscription status',
      className: 'left-[33%] top-[24%] rotate-3 bg-[#82caff] animate-float-b'
    },
    {
      text: 'db: billing_subscriptions',
      className: 'left-[9%] top-[48%] -rotate-2 bg-[#ffd84d] animate-float-c'
    },
    {
      text: 'fix: realtime billing refresh',
      className: 'left-[41%] top-[65%] rotate-3 bg-[#ff5bbd] text-white animate-float-a'
    },
    {
      text: 'ux: clarify invoice credits',
      className: 'left-[16%] top-[83%] -rotate-3 bg-white animate-float-b'
    }
  ];

  const notes = [
    'Added hosted checkout, subscription webhooks, and plan aware limits.',
    'Added billing controls for upgrades, cancellation, and resuming.',
    'Billing state now refreshes in real time after webhook updates.',
    'Recent invoices show credit amounts in plain language.'
  ];

  const features = [
    {
      title: 'Read the noisy middle',
      body: 'Blah Blah looks at the commits and changed files between tags so you do not have to reconstruct the story by hand.'
    },
    {
      title: 'Hand back editable notes',
      body: 'The draft is clean markdown, ready to copy, download, edit, or paste into your release workflow.'
    },
    {
      title: 'Built for small teams',
      body: 'Start with one repo for free. Upgrade when you are shipping across more projects.'
    }
  ];

  const pricing = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      tag: 'Until you get fancy',
      detail: '1 repo · 20 notes monthly'
    },
    {
      name: 'Starter',
      detail: '5 repos · 100 notes monthly',
      monthly: '$5',
      yearly: '$50',
      save: 'Save 17%'
    },
    {
      name: 'Pro',
      detail: 'Unlimited repos and notes',
      monthly: '$15',
      yearly: '$150',
      save: 'Save 17%'
    }
  ];
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <link rel="canonical" href={canonical} />
  <meta name="robots" content="index, follow" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  {@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>

<div class="landing min-h-screen bg-[#f8f1dd] text-[#11100d]">
  <header class="fixed inset-x-0 top-0 z-50 border-b-4 border-[#11100d] bg-[#ffe34f]">
    <div class="flex h-[5.5rem] w-full items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
      <div class="flex min-w-0 items-center">
        <a class="flex shrink-0 items-center gap-3" href="/">
          <span class="logo-mark grid h-10 w-10 place-items-center border-[3px] border-[#11100d] bg-white text-[#11100d]">
            <MessageCircle class="h-5 w-5" strokeWidth={3} />
          </span>
          <span class="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">{brand.name}!</span>
        </a>
      </div>

      <div class="flex items-center justify-end gap-3">
        <nav class="hidden items-center gap-3 md:flex" aria-label="Primary">
          {#each navItems as item}
            <a class="neo-button bg-white text-[#11100d]" href={item.href}>{item.label}</a>
          {/each}
        </nav>

        <form method="POST">
          <button class="neo-button github-button min-w-max bg-[#11100d] text-sm text-[#ffe34f] sm:text-base" type="submit">
            <svg class="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.23 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            {brand.primaryCta} →
          </button>
        </form>
      </div>
    </div>
  </header>

  <main class="pt-[5.5rem]">
    <section class="hero-section relative mx-auto grid min-h-[calc(100svh-5.5rem)] w-full max-w-[96rem] grid-cols-1 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(44rem,1fr)_minmax(28rem,0.62fr)] lg:items-center lg:gap-20 lg:px-10 lg:py-10">
      <div class="hero-left min-w-0 lg:pt-2">
        <div class="hero-copy min-w-0">
          <p class="neo-pill inline-flex w-fit items-center gap-2 bg-[#6d4aff] text-white">
            <Sparkles class="h-4 w-4" />
            {brand.eyebrow}
          </p>

          <h1 class="hero-title font-display mt-6 max-w-[48rem] text-[3.3rem] font-black uppercase leading-[0.86] tracking-[-0.05em] sm:text-[4.5rem] lg:text-[5rem] xl:text-[5.5rem]">
            <span class="block whitespace-nowrap">{brand.headlineA}</span>
            <span class="pink-blah my-2 inline-flex whitespace-nowrap border-[5px] border-[#11100d] bg-[#ff5bbd] px-5 pb-4 pt-3 leading-[0.78] text-white">
              {brand.headlineB}
            </span>
            <span class="block whitespace-nowrap">{brand.headlineC}</span>
          </h1>

          <p class="hero-subhead mt-6 max-w-[48rem] text-lg font-extrabold leading-8 text-[#3f3a30]">
            {brand.subhead}
          </p>

          {#if form?.message}
            <div class="mt-4 max-w-md border-[3px] border-[#11100d] bg-[#ffebe6] px-4 py-3 text-sm font-black text-red-700 shadow-[5px_5px_0_#11100d]">
              {form.message}
            </div>
          {/if}
        </div>

        <div class="commit-cloud relative mt-10 hidden min-h-[18rem] w-full max-w-[48rem] lg:block">
            {#each chatter as item}
              <span class="absolute max-w-[19rem] whitespace-nowrap rounded-lg border-[3px] border-[#11100d] px-4 py-2 font-mono text-sm font-black shadow-[5px_5px_0_#11100d] {item.className}">
                {item.text}
              </span>
            {/each}
          <p class="more-label absolute left-[66%] top-[89%] font-mono text-sm font-black text-[#6f6655]">
            ...and 42 more
          </p>
        </div>
      </div>

      <div class="flow-arrow pointer-events-none absolute left-[51%] top-[61%] hidden -translate-x-1/2 -translate-y-1/2 -rotate-6 lg:block" aria-hidden="true">
        <svg viewBox="0 0 230 116" class="h-28 w-64 overflow-visible">
          <path d="M12 72 C64 10 150 16 209 61" fill="none" stroke="#11100d" stroke-width="7" stroke-linecap="round" />
          <path d="M190 33 L218 69 L171 73" fill="none" stroke="#11100d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <div class="hero-right flex min-h-[30rem] items-center justify-end lg:pl-6 lg:pt-10">
        <article class="release-card w-full max-w-[33rem] rounded-xl border-[4px] border-[#11100d] bg-white p-5 shadow-[8px_8px_0_#11100d] sm:p-7">
          <div class="flex items-center justify-between gap-4">
            <span class="rounded-md border-[3px] border-[#11100d] bg-[#ffe34f] px-3 py-1 text-sm font-black">v1.1.0</span>
            <span class="text-sm font-black text-[#8a806b]">Sept 16</span>
          </div>

          <h2 class="font-display mt-5 text-3xl font-black tracking-[-0.04em]">Release v1.1.0</h2>

          <ul class="mt-5 space-y-3">
            {#each notes as note}
              <li class="flex gap-3 text-sm font-black leading-6 text-[#11100d]">
                <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#6d4aff]"></span>
                <span>{note}</span>
              </li>
            {/each}
          </ul>

          <div class="mt-6 flex flex-wrap gap-3">
            <button class="neo-button h-10 px-3 text-sm bg-[#6d4aff] text-white" type="button">
              <SquarePen class="h-4 w-4" />
              Edit draft
            </button>
            <button class="neo-button h-10 bg-white px-3 text-sm text-[#11100d]" type="button">
              <Clipboard class="h-4 w-4" />
              Copy markdown
            </button>
          </div>
        </article>
      </div>
    </section>

    <section id="how" class="grid-section mx-auto flex min-h-[calc(100svh-5.5rem)] max-w-[96rem] scroll-mt-[5.5rem] flex-col justify-center px-5 py-12 sm:px-8 lg:px-10">
      <div class="grid flex-1 content-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p class="neo-pill inline-flex w-fit -rotate-2 bg-[#6d4aff] text-white">How it works</p>
          <h2 class="font-display mt-7 max-w-2xl text-[3.6rem] font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-[5rem] lg:text-[5.8rem]">
            From repo noise to release notes.
          </h2>
        </div>

        <div class="grid h-full gap-5">
          {#each features as feature, index}
            <article class="grid min-h-36 grid-cols-[4.5rem_1fr] items-center gap-5 border-[4px] border-[#11100d] bg-white p-5 shadow-[8px_8px_0_#11100d]">
              <span class="font-display grid h-16 w-16 place-items-center border-[4px] border-[#11100d] bg-[#ffe34f] text-3xl font-black shadow-[4px_4px_0_#11100d]">
                {index + 1}
              </span>
              <div>
                <h3 class="font-display text-2xl font-black uppercase tracking-[-0.04em]">{feature.title}</h3>
                <p class="mt-2 text-sm font-bold leading-6 text-[#5f594b]">{feature.body}</p>
              </div>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section id="pricing" class="pricing-section grid-section mx-auto flex min-h-[calc(100svh-17.5rem)] max-w-[96rem] scroll-mt-[5.5rem] flex-col justify-center px-5 py-10 sm:px-8 lg:px-10">
      <div class="pricing-content grid flex-1 content-center gap-10">
        <div class="max-w-5xl">
          <p class="neo-pill inline-flex w-fit rotate-2 bg-[#ff5bbd] text-white">Pricing</p>
          <h2 class="font-display mt-7 text-[3.6rem] font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-[5rem] lg:text-[5.8rem]">
            Start free. Upgrade when releases get real.
          </h2>
        </div>

        <div class="grid gap-5 lg:grid-cols-3">
          {#each pricing as plan}
            <article class="pricing-card flex min-h-72 flex-col border-[4px] border-[#11100d] bg-white p-6 shadow-[8px_8px_0_#11100d]">
              <p class="font-display text-2xl font-black uppercase text-[#6d4aff]">{plan.name}</p>
              {#if plan.monthly}
                <div class="mt-5">
                  <p class="text-5xl font-black">
                    {plan.monthly}<span class="text-base text-[#8a806b]">/mo</span>
                  </p>
                  <p class="my-3 font-mono text-xs font-black uppercase text-[#8a806b]">or</p>
                  <div class="flex flex-wrap items-center gap-3">
                    <p class="text-5xl font-black">
                      {plan.yearly}<span class="text-base text-[#8a806b]">/yr</span>
                    </p>
                    <span class="neo-save-label inline-flex rotate-2 whitespace-nowrap border-[3px] border-[#11100d] bg-[#ff5bbd] px-3 py-1 text-xs font-black uppercase text-white">
                      {plan.save}
                    </span>
                  </div>
                </div>
              {:else}
                <div class="mt-5">
                  <p class="text-5xl font-black">
                    {plan.price}<span class="text-base text-[#8a806b]">/{plan.period}</span>
                  </p>
                  {#if plan.tag}
                    <span class="neo-save-label mt-4 inline-flex -rotate-1 whitespace-nowrap border-[3px] border-[#11100d] bg-[#ff5bbd] px-3 py-1 text-xs font-black uppercase text-white">
                      {plan.tag}
                    </span>
                  {/if}
                </div>
              {/if}
              <p class="mt-auto pt-8 text-base font-black leading-7 text-[#5f594b]">{plan.detail}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <footer class="border-t-4 border-[#11100d] bg-[#ffe34f]">
    <div class="mx-auto flex w-full max-w-[96rem] flex-col gap-3 px-5 py-5 text-sm font-black sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <p>&copy; 2026 {brand.name}</p>
      <nav class="flex gap-4" aria-label="Legal">
        <a class="hover:underline" href="/terms">Terms</a>
        <a class="hover:underline" href="/privacy">Privacy</a>
      </nav>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    background: #f8f1dd;
  }

  .font-display {
    font-family:
      "Arial Black", "Arial Rounded MT Bold", Impact, ui-sans-serif, system-ui,
      sans-serif;
  }

  .neo-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    border: 3px solid #11100d;
    border-radius: 0.6rem;
    padding-inline: 1rem;
    font-weight: 900;
    box-shadow: 4px 4px 0 #11100d;
    transform: translateZ(0);
    backface-visibility: hidden;
    transition:
      box-shadow 120ms ease,
      transform 120ms ease;
  }

  .neo-button:hover {
    transform: translate3d(-2px, -2px, 0);
    box-shadow: 6px 6px 0 #11100d;
  }

  .logo-mark {
    border-radius: 0.45rem;
    box-shadow: 4px 4px 0 #11100d;
    transform: rotate(-3deg);
  }

  .github-button {
    box-shadow: 4px 4px 0 #6d4aff;
  }

  .github-button:hover {
    box-shadow: 6px 6px 0 #6d4aff;
  }

  .neo-pill {
    border: 3px solid #11100d;
    border-radius: 999px;
    padding: 0.6rem 1rem;
    font-weight: 900;
    box-shadow: 4px 4px 0 #11100d;
  }

  .neo-save-label {
    border-radius: 999px;
    box-shadow: 3px 3px 0 #11100d;
  }

  .pink-blah {
    position: relative;
    isolation: isolate;
    transform: rotate(-2deg) translateZ(0);
    backface-visibility: hidden;
    box-shadow: none;
    margin-top: 0.35em;
    margin-bottom: 0.35em;
  }

  .grid-section {
    position: relative;
    isolation: isolate;
  }

  .grid-section::before {
    content: "";
    position: absolute;
    inset: 2rem 1.25rem;
    z-index: -1;
    opacity: 0.28;
    background-image:
      linear-gradient(#11100d 1px, transparent 1px),
      linear-gradient(90deg, #11100d 1px, transparent 1px);
    background-size: 2.25rem 2.25rem;
    mask-image: radial-gradient(ellipse at center, black 0%, black 52%, transparent 76%);
  }

  .animate-float-a {
    animation: float-a 5.8s ease-in-out infinite;
  }

  .animate-float-b {
    animation: float-b 6.4s ease-in-out infinite;
  }

  .animate-float-c {
    animation: float-c 7.2s ease-in-out infinite;
  }

  @keyframes float-a {
    0%,
    100% {
      transform: translate3d(0, 0, 0) rotate(-4deg);
    }
    50% {
      transform: translate3d(8px, -10px, 0) rotate(-4deg);
    }
  }

  @keyframes float-b {
    0%,
    100% {
      transform: translate3d(0, 0, 0) rotate(4deg);
    }
    50% {
      transform: translate3d(-10px, 8px, 0) rotate(4deg);
    }
  }

  @keyframes float-c {
    0%,
    100% {
      transform: translate3d(0, 0, 0) rotate(-3deg);
    }
    50% {
      transform: translate3d(6px, 12px, 0) rotate(-3deg);
    }
  }

  @media (max-height: 900px) and (min-width: 1024px) {
    .hero-section {
      padding-top: 2rem;
      padding-bottom: 2rem;
      gap: 4.5rem;
      grid-template-columns: minmax(38rem, 1fr) minmax(26rem, 0.62fr);
    }

    .hero-title {
      margin-top: 1.4rem;
      font-size: 4.25rem;
      line-height: 0.86;
      max-width: 42rem;
    }

    .hero-subhead {
      margin-top: 1.35rem;
      max-width: 42rem;
      font-size: 1rem;
      line-height: 1.55rem;
    }

    .commit-cloud {
      margin-top: 2rem;
      min-height: 15.5rem;
      max-width: 42rem;
    }

    .hero-right {
      min-height: 25rem;
    }

    .release-card {
      max-width: 29rem;
      padding: 1.1rem;
    }

    .release-card h2 {
      margin-top: 0.9rem;
      font-size: 1.6rem;
    }

    .release-card ul {
      margin-top: 0.9rem;
      gap: 0;
    }

    .release-card li {
      line-height: 1.35rem;
    }

    .release-card div:last-child {
      margin-top: 1rem;
    }

    .more-label {
      top: 91%;
      left: 62%;
    }
  }

  @media (min-width: 1024px) {
    .pricing-section {
      min-height: calc(100svh - 18rem);
      padding-top: 1.75rem;
      padding-bottom: 1.75rem;
    }

    .pricing-content {
      gap: 2.25rem;
    }

    .pricing-section h2 {
      margin-top: 1.25rem;
      font-size: 4.5rem;
    }

    .pricing-card {
      min-height: 16rem;
      padding: 1.5rem;
    }
  }

  @media (max-height: 780px) and (min-width: 1024px) {
    .hero-title {
      font-size: 4rem;
    }

    .commit-cloud {
      min-height: 14.5rem;
    }

    .hero-right {
      min-height: 24rem;
    }

    .flow-arrow {
      top: 61%;
      transform: translate(-72%, -50%) rotate(-6deg) scale(0.64);
    }

    .neo-pill {
      padding: 0.45rem 0.85rem;
    }
  }

  @media (max-width: 767px) {
    main {
      padding-top: 4.75rem;
    }

    header > div {
      height: 4.75rem;
    }

    header a {
      font-size: 1.45rem;
    }

    .logo-mark {
      height: 2.25rem;
      width: 2.25rem;
    }

    .github-button {
      min-height: 2.45rem;
      padding-inline: 0.7rem;
      font-size: 0.8rem;
    }

    .hero-title {
      margin-top: 1rem;
      font-size: 2.55rem;
      letter-spacing: -0.04em;
      line-height: 0.9;
    }

    .pink-blah {
      padding: 0.22em 0.28em 0.3em;
      border-width: 4px;
    }

    .hero-subhead {
      margin-top: 1.1rem;
      font-size: 0.98rem;
      line-height: 1.65rem;
      max-width: none;
    }

    .hero-right {
      min-height: auto;
      justify-content: stretch;
    }

    .release-card {
      max-width: none;
      padding: 1rem;
    }

    .release-card h2 {
      font-size: 1.75rem;
    }

    .release-card div:last-child {
      flex-direction: column;
    }
  }
</style>
