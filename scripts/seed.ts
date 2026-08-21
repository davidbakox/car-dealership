/**
 * Seed script: 5 sample cars + 2 sample auctions, with placeholder photos
 * uploaded to Supabase Storage so images are real bucket URLs (matching the
 * next/image remotePatterns).
 *
 * Run with:  npm run seed
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * Uses the service-role key so it bypasses RLS.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "car-images";

/** Fetch a placeholder JPEG and upload it to Storage; return its public URL. */
async function uploadPlaceholder(seed: string): Promise<string | null> {
  try {
    const res = await fetch(`https://picsum.photos/seed/${seed}/800/600`);
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const path = `seed/${seed}.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.warn(`  ! placeholder ${seed} failed:`, (e as Error).message);
    return null;
  }
}

async function imagesFor(prefix: string, n: number): Promise<string[]> {
  const out: string[] = [];
  for (let i = 1; i <= n; i++) {
    const u = await uploadPlaceholder(`${prefix}-${i}`);
    if (u) out.push(u);
  }
  return out;
}

const sampleCars = [
  {
    title: "2019 Volkswagen Golf 1.6 TDI",
    make: "Volkswagen",
    model: "Golf",
    year: 2019,
    mileage: 92000,
    fuel_type: "diesel",
    transmission: "manual",
    price: 13900,
    currency: "EUR",
    description:
      "Well-maintained Golf with full service history. New tyres, recent timing belt. Cruise control, parking sensors.",
    status: "available" as const,
    is_featured: true,
  },
  {
    title: "2021 Tesla Model 3 Long Range",
    make: "Tesla",
    model: "Model 3",
    year: 2021,
    mileage: 41000,
    fuel_type: "electric",
    transmission: "automatic",
    price: 32900,
    currency: "EUR",
    description:
      "Dual-motor AWD, ~560 km range. Autopilot, premium interior, garage-kept. No accidents.",
    status: "available" as const,
    is_featured: true,
  },
  {
    title: "2017 BMW 320i M Sport",
    make: "BMW",
    model: "320i",
    year: 2017,
    mileage: 118000,
    fuel_type: "petrol",
    transmission: "automatic",
    price: 15400,
    currency: "EUR",
    description:
      "M Sport package, leather seats, navigation, xenon lights. Recently serviced.",
    status: "available" as const,
    is_featured: false,
  },
  {
    title: "2020 Toyota Corolla Hybrid",
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    mileage: 63000,
    fuel_type: "hybrid",
    transmission: "automatic",
    price: 17800,
    currency: "EUR",
    description:
      "Excellent fuel economy, one owner, full Toyota service history. Adaptive cruise, lane assist.",
    status: "reserved" as const,
    is_featured: true,
  },
  {
    title: "2016 Ford Focus 1.0 EcoBoost",
    make: "Ford",
    model: "Focus",
    year: 2016,
    mileage: 134000,
    fuel_type: "petrol",
    transmission: "manual",
    price: 7900,
    currency: "EUR",
    description:
      "Economical and reliable hatchback. Air conditioning, Bluetooth, new brakes.",
    status: "available" as const,
    is_featured: false,
  },
];

async function main() {
  console.log("Seeding database…");

  // Clean slate (dev only). Order matters due to FKs.
  console.log("Clearing existing sample data…");
  await supabase.from("offers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("auctions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("cars").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const insertedCarIds: string[] = [];

  for (const [i, car] of sampleCars.entries()) {
    console.log(`Uploading images for: ${car.title}`);
    const images = await imagesFor(`car${i + 1}`, 3);
    const { data, error } = await supabase
      .from("cars")
      .insert({ ...car, images })
      .select("id")
      .single();
    if (error) {
      console.error("  car insert failed:", error.message);
      continue;
    }
    insertedCarIds.push(data.id);
    console.log(`  ✓ ${car.title}`);
  }

  // Two auctions: one from an existing car, one standalone.
  const now = Date.now();
  const auctions: Array<{
    car_id: string | null;
    starting_price: number;
    current_highest_offer: number | null;
    bid_increment: number;
    ends_at: string;
    status: "open";
  }> = [
    {
      car_id: insertedCarIds[2] ?? null, // BMW 320i
      starting_price: 12000,
      current_highest_offer: null,
      bid_increment: 250,
      ends_at: new Date(now + 3 * 86400_000).toISOString(),
      status: "open" as const,
    },
    {
      car_id: insertedCarIds[4] ?? null, // Ford Focus
      starting_price: 6000,
      current_highest_offer: 6500,
      bid_increment: 100,
      ends_at: new Date(now + 5 * 86400_000).toISOString(),
      status: "open" as const,
    },
  ];

  for (const a of auctions) {
    const { error } = await supabase.from("auctions").insert(a);
    if (error) console.error("  auction insert failed:", error.message);
    else console.log("  ✓ auction created");
  }

  console.log("\nDone. 5 cars + 2 auctions seeded.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
