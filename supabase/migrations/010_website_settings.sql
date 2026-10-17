-- 010_website_settings.sql
-- Pengaturan tampilan & SEO website
create table if not exists public.heca_site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.heca_site_settings enable row level security;

-- Publik boleh BACA (tampil di website)
drop policy if exists "public read site_settings" on public.heca_site_settings;
create policy "public read site_settings" on public.heca_site_settings
  for select using (true);

-- Seed data default
insert into public.heca_site_settings (key, value) values
  ('announcement', jsonb_build_object(
    'enabled', false,
    'text', 'New Season — The Archive Is Being Refreshed',
    'bg_color', '#111111',
    'text_color', '#EBE6DF',
    'link', null
  )),
  ('site_meta', jsonb_build_object(
    'title', 'HECA | High-Fashion & Minimalist Editorial',
    'description', 'HECA is a modern luxury fashion brand inspired by minimalist editorial style.',
    'keywords', 'HECA, Luxury Fashion, Minimalist, Editorial, Designer Clothes',
    'og_image', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80'
  )),
  ('home_content', jsonb_build_object(
    'hero_title', 'THE NEW',
    'hero_subtitle', 'Scroll Down',
    'archive_title', 'The Archive',
    'archive_subtitle', 'Collection In Curation',
    'newsletter_title', 'Join The Archive',
    'newsletter_text', 'Subscribe to receive updates on new arrivals, special offers and other discount information.'
  )),
  ('coming_soon', jsonb_build_object(
    'title', 'Coming Soon',
    'text', 'We are currently curating this experience. Please check back later for updates.'
  )),
  ('footer', jsonb_build_object(
    'tagline', 'HECA',
    'copyright', '© 2026 HECA. ALL RIGHTS RESERVED.'
  ))
on conflict (key) do nothing;
