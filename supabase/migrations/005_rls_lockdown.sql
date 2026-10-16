-- 005_rls_lockdown.sql
-- 1. Enable RLS on all heca tables
alter table if exists public.heca_products enable row level security;
alter table if exists public.heca_hero_slides enable row level security;
alter table if exists public.heca_settings enable row level security;
alter table if exists public.heca_orders enable row level security;
alter table if exists public.heca_admins enable row level security;

-- 2. Hapus semua policy publik yang terlalu longgar
drop policy if exists "public write slides"   on public.heca_hero_slides;
drop policy if exists "public write settings" on public.heca_settings;
drop policy if exists "allow all orders"      on public.heca_orders;

-- Hapus policy lama di products bila ada (insert/update/delete publik)
drop policy if exists "public insert products" on public.heca_products;
drop policy if exists "public update products" on public.heca_products;
drop policy if exists "public delete products" on public.heca_products;
drop policy if exists "allow all products"    on public.heca_products;

-- 3. PUBLIK HANYA BOLEH BACA (tampil di website)
drop policy if exists "public read slides"   on public.heca_hero_slides;
create policy "public read slides"   on public.heca_hero_slides for select using (true);

drop policy if exists "public read settings" on public.heca_settings;
create policy "public read settings" on public.heca_settings   for select using (true);

drop policy if exists "public read products" on public.heca_products;
create policy "public read products" on public.heca_products  for select using (true);

-- 4. Orders: TANPA policy sama sekali.
--    Publik TIDAK BOLEH baca/tulis. Ditulis hanya oleh server (service-role key).
--    Jangan buat policy apa pun untuk heca_orders.
