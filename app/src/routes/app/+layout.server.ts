import { getUserBilling } from '$lib/server/billing';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  const billing = await getUserBilling(locals.supabase, locals.user.id);

  return {
    billing,
    session: locals.session,
    user: locals.user
  };
};
