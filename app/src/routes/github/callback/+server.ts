import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies, locals, url }) => {
  if (!locals.user) {
    redirect(303, '/?next=/app/onboarding');
  }

  const installationId = url.searchParams.get('installation_id');
  const setupAction = url.searchParams.get('setup_action');
  const state = url.searchParams.get('state');
  const expectedState = cookies.get('github_app_install_state');

  cookies.delete('github_app_install_state', { path: '/' });

  if (!installationId) {
    redirect(303, '/app/onboarding?github_install=missing_installation_id');
  }

  if (state && expectedState && state !== expectedState) {
    redirect(303, '/app/onboarding?github_install=state_mismatch');
  }

  const parsedInstallationId = Number(installationId);

  if (!Number.isSafeInteger(parsedInstallationId)) {
    redirect(303, '/app/onboarding?github_install=invalid_installation_id');
  }

  const { error } = await locals.supabase.from('github_installations').upsert(
    {
      installation_id: parsedInstallationId,
      setup_action: setupAction,
      user_id: locals.user.id
    },
    { onConflict: 'installation_id' }
  );

  if (error) {
    console.error('Failed to save GitHub installation', error);
    redirect(303, '/app/onboarding?github_install=save_failed');
  }

  redirect(303, '/app/onboarding?github_install=success');
};
