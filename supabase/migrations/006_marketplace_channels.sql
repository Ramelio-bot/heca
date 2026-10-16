-- Tambah channel marketplace internasional
alter table if exists public.heca_products
  add column if not exists etsy_url    text,
  add column if not exists amazon_url  text,
  add column if not exists alibaba_url text;

comment on column public.heca_products.etsy_url    is 'Etsy shop listing URL';
comment on column public.heca_products.amazon_url  is 'Amazon storefront / product URL';
comment on column public.heca_products.alibaba_url is 'Alibaba store / product URL';

-- Tambahkan juga key store links global (dipakai sebagai fallback)
insert into public.heca_settings (key, value)
values ('store_links', jsonb_build_object(
  'shopee',        'https://shopee.co.id/heca.official',
  'tokopedia',     'https://tokopedia.com/hecaofficial',
  'tiktok',        'https://tiktok.com/@heca.official',
  'etsy',          'https://www.etsy.com/shop/hecaofficial',
  'amazon',        'https://www.amazon.com/stores/hecaofficial',
  'alibaba',       'https://hecaofficial.en.alibaba.com',
  'instagram',     'https://instagram.com/heca.official',
  'pinterest',     'https://pinterest.com/heca.official',
  'spotify',       'https://spotify.com/user/heca.official',
  'clientService', 'mailto:care@heca.com'
))
on conflict (key) do update
set value = jsonb_build_object(
  'shopee',        coalesce(excluded.value->>'shopee',        heca_settings.value->>'shopee'),
  'tokopedia',     coalesce(excluded.value->>'tokopedia',     heca_settings.value->>'tokopedia'),
  'tiktok',        coalesce(excluded.value->>'tiktok',        heca_settings.value->>'tiktok'),
  'etsy',          coalesce(excluded.value->>'etsy',          'https://www.etsy.com/shop/hecaofficial'),
  'amazon',        coalesce(excluded.value->>'amazon',        'https://www.amazon.com/stores/hecaofficial'),
  'alibaba',       coalesce(excluded.value->>'alibaba',       'https://hecaofficial.en.alibaba.com'),
  'instagram',     coalesce(excluded.value->>'instagram',     heca_settings.value->>'instagram'),
  'pinterest',     coalesce(excluded.value->>'pinterest',     heca_settings.value->>'pinterest'),
  'spotify',       coalesce(excluded.value->>'spotify',       heca_settings.value->>'spotify'),
  'clientService', coalesce(excluded.value->>'clientService', heca_settings.value->>'clientService')
);
