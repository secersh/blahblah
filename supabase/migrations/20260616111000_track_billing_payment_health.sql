alter table public.billing_subscriptions
  add column if not exists last_payment_failed_at timestamptz,
  add column if not exists last_payment_recovered_at timestamptz,
  add column if not exists last_payment_event text;
