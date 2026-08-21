import type { Car } from "@/lib/types";
import { parsePriceRange } from "@/lib/pricing";

// Raw Next.js searchParams values.
export type Param = string | string[] | undefined;

/** Every filter the catalogue understands, straight off the URL. */
export interface CarFilters {
  q?: Param;
  make?: Param;
  model?: Param;
  body?: Param;
  fuel?: Param;
  transmission?: Param;
  drivetrain?: Param;
  euro?: Param;
  seats?: Param;
  sale?: Param; // "" | "own" | "consignment"
  features?: Param;
  minYear?: Param;
  maxYear?: Param;
  minPrice?: Param;
  maxPrice?: Param;
  priceRange?: Param; // legacy bracket dropdown, still honoured
  maxMileage?: Param;
  sort?: Param;
  page?: Param;
}

export const PAGE_SIZE = 12;

export const SORTS = [
  "newest",
  "price_asc",
  "price_desc",
  "year_desc",
  "mileage_asc",
] as const;
export type Sort = (typeof SORTS)[number];

export const MILEAGE_LIMITS = [50000, 100000, 150000, 200000, 250000] as const;

export const SEAT_OPTIONS = [2, 4, 5, 7, 9] as const;

// 2000 → current year, newest first (marketplace convention).
export const YEARS = Array.from(
  { length: new Date().getFullYear() - 2000 + 1 },
  (_, i) => new Date().getFullYear() - i
);

/** A car counts as "new in stock" for two weeks after it was added. */
export const NEW_IN_STOCK_DAYS = 14;
export function isNewInStock(car: Pick<Car, "created_at">): boolean {
  const age = Date.now() - new Date(car.created_at).getTime();
  return age >= 0 && age < NEW_IN_STOCK_DAYS * 24 * 60 * 60 * 1000;
}

// --- param helpers -------------------------------------------------------

/** First value of a possibly-repeated param, trimmed; "" becomes undefined. */
export function one(v: Param): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  const t = s?.trim();
  return t ? t : undefined;
}

/** All values of a repeated param (checkbox groups submit one entry each). */
export function many(v: Param): string[] {
  if (v === undefined) return [];
  return (Array.isArray(v) ? v : [v]).flatMap((x) =>
    x.split(",").map((s) => s.trim()).filter(Boolean)
  );
}

function num(v: Param): number | undefined {
  const s = one(v);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** How many filters the user has actually set (drives the mobile badge). */
export function activeFilterCount(f: CarFilters): number {
  const keys: (keyof CarFilters)[] = [
    "q", "make", "model", "body", "fuel", "transmission", "drivetrain",
    "euro", "seats", "sale", "features", "minYear", "maxYear", "minPrice",
    "maxPrice", "priceRange", "maxMileage",
  ];
  return keys.reduce((n, k) => n + (many(f[k]).length > 0 ? 1 : 0), 0);
}

// --- filtering + sorting -------------------------------------------------
//
// Filtering runs in JS over the full (small) catalogue rather than in SQL.
// A dealership stock is tens of cars, the rows are tiny, and the whole list is
// already cached for 60s by createPublicClient() — so one cached read beats a
// new round-trip per filter combination, and it sidesteps Postgres ordering the
// `status` enum in its declaration order. If stock ever grows past a few
// hundred cars, move this into the query with .in()/.range() instead.

const STATUS_ORDER: Record<Car["status"], number> = {
  available: 0,
  reserved: 1,
  sold: 2,
};

export function filterCars(cars: Car[], f: CarFilters): Car[] {
  const q = one(f.q)?.toLowerCase();
  const make = one(f.make);
  const model = one(f.model);
  const sale = one(f.sale);
  const bodies = many(f.body);
  const fuels = many(f.fuel);
  const transmissions = many(f.transmission);
  const drivetrains = many(f.drivetrain);
  const euros = many(f.euro);
  const features = many(f.features);
  const seats = num(f.seats);
  const minYear = num(f.minYear);
  const maxYear = num(f.maxYear);
  const maxMileage = num(f.maxMileage);

  const range = parsePriceRange(one(f.priceRange));
  const minPrice = range.min ?? num(f.minPrice);
  const maxPrice = range.max ?? num(f.maxPrice);

  return cars.filter((c) => {
    if (make && c.make !== make) return false;
    if (model && c.model !== model) return false;
    if (bodies.length && !bodies.includes(c.body_type ?? "")) return false;
    if (fuels.length && !fuels.includes(c.fuel_type)) return false;
    if (transmissions.length && !transmissions.includes(c.transmission)) return false;
    if (drivetrains.length && !drivetrains.includes(c.drivetrain ?? "")) return false;
    if (euros.length && !euros.includes(c.euro_norm ?? "")) return false;
    if (seats !== undefined && c.seats !== seats) return false;
    if (sale === "own" && c.is_consignment) return false;
    if (sale === "consignment" && !c.is_consignment) return false;
    if (features.length && !features.every((k) => (c.features ?? []).includes(k))) return false;
    if (minYear !== undefined && c.year < minYear) return false;
    if (maxYear !== undefined && c.year > maxYear) return false;
    if (minPrice !== undefined && c.price < minPrice) return false;
    if (maxPrice !== undefined && c.price > maxPrice) return false;
    if (maxMileage !== undefined && c.mileage > maxMileage) return false;
    if (q) {
      const hay = `${c.title} ${c.make} ${c.model} ${c.engine ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Available cars always come first; the chosen sort orders within a status. */
export function sortCars(cars: Car[], sort: Sort): Car[] {
  const within: Record<Sort, (a: Car, b: Car) => number> = {
    newest: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    year_desc: (a, b) => b.year - a.year,
    mileage_asc: (a, b) => a.mileage - b.mileage,
  };
  return [...cars].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || within[sort](a, b)
  );
}

export function parseSort(v: Param): Sort {
  const s = one(v);
  return (SORTS as readonly string[]).includes(s ?? "") ? (s as Sort) : "newest";
}

export function parsePage(v: Param, totalPages: number): number {
  const n = num(v) ?? 1;
  return Math.min(Math.max(1, Math.trunc(n)), Math.max(1, totalPages));
}

/** make -> sorted models, for the dependent Model dropdown. */
export function modelsByMake(cars: Pick<Car, "make" | "model">[]): Record<string, string[]> {
  const out: Record<string, Set<string>> = {};
  for (const c of cars) {
    if (!c.make || !c.model) continue;
    (out[c.make] ??= new Set()).add(c.model);
  }
  return Object.fromEntries(
    Object.entries(out).map(([k, v]) => [k, [...v].sort()])
  );
}
