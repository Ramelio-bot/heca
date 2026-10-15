-- HECA products: lengkapi kolom agar form admin benar-benar menyimpan data
alter table if exists public.heca_products
  add column if not exists sizes            text[]        not null default array['S','M','L'],
  add column if not exists is_new           boolean       not null default false,
  add column if not exists discount_percent integer       not null default 0,
  add column if not exists hover_image      text,
  add column if not exists description      text,
  add column if not exists material         text,
  add column if not exists care_instructions text,
  add column if not exists shopee_url       text,
  add column if not exists tokopedia_url    text,
  add column if not exists tiktok_url       text,
  add column if not exists video_url        text,
  add column if not exists size_guide_url   text,
  add column if not exists sort_order       integer       not null default 0,
  add column if not exists updated_at       timestamptz   not null default now();

-- index untuk urutan & filter
create index if not exists idx_heca_products_category on public.heca_products (category);
create index if not exists idx_heca_products_sort      on public.heca_products (sort_order);

-- data lama: beri sort_order sesuai id supaya urutan stabil
update public.heca_products set sort_order = id where sort_order = 0;
