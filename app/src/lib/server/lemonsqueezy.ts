import { env } from '$env/dynamic/private';
import type { BillingInterval, PlanId } from './plans';
import { getPlanByVariantId, type LemonVariantConfig } from './plans';
import { createHmac, timingSafeEqual } from 'node:crypto';

const LEMON_API_URL = 'https://api.lemonsqueezy.com/v1';

type CheckoutOptions = {
  userId: string;
  email?: string | null;
  plan: Exclude<PlanId, 'free'>;
  interval: BillingInterval;
  origin: string;
};

type ChangeSubscriptionOptions = {
  subscriptionId: string;
  plan: Exclude<PlanId, 'free'>;
  interval: BillingInterval;
  invoiceImmediately: boolean;
};

type LemonCheckoutResponse = {
  data?: {
    attributes?: {
      url?: string;
    };
  };
  errors?: unknown;
};

type LemonSubscriptionResponse = {
  data?: {
    attributes?: {
      urls?: {
        customer_portal?: string | null;
        customer_portal_update_subscription?: string | null;
        update_payment_method?: string | null;
      };
    };
  };
  errors?: unknown;
};

type LemonSubscriptionInvoiceResponse = {
  data?: Array<{
    id?: string;
    attributes?: {
      status?: string | null;
      status_formatted?: string | null;
      total_formatted?: string | null;
      currency?: string | null;
      created_at?: string | null;
      urls?: {
        invoice_url?: string | null;
      };
    };
  }>;
  errors?: unknown;
};

export type BillingInvoice = {
  id: string;
  status: string | null;
  statusFormatted: string | null;
  totalFormatted: string | null;
  currency: string | null;
  createdAt: string | null;
  invoiceUrl: string | null;
};

export type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
      plan?: string;
      interval?: string;
    };
  };
  data?: {
    id?: string;
    attributes?: Record<string, unknown>;
  };
};

function getRequiredEnv(name: string) {
  const value = env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getLemonVariantConfig(): LemonVariantConfig {
  return {
    starterMonthly: getRequiredEnv('LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID'),
    starterYearly: getRequiredEnv('LEMONSQUEEZY_STARTER_YEARLY_VARIANT_ID'),
    proMonthly: getRequiredEnv('LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID'),
    proYearly: getRequiredEnv('LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID')
  };
}

export function getLemonPlanByVariantId(variantId: string | number | null | undefined) {
  return getPlanByVariantId(variantId, getLemonVariantConfig());
}

export function getVariantId(plan: Exclude<PlanId, 'free'>, interval: BillingInterval) {
  const config = getLemonVariantConfig();

  if (plan === 'starter') {
    return interval === 'monthly' ? config.starterMonthly : config.starterYearly;
  }

  return interval === 'monthly' ? config.proMonthly : config.proYearly;
}

export async function createCheckoutUrl({ userId, email, plan, interval, origin }: CheckoutOptions) {
  const apiKey = getRequiredEnv('LEMONSQUEEZY_API_KEY');
  const storeId = getRequiredEnv('LEMONSQUEEZY_STORE_ID');
  const variantId = getVariantId(plan, interval);
  const redirectUrl = `${origin}/app/billing?checkout=success`;

  const response = await fetch(`${LEMON_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json'
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          product_options: {
            redirect_url: redirectUrl,
            enabled_variants: [Number(variantId)]
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: false,
            desc: false,
            discount: true,
            subscription_preview: true,
            background_color: '#0d1117',
            headings_color: '#e6edf3',
            primary_text_color: '#dbe2ee',
            secondary_text_color: '#8b949e',
            links_color: '#f59e0b',
            borders_color: '#262d3a',
            checkbox_color: '#f59e0b',
            active_state_color: '#fb923c',
            button_color: '#f59e0b',
            button_text_color: '#1a1206',
            terms_privacy_color: '#8b949e'
          },
          checkout_data: {
            email: email ?? '',
            custom: {
              user_id: userId,
              plan,
              interval
            }
          }
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId
            }
          }
        }
      }
    })
  });

  const body = (await response.json()) as LemonCheckoutResponse;

  if (!response.ok || !body.data?.attributes?.url) {
    console.error('Lemon checkout creation failed', response.status, body.errors ?? body);
    throw new Error('Checkout could not be created.');
  }

  return body.data.attributes.url;
}

export async function changeSubscriptionPlan({
  subscriptionId,
  plan,
  interval,
  invoiceImmediately
}: ChangeSubscriptionOptions) {
  const apiKey = getRequiredEnv('LEMONSQUEEZY_API_KEY');
  const variantId = getVariantId(plan, interval);

  const response = await fetch(`${LEMON_API_URL}/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json'
    },
    body: JSON.stringify({
      data: {
        type: 'subscriptions',
        id: subscriptionId,
        attributes: {
          variant_id: Number(variantId),
          invoice_immediately: invoiceImmediately
        }
      }
    })
  });

  const body = (await response.json()) as LemonSubscriptionResponse;

  if (!response.ok) {
    console.error('Lemon subscription update failed', response.status, body.errors ?? body);
    throw new Error('Subscription could not be updated.');
  }
}

export async function cancelSubscription(subscriptionId: string) {
  const apiKey = getRequiredEnv('LEMONSQUEEZY_API_KEY');

  const response = await fetch(`${LEMON_API_URL}/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json'
    }
  });

  const body = (await response.json()) as LemonSubscriptionResponse;

  if (!response.ok) {
    console.error('Lemon subscription cancellation failed', response.status, body.errors ?? body);
    throw new Error('Subscription could not be cancelled.');
  }
}

export async function resumeSubscription(subscriptionId: string) {
  const apiKey = getRequiredEnv('LEMONSQUEEZY_API_KEY');

  const response = await fetch(`${LEMON_API_URL}/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json'
    },
    body: JSON.stringify({
      data: {
        type: 'subscriptions',
        id: subscriptionId,
        attributes: {
          cancelled: false
        }
      }
    })
  });

  const body = (await response.json()) as LemonSubscriptionResponse;

  if (!response.ok) {
    console.error('Lemon subscription resume failed', response.status, body.errors ?? body);
    throw new Error('Subscription could not be resumed.');
  }
}

export async function getUpdatePaymentMethodUrl(subscriptionId: string) {
  const portal = await getSubscriptionUrl(subscriptionId);

  return portal?.url ?? null;
}

export async function getSubscriptionUrl(subscriptionId: string) {
  const apiKey = getRequiredEnv('LEMONSQUEEZY_API_KEY');

  const response = await fetch(`${LEMON_API_URL}/subscriptions/${subscriptionId}`, {
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`
    }
  });

  const body = (await response.json()) as LemonSubscriptionResponse;

  if (!response.ok) {
    console.error('Lemon subscription retrieval failed', response.status, body.errors ?? body);
    return null;
  }

  const urls = body.data?.attributes?.urls;

  if (urls?.update_payment_method) {
    return { source: 'update_payment_method', url: urls.update_payment_method };
  }

  if (urls?.customer_portal_update_subscription) {
    return { source: 'customer_portal_update_subscription', url: urls.customer_portal_update_subscription };
  }

  if (urls?.customer_portal) {
    return { source: 'customer_portal', url: urls.customer_portal };
  }

  return null;
}

export async function listSubscriptionInvoices(subscriptionId: string, limit = 5): Promise<BillingInvoice[]> {
  const apiKey = getRequiredEnv('LEMONSQUEEZY_API_KEY');
  const url = new URL(`${LEMON_API_URL}/subscriptions/${subscriptionId}/subscription-invoices`);
  url.searchParams.set('page[size]', String(limit));

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`
    }
  });

  const body = (await response.json()) as LemonSubscriptionInvoiceResponse;

  if (!response.ok) {
    console.error('Lemon subscription invoices retrieval failed', response.status, body.errors ?? body);
    return [];
  }

  return (body.data ?? [])
    .map((invoice) => {
      const attributes = invoice.attributes;

      return {
        id: invoice.id ?? '',
        status: attributes?.status ?? null,
        statusFormatted: attributes?.status_formatted ?? null,
        totalFormatted: attributes?.total_formatted ?? null,
        currency: attributes?.currency ?? null,
        createdAt: attributes?.created_at ?? null,
        invoiceUrl: attributes?.urls?.invoice_url ?? null
      };
    })
    .filter((invoice) => invoice.id)
    .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

      return rightTime - leftTime;
    });
}

export function verifyLemonSignature(rawBody: string, signature: string | null) {
  const secret = getRequiredEnv('LEMONSQUEEZY_WEBHOOK_SECRET');

  if (!signature) {
    return false;
  }

  const digest = createHmac('sha256', secret).update(rawBody).digest('hex');
  const digestBuffer = Buffer.from(digest, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');

  return digestBuffer.length === signatureBuffer.length && timingSafeEqual(digestBuffer, signatureBuffer);
}

export function asString(value: unknown) {
  if (value === null || value === undefined) return null;
  return String(value);
}
