<script lang="ts">
  import MessageCircle from '@lucide/svelte/icons/message-circle';
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
  import CreditCard from '@lucide/svelte/icons/credit-card';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';

  let { data, form } = $props();

  const hasGithubInstallation = $derived(Boolean(data.githubInstallation));
  const hasActiveRepository = $derived(data.activeRepositoryCount > 0);
  const setupComplete = $derived(hasGithubInstallation && hasActiveRepository);
  const repositoryLimitLabel = $derived(data.repositoryLimit === null ? 'Unlimited' : data.repositoryLimit);
  const releaseNoteLimitLabel = $derived(data.releaseNoteLimit === null ? 'Unlimited' : data.releaseNoteLimit);
  const usageChartWidth = 600;
  const usageChartHeight = 180;
  const usageChartPaddingX = 28;
  const usageChartPaddingY = 18;
  const usageChartInnerWidth = usageChartWidth - usageChartPaddingX * 2;
  const usageChartInnerHeight = usageChartHeight - usageChartPaddingY * 2;
  const repositoryUsageColor = '#ff5bbd';
  const releaseNoteUsageColor = '#6d4aff';
  const usageChartMax = $derived(
    Math.max(
      1,
      ...data.usageHistory.flatMap((period) => [period.repositories, period.releaseNotes])
    )
  );
  const usageChartTicks = $derived(getUsageTicks(usageChartMax));
  const repositoryUsagePath = $derived(
    getUsagePath(data.usageHistory.map((period, index) => [getUsageX(index), getUsageY(period.repositories)]))
  );
  const releaseNoteUsagePath = $derived(
    getUsagePath(data.usageHistory.map((period, index) => [getUsageX(index), getUsageY(period.releaseNotes)]))
  );

  function getUsageX(index: number) {
    if (data.usageHistory.length <= 1) return usageChartWidth / 2;
    return usageChartPaddingX + (index / (data.usageHistory.length - 1)) * usageChartInnerWidth;
  }

  function getUsageY(value: number) {
    const clamped = Math.max(0, Math.min(usageChartMax, value));
    return usageChartPaddingY + usageChartInnerHeight - (clamped / usageChartMax) * usageChartInnerHeight;
  }

  function getUsagePath(points: number[][]) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;

    const [firstX, firstY] = points[0];
    const segments = [`M ${firstX} ${firstY}`];

    for (let index = 1; index < points.length; index += 1) {
      const [previousX, previousY] = points[index - 1];
      const [currentX, currentY] = points[index];
      const controlX = previousX + (currentX - previousX) / 2;
      segments.push(`C ${controlX} ${previousY}, ${controlX} ${currentY}, ${currentX} ${currentY}`);
    }

    return segments.join(' ');
  }

  function getUsageTicks(max: number) {
    if (max <= 5) {
      return Array.from({ length: max + 1 }, (_, index) => index);
    }

    const step = Math.ceil(max / 4);
    const ticks = Array.from({ length: 5 }, (_, index) => index * step);
    ticks[ticks.length - 1] = max;
    return [...new Set(ticks)];
  }

  function formatPeriod(period: string) {
    return new Date(`${period}-01T00:00:00Z`).toLocaleDateString(undefined, {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC'
    });
  }
</script>

<svelte:head>
  <title>Dashboard | Blah Blah</title>
</svelte:head>

<section>
  <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-neutral">Dashboard</h1>
      <p class="mt-1 text-sm text-neutral/60">Track connected repositories and generated drafts.</p>
    </div>
    <a class="btn btn-primary gap-2" href="#usage-history">Usage history</a>
  </div>

  {#if form?.message}
    <div class="alert alert-error mb-6 text-sm">{form.message}</div>
  {/if}

  {#if !setupComplete}
    <div class="mb-8 rounded-xl border border-base-300 bg-base-100 p-6">
      <div class="mb-5 flex items-start gap-3">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <MessageCircle class="h-5 w-5" />
        </span>
        <div>
          <h2 class="text-lg font-semibold text-neutral">Get set up</h2>
          <p class="mt-1 text-sm text-neutral/60">
            Install the GitHub App, allow repository access, then choose which repository Blah Blah
            should generate release notes for.
          </p>
        </div>
      </div>

      <div class="grid gap-3">
        <div class="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-medium text-neutral">1. Install GitHub App</p>
            <p class="mt-1 text-sm text-neutral/60">
              {hasGithubInstallation ? 'GitHub is connected.' : 'Allow Blah Blah to access selected repositories.'}
            </p>
          </div>
          {#if hasGithubInstallation}
            <span class="badge badge-success gap-1">Connected</span>
          {:else}
            <form method="POST" action="?/installGithubApp">
              <button class="btn btn-primary btn-sm" type="submit">Install GitHub App</button>
            </form>
          {/if}
        </div>

        <div class="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-medium text-neutral">2. Select active repository</p>
            <p class="mt-1 text-sm text-neutral/60">
              {hasActiveRepository
                ? `${data.activeRepositoryCount} active repository ready for release notes.`
                : 'Sync repositories, then activate the repo that should generate release notes.'}
            </p>
          </div>
          <a class="btn btn-outline btn-sm" class:btn-disabled={!hasGithubInstallation} href="/app/repositories">
            {hasActiveRepository ? 'Manage repos' : 'Select repos'}
          </a>
        </div>
      </div>
    </div>
  {/if}

  <div class="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <article class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-neutral/55">Active repositories</p>
        <FolderGit2 class="h-4 w-4 text-neutral/40" />
      </div>
      <p class="mt-3 text-2xl font-semibold text-neutral">{data.activeRepositoryCount}</p>
    </article>
    <article class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-neutral/55">Release notes</p>
        <ScrollText class="h-4 w-4 text-neutral/40" />
      </div>
      <p class="mt-3 text-2xl font-semibold text-neutral">
        {data.usedReleaseNoteCount} / {releaseNoteLimitLabel}
      </p>
      <p class="mt-1 text-xs text-neutral/45">{data.repositoryUsagePeriod}</p>
    </article>
    <article class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm text-neutral/55">Plan usage</p>
        <CreditCard class="h-4 w-4 text-neutral/40" />
      </div>
      <p class="mt-3 text-2xl font-semibold text-neutral">
        {data.usedRepositorySlotCount} / {repositoryLimitLabel} <span class="text-base font-normal text-neutral/50">repos</span>
      </p>
      <p class="mt-1 text-xs text-neutral/45">{data.repositoryUsagePeriod}</p>
    </article>
    <article class="rounded-xl border p-5 {data.failedCount > 0 ? 'failed-summary-card border-[#11100d]' : 'border-base-300 bg-base-100'}">
      <div class="flex items-center justify-between">
        <p class="text-sm text-neutral/55">Failed</p>
        <TriangleAlert class="h-4 w-4 {data.failedCount > 0 ? 'text-[#d72638]' : 'text-neutral/40'}" />
      </div>
      <p class="mt-3 text-2xl font-semibold {data.failedCount > 0 ? 'text-[#d72638]' : 'text-neutral'}">{data.failedCount}</p>
    </article>
  </div>

  <div class="grid gap-4 xl:grid-cols-[1.5fr_2.5fr]">
    <section class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-neutral">Active repositories</h2>
          <p class="mt-1 text-sm text-neutral/60">Currently generating release notes.</p>
        </div>
        <a class="btn btn-sm btn-outline" href="/app/repositories">Manage</a>
      </div>

      {#if data.activeRepositories.length === 0}
        <div class="rounded-lg border border-dashed border-base-300 p-6 text-center">
          <FolderGit2 class="mx-auto h-7 w-7 text-neutral/30" />
          <p class="mt-2 text-sm text-neutral/55">No active repositories yet.</p>
        </div>
      {:else}
        <div class="panel-flat divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300">
          {#each data.activeRepositories as repository}
            <a class="block p-3 transition-colors hover:text-primary" href="/app/repositories">
              <span class="flex min-w-0 items-center gap-2 font-mono text-sm font-medium text-neutral">
                <FolderGit2 class="h-4 w-4 shrink-0 text-primary" />
                <span class="truncate">{repository.full_name}</span>
              </span>
              <p class="mt-1 text-xs text-neutral/55">
                {repository.private ? 'Private' : 'Public'}
                <span class="font-mono text-neutral/45">· {repository.default_branch ?? 'default branch unknown'}</span>
              </p>
            </a>
          {/each}
        </div>
      {/if}
    </section>

    <section class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-neutral">Recent release notes</h2>
          <p class="mt-1 text-sm text-neutral/60">Latest drafts, approved, and failed notes.</p>
        </div>
        <a class="btn btn-sm btn-outline" href="/app/release-notes">View all</a>
      </div>

      {#if data.recentReleaseNotes.length === 0}
        <div class="rounded-lg border border-dashed border-base-300 p-6 text-center">
          <ScrollText class="mx-auto h-7 w-7 text-neutral/30" />
          <p class="mt-2 text-sm text-neutral/55">No release notes created yet.</p>
          {#if setupComplete}
            <a class="btn btn-sm btn-primary mt-4" href="/app/release-notes">Generate release notes</a>
          {/if}
        </div>
      {:else}
        <div class="panel-flat divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300">
          {#each data.recentReleaseNotes as releaseNote}
            {@const hasFile = releaseNote.status === 'draft' || releaseNote.status === 'approved'}
            <div class="flex items-start justify-between gap-3 p-3">
              <div class="min-w-0 flex-1">
                <span class="flex min-w-0 items-center gap-2 font-mono text-sm font-medium text-neutral">
                  <FolderGit2 class="h-4 w-4 shrink-0 text-primary" />
                  <span class="truncate">{releaseNote.repositoryFullName}</span>
                </span>
                {#if hasFile}
                  <a class="mt-1 block text-xs text-neutral/55 transition-colors hover:text-primary" href={`/app/release-notes/${releaseNote.id}`}>
                    {releaseNote.title}
                    <span class="font-mono text-neutral/45">· {releaseNote.previous_tag_name ?? 'Initial'} → {releaseNote.tag_name}</span>
                  </a>
                {:else}
                  <p class="mt-1 text-xs text-neutral/55">
                    {releaseNote.title}
                    <span class="font-mono text-neutral/45">· {releaseNote.previous_tag_name ?? 'Initial'} → {releaseNote.tag_name}</span>
                  </p>
                  {#if releaseNote.status === 'failed' && releaseNote.error_message}
                    <p class="mt-0.5 text-xs text-error/80">{releaseNote.error_message}</p>
                  {/if}
                {/if}
              </div>
              {#if releaseNote.status === 'generating'}
                <span class="badge badge-ghost shrink-0 gap-1.5">
                  <LoaderCircle class="h-3 w-3 animate-spin" />
                  generating
                </span>
              {:else if releaseNote.status === 'failed'}
                <span class="badge badge-error shrink-0 gap-1.5">
                  <TriangleAlert class="h-3 w-3" />
                  failed
                </span>
              {:else if releaseNote.status === 'approved'}
                <span class="badge badge-success shrink-0">approved</span>
              {:else}
                <span class="badge badge-ghost shrink-0">draft</span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </div>

  <section id="usage-history" class="mt-4 scroll-mt-24 rounded-xl border border-base-300 bg-base-100 p-5">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="font-semibold text-neutral">Usage history</h2>
        <p class="mt-1 text-sm text-neutral/60">Monthly repository slots and release-note generations.</p>
      </div>
      <div class="flex items-center gap-4 text-xs text-neutral/55">
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-sm" style={`background-color: ${repositoryUsageColor}`}></span>
          Repos
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-sm" style={`background-color: ${releaseNoteUsageColor}`}></span>
          Notes
        </span>
      </div>
    </div>

    <div class="panel-flat rounded-lg border border-base-300 bg-base-200/40 p-4">
      <svg class="h-64 w-full overflow-visible" viewBox={`0 0 ${usageChartWidth} ${usageChartHeight}`} role="img">
        <title>Monthly usage history</title>
        <desc>Repository slot and release-note counts by month.</desc>

        {#each usageChartTicks as tick}
          {@const y = getUsageY(tick)}
          <line
            x1={usageChartPaddingX}
            y1={y}
            x2={usageChartWidth - usageChartPaddingX}
            y2={y}
            class="stroke-base-300/70"
            stroke-width="1"
          />
          <text x="8" y={y + 4} text-anchor="end" class="fill-neutral/35 text-[10px]">{tick}</text>
        {/each}

        <path
          d={repositoryUsagePath}
          fill="none"
          stroke={repositoryUsageColor}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d={releaseNoteUsagePath}
          fill="none"
          stroke={releaseNoteUsageColor}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        {#each data.usageHistory as period, index}
          {@const x = getUsageX(index)}
          <circle cx={x} cy={getUsageY(period.repositories)} r="2.25" fill={repositoryUsageColor} />
          <circle cx={x} cy={getUsageY(period.releaseNotes)} r="2.25" fill={releaseNoteUsageColor} />
          <text
            x={x}
            y={usageChartHeight - 1}
            text-anchor="middle"
            class="fill-neutral/45 text-[10px]"
          >
            {formatPeriod(period.period)}
          </text>
        {/each}
      </svg>
    </div>
  </section>
</section>
