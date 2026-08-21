import { createClient } from "@/lib/supabase/server";
import type { OfferWithContext } from "@/lib/types";
import { isAdminEmail } from "@/lib/admin-identity";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// CSV export of the leads table. Auth is enforced here too (not just via
// middleware): no verified session -> 401, so the endpoint can't be scraped.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data } = await supabase
    .from("offers")
    .select("*, car:cars(id, title), auction:auctions(id)")
    .order("created_at", { ascending: false });
  const offers = (data ?? []) as OfferWithContext[];

  const headers = [
    "created_at",
    "buyer_name",
    "buyer_phone",
    "buyer_email",
    "amount",
    "car",
    "auction_id",
    "message",
  ];

  const rows = offers.map((o) => [
    o.created_at,
    o.buyer_name,
    o.buyer_phone,
    o.buyer_email,
    o.amount ?? "",
    o.car?.title ?? "",
    o.auction_id ?? "",
    o.message ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");

  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// Escape per RFC 4180: wrap in quotes if the value contains comma/quote/newline,
// and double any embedded quotes.
function csvCell(value: unknown): string {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
