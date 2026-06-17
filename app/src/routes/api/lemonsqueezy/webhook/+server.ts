import { asString, getLemonPlanByVariantId, verifyLemonSignature, type LemonWebhookPayload } from '$lib/server/lemonsqueezy';
import { createSupabaseServiceClient } from '$lib/supabase/service';
import { json } from '@sveltejs/kit';

const SUBSCRIPTION_SYNC_EVENTS = new Set([
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_resumed',
  'subscription_expired',
  'subscription_paused',
  'subscription_unpaused'
]);

const SUBSCRIPTION_PAYMENT_EVENTS = new Set([
  'subscription_payment_failed',
  'subscription_payment_success',
  'subscription_payment_recovered'
]);

function toTimestamp(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function getEventTimestamp(attributes: Record<string, unknown>) {
  return toTimestamp(attributes.created_at) ?? new Date().toISOString();
}

function getNestedId(value: unknown) {
  if (!value || typeof value !== 'object' || !('id' in value)) {
    return null;
  }

  return asString((value as { id: unknown }).id);
}

export const POST = async ({ request }) => {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');

  if (!verifyLemonSignature(rawBody, signature)) {
    console.warn('Lemon webhook signature verification failed');
    return json({ message: 'Invalid signature.' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LemonWebhookPayload;
  const eventName = payload.meta?.event_name ?? '';

  const attributes = payload.data?.attributes ?? {};
  const userId = payload.meta?.custom_data?.user_id;
  const subscriptionId = payload.data?.id ?? asString(attributes.id);
  const variantId = asString(attributes.variant_id);
  const plan = getLemonPlanByVariantId(variantId);

  if (SUBSCRIPTION_PAYMENT_EVENTS.has(eventName)) {
    const paymentSubscriptionId = asString(attributes.subscription_id) ?? getNestedId(attributes.subscription);

    if (!userId && !paymentSubscriptionId) {
      console.error('Lemon payment webhook missing user mapping', { eventName, subscriptionId });
      return json({ message: 'Payment mapping missing.' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const eventTimestamp = getEventTimestamp(attributes);
    const paymentUpdate =
      eventName === 'subscription_payment_failed'
        ? {
            last_payment_failed_at: eventTimestamp,
            last_payment_event: eventName
          }
        : {
            last_payment_recovered_at: eventTimestamp,
            last_payment_event: eventName
          };

    const query = supabase
      .from('billing_subscriptions')
      .update(paymentUpdate);

    const { error } = userId
      ? await query.eq('user_id', userId)
      : await query.eq('lemon_subscription_id', paymentSubscriptionId);

    if (error) {
      console.error('Failed to sync Lemon payment event', error);
      return json({ message: 'Payment sync failed.' }, { status: 500 });
    }

    return json({ ok: true });
  }

  if (!SUBSCRIPTION_SYNC_EVENTS.has(eventName)) {
    return json({ ok: true, ignored: true });
  }

  if (!userId || !subscriptionId || !variantId || !plan) {
    console.error('Lemon webhook missing subscription mapping', {
      eventName,
      userId,
      subscriptionId,
      variantId
    });
    return json({ message: 'Subscription mapping missing.' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from('billing_subscriptions').upsert(
    {
      user_id: userId,
      plan,
      status: asString(attributes.status) ?? 'unknown',
      lemon_customer_id: asString(attributes.customer_id),
      lemon_order_id: asString(attributes.order_id),
      lemon_product_id: asString(attributes.product_id),
      lemon_variant_id: variantId,
      lemon_subscription_id: subscriptionId,
      renews_at: toTimestamp(attributes.renews_at),
      ends_at: toTimestamp(attributes.ends_at),
      trial_ends_at: toTimestamp(attributes.trial_ends_at),
      last_payment_recovered_at:
        eventName === 'subscription_created' || eventName === 'subscription_resumed'
          ? new Date().toISOString()
          : undefined,
      last_payment_event:
        eventName === 'subscription_created' || eventName === 'subscription_resumed'
          ? eventName
          : undefined,
      test_mode: Boolean(attributes.test_mode)
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Failed to sync Lemon subscription', error);
    return json({ message: 'Subscription sync failed.' }, { status: 500 });
  }

  return json({ ok: true });
};
