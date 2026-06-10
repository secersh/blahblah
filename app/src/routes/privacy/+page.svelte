<script lang="ts">
  import { SITE_URL } from '$lib/config';
  import Brand from '$lib/components/Brand.svelte';

  const title = 'Privacy Policy | ShipLog';
  const description = 'Temporary privacy policy for ShipLog.';
  const canonical = SITE_URL + '/privacy';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta name="robots" content="index, follow" />
</svelte:head>

<div class="min-h-screen">
  <header class="mx-auto flex max-w-4xl items-center justify-between px-6 py-5 lg:px-8">
    <Brand size="md" href="/" />
    <a class="btn btn-sm btn-ghost" href="/">Home</a>
  </header>

  <main class="mx-auto max-w-4xl px-6 pb-20 pt-8 lg:px-8">
    <article class="prose prose-neutral max-w-none">
      <p class="text-sm font-medium text-primary">Legal placeholder</p>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> June 10, 2026</p>
      <p>
        This privacy policy is temporary placeholder text for ShipLog and will be replaced with a
        final privacy policy before the service is offered commercially.
      </p>

      <h2>Information we collect</h2>
      <p>
        ShipLog may collect account information from GitHub, repository metadata for repositories
        you authorize, generated release-note drafts, and basic usage information needed to operate
        the service.
      </p>

      <h2>How we use information</h2>
      <p>
        We use information to authenticate users, connect repositories, generate release-note
        drafts, operate the dashboard, troubleshoot issues, and improve the service.
      </p>

      <h2>GitHub data</h2>
      <p>
        ShipLog only requests access to repositories selected during GitHub App installation.
        Repository data is used to list repositories, inspect tags, compare releases, and generate
        release-note drafts.
      </p>

      <h2>Storage</h2>
      <p>
        Generated release-note drafts and related metadata may be stored so you can review, edit,
        approve, and delete them from the application.
      </p>

      <h2>Third-party services</h2>
      <p>
        ShipLog uses third-party infrastructure and services such as GitHub, Supabase, Cloudflare,
        and payment providers where applicable. These services may process information according to
        their own policies.
      </p>

      <h2>Your choices</h2>
      <p>
        You can remove the GitHub connection from the settings page and delete generated release
        notes from the application.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about this placeholder privacy policy, contact the ShipLog operator through
        the public project repository or the contact channel published for the service.
      </p>
    </article>
  </main>
</div>
