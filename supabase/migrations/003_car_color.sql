-- ============================================================================
--  003 — paint colour on the car listing
--  Run in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run).
--  Additive and idempotent: no existing column or row is touched.
--
--  Stored as a language-neutral key (white | black | silver | gray | blue |
--  red | bordeaux | green | brown | beige | yellow | orange | gold | purple |
--  other) so the label stays translatable — see CAR_COLORS in lib/types.ts.
--  Nullable: cars added before this migration simply do not show a colour.
--
--  Equipment ("features") needs no migration — it is already a text[] and the
--  expanded catalogue only adds new keys to it.
-- ============================================================================

alter table public.cars
  add column if not exists color text;

create index if not exists cars_color_idx on public.cars (color);
