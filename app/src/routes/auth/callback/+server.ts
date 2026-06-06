import { redirect } from '@sveltejs/kit';

export const GET = async ({ locals, url }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/app/onboarding';
  const redirectTo = next.startsWith('/') ? next : '/app/onboarding';

  if (code) {
    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(303, redirectTo);
    }
  }

  redirect(303, '/?error=auth_failed');
};
