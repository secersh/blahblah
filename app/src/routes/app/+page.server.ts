import { getUserBilling } from '$lib/server/billing';
import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';

function getCurrentPeriodKey() {
  return new Date().toISOString().slice(0, 7);
}

function getRecentPeriodKeys(count = 6) {
  const periods = [];
  const date = new Date();
  date.setUTCDate(1);

  for (let index = count - 1; index >= 0; index -= 1) {
    const periodDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - index, 1));
    periods.push(periodDate.toISOString().slice(0, 7));
  }

  return periods;
}

export const load = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  const billing = await getUserBilling(locals.supabase, locals.user.id);

  const { data: installation } = await locals.supabase
    .from('github_installations')
    .select('installation_id, created_at')
    .eq('user_id', locals.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: repositoryCount } = await locals.supabase
    .from('repositories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id);

  const { count: activeRepositoryCount } = await locals.supabase
    .from('repositories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id)
    .eq('active', true);

  const { data: activeRepositories } = await locals.supabase
    .from('repositories')
    .select('id, full_name, private, default_branch')
    .eq('user_id', locals.user.id)
    .eq('active', true)
    .order('full_name', { ascending: true });

  const periodKey = getCurrentPeriodKey();
  const { count: usedRepositorySlotCount } = await locals.supabase
    .from('repository_usage_periods')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id)
    .eq('period_key', periodKey);

  const { count: usedReleaseNoteCount } = await locals.supabase
    .from('release_note_usage_periods')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id)
    .eq('period_key', periodKey);

  const { count: draftCount } = await locals.supabase
    .from('release_notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id)
    .eq('status', 'draft');

  const { count: failedCount } = await locals.supabase
    .from('release_notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id)
    .eq('status', 'failed');

  const { data: recentReleaseNotes } = await locals.supabase
    .from('release_notes')
    .select('id, title, status, tag_name, previous_tag_name, created_at, repository_id, error_message')
    .eq('user_id', locals.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentRepositoryIds = [
    ...new Set((recentReleaseNotes ?? []).map((releaseNote) => releaseNote.repository_id))
  ];
  const { data: recentRepositories } =
    recentRepositoryIds.length > 0
      ? await locals.supabase.from('repositories').select('id, full_name').in('id', recentRepositoryIds)
      : { data: [] };
  const recentRepositoryNamesById = new Map(
    (recentRepositories ?? []).map((repository) => [repository.id, repository.full_name])
  );

  const usagePeriods = getRecentPeriodKeys();
  const { data: repositoryUsageHistoryRows } = await locals.supabase
    .from('repository_usage_periods')
    .select('period_key')
    .eq('user_id', locals.user.id)
    .in('period_key', usagePeriods);

  const { data: releaseNoteUsageHistoryRows } = await locals.supabase
    .from('release_note_usage_periods')
    .select('period_key')
    .eq('user_id', locals.user.id)
    .in('period_key', usagePeriods);

  const repositoryUsageByPeriod = new Map<string, number>();
  for (const row of repositoryUsageHistoryRows ?? []) {
    repositoryUsageByPeriod.set(row.period_key, (repositoryUsageByPeriod.get(row.period_key) ?? 0) + 1);
  }

  const releaseNoteUsageByPeriod = new Map<string, number>();
  for (const row of releaseNoteUsageHistoryRows ?? []) {
    releaseNoteUsageByPeriod.set(row.period_key, (releaseNoteUsageByPeriod.get(row.period_key) ?? 0) + 1);
  }

  return {
    activeRepositoryCount: activeRepositoryCount ?? 0,
    activeRepositories: activeRepositories ?? [],
    draftCount: draftCount ?? 0,
    failedCount: failedCount ?? 0,
    githubInstallation: installation,
    githubInstallStatus: url.searchParams.get('github_install'),
    repositoryCount: repositoryCount ?? 0,
    repositoryLimit: billing.limits.repositories,
    releaseNoteLimit: billing.limits.releaseNotes,
    repositoryUsagePeriod: periodKey,
    recentReleaseNotes: (recentReleaseNotes ?? []).map((releaseNote) => ({
      ...releaseNote,
      repositoryFullName: recentRepositoryNamesById.get(releaseNote.repository_id)
    })),
    usageHistory: usagePeriods.map((period) => ({
      period,
      releaseNotes: releaseNoteUsageByPeriod.get(period) ?? 0,
      repositories: repositoryUsageByPeriod.get(period) ?? 0
    })),
    usedReleaseNoteCount: usedReleaseNoteCount ?? 0,
    usedRepositorySlotCount: usedRepositorySlotCount ?? 0
  };
};

export const actions = {
  installGithubApp: async ({ cookies, locals, url }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before installing the GitHub App.' });
    }

    if (!env.GITHUB_APP_SLUG) {
      return fail(500, { message: 'GitHub App is not configured.' });
    }

    const state = randomUUID();

    cookies.set('github_app_install_state', state, {
      httpOnly: true,
      maxAge: 60 * 10,
      path: '/',
      sameSite: 'lax',
      secure: url.protocol === 'https:'
    });

    const installUrl = new URL(`https://github.com/apps/${env.GITHUB_APP_SLUG}/installations/new`);
    installUrl.searchParams.set('state', state);

    redirect(303, installUrl.toString());
  }
};
