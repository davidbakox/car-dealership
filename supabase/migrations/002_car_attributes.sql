-- ============================================================================
--  002 — extra catalogue attributes for the marketplace-style listing UI
--  Run in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run).
--  Additive and idempotent: no existing column or row is touched.
-- ============================================================================

alter table public.cars
  add column if not exists body_type      text,           -- sedan | suv | wagon | hatchback | coupe | van | minibus
  add column if not exists drivetrain     text,           -- fwd | rwd | awd
  add column if not exists euro_norm      text,           -- euro3 … euro6
  add column if not exists engine         text,           -- free text, e.g. "2.0 TDI"
  add column if not exists seats          int,
  add column if not exists is_consignment boolean not null default false,
  add column if not exists has_home_delivery boolean not null default false,
  add column if not exists features       text[] not null default '{}';

-- Guard rails: the app validates with zod, these stop bad data at the DB edge.
do $$ begin
  alter table public.cars add constraint cars_seats_range check (seats is null or seats between 1 and 9);
exception when duplicate_object then null; end $$;

create index if not exists cars_body_type_idx   on public.cars (body_type);
create index if not exists cars_drivetrain_idx  on public.cars (drivetrain);
create index if not exists cars_consignment_idx on public.cars (is_consignment) where is_consignment;
create index if not exists cars_delivery_idx    on public.cars (has_home_delivery) where has_home_delivery;
