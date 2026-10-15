-- Pengganti penyimpanan localStorage: hero slides & toko links sekarang di DB
create table if not exists public.heca_hero_slides (
  id          bigint generated always as identity primary key,
  type        text not null default 'image',      -- 'image' | 'video'
  url         text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.heca_settings (
  key   text primary key,
  value jsonb not null
);

alter table public.heca_hero_slides enable row level security;
alter table public.heca_settings   enable row level security;

-- publik boleh BACA (tampil di website)
drop policy if exists "public read slides" on public.heca_hero_slides;
create policy "public read slides" on public.heca_hero_slides for select using (true);

drop policy if exists "public write slides" on public.heca_hero_slides;
create policy "public write slides" on public.heca_hero_slides for all using (true) with check (true);

drop policy if exists "public read settings" on public.heca_settings;
create policy "public read settings" on public.heca_settings for select using (true);

drop policy if exists "public write settings" on public.heca_settings;
create policy "public write settings" on public.heca_settings for all using (true) with check (true);

-- Seed data awal
insert into public.heca_hero_slides (type, url, sort_order) values
  ('image','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop', 1),
  ('image','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop', 2),
  ('image','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1920&auto=format&fit=crop', 3)
on conflict do nothing;

insert into public.heca_settings (key, value) values
  ('store_links', '{"shopee":"https://shopee.co.id/heca.official","tokopedia":"https://tokopedia.com/hecaofficial","tiktok":"https://tiktok.com/@heca.official","instagram":"https://instagram.com/heca.official","pinterest":"https://pinterest.com/heca.official","spotify":"https://spotify.com/user/heca.official","clientService":"mailto:care@heca.com"}')
on conflict (key) do nothing;
