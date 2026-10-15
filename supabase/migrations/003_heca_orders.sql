create table if not exists public.heca_orders (
  id                uuid primary key default gen_random_uuid(),
  paypal_order_id   text unique,
  product_id        bigint references public.heca_products(id),
  product_name      text not null,
  size              text,
  unit_price        numeric(12,2) not null,
  currency          text not null default 'USD',
  qty               integer not null default 1,
  subtotal          numeric(12,2) not null,
  shipping          numeric(12,2) not null default 0,
  total             numeric(12,2) not null,
  status            text not null default 'CREATED',  -- CREATED | APPROVED | CAPTURED | FAILED | CANCELLED
  customer_email    text,
  customer_name     text,
  shipping_address  jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_heca_orders_status on public.heca_orders (status);
alter table public.heca_orders enable row level security;

-- Policies for server and public read/write
drop policy if exists "allow all orders" on public.heca_orders;
create policy "allow all orders" on public.heca_orders for all using (true) with check (true);

-- Settings defaults for fx_rate and shipping_usd
insert into public.heca_settings (key, value) values
  ('fx_rate', '15500'::jsonb),
  ('shipping_usd', '15'::jsonb)
on conflict (key) do nothing;
