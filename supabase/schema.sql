-- ============================================================================
--  Car dealership schema
--  Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
--  Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- ============================================================================

-- gen_random_uuid() lives in pgcrypto (usually preinstalled on Supabase).
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
--  Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type car_status as enum ('available', 'sold', 'reserved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type auction_status as enum ('open', 'closed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
--  cars
-- ---------------------------------------------------------------------------
create table if not exists public.cars (
  id            uuid primary key default gen_random_uuid(),
  title         text        not null,
  make          text        not null,
  model         text        not null,
  year          int         not null check (year between 1900 and 2100),
  mileage       int         not null check (mileage >= 0),
  fuel_type     text        not null,
  transmission  text        not null,
  price         numeric(12,2) not null check (price >= 0),
  currency      text        not null default 'EUR',
  description   text        not null default '',
  status        car_status  not null default 'available',
  images        text[]      not null default '{}',   -- ordered Storage URLs
  is_featured   boolean     not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists cars_status_idx      on public.cars (status);
create index if not exists cars_featured_idx     on public.cars (is_featured) where is_featured;
create index if not exists cars_created_at_idx    on public.cars (created_at desc);

-- ---------------------------------------------------------------------------
--  auctions  (FK to a car; car_id nullable so standalone auctions are possible)
-- ---------------------------------------------------------------------------
create table if not exists public.auctions (
  id                     uuid primary key default gen_random_uuid(),
  car_id                 uuid references public.cars (id) on delete set null,
  starting_price         numeric(12,2) not null check (starting_price >= 0),
  current_highest_offer  numeric(12,2),
  bid_increment          numeric(12,2) not null default 100 check (bid_increment > 0),
  ends_at                timestamptz not null,
  status                 auction_status not null default 'open',
  created_at             timestamptz not null default now()
);

create index if not exists auctions_status_idx   on public.auctions (status);
create index if not exists auctions_ends_at_idx    on public.auctions (ends_at);
create index if not exists auctions_car_id_idx     on public.auctions (car_id);

-- ---------------------------------------------------------------------------
--  offers  (doubles as the leads / mini-CRM table)
-- ---------------------------------------------------------------------------
create table if not exists public.offers (
  id           uuid primary key default gen_random_uuid(),
  auction_id   uuid references public.auctions (id) on delete set null,
  car_id       uuid references public.cars (id) on delete set null,
  buyer_name   text not null,
  buyer_phone  text not null,
  buyer_email  text not null,
  amount       numeric(12,2),          -- nullable: plain inquiries have no amount
  message      text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists offers_created_at_idx  on public.offers (created_at desc);
create index if not exists offers_auction_id_idx   on public.offers (auction_id);
create index if not exists offers_car_id_idx       on public.offers (car_id);

-- ---------------------------------------------------------------------------
--  login_attempts  (rate limiting for the admin login endpoint)
--  One row per attempt; the login action counts recent rows per ip/email.
-- ---------------------------------------------------------------------------
create table if not exists public.login_attempts (
  id           bigint generated always as identity primary key,
  ip           text not null,
  email        text not null,
  succeeded    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists login_attempts_lookup_idx
  on public.login_attempts (ip, email, created_at desc);

-- ============================================================================
--  Row Level Security
--  Public (anon) users may ONLY:
--    - read available cars / open auctions
--    - insert offers (submit inquiry/bid)
--  They may NOT read offers (leads are private) or write cars/auctions.
--  The admin uses an authenticated session and bypasses these via policies
--  scoped to authenticated. The service-role key (server-only) bypasses RLS.
-- ============================================================================

alter table public.cars           enable row level security;
alter table public.auctions        enable row level security;
alter table public.offers          enable row level security;
alter table public.login_attempts  enable row level security;

-- ---- cars ----
-- Cars are a public catalogue: anon may read all of them (sold/reserved cars
-- still have viewable detail pages with a status badge). Listings QUERIES
-- filter to 'available'; visibility itself is open. Nothing sensitive lives
-- on cars. Writes remain authenticated-only below.
drop policy if exists "public reads available cars" on public.cars;
drop policy if exists "public reads cars" on public.cars;
create policy "public reads cars"
  on public.cars for select
  to anon
  using (true);

drop policy if exists "authenticated full access cars" on public.cars;
create policy "authenticated full access cars"
  on public.cars for all
  to authenticated
  using (true) with check (true);

-- ---- auctions ----
-- Same rationale as cars: closed auctions keep a viewable "ended" detail page.
drop policy if exists "public reads open auctions" on public.auctions;
drop policy if exists "public reads auctions" on public.auctions;
create policy "public reads auctions"
  on public.auctions for select
  to anon
  using (true);

drop policy if exists "authenticated full access auctions" on public.auctions;
create policy "authenticated full access auctions"
  on public.auctions for all
  to authenticated
  using (true) with check (true);

-- ---- offers ----
-- Public may INSERT a lead but never SELECT/UPDATE/DELETE.
drop policy if exists "public inserts offers" on public.offers;
create policy "public inserts offers"
  on public.offers for insert
  to anon
  with check (true);

drop policy if exists "authenticated reads offers" on public.offers;
create policy "authenticated reads offers"
  on public.offers for all
  to authenticated
  using (true) with check (true);

-- ---- login_attempts ----
-- No anon/authenticated access at all; only the service-role key (server-side)
-- reads/writes this table. RLS is enabled with no permissive policies -> denied.

-- ============================================================================
--  RPC: atomically bump an auction's highest offer if the new amount is higher.
--  Called from the public "submit offer" server action. SECURITY DEFINER so it
--  can update the auctions row while the caller is anon; it validates internally.
-- ============================================================================
create or replace function public.submit_auction_offer(
  p_auction_id uuid,
  p_amount     numeric
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current numeric;
  v_start   numeric;
  v_status  auction_status;
  v_ends_at timestamptz;
begin
  select current_highest_offer, starting_price, status, ends_at
    into v_current, v_start, v_status, v_ends_at
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'auction not found';
  end if;
  if v_status <> 'open' or v_ends_at <= now() then
    raise exception 'auction is closed';
  end if;
  if p_amount < v_start then
    raise exception 'offer below starting price';
  end if;

  -- Only raise the highest offer when the new amount actually beats it.
  if v_current is null or p_amount > v_current then
    update public.auctions
       set current_highest_offer = p_amount
     where id = p_auction_id;
    return p_amount;
  end if;

  return v_current;
end;
$$;

grant execute on function public.submit_auction_offer(uuid, numeric) to anon, authenticated;

-- ---------------------------------------------------------------------------
--  Extra catalogue attributes (migration 002) — see supabase/migrations/.
--  Kept here too so a fresh install from this file gets the full cars table.
-- ---------------------------------------------------------------------------
alter table public.cars
  add column if not exists body_type      text,
  add column if not exists drivetrain     text,
  add column if not exists euro_norm      text,
  add column if not exists engine         text,
  add column if not exists seats          int,
  add column if not exists is_consignment boolean not null default false,
  add column if not exists has_home_delivery boolean not null default false,
  add column if not exists features       text[] not null default '{}';

do $$ begin
  alter table public.cars add constraint cars_seats_range check (seats is null or seats between 1 and 9);
exception when duplicate_object then null; end $$;

create index if not exists cars_body_type_idx   on public.cars (body_type);
create index if not exists cars_drivetrain_idx  on public.cars (drivetrain);
create index if not exists cars_consignment_idx on public.cars (is_consignment) where is_consignment;
create index if not exists cars_delivery_idx    on public.cars (has_home_delivery) where has_home_delivery;
