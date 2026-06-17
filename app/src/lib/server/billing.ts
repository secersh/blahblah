import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import {
  getBillingIntervalByVariantId,
  getPlanLimits,
  PLAN_DEFINITIONS,
  resolveEntitledPlan,
  type LemonVariantConfig,
  type PlanId
} from './plans';

export type BillingSubscription = {
  plan: string;
  status: string;
  lemon_customer_id: string | null;
  lemon_subscription_id: string | null;
  lemon_variant_id: string | null;
  renews_at: string | null;
  ends_at: string | null;
  trial_ends_at: string | null;
  last_payment_failed_at: string | null;
  last_payment_recovered_at: string | null;
  last_payment_event: string | null;
};

export async function getUserBilling(supabase: SupabaseClient, userId: string) {
  const { data: subscriptions } = await supabase
    .from('billing_subscriptions')
    .select(
      'plan, status, lemon_customer_id, lemon_subscription_id, lemon_variant_id, renews_at, ends_at, trial_ends_at, last_payment_failed_at, last_payment_recovered_at, last_payment_event'
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);

  const subscription = subscriptions?.[0] ?? null;

  const plan = resolveEntitledPlan(subscription as BillingSubscription | null);
  const variantConfig: LemonVariantConfig = {
    starterMonthly: env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID ?? '',
    starterYearly: env.LEMONSQUEEZY_STARTER_YEARLY_VARIANT_ID ?? '',
    proMonthly: env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID ?? '',
    proYearly: env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID ?? ''
  };
  const interval = getBillingIntervalByVariantId(subscription?.lemon_variant_id, variantConfig);
  const lastPaymentFailedAt = subscription?.last_payment_failed_at
    ? new Date(subscription.last_payment_failed_at).getTime()
    : 0;
  const lastPaymentRecoveredAt = subscription?.last_payment_recovered_at
    ? new Date(subscription.last_payment_recovered_at).getTime()
    : 0;
  const hasPaymentIssue =
    subscription?.last_payment_event === 'subscription_payment_failed' ||
    lastPaymentFailedAt > lastPaymentRecoveredAt;

  return {
    currentPlan: plan,
    currentInterval: interval,
    currentPlanDefinition: PLAN_DEFINITIONS[plan],
    limits: getPlanLimits(plan),
    hasPaymentIssue,
    subscription: (subscription ?? null) as BillingSubscription | null
  };
}

export function formatPlanName(plan: PlanId) {
  return PLAN_DEFINITIONS[plan].name;
}
