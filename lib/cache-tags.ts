// Shared cache tags let admin mutations invalidate public catalogue reads
// immediately without forcing every visitor request back to Supabase.
export const CARS_CACHE_TAG = "public-cars";

