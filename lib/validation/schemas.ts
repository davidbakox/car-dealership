import { z } from "zod";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  CURRENCIES,
  BODY_TYPES,
  DRIVETRAINS,
  EURO_NORMS,
  CAR_FEATURES,
  CAR_COLORS,
} from "@/lib/types";

// Admin <select>s submit "" for "not set" — map that to null rather than
// failing the enum, so an optional spec can be left blank.
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.enum(values).nullable().default(null)
  );

// ---------------------------------------------------------------------------
//  Admin: car create/edit
// ---------------------------------------------------------------------------
export const carSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(160),
  make: z.string().trim().min(1, "Make is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(60),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year looks wrong")
    .max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().int().min(0, "Mileage cannot be negative"),
  fuel_type: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.enum(CURRENCIES),
  description: z.string().trim().max(5000).default(""),
  status: z.enum(["available", "sold", "reserved"]).default("available"),
  is_featured: z.coerce.boolean().default(false),
  // --- Catalogue attributes (migration 002). All optional: a car can be
  // published before every spec is known. ---
  body_type: optionalEnum(BODY_TYPES),
  drivetrain: optionalEnum(DRIVETRAINS),
  euro_norm: optionalEnum(EURO_NORMS),
  color: optionalEnum(CAR_COLORS),
  engine: z
    .preprocess((v) => (v === "" || v === undefined ? null : v), z.string().trim().max(40).nullable())
    .default(null),
  seats: z
    .preprocess(
      (v) => (v === "" || v === undefined || v === null ? null : Number(v)),
      z.number().int().min(1).max(9).nullable()
    )
    .default(null),
  is_consignment: z.coerce.boolean().default(false),
  has_home_delivery: z.coerce.boolean().default(false),
  features: z.array(z.enum(CAR_FEATURES)).default([]),
  // Ordered list of Storage URLs; upload happens before submit.
  images: z.array(z.string().url()).default([]),
});
export type CarInput = z.infer<typeof carSchema>;

// ---------------------------------------------------------------------------
//  Admin: auction create/edit
// ---------------------------------------------------------------------------
export const auctionSchema = z
  .object({
    car_id: z.string().uuid().nullable().optional(),
    starting_price: z.coerce.number().min(0, "Starting price cannot be negative"),
    bid_increment: z.coerce.number().gt(0, "Increment must be greater than 0"),
    // datetime-local yields "YYYY-MM-DDTHH:mm"; coerce to a Date.
    ends_at: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
      message: "End date must be in the future",
    }),
    status: z.enum(["open", "closed"]).default("open"),
  })
  .strict();
export type AuctionInput = z.infer<typeof auctionSchema>;

// ---------------------------------------------------------------------------
//  Public: inquiry (car detail "Send inquiry" form — no amount)
// ---------------------------------------------------------------------------
export const inquirySchema = z.object({
  car_id: z.string().uuid(),
  buyer_name: z.string().trim().min(2, "Please enter your name").max(120),
  buyer_phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .max(40),
  buyer_email: z.string().trim().email("Please enter a valid email"),
  message: z.string().trim().max(2000).default(""),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

// ---------------------------------------------------------------------------
//  Public: auction offer (has an amount)
// ---------------------------------------------------------------------------
export const offerSchema = z.object({
  auction_id: z.string().uuid(),
  buyer_name: z.string().trim().min(2, "Please enter your name").max(120),
  buyer_phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .max(40),
  buyer_email: z.string().trim().email("Please enter a valid email"),
  amount: z.coerce.number().gt(0, "Offer amount must be greater than 0"),
  message: z.string().trim().max(2000).default(""),
});
export type OfferInput = z.infer<typeof offerSchema>;

// ---------------------------------------------------------------------------
//  Public: sell-your-car request (acquisition page -> offers/leads table)
// ---------------------------------------------------------------------------
export const sellSchema = z.object({
  seller_name: z.string().trim().min(2, "Please enter your name").max(120),
  seller_phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .max(40),
  seller_email: z.string().trim().email("Please enter a valid email"),
  car_make: z.string().trim().min(1, "Make is required").max(60),
  car_model: z.string().trim().min(1, "Model is required").max(60),
  car_year: z.coerce
    .number()
    .int()
    .min(1950, "Year looks wrong")
    .max(new Date().getFullYear() + 1),
  car_mileage: z.coerce.number().int().min(0, "Mileage cannot be negative"),
  message: z.string().trim().max(2000).default(""),
  terms_accepted: z.literal("on"),
});
export type SellInput = z.infer<typeof sellSchema>;

// ---------------------------------------------------------------------------
//  Public: contact message (Contact page -> shared offers/leads table)
// ---------------------------------------------------------------------------
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a valid phone number")
    .max(40),
  message: z.string().trim().min(1, "Please enter a message").max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ---------------------------------------------------------------------------
//  Admin: login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Small helper to normalise zod errors into a flat { field: message } map
 * that the form components render. Keeps server actions terse.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
