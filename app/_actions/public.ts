"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { ADMIN_PATH } from "@/lib/env";
import {
  CONTACT_MESSAGE_MARKER,
  SELL_REQUEST_MARKER,
} from "@/lib/contact";
import {
  inquirySchema,
  offerSchema,
  contactSchema,
  sellSchema,
  fieldErrors,
} from "@/lib/validation/schemas";
import type { PublicFormState } from "@/lib/form-state";
import { getClientIp } from "@/lib/request-ip";
import {
  checkPublicFormRate,
  recordPublicFormSubmission,
} from "@/lib/rate-limit";

// Public form actions. Return neutral status codes; the client components map
// them to translated copy (next-intl). Server-side validation via zod.
// NOTE: this is offer submission, not live competitive bidding. Real-time
// bidding across concurrent users would need Supabase Realtime + server-side
// bid validation — a separate phase, intentionally not built here.

function logWriteFailure(form: string, message: string) {
  console.error(`[public form] ${form} insert failed: ${message}`);
}

/**
 * Shared guard for the public forms. Returns the failure state to hand straight
 * back to the visitor, or null when the submission may proceed.
 */
async function guardRate(): Promise<PublicFormState | null> {
  const ip = getClientIp();
  if (!(await checkPublicFormRate(ip))) return { error: "rateLimited" };
  await recordPublicFormSubmission(ip);
  return null;
}

export async function submitInquiryAction(
  _prev: PublicFormState,
  formData: FormData
): Promise<PublicFormState> {
  const parsed = inquirySchema.safeParse({
    car_id: formData.get("car_id"),
    buyer_name: formData.get("buyer_name"),
    buyer_phone: formData.get("buyer_phone"),
    buyer_email: formData.get("buyer_email"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const limited = await guardRate();
  if (limited) return limited;

  // Service role: the anon INSERT policy on `offers` rejects any row that
  // references a car, so this submission never reached the table. See
  // lib/supabase/admin.ts — the payload below is fully validated and fixed.
  const supabase = createAdminClient();
  const { error } = await supabase.from("offers").insert({
    car_id: parsed.data.car_id,
    buyer_name: parsed.data.buyer_name,
    buyer_phone: parsed.data.buyer_phone,
    buyer_email: parsed.data.buyer_email,
    message: parsed.data.message,
    amount: null,
  });
  if (error) {
    logWriteFailure("inquiry", error.message);
    return { error: "generic" };
  }

  // Car inquiries share the inbox with contact-form messages.
  revalidatePath(ADMIN_PATH);
  revalidatePath(`${ADMIN_PATH}/messages`);
  return { ok: true };
}

export async function submitOfferAction(
  _prev: PublicFormState,
  formData: FormData
): Promise<PublicFormState> {
  const parsed = offerSchema.safeParse({
    auction_id: formData.get("auction_id"),
    buyer_name: formData.get("buyer_name"),
    buyer_phone: formData.get("buyer_phone"),
    buyer_email: formData.get("buyer_email"),
    amount: formData.get("amount"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = createClient();

  // Validate + bump highest offer atomically in Postgres.
  const { error: rpcError } = await supabase.rpc("submit_auction_offer", {
    p_auction_id: parsed.data.auction_id,
    p_amount: parsed.data.amount,
  });
  if (rpcError) {
    return {
      error: rpcError.message.includes("closed")
        ? "closed"
        : rpcError.message.includes("below")
          ? "below"
          : "generic",
    };
  }

  const { error } = await supabase.from("offers").insert({
    auction_id: parsed.data.auction_id,
    buyer_name: parsed.data.buyer_name,
    buyer_phone: parsed.data.buyer_phone,
    buyer_email: parsed.data.buyer_email,
    amount: parsed.data.amount,
    message: parsed.data.message,
  });
  if (error) return { error: "generic" };

  revalidatePath(`/auctions/${parsed.data.auction_id}`);
  return { ok: true };
}

// Sell-your-car request -> stored in the existing protected leads table. The
// marker gives these submissions their own admin inbox without a DB migration.
export async function submitSellRequestAction(
  _prev: PublicFormState,
  formData: FormData
): Promise<PublicFormState> {
  const parsed = sellSchema.safeParse({
    seller_name: formData.get("seller_name"),
    seller_phone: formData.get("seller_phone"),
    seller_email: formData.get("seller_email"),
    car_make: formData.get("car_make"),
    car_model: formData.get("car_model"),
    car_year: formData.get("car_year"),
    car_mileage: formData.get("car_mileage"),
    message: formData.get("message"),
    terms_accepted: formData.get("terms_accepted"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const d = parsed.data;
  const limited = await guardRate();
  if (limited) return limited;

  const composed =
    `${SELL_REQUEST_MARKER} ${d.car_make} ${d.car_model}, ${d.car_year}, ${d.car_mileage} km` +
    (d.message ? ` — ${d.message}` : "");

  const supabase = createAdminClient();
  const { error } = await supabase.from("offers").insert({
    buyer_name: d.seller_name,
    buyer_phone: d.seller_phone,
    buyer_email: d.seller_email,
    amount: null,
    message: composed,
  });
  if (error) {
    logWriteFailure("sellrequest", error.message);
    return { error: "generic" };
  }

  revalidatePath(`${ADMIN_PATH}/sell-requests`);
  return { ok: true };
}

// Contact messages share the existing offers/leads table. The phone marker
// lets the admin inbox select only Contact-page submissions.
export async function submitContactAction(
  _prev: PublicFormState,
  formData: FormData
): Promise<PublicFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const limited = await guardRate();
  if (limited) return limited;

  const supabase = createAdminClient();
  const { error } = await supabase.from("offers").insert({
    buyer_name: parsed.data.name,
    buyer_email: CONTACT_MESSAGE_MARKER,
    buyer_phone: parsed.data.phone,
    amount: null,
    message: parsed.data.message,
  });
  if (error) {
    logWriteFailure("contact", error.message);
    return { error: "generic" };
  }

  revalidatePath(ADMIN_PATH);
  revalidatePath(`${ADMIN_PATH}/messages`);
  return { ok: true };
}
