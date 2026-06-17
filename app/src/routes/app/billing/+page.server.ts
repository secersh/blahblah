import {
  cancelSubscription,
  changeSubscriptionPlan,
  createCheckoutUrl,
  listSubscriptionInvoices,
  resumeSubscription
} from '$lib/server/lemonsqueezy';
import { getUserBilling } from '$lib/server/billing';
import { fail, redirect } from '@sveltejs/kit';

const CHECKOUT_PLANS = ['starter', 'pro'] as const;
const CHECKOUT_INTERVALS = ['monthly', 'yearly'] as const;

export const load = async ({ locals, url }) => {
  if (!locals.user) {
    redirect(303, `/?next=${encodeURIComponent(url.pathname)}`);
  }

  const billing = await getUserBilling(locals.supabase, locals.user.id);
  const invoices = billing.subscription?.lemon_subscription_id
    ? await listSubscriptionInvoices(billing.subscription.lemon_subscription_id)
    : [];

  return {
    billing,
    invoices,
    checkoutSuccess: url.searchParams.get('checkout') === 'success',
    planChanged: url.searchParams.get('plan') === 'changed',
    requestedPlan: url.searchParams.get('target_plan'),
    requestedInterval: url.searchParams.get('target_interval'),
    cancellationRequested: url.searchParams.get('subscription') === 'cancelled',
    resumeRequested: url.searchParams.get('subscription') === 'resumed'
  };
};

export const actions = {
  checkout: async ({ locals, request, url }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before upgrading.' });
    }

    const formData = await request.formData();
    const plan = String(formData.get('plan') ?? '');
    const interval = String(formData.get('interval') ?? '');

    if (!CHECKOUT_PLANS.includes(plan as (typeof CHECKOUT_PLANS)[number])) {
      return fail(400, { message: 'Choose a valid plan.' });
    }

    if (!CHECKOUT_INTERVALS.includes(interval as (typeof CHECKOUT_INTERVALS)[number])) {
      return fail(400, { message: 'Choose a valid billing interval.' });
    }

    const billing = await getUserBilling(locals.supabase, locals.user.id);

    if (billing.currentPlan !== 'free') {
      return fail(400, { message: 'Plan changes for existing subscriptions are not available through checkout.' });
    }

    let checkoutUrl: string;

    try {
      checkoutUrl = await createCheckoutUrl({
        userId: locals.user.id,
        email: locals.user.email,
        plan: plan as (typeof CHECKOUT_PLANS)[number],
        interval: interval as (typeof CHECKOUT_INTERVALS)[number],
        origin: url.origin
      });
    } catch (error) {
      console.error('Failed to create Lemon checkout', error);
      return fail(500, { message: 'Checkout could not be started. Try again.' });
    }

    redirect(303, checkoutUrl);
  },
  changePlan: async ({ locals, request }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before changing plans.' });
    }

    const formData = await request.formData();
    const plan = String(formData.get('plan') ?? '');
    const interval = String(formData.get('interval') ?? '');

    if (!CHECKOUT_PLANS.includes(plan as (typeof CHECKOUT_PLANS)[number])) {
      return fail(400, { message: 'Choose a valid plan.' });
    }

    if (!CHECKOUT_INTERVALS.includes(interval as (typeof CHECKOUT_INTERVALS)[number])) {
      return fail(400, { message: 'Choose a valid billing interval.' });
    }

    const billing = await getUserBilling(locals.supabase, locals.user.id);

    if (!billing.subscription?.lemon_subscription_id || billing.currentPlan === 'free') {
      return fail(400, { message: 'Start a subscription before changing plans.' });
    }

    if (billing.subscription.status === 'cancelled') {
      return fail(400, { message: 'This subscription is cancelled. Plan changes are unavailable.' });
    }

    if (billing.currentPlan === plan && billing.currentInterval === interval) {
      return fail(400, { message: 'You are already on this plan.' });
    }

    const invoiceImmediately = billing.currentPlan === 'starter' && plan === 'pro';

    try {
      await changeSubscriptionPlan({
        subscriptionId: billing.subscription.lemon_subscription_id,
        plan: plan as (typeof CHECKOUT_PLANS)[number],
        interval: interval as (typeof CHECKOUT_INTERVALS)[number],
        invoiceImmediately
      });
    } catch (error) {
      console.error('Failed to change Lemon subscription plan', error);
      return fail(500, { message: 'Plan could not be changed. Try again.' });
    }

    redirect(303, `/app/billing?plan=changed&target_plan=${plan}&target_interval=${interval}`);
  },
  cancelSubscription: async ({ locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before cancelling a subscription.' });
    }

    const billing = await getUserBilling(locals.supabase, locals.user.id);

    if (!billing.subscription?.lemon_subscription_id || billing.currentPlan === 'free') {
      return fail(400, { message: 'No active subscription to cancel.' });
    }

    if (billing.subscription.status === 'cancelled') {
      return fail(400, { message: 'This subscription is already cancelled.' });
    }

    try {
      await cancelSubscription(billing.subscription.lemon_subscription_id);
    } catch (error) {
      console.error('Failed to cancel Lemon subscription', error);
      return fail(500, { message: 'Subscription could not be cancelled. Try again.' });
    }

    redirect(303, '/app/billing?subscription=cancelled');
  },
  resumeSubscription: async ({ locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Sign in before resuming a subscription.' });
    }

    const billing = await getUserBilling(locals.supabase, locals.user.id);

    if (!billing.subscription?.lemon_subscription_id || billing.currentPlan === 'free') {
      return fail(400, { message: 'No paid subscription to resume.' });
    }

    if (billing.subscription.status !== 'cancelled') {
      return fail(400, { message: 'This subscription is not cancelled.' });
    }

    try {
      await resumeSubscription(billing.subscription.lemon_subscription_id);
    } catch (error) {
      console.error('Failed to resume Lemon subscription', error);
      return fail(500, { message: 'Subscription could not be resumed. Try again.' });
    }

    redirect(303, '/app/billing?subscription=resumed');
  }
};
