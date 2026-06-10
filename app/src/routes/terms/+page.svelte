<script lang="ts">
  import { SITE_URL } from '$lib/config';
  import Brand from '$lib/components/Brand.svelte';

  const title = 'Terms and Conditions | ShipLog';
  const description = 'Temporary terms and conditions for ShipLog.';
  const canonical = SITE_URL + '/terms';
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
      <h1>Terms and Conditions</h1>
      <p><strong>Last updated:</strong> June 10, 2026</p>
      <p>
        These terms are temporary placeholder text for ShipLog and will be replaced with final
        legal terms before the service is offered commercially.
      </p>

      <h2>Use of the service</h2>
      <p>
        ShipLog helps users connect GitHub repositories and generate draft release notes from
        repository tags and commit history. You are responsible for the repositories you connect,
        the content you generate, and how you use or publish generated release notes.
      </p>

      <h2>Accounts and access</h2>
      <p>
        You may need to sign in with GitHub and authorize the ShipLog GitHub App. You should only
        connect repositories that you own or are authorized to manage.
      </p>

      <h2>Generated content</h2>
      <p>
        Generated release notes are drafts. You should review, edit, and approve them before
        publishing. ShipLog does not guarantee that generated content is complete, accurate, or fit
        for a particular purpose.
      </p>

      <h2>Availability</h2>
      <p>
        ShipLog is currently an early-stage service and may change, break, or become unavailable
        while it is being developed.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, ShipLog is provided as-is and without warranties.
        The service operator is not liable for indirect, incidental, or consequential damages
        arising from use of the service.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these placeholder terms, contact the ShipLog operator through the
        public project repository or the contact channel published for the service.
      </p>
    </article>
  </main>
</div>
