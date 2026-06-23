<script lang="ts">
  import { SITE_URL } from '$lib/config';
  import Brand from '$lib/components/Brand.svelte';

  const title = 'Privacy Policy | Blah Blah';
  const description = 'Privacy policy for Blah Blah.';
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
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> June 10, 2026</p>
      <p>
        Blah Blah is a small software service that helps generate draft release notes from GitHub
        repository tags and commit history. This policy explains what information Blah Blah collects
        and how it is used.
      </p>

      <h2>Information Blah Blah Collects</h2>
      <p>Blah Blah may collect and store:</p>
      <ul>
        <li>Account information from GitHub, such as your GitHub user ID, username, and email</li>
        <li>GitHub App installation information</li>
        <li>Repository metadata for repositories you authorize</li>
        <li>Repository tags, commit metadata, file-change summaries, and compare data</li>
        <li>Generated release-note drafts and edits you make to them</li>
        <li>Basic usage and error information needed to operate and troubleshoot the service</li>
      </ul>

      <h2>How Blah Blah Uses Information</h2>
      <p>
        Blah Blah uses information to sign you in, connect GitHub repositories, list repository tags,
        compare releases, generate draft release notes, display your dashboard, troubleshoot issues,
        prevent abuse, and improve the product.
      </p>

      <h2>GitHub Data</h2>
      <p>
        Blah Blah uses a GitHub App and only requests access to repositories you authorize. GitHub
        data is used to list repositories, read tags, compare commits between releases, and generate
        release-note drafts.
      </p>
      <p>You can revoke Blah Blah's GitHub access at any time through GitHub.</p>

      <h2>Generated Release Notes</h2>
      <p>
        Generated release notes and related metadata may be stored so you can review, edit, approve,
        and delete them from the application.
      </p>

      <h2>Cookies and Sessions</h2>
      <p>
        Blah Blah uses cookies or similar session storage to keep you signed in and to complete
        authentication and GitHub App installation flows.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        Blah Blah uses third-party services to operate the product, including GitHub, Supabase,
        Cloudflare, and payment providers where applicable. These services may process information
        according to their own privacy policies.
      </p>

      <h2>Payments</h2>
      <p>
        If Blah Blah offers paid plans, payments are handled by a third-party payment provider.
        Blah Blah does not store your full payment card details.
      </p>

      <h2>Sharing</h2>
      <p>
        Blah Blah does not sell your personal information. Information may be shared with service
        providers as needed to run Blah Blah, comply with legal obligations, prevent abuse, or protect
        the service and its users.
      </p>

      <h2>Retention and Deletion</h2>
      <p>
        Blah Blah keeps information while it is needed to provide the service. You can remove your
        GitHub connection from the settings page and delete generated release notes from the
        application.
      </p>

      <h2>Security</h2>
      <p>
        I try to use reasonable safeguards to protect Blah Blah data, but no small web service can
        guarantee perfect security.
      </p>

      <h2>Changes</h2>
      <p>
        This policy may be updated as Blah Blah evolves. Continued use of Blah Blah after changes means
        you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        For questions, contact the Blah Blah operator through the public project repository or the
        contact channel published for the service.
      </p>
    </article>
  </main>
</div>
