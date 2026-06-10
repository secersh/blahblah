<script lang="ts">
  import { SITE_URL } from '$lib/config';
  import Brand from '$lib/components/Brand.svelte';

  const title = 'Terms and Conditions | ShipLog';
  const description = 'Terms and conditions for ShipLog.';
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
      <h1>Terms and Conditions</h1>
      <p><strong>Last updated:</strong> June 10, 2026</p>
      <p>
        ShipLog is a small software service that helps generate draft release notes from GitHub
        repository tags and commit history.
      </p>
      <p>By using ShipLog, you agree to these Terms.</p>

      <h2>What ShipLog Does</h2>
      <p>
        ShipLog connects to GitHub repositories you authorize, reads repository metadata, tags,
        commits, and related release information, and uses that data to create draft release notes.
      </p>

      <h2>Your Responsibilities</h2>
      <p>You are responsible for:</p>
      <ul>
        <li>Only connecting repositories you own or are allowed to manage</li>
        <li>Reviewing generated release notes before publishing them</li>
        <li>Keeping your GitHub account secure</li>
        <li>
          Making sure your use of ShipLog complies with any rules, contracts, or laws that apply
          to you
        </li>
      </ul>
      <p>Generated release notes are drafts. They may be incomplete, inaccurate, or need editing.</p>

      <h2>GitHub Access</h2>
      <p>ShipLog uses a GitHub App to access only the repositories you authorize.</p>
      <p>
        You can revoke access at any time through GitHub or remove the connection from ShipLog
        settings.
      </p>

      <h2>Billing</h2>
      <p>ShipLog may offer free and paid plans. Prices, limits, and features may change over time.</p>
      <p>
        If you buy a paid plan, payment is handled by a third-party payment provider. ShipLog does
        not store your full payment details.
      </p>

      <h2>Availability</h2>
      <p>
        ShipLog is built and operated by a solo developer. I will try to keep it working, but there
        may be bugs, downtime, breaking changes, or discontinued features.
      </p>
      <p>
        ShipLog is provided as-is, without any guarantee that it will always be available, secure,
        accurate, or fit for your specific use case.
      </p>

      <h2>No Liability</h2>
      <p>
        To the maximum extent allowed by law, ShipLog and its operator are not liable for indirect,
        incidental, special, consequential, or punitive damages, or for lost profits, lost data, lost
        business, or other losses related to your use of the service.
      </p>

      <h2>Termination</h2>
      <p>
        You may stop using ShipLog at any time. I may suspend or terminate access if the service is
        abused, misused, or used in a way that could harm ShipLog, GitHub, other users, or third
        parties.
      </p>

      <h2>Changes</h2>
      <p>
        These Terms may be updated as ShipLog evolves. Continued use of ShipLog after changes means
        you accept the updated Terms.
      </p>

      <h2>Contact</h2>
      <p>
        For questions, contact the ShipLog operator through the public project repository or the
        contact channel published for the service.
      </p>
    </article>
  </main>
</div>
