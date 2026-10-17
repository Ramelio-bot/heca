-- Tabel rate limit login (shared across semua instance serverless)
create table if not exists public.login_attempts (
  key          text primary key,          -- mis. "login:203.0.113.77"
  count        integer not null default 0,
  first_at     timestamptz not null default now(),
  locked_until timestamptz
);

alter table public.login_attempts enable row level security;

-- Fungsi atomik: naikkan hitungan, kunci bila >= 5 dalam 15 menit
create or replace function public.register_login_attempt(p_key text)
returns table (allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  v_now timestamptz := now();
  v_locked_until timestamptz;
  v_count integer;
begin
  select * into rec from public.login_attempts where key = p_key;

  if rec is null then
    insert into public.login_attempts (key, count, first_at, locked_until)
    values (p_key, 1, v_now, null);
    return query select true, 0;
    return;
  end if;

  -- sedang dikunci?
  if rec.locked_until is not null and rec.locked_until > v_now then
    return query select false, greatest(0, ceil(extract(epoch from (rec.locked_until - v_now)))::int);
    return;
  end if;

  -- window 15 menit sudah lewat -> reset
  if rec.first_at < v_now - interval '15 minutes' then
    update public.login_attempts
    set count = 1, first_at = v_now, locked_until = null
    where key = p_key;
    return query select true, 0;
    return;
  end if;

  v_count := rec.count + 1;

  if v_count >= 5 then
    v_locked_until := v_now + interval '15 minutes';
    update public.login_attempts
    set count = v_count, locked_until = v_locked_until
    where key = p_key;
    return query select false, 900;
    return;
  end if;

  update public.login_attempts set count = v_count where key = p_key;
  return query select true, 0;
end;
$$;

-- Fungsi reset saat login sukses
create or replace function public.clear_login_attempt(p_key text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.login_attempts where key = p_key;
$$;

-- Beri hak akses ke anon dan authenticated (dipanggil dari server-side / RPC)
grant execute on function public.register_login_attempt(text) to anon, authenticated;
grant execute on function public.clear_login_attempt(text) to anon, authenticated;
