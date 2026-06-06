import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  if (locals.user) {
    redirect(303, '/app');
  }
};

export const actions = {
  default: async ({ locals, url }) => {
    const { data, error } = await locals.supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${url.origin}/auth/callback`
      }
    });

    if (error || !data.url) {
      return fail(500, {
        message: error?.message ?? 'Could not start GitHub sign-in.'
      });
    }

    redirect(303, data.url);
  }
};
