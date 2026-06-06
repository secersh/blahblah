import { GITHUB_APP_SLUG } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';

const FREE_REPOSITORY_LIMIT = 1;

function getCurrentPeriodKey() {
  return new Date().toISOString().slice(0, 7);
}

export const load = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

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

  const { count: draftCount } = await locals.supabase
    .from('release_notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id)
    .eq('status', 'draft');

  const { data: recentReleaseNotes } = await locals.supabase
    .from('release_notes')
    .select('id, title, status, tag_name, previous_tag_name, created_at, repository_id')
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

  return {
    activeRepositoryCount: activeRepositoryCount ?? 0,
    activeRepositories: activeRepositories ?? [],
    draftCount: draftCount ?? 0,
    githubInstallation: installation,
    githubInstallStatus: url.searchParams.get('github_install'),
    repositoryCount: repositoryCount ?? 0,
    repositoryLimit: FREE_REPOSITORY_LIMIT,
    repositoryUsagePeriod: periodKey,
    recentReleaseNotes: (recentReleaseNotes ?? []).map((releaseNote) => ({
      ...releaseNote,
      repositoryFullName: recentRepositoryNamesById.get(releaseNote.repository_id)
    })),
    usedRepositorySlotCount: usedRepositorySlotCount ?? 0
  };
};

export const actions = {
  installGithubApp: async ({ cookies, locals, url }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before installing the GitHub App.' });
    }

    if (!GITHUB_APP_SLUG) {
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

    const installUrl = new URL(`https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`);
    installUrl.searchParams.set('state', state);

    redirect(303, installUrl.toString());
  }
};
