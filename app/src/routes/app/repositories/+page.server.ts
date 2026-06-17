import { getUserBilling } from '$lib/server/billing';
import { hasReachedLimit } from '$lib/server/plans';
import { listInstallationRepositories } from '$lib/server/github/app';
import { fail, redirect } from '@sveltejs/kit';

function getCurrentPeriodKey() {
  return new Date().toISOString().slice(0, 7);
}

export const load = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  const billing = await getUserBilling(locals.supabase, locals.user.id);

  const { data: installation } = await locals.supabase
    .from('github_installations')
    .select('id, installation_id')
    .eq('user_id', locals.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: repositories } = installation
    ? await locals.supabase
        .from('repositories')
        .select('id, github_repository_id, owner, name, full_name, private, html_url, default_branch, active')
        .eq('user_id', locals.user.id)
        .eq('github_installation_id', installation.id)
        .eq('github_accessible', true)
        .order('full_name', { ascending: true })
    : { data: [] };

  const activeRepositoryCount = repositories?.filter((repository) => repository.active).length ?? 0;
  const periodKey = getCurrentPeriodKey();
  const { data: repositoryUsagePeriods } = await locals.supabase
    .from('repository_usage_periods')
    .select('repository_id')
    .eq('user_id', locals.user.id)
    .eq('period_key', periodKey);
  const usedRepositoryIds = new Set(
    (repositoryUsagePeriods ?? []).map((usagePeriod) => usagePeriod.repository_id)
  );

  return {
    activeRepositoryCount,
    billing,
    hasGithubInstallation: Boolean(installation),
    periodKey,
    repositoryLimit: billing.limits.repositories,
    repositories: (repositories ?? []).map((repository) => ({
      ...repository,
      usedThisPeriod: usedRepositoryIds.has(repository.id)
    })),
    syncStatus: url.searchParams.get('sync'),
    usedRepositorySlotCount: usedRepositoryIds.size
  };
};

export const actions = {
  syncGithubRepos: async ({ locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before syncing repositories.' });
    }

    const { data: installation } = await locals.supabase
      .from('github_installations')
      .select('id, installation_id')
      .eq('user_id', locals.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!installation) {
      return fail(400, { message: 'Connect the GitHub App before syncing repositories.' });
    }

    let githubRepos;

    try {
      githubRepos = await listInstallationRepositories(installation.installation_id);
    } catch (error) {
      console.error('Failed to sync GitHub repositories', error);
      return fail(500, { message: 'Repository sync failed. Try again.' });
    }

    const rows = githubRepos.map((repo) => ({
      user_id: locals.user!.id,
      github_installation_id: installation.id,
      github_repository_id: repo.id,
      owner: repo.owner.login,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      default_branch: repo.default_branch,
      github_accessible: true
    }));

    const accessibleRepositoryIds = githubRepos.map((repo) => repo.id);

    const inaccessibleQuery = locals.supabase
      .from('repositories')
      .update({ active: false, github_accessible: false })
      .eq('user_id', locals.user.id)
      .eq('github_installation_id', installation.id);

    const { error: deactivateMissingError } =
      accessibleRepositoryIds.length > 0
        ? await inaccessibleQuery.not('github_repository_id', 'in', `(${accessibleRepositoryIds.join(',')})`)
        : await inaccessibleQuery;

    if (deactivateMissingError) {
      console.error('Failed to deactivate inaccessible repositories', deactivateMissingError);
      return fail(500, { message: 'Repository sync could not be saved. Try again.' });
    }

    if (rows.length > 0) {
      const { error } = await locals.supabase.from('repositories').upsert(rows, {
        onConflict: 'github_repository_id'
      });

      if (error) {
        console.error('Failed to save repositories', error);
        return fail(500, { message: 'Repository sync could not be saved. Try again.' });
      }
    }

    redirect(303, '/app/repositories?sync=success');
  },

  toggleRepositoryActive: async ({ locals, request }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before changing repositories.' });
    }

    const formData = await request.formData();
    const repositoryId = String(formData.get('repositoryId') ?? '');
    const nextActive = String(formData.get('nextActive') ?? '') === 'true';

    if (!repositoryId) {
      return fail(400, { message: 'Choose a repository first.' });
    }

    const { data: repository } = await locals.supabase
      .from('repositories')
      .select('id, active')
      .eq('id', repositoryId)
      .eq('user_id', locals.user.id)
      .maybeSingle();

    if (!repository) {
      return fail(404, { message: 'Repository was not found.' });
    }

    const periodKey = getCurrentPeriodKey();

    if (nextActive && !repository.active) {
      const billing = await getUserBilling(locals.supabase, locals.user.id);
      const { data: existingUsage } = await locals.supabase
        .from('repository_usage_periods')
        .select('id')
        .eq('repository_id', repository.id)
        .eq('user_id', locals.user.id)
        .eq('period_key', periodKey)
        .maybeSingle();

      if (!existingUsage) {
        const { count: usedSlotCount } = await locals.supabase
          .from('repository_usage_periods')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', locals.user.id)
          .eq('period_key', periodKey);

        if (hasReachedLimit(usedSlotCount ?? 0, billing.limits.repositories)) {
          return fail(400, {
            message: `${billing.currentPlanDefinition.name} plan repository quota reached. Upgrade to enable more.`
          });
        }

        const { error: usageError } = await locals.supabase.from('repository_usage_periods').insert({
          user_id: locals.user.id,
          repository_id: repository.id,
          period_key: periodKey
        });

        if (usageError) {
          console.error('Failed to record repository usage period', usageError);
          return fail(500, { message: 'Repository could not be updated. Try again.' });
        }
      }
    }

    const { error } = await locals.supabase
      .from('repositories')
      .update({ active: nextActive })
      .eq('id', repositoryId)
      .eq('user_id', locals.user.id);

    if (error) {
      console.error('Failed to update repository active state', error);
      return fail(500, { message: 'Repository could not be updated. Try again.' });
    }

    redirect(303, '/app/repositories');
  }
};
