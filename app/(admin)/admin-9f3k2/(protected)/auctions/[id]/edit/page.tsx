import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AuctionForm from "@/components/admin/AuctionForm";
import { t } from "@/lib/i18n/config";
import type { Auction, Car } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AuctionEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireAdmin();
  const isNew = params.id === "new";

  // Load cars for the "from existing car" dropdown.
  const carsResult = await supabase
    .from("cars")
    .select("id, title")
    .order("created_at", { ascending: false });
  const cars = (carsResult.data ?? []) as Pick<Car, "id" | "title">[];

  let auction: Auction | undefined;
  if (!isNew) {
    const { data } = await supabase
      .from("auctions")
      .select("*")
      .eq("id", params.id)
      .single();
    if (!data) notFound();
    auction = data as Auction;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {isNew ? t.admin_new_auction : "Edit auction"}
      </h1>
      <AuctionForm auction={auction} cars={cars} />
    </div>
  );
}
