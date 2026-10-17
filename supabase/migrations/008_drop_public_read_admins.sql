-- Hapus policy public read di heca_admins
drop policy if exists "public read admins" on public.heca_admins;

-- Kebijakan select hanya untuk akun terautentikasi mencocokkan emailnya sendiri
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'heca_admins' and policyname = 'admin read own record'
  ) then
    create policy "admin read own record" on public.heca_admins
    for select to authenticated
    using (email = (auth.jwt() ->> 'email'));
  end if;
end $$;
