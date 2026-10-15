create table if not exists public.heca_admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.heca_admins enable row level security;

drop policy if exists "public read admins" on public.heca_admins;
create policy "public read admins" on public.heca_admins for select using (true);

-- Register default admin email
insert into public.heca_admins (email)
values ('admin@heca.com')
on conflict (email) do nothing;

-- Create default admin in auth.users if not exists
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@heca.com',
  crypt('Heca9901!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
where not exists (
  select 1 from auth.users where email = 'admin@heca.com'
);
