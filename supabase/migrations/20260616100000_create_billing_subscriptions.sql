create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  status text not null default 'free',
  lemon_customer_id text,
  lemon_order_id text,
  lemon_product_id text,
  lemon_variant_id text,
  lemon_subscription_id text unique,
  renews_at timestamptz,
  ends_at timestamptz,
  trial_ends_at timestamptz,
  test_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.billing_subscriptions enable row level security;

grant select on public.billing_subscriptions to authenticated;

create policy "Users can read own billing subscription"
  on public.billing_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists set_billing_subscriptions_updated_at on public.billing_subscriptions;

create trigger set_billing_subscriptions_updated_at
  before update on public.billing_subscriptions
  for each row
  execute function public.set_updated_at();
