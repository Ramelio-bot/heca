-- supabase/migrations/011_customers.sql
-- Customer Accounts and Profile / Shipping Data

create table if not exists public.heca_customers (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid unique references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  postal_code     text,
  country         text default 'Indonesia',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.heca_customers enable row level security;

-- Customer can only read and update their own profile
drop policy if exists "customers read own" on public.heca_customers;
create policy "customers read own" on public.heca_customers
  for select using (auth.uid() = auth_user_id);

drop policy if exists "customers update own" on public.heca_customers;
create policy "customers update own" on public.heca_customers
  for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

-- Update heca_orders with shipping columns and auth_user_id
alter table public.heca_orders
  add column if not exists customer_phone text,
  add column if not exists customer_city text,
  add column if not exists customer_province text,
  add column if not exists customer_postal_code text,
  add column if not exists customer_country text,
  add column if not exists auth_user_id uuid;

-- Allow customers to view their own orders
drop policy if exists "customers read own orders" on public.heca_orders;
create policy "customers read own orders" on public.heca_orders
  for select using (auth.uid() = auth_user_id);
