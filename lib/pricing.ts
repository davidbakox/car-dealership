// Price brackets for the search/filter dropdowns. Values encode "min-max"
// (open-ended upper bound = trailing dash). Labels are numeric, so they read
// the same in every locale.
export const PRICE_RANGES = [
  { value: "0-2499", label: "0 – 2.499 €" },
  { value: "2500-4999", label: "2.500 – 4.999 €" },
  { value: "5000-9999", label: "5.000 – 9.999 €" },
  { value: "10000-19999", label: "10.000 – 19.999 €" },
  { value: "20000-", label: "20.000+ €" },
] as const;

// Display order for mixed-status car lists: available first, sold last.
// (Postgres orders enums by definition order, which isn't what we want here,
// so we sort client-side.)
import type { Car } from "@/lib/types";
const STATUS_ORDER: Record<Car["status"], number> = {
  available: 0,
  reserved: 1,
  sold: 2,
};
export function sortByAvailability<T extends { status: Car["status"] }>(
  cars: T[]
): T[] {
  // Stable sort keeps the existing (newest-first) order within each status.
  return [...cars].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );
}

export function parsePriceRange(v?: string): { min?: number; max?: number } {
  if (!v || !v.includes("-")) return {};
  const [lo, hi] = v.split("-");
  const min = lo ? Number(lo) : undefined;
  const max = hi ? Number(hi) : undefined;
  return {
    min: Number.isFinite(min) ? min : undefined,
    max: Number.isFinite(max) ? max : undefined,
  };
}
