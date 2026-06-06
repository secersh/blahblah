import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  return {
    user: locals.user
  };
};
