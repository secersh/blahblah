import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  const { data: releaseNote } = await locals.supabase
    .from('release_notes')
    .select('id, title, status, tag_name, previous_tag_name, storage_bucket, storage_path, repositories(full_name)')
    .eq('id', params.releaseNoteId)
    .eq('user_id', locals.user.id)
    .maybeSingle();

  if (!releaseNote) {
    redirect(303, '/app/release-notes');
  }

  const { data: fileData, error: downloadError } = await locals.supabase.storage
    .from(releaseNote.storage_bucket)
    .download(releaseNote.storage_path);

  if (downloadError) {
    console.error('Failed to download release note file', downloadError);
  }

  const repository = Array.isArray(releaseNote.repositories)
    ? releaseNote.repositories[0]
    : releaseNote.repositories;

  return {
    releaseNote: {
      ...releaseNote,
      repositoryFullName: repository?.full_name,
      content: fileData ? await fileData.text() : ''
    },
    saved: url.searchParams.get('saved') === 'true'
  };
};

export const actions = {
  approveReleaseNote: async ({ locals, params }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before approving release notes.' });
    }

    const { error } = await locals.supabase
      .from('release_notes')
      .update({ status: 'approved' })
      .eq('id', params.releaseNoteId)
      .eq('user_id', locals.user.id);

    if (error) {
      console.error('Failed to approve release note', error);
      return fail(500, { message: 'Release note could not be approved. Try again.' });
    }

    redirect(303, `/app/release-notes/${params.releaseNoteId}?saved=true`);
  },

  saveReleaseNote: async ({ locals, params, request }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before editing release notes.' });
    }

    const formData = await request.formData();
    const content = String(formData.get('content') ?? '');

    const { data: releaseNote } = await locals.supabase
      .from('release_notes')
      .select('id, storage_bucket, storage_path')
      .eq('id', params.releaseNoteId)
      .eq('user_id', locals.user.id)
      .maybeSingle();

    if (!releaseNote) {
      return fail(404, { message: 'Release note was not found.' });
    }

    const { error: uploadError } = await locals.supabase.storage
      .from(releaseNote.storage_bucket)
      .upload(releaseNote.storage_path, content, {
        contentType: 'text/markdown',
        upsert: true
      });

    if (uploadError) {
      console.error('Failed to save release note file', uploadError);
      return fail(500, { message: 'Release note could not be saved. Try again.' });
    }

    redirect(303, `/app/release-notes/${params.releaseNoteId}?saved=true`);
  }
};
