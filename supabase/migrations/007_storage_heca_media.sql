-- Buat bucket heca-media untuk media upload admin
insert into storage.buckets (id, name, public)
values ('heca-media', 'heca-media', true)
on conflict (id) do update set public = true;

-- Policies untuk storage.objects
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated upload heca-media'
  ) then
    create policy "authenticated upload heca-media"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'heca-media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated update heca-media'
  ) then
    create policy "authenticated update heca-media"
    on storage.objects for update to authenticated
    using (bucket_id = 'heca-media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated delete heca-media'
  ) then
    create policy "authenticated delete heca-media"
    on storage.objects for delete to authenticated
    using (bucket_id = 'heca-media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'public read heca-media'
  ) then
    create policy "public read heca-media"
    on storage.objects for select to public
    using (bucket_id = 'heca-media');
  end if;
end $$;
