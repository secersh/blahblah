import { getUserBilling } from '$lib/server/billing';
import { getSubscriptionUrl } from '$lib/server/lemonsqueezy';
import { error, redirect } from '@sveltejs/kit';

export const GET = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  const billing = await getUserBilling(locals.supabase, locals.user.id);

  if (!billing.subscription?.lemon_subscription_id) {
    redirect(303, '/app/billing');
  }

  const portal = await getSubscriptionUrl(billing.subscription.lemon_subscription_id);

  if (!portal) {
    error(502, 'Payment method update is not available.');
  }

  redirect(303, portal.url);
};
