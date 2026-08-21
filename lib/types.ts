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
  color: string | null;
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

// Paint colours. Language-neutral keys like every other catalogue attribute,
// with a hex swatch so the admin picker and the public spec tile can show the
// actual colour instead of only naming it.
export const CAR_COLORS = [
  "white",
  "black",
  "silver",
  "gray",
  "blue",
  "red",
  "bordeaux",
  "green",
  "brown",
  "beige",
  "yellow",
  "orange",
  "gold",
  "purple",
  "other",
] as const;

// Swatch fill per colour. "other" has no single fill — ColorSwatch draws a
// rainbow for it, so it is deliberately absent from this map.
export const COLOR_SWATCHES: Record<string, string> = {
  white: "#f4f6f8",
  black: "#15181c",
  silver: "#c6cbd2",
  gray: "#6b7280",
  blue: "#1d4ed8",
  red: "#dc2626",
  bordeaux: "#7c1d24",
  green: "#15803d",
  brown: "#6b4423",
  beige: "#d8c9a6",
  yellow: "#eab308",
  orange: "#ea580c",
  gold: "#b8912f",
  purple: "#7c3aed",
};

// Equipment checkboxes ("Dotări"). Stored as a text[] of these keys, so the
// labels stay translatable and the data stays language-neutral.
//
// The catalogue mirrors what the big marketplaces (mobile.de, autovit.ro) list
// per car, so a Dennis Cars ad can carry the same detail a buyer sees there.
// NOTE: keys are permanent — car rows store them verbatim. Add new ones at the
// end of their group; never rename or remove an existing key.
export const CAR_FEATURES = [
  // safety & driver assistance
  "abs_esp_airbag",
  "isofix",
  "parking_sensors",
  "parking_sensors_front",
  "rear_camera",
  "camera_360",
  "park_assist",
  "blind_spot_assist",
  "lane_assist",
  "traffic_sign_recognition",
  "emergency_brake_assist",
  "adaptive_cruise_control",
  "tire_pressure_monitor",
  "hill_start_assist",
  "alarm",
  "central_locking",
  "immobilizer",
  // comfort
  "air_conditioning",
  "climate_control",
  "multizone_climate",
  "heated_seats",
  "ventilated_seats",
  "electric_seats",
  "memory_seats",
  "leather_seats",
  "heated_steering_wheel",
  "electric_mirrors",
  "heated_mirrors",
  "folding_mirrors",
  "electric_windows",
  "cruise_control",
  "keyless_entry",
  "keyless_start",
  "rain_sensor",
  "light_sensor",
  "auto_dimming_mirror",
  "electric_tailgate",
  "auxiliary_heating",
  // multimedia
  "navigation",
  "bluetooth",
  "onboard_computer",
  "steering_controls",
  "touchscreen",
  "carplay_androidauto",
  "usb_port",
  "cd_player",
  "premium_sound",
  "wireless_charging",
  "head_up_display",
  "digital_cockpit",
  // exterior
  "led_xenon",
  "adaptive_lights",
  "fog_lights",
  "daytime_running_lights",
  "alloy_wheels",
  "tow_bar",
  "sunroof",
  "panoramic_roof",
  "roof_rails",
  "tinted_windows",
  "metallic_paint",
  "winter_tires",
  "spare_wheel",
  // paperwork & condition
  "service_book",
  "first_owner",
  "accident_free",
  "non_smoker",
  "registered_ro",
  "valid_itp",
] as const;

// Equipment grouped for display on the car detail page AND for the admin form,
// which renders one titled block per group. Every key in CAR_FEATURES must
// appear in exactly one group — the detail page renders these groups in order
// and skips any group the car has nothing from.
export const FEATURE_GROUPS = [
  {
    key: "safety",
    icon: "shield",
    items: [
      "abs_esp_airbag",
      "isofix",
      "parking_sensors",
      "parking_sensors_front",
      "rear_camera",
      "camera_360",
      "park_assist",
      "blind_spot_assist",
      "lane_assist",
      "traffic_sign_recognition",
      "emergency_brake_assist",
      "adaptive_cruise_control",
      "tire_pressure_monitor",
      "hill_start_assist",
      "alarm",
      "central_locking",
      "immobilizer",
    ],
  },
  {
    key: "comfort",
    icon: "seat",
    items: [
      "air_conditioning",
      "climate_control",
      "multizone_climate",
      "heated_seats",
      "ventilated_seats",
      "electric_seats",
      "memory_seats",
      "leather_seats",
      "heated_steering_wheel",
      "electric_mirrors",
      "heated_mirrors",
      "folding_mirrors",
      "electric_windows",
      "cruise_control",
      "keyless_entry",
      "keyless_start",
      "rain_sensor",
      "light_sensor",
      "auto_dimming_mirror",
      "electric_tailgate",
      "auxiliary_heating",
    ],
  },
  {
    key: "multimedia",
    icon: "cog",
    items: [
      "navigation",
      "bluetooth",
      "onboard_computer",
      "steering_controls",
      "touchscreen",
      "carplay_androidauto",
      "usb_port",
      "cd_player",
      "premium_sound",
      "wireless_charging",
      "head_up_display",
      "digital_cockpit",
    ],
  },
  {
    key: "exterior",
    icon: "car",
    items: [
      "led_xenon",
      "adaptive_lights",
      "fog_lights",
      "daytime_running_lights",
      "alloy_wheels",
      "tow_bar",
      "sunroof",
      "panoramic_roof",
      "roof_rails",
      "tinted_windows",
      "metallic_paint",
      "winter_tires",
      "spare_wheel",
    ],
  },
  {
    key: "condition",
    icon: "check",
    items: [
      "service_book",
      "first_owner",
      "accident_free",
      "non_smoker",
      "registered_ro",
      "valid_itp",
    ],
  },
] as const;

// The public filter rail shows a shortlist, not all ~69 boxes: these are the
// ones buyers actually narrow a search by. Filtering itself is generic, so a
// URL naming any other feature key still works.
export const FILTER_FEATURES = [
  "air_conditioning",
  "climate_control",
  "cruise_control",
  "heated_seats",
  "leather_seats",
  "electric_seats",
  "navigation",
  "bluetooth",
  "carplay_androidauto",
  "parking_sensors",
  "rear_camera",
  "led_xenon",
  "alloy_wheels",
  "panoramic_roof",
  "tow_bar",
  "isofix",
] as const;

export type BodyType = (typeof BODY_TYPES)[number];
export type Drivetrain = (typeof DRIVETRAINS)[number];
export type EuroNorm = (typeof EURO_NORMS)[number];
export type CarFeature = (typeof CAR_FEATURES)[number];
export type CarColor = (typeof CAR_COLORS)[number];
