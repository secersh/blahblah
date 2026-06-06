import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  const { data: installation } = await locals.supabase
    .from('github_installations')
    .select('id, installation_id, created_at')
    .eq('user_id', locals.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: repositoryCount } = await locals.supabase
    .from('repositories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id);

  const { count: releaseNoteCount } = await locals.supabase
    .from('release_notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', locals.user.id);

  return {
    githubInstallation: installation,
    repositoryCount: repositoryCount ?? 0,
    releaseNoteCount: releaseNoteCount ?? 0,
    removed: url.searchParams.get('github') === 'removed'
  };
};

export const actions = {
  removeGithubConnection: async ({ locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before changing settings.' });
    }

    const { error } = await locals.supabase
      .from('github_installations')
      .delete()
      .eq('user_id', locals.user.id);

    if (error) {
      console.error('Failed to remove GitHub connection data', error);
      return fail(500, { message: 'GitHub connection could not be removed. Try again.' });
    }

    redirect(303, '/app/settings?github=removed');
  }
};
