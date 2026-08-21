"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { carSchema, auctionSchema, fieldErrors } from "@/lib/validation/schemas";
import { ADMIN_PATH } from "@/lib/env";
import type { ActionState } from "@/lib/form-state";
import {
  CONTACT_MESSAGE_MARKER,
  SELL_REQUEST_MARKER,
} from "@/lib/contact";
import { deleteR2Images } from "@/lib/r2";
import { CARS_CACHE_TAG } from "@/lib/cache-tags";

// ---------------------------------------------------------------------------
//  Cars
// ---------------------------------------------------------------------------
function parseImages(formData: FormData): string[] {
  // The client sends the ordered image URLs as a single JSON string field.
  const raw = formData.get("images");
  if (typeof raw !== "string" || !raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function revalidateCars() {
  revalidateTag(CARS_CACHE_TAG);
  revalidatePath(`${ADMIN_PATH}/cars`);
  revalidatePath("/cars");
  revalidatePath("/");
}

export async function saveCarAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = carSchema.safeParse({
    title: formData.get("title"),
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    mileage: formData.get("mileage"),
    fuel_type: formData.get("fuel_type"),
    transmission: formData.get("transmission"),
    price: formData.get("price"),
    currency: formData.get("currency"),
    description: formData.get("description"),
    status: formData.get("status"),
    is_featured: formData.get("is_featured") === "on",
    body_type: formData.get("body_type"),
    drivetrain: formData.get("drivetrain"),
    euro_norm: formData.get("euro_norm"),
    color: formData.get("color"),
    engine: formData.get("engine"),
    seats: formData.get("seats"),
    is_consignment: formData.get("is_consignment") === "on",
    has_home_delivery: formData.get("has_home_delivery") === "on",
    features: formData.getAll("features").map(String),
    images: parseImages(formData),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const id = formData.get("id");
  const payload = parsed.data;

  if (typeof id === "string" && id) {
    const { data: existing } = await supabase
      .from("cars")
      .select("images")
      .eq("id", id)
      .single();
    const { error } = await supabase.from("cars").update(payload).eq("id", id);
    if (error) return { error: error.message };

    const previousImages = Array.isArray(existing?.images)
      ? (existing.images as string[])
      : [];
    await deleteR2Images(
      previousImages.filter((url) => !payload.images.includes(url))
    );
  } else {
    const { error } = await supabase.from("cars").insert(payload);
    if (error) return { error: error.message };
  }

  revalidateCars();
  redirect(`${ADMIN_PATH}/cars`);
}

export async function deleteCarAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data: existing } = await supabase
    .from("cars")
    .select("images")
    .eq("id", id)
    .single();
  const { error } = await supabase.from("cars").delete().eq("id", id);
  if (!error && Array.isArray(existing?.images)) {
    await deleteR2Images(existing.images as string[]);
  }
  revalidateCars();
}

/** Quick status/featured toggles from the cars list without opening the editor. */
export async function updateCarFlagsAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const patch: Record<string, unknown> = {};
  const status = formData.get("status");
  if (typeof status === "string") patch.status = status;
  if (formData.has("is_featured"))
    patch.is_featured = formData.get("is_featured") === "true";
  await supabase.from("cars").update(patch).eq("id", id);
  revalidateCars();
}

// ---------------------------------------------------------------------------
//  Auctions
// ---------------------------------------------------------------------------
export async function saveAuctionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const carIdRaw = formData.get("car_id");
  const parsed = auctionSchema.safeParse({
    car_id: carIdRaw ? String(carIdRaw) : null,
    starting_price: formData.get("starting_price"),
    bid_increment: formData.get("bid_increment"),
    ends_at: formData.get("ends_at"),
    status: formData.get("status") ?? "open",
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const id = formData.get("id");
  const payload = {
    car_id: parsed.data.car_id ?? null,
    starting_price: parsed.data.starting_price,
    bid_increment: parsed.data.bid_increment,
    ends_at: parsed.data.ends_at.toISOString(),
    status: parsed.data.status,
  };

  if (typeof id === "string" && id) {
    const { error } = await supabase
      .from("auctions")
      .update(payload)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("auctions").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath(`${ADMIN_PATH}/auctions`);
  revalidatePath("/");
  redirect(`${ADMIN_PATH}/auctions`);
}

export async function closeAuctionAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  await supabase.from("auctions").update({ status: "closed" }).eq("id", id);
  revalidatePath(`${ADMIN_PATH}/auctions`);
  revalidatePath(`${ADMIN_PATH}/auctions/${id}`);
  revalidatePath("/");
}

export async function deleteAuctionAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  await supabase.from("auctions").delete().eq("id", id);
  revalidatePath(`${ADMIN_PATH}/auctions`);
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Contact messages
// ---------------------------------------------------------------------------
export async function deleteContactMessageAction(
  formData: FormData
): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;

  // The marker guard prevents this action from deleting ordinary leads.
  await supabase
    .from("offers")
    .delete()
    .eq("id", id)
    .or(
      `buyer_phone.eq.${CONTACT_MESSAGE_MARKER},buyer_email.eq.${CONTACT_MESSAGE_MARKER}`
    );

  revalidatePath(ADMIN_PATH);
  revalidatePath(`${ADMIN_PATH}/messages`);
}

export async function deleteSellRequestAction(
  formData: FormData
): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;

  const { data } = await supabase
    .from("offers")
    .select("message")
    .eq("id", id)
    .single();

  const isSellRequest =
    data?.message?.startsWith(SELL_REQUEST_MARKER) ||
    data?.message?.startsWith("[VÂNZARE]");
  if (!isSellRequest) return;

  await supabase.from("offers").delete().eq("id", id);
  revalidatePath(ADMIN_PATH);
  revalidatePath(`${ADMIN_PATH}/sell-requests`);
}
