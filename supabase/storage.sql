-- ============================================================================
--  Storage: car-images bucket
--  Run AFTER schema.sql. Creates a public-read bucket for car photos.
--  Uploads/deletes are restricted to authenticated users (the admin).
--  File-size and MIME limits are ALSO enforced in the upload server action,
--  but we set bucket-level limits here as a second line of defence.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'car-images',
  'car-images',
  true,                                  -- public read (needed for <img> URLs)
  5242880,                               -- 5 MB per file
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---- Policies on storage.objects for this bucket ----

drop policy if exists "car-images public read" on storage.objects;
create policy "car-images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'car-images');

drop policy if exists "car-images admin insert" on storage.objects;
create policy "car-images admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'car-images');

drop policy if exists "car-images admin update" on storage.objects;
create policy "car-images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'car-images');

drop policy if exists "car-images admin delete" on storage.objects;
create policy "car-images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'car-images');
