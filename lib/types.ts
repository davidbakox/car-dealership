// Domain types mirroring the Supabase schema (see supabase/schema.sql).

export type CarStatus = "available" | "sold" | "reserved";
export type AuctionStatus = "open" | "closed";

export interface Car {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  price: number;
  currency: string;
  description: string;
  status: CarStatus;
  images: string[];
  is_featured: boolean;
  created_at: string;
  // --- Catalogue attributes (migration 002). Nullable so rows created before
  // the migration keep working; the UI hides any spec that is missing. ---
  body_type: string | null;
  drivetrain: string | null;
  euro_norm: string | null;
  engine: string | null;
  seats: number | null;
  is_consignment: boolean;
  has_home_delivery: boolean;
  features: string[];
}

export interface Auction {
  id: string;
  car_id: string | null;
  starting_price: number;
  current_highest_offer: number | null;
  bid_increment: number;
  ends_at: string;
  status: AuctionStatus;
  created_at: string;
}

/** An auction joined with its car (used on public + admin auction views). */
export interface AuctionWithCar extends Auction {
  car: Car | null;
}

export interface Offer {
  id: string;
  auction_id: string | null;
  car_id: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  amount: number | null;
  message: string;
  created_at: string;
}

/** Offer joined with a light car/auction label for the leads table. */
export interface OfferWithContext extends Offer {
  car: Pick<Car, "id" | "title"> | null;
  auction: Pick<Auction, "id"> | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
}

/** Shared allowed values for form <select>s and validation. */
export const FUEL_TYPES = [
  "petrol",
  "diesel",
  "hybrid",
  "electric",
  "lpg",
] as const;

export const TRANSMISSIONS = ["manual", "automatic"] as const;

export const CURRENCIES = ["EUR", "RON", "HUF", "USD"] as const;

// Body styles. This one list drives BOTH the "search by body type" tiles on the
// homepage and the body-type filter, so the two can never drift apart.
export const BODY_TYPES = [
  "sedan",
  "suv",
  "wagon",
  "hatchback",
  "coupe",
  "van",
  "minibus",
] as const;

export const DRIVETRAINS = ["fwd", "rwd", "awd"] as const;

export const EURO_NORMS = ["euro3", "euro4", "euro5", "euro6"] as const;

// Equipment checkboxes ("Dotări"). Stored as a text[] of these keys, so the
// labels stay translatable and the data stays language-neutral.
export const CAR_FEATURES = [
  "abs_esp_airbag",
  "electric_mirrors",
  "onboard_computer",
  "steering_controls",
  "air_conditioning",
  "climate_control",
  "parking_sensors",
  "rear_camera",
  "cruise_control",
  "navigation",
  "heated_seats",
  "led_xenon",
  "alloy_wheels",
  "bluetooth",
  "isofix",
  "tow_bar",
] as const;

export type BodyType = (typeof BODY_TYPES)[number];
export type Drivetrain = (typeof DRIVETRAINS)[number];
export type EuroNorm = (typeof EURO_NORMS)[number];
export type CarFeature = (typeof CAR_FEATURES)[number];
