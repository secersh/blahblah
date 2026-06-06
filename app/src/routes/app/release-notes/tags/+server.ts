import { listRepositoryTags } from '$lib/server/github/app';
import { error, json } from '@sveltejs/kit';

export const GET = async ({ locals, url }) => {
  if (!locals.user) {
    error(401, 'Unauthorized');
  }

  const repositoryId = url.searchParams.get('repositoryId');

  if (!repositoryId) {
    error(400, 'Missing repositoryId');
  }

  const { data: repository } = await locals.supabase
    .from('repositories')
    .select('owner, name, active, github_installations(installation_id)')
    .eq('id', repositoryId)
    .eq('user_id', locals.user.id)
    .maybeSingle();

  const githubInstallation = Array.isArray(repository?.github_installations)
    ? repository?.github_installations[0]
    : repository?.github_installations;
  const installationId = githubInstallation?.installation_id;

  if (!repository || !repository.active || !installationId) {
    error(404, 'Repository not found');
  }

  try {
    const tags = await listRepositoryTags({
      installationId,
      owner: repository.owner,
      repo: repository.name
    });

    return json({
      tags: tags.map((tag) => ({
        name: tag.name,
        sha: tag.commit.sha
      }))
    });
  } catch (tagError) {
    console.error('Failed to fetch repository tags', tagError);
    error(500, 'Could not fetch tags');
  }
};
