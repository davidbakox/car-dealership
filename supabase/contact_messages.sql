-- ============================================================================
--  contact_messages  (Contact page form -> admin inbox)
--  Migration: run this in the Supabase SQL Editor AFTER schema.sql.
--  Same security pattern as `offers`: anon may INSERT, only the authenticated
--  admin may read. Nothing here is publicly readable.
-- ============================================================================

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "public inserts contact messages" on public.contact_messages;
create policy "public inserts contact messages"
  on public.contact_messages for insert
  to anon
  with check (true);

drop policy if exists "authenticated reads contact messages" on public.contact_messages;
create policy "authenticated reads contact messages"
  on public.contact_messages for all
  to authenticated
  using (true) with check (true);
