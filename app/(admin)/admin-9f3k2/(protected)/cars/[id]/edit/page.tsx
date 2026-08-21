import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import CarForm from "@/components/admin/CarForm";
import { t } from "@/lib/i18n/config";
import type { Car } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// One route handles both create and edit: /cars/new/edit -> create,
// /cars/<uuid>/edit -> edit that car.
export default async function CarEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireAdmin();
  const isNew = params.id === "new";

  let car: Car | undefined;
  if (!isNew) {
    const { data } = await supabase
      .from("cars")
      .select("*")
      .eq("id", params.id)
      .single();
    if (!data) notFound();
    car = data as Car;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {isNew ? t.admin_new_car : t.admin_edit_car}
      </h1>
      <CarForm car={car} />
    </div>
  );
}
