import { listRepositoryTags } from '$lib/server/github/app';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  const repositoryIdFilter = url.searchParams.get('repositoryId') ?? '';
  const statusFilter = url.searchParams.get('status') ?? '';

  const { data: activeRepositories } = await locals.supabase
    .from('repositories')
    .select('id, full_name')
    .eq('user_id', locals.user.id)
    .eq('active', true)
    .order('full_name', { ascending: true });

  let releaseNotesQuery = locals.supabase
    .from('release_notes')
    .select('id, title, status, tag_name, previous_tag_name, created_at, repository_id, error_message')
    .eq('user_id', locals.user.id);

  if (repositoryIdFilter) {
    releaseNotesQuery = releaseNotesQuery.eq('repository_id', repositoryIdFilter);
  }

  if (statusFilter === 'draft' || statusFilter === 'approved') {
    releaseNotesQuery = releaseNotesQuery.eq('status', statusFilter);
  }

  const { data: releaseNotes } = await releaseNotesQuery.order('created_at', { ascending: false });

  const repositoryIds = [...new Set((releaseNotes ?? []).map((releaseNote) => releaseNote.repository_id))];
  const { data: repositories } =
    repositoryIds.length > 0
      ? await locals.supabase.from('repositories').select('id, full_name').in('id', repositoryIds)
      : { data: [] };

  const repositoryNamesById = new Map(
    (repositories ?? []).map((repository) => [repository.id, repository.full_name])
  );

  return {
    activeRepositories: activeRepositories ?? [],
    filters: {
      repositoryId: repositoryIdFilter,
      status: statusFilter
    },
    releaseNotes: (releaseNotes ?? []).map((releaseNote) => ({
      ...releaseNote,
      repositoryFullName: repositoryNamesById.get(releaseNote.repository_id)
    })),
    queued: url.searchParams.get('queued') === 'true'
  };
};

export const actions = {
  approveReleaseNote: async ({ locals, request }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before approving release notes.' });
    }

    const formData = await request.formData();
    const releaseNoteId = String(formData.get('releaseNoteId') ?? '');

    if (!releaseNoteId) {
      return fail(400, { message: 'Choose a release note first.' });
    }

    const { error } = await locals.supabase
      .from('release_notes')
      .update({ status: 'approved' })
      .eq('id', releaseNoteId)
      .eq('user_id', locals.user.id);

    if (error) {
      console.error('Failed to approve release note', error);
      return fail(500, { message: 'Release note could not be approved. Try again.' });
    }

    redirect(303, '/app/release-notes');
  },

  deleteReleaseNote: async ({ locals, request }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before deleting release notes.' });
    }

    const formData = await request.formData();
    const releaseNoteId = String(formData.get('releaseNoteId') ?? '');

    if (!releaseNoteId) {
      return fail(400, { message: 'Choose a release note first.' });
    }

    const { data: releaseNote } = await locals.supabase
      .from('release_notes')
      .select('id, storage_bucket, storage_path')
      .eq('id', releaseNoteId)
      .eq('user_id', locals.user.id)
      .maybeSingle();

    if (!releaseNote) {
      return fail(404, { message: 'Release note was not found.' });
    }

    const { error: deleteFileError } = await locals.supabase.storage
      .from(releaseNote.storage_bucket)
      .remove([releaseNote.storage_path]);

    if (deleteFileError) {
      console.error('Failed to delete release note file', deleteFileError);
      return fail(500, { message: 'Release note could not be deleted. Try again.' });
    }

    const { error } = await locals.supabase
      .from('release_notes')
      .delete()
      .eq('id', releaseNote.id)
      .eq('user_id', locals.user.id);

    if (error) {
      console.error('Failed to delete release note', error);
      return fail(500, { message: 'Release note could not be deleted. Try again.' });
    }

    redirect(303, '/app/release-notes');
  },

  generateReleaseNotes: async ({ locals, request }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before generating release notes.' });
    }

    const formData = await request.formData();
    const repositoryId = String(formData.get('repositoryId') ?? '');
    const startTag = String(formData.get('startTag') ?? '');
    const endTag = String(formData.get('endTag') ?? '');

    if (!repositoryId || !startTag || !endTag) {
      return fail(400, { message: 'Choose a repository and both tags.' });
    }

    if (startTag === endTag) {
      return fail(400, { message: 'Start and end tags must be different.' });
    }

    const { data: repository } = await locals.supabase
      .from('repositories')
      .select('id, full_name, owner, name, active, github_installations(installation_id)')
      .eq('id', repositoryId)
      .eq('user_id', locals.user.id)
      .maybeSingle();

    if (!repository || !repository.active) {
      return fail(400, { message: 'Choose an active repository.' });
    }

    const githubInstallation = Array.isArray(repository.github_installations)
      ? repository.github_installations[0]
      : repository.github_installations;
    const installationId = githubInstallation?.installation_id;

    if (!installationId) {
      return fail(400, { message: 'GitHub connection was not found. Sync repositories again.' });
    }

    try {
      const tags = await listRepositoryTags({
        installationId,
        owner: repository.owner,
        repo: repository.name
      });
      const startTagIndex = tags.findIndex((tag) => tag.name === startTag);
      const endTagIndex = tags.findIndex((tag) => tag.name === endTag);

      if (startTagIndex === -1 || endTagIndex === -1 || startTagIndex <= endTagIndex) {
        return fail(400, { message: 'Start tag must be older than end tag.' });
      }
    } catch (error) {
      console.error('Failed to validate release note tag range', error);
      return fail(500, { message: 'Tag range could not be validated. Try again.' });
    }

    const title = `${repository.full_name}: ${startTag} to ${endTag}`;
    const storagePath = `${locals.user.id}/${repository.full_name}/drafts/${Date.now()}-${endTag}.md`;

    // Create the job row up front in a 'generating' state; the edge function
    // fills in the draft file and flips the status when it finishes.
    const { data: created, error: insertError } = await locals.supabase
      .from('release_notes')
      .insert({
        user_id: locals.user.id,
        repository_id: repository.id,
        status: 'generating',
        title,
        previous_tag_name: startTag,
        tag_name: endTag,
        storage_path: storagePath
      })
      .select('id')
      .single();

    if (insertError || !created) {
      console.error('Failed to create release note job', insertError);
      return fail(500, { message: 'Release notes could not be queued. Try again.' });
    }

    // Kick off async generation. The function acks immediately (202) and runs
    // the slow work in the background, so this invoke returns quickly.
    const { error: invokeError } = await locals.supabase.functions.invoke('generate-release-notes', {
      body: {
        releaseNoteId: created.id,
        repositoryFullName: repository.full_name,
        owner: repository.owner,
        repo: repository.name,
        installationId,
        startTag,
        endTag,
        storagePath
      }
    });

    if (invokeError) {
      let detail: unknown = null;
      const context = (invokeError as { context?: Response }).context;
      if (context && typeof context.json === 'function') {
        try {
          detail = await context.clone().json();
        } catch {
          try {
            detail = await context.text();
          } catch {
            detail = null;
          }
        }
      }
      console.error('Failed to start release note generation', invokeError, 'body=', detail);
      await locals.supabase
        .from('release_notes')
        .update({ status: 'failed', error_message: 'Could not start generation.' })
        .eq('id', created.id)
        .eq('user_id', locals.user.id);
      return fail(502, { message: 'Generation service is unavailable. Try again.' });
    }

    redirect(303, '/app/release-notes?queued=true');
  }
};
