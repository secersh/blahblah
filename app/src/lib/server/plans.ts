export type PlanId = 'free' | 'starter' | 'pro';
export type BillingInterval = 'monthly' | 'yearly';

export type PlanLimits = {
  repositories: number | null;
  releaseNotes: number | null;
};

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: {
    monthly: string;
    yearly?: string;
  };
  limits: PlanLimits;
};

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    price: { monthly: '$0' },
    limits: {
      repositories: 1,
      releaseNotes: 20
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: { monthly: '$5', yearly: '$50' },
    limits: {
      repositories: 5,
      releaseNotes: 100
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: { monthly: '$15', yearly: '$150' },
    limits: {
      repositories: null,
      releaseNotes: null
    }
  }
};

const PAID_ACCESS_STATUSES = new Set(['active', 'on_trial']);

export type LemonVariantConfig = {
  starterMonthly: string;
  starterYearly: string;
  proMonthly: string;
  proYearly: string;
};

export function getPlanByVariantId(
  variantId: string | number | null | undefined,
  config: LemonVariantConfig
): PlanId | null {
  const normalized = String(variantId ?? '');

  if (
    normalized &&
    (normalized === config.starterMonthly || normalized === config.starterYearly)
  ) {
    return 'starter';
  }

  if (
    normalized &&
    (normalized === config.proMonthly || normalized === config.proYearly)
  ) {
    return 'pro';
  }

  return null;
}

export function getBillingIntervalByVariantId(
  variantId: string | number | null | undefined,
  config: LemonVariantConfig
): BillingInterval | null {
  const normalized = String(variantId ?? '');

  if (normalized && (normalized === config.starterMonthly || normalized === config.proMonthly)) {
    return 'monthly';
  }

  if (normalized && (normalized === config.starterYearly || normalized === config.proYearly)) {
    return 'yearly';
  }

  return null;
}

export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLAN_DEFINITIONS[plan].limits;
}

export function hasReachedLimit(used: number, limit: number | null) {
  return limit !== null && used >= limit;
}

export function formatLimit(limit: number | null, label: string) {
  return limit === null ? `Unlimited ${label}` : `${limit} ${label}`;
}

export function resolveEntitledPlan(
  subscription: { plan: string; status: string; ends_at?: string | null } | null | undefined
): PlanId {
  if (!subscription) {
    return 'free';
  }

  const isCancelledWithRemainingAccess =
    subscription.status === 'cancelled' &&
    (!subscription.ends_at || new Date(subscription.ends_at).getTime() > Date.now());

  if (!PAID_ACCESS_STATUSES.has(subscription.status) && !isCancelledWithRemainingAccess) {
    return 'free';
  }

  if (subscription.plan === 'starter' || subscription.plan === 'pro') {
    return subscription.plan;
  }

  return 'free';
}
