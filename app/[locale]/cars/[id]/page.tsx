import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getPathname } from "@/i18n/routing";
import Gallery from "@/components/public/Gallery";
import StatusBadge from "@/components/ui/StatusBadge";
import Icon from "@/components/ui/Icon";
import { formatPrice, formatNumber } from "@/lib/format";
import { SITE_URL } from "@/lib/env";
import { PHONE, PHONE_HREF } from "@/lib/contact";
import type { Car, CarStatus } from "@/lib/types";

export const runtime = "edge";

const getCar = cache(async (id: string): Promise<Car | null> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("cars").select("*").eq("id", id).single();
  return (data as Car) ?? null;
});

function absoluteUrl(locale: string, id: string) {
  const path = getPathname({
    href: { pathname: "/cars/[id]", params: { id } },
    locale: locale as "ro" | "hu",
  });
  return `${SITE_URL}${path}`;
}

export async function generateMetadata({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const car = await getCar(id);
  if (!car) return { title: "404" };
  const desc =
    car.description?.slice(0, 160) ||
    `${car.year} ${car.make} ${car.model} — ${formatPrice(car.price, car.currency)}`;
  const cover = car.images[0];
  const url = absoluteUrl(locale, id);
  return {
    title: car.title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: car.title,
      description: desc,
      url,
      type: "website",
      images: cover ? [{ url: cover, width: 1200, height: 900 }] : [],
    },
    twitter: { card: "summary_large_image", images: cover ? [cover] : [] },
  };
}

export default async function CarDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  setRequestLocale(locale);
  const car = await getCar(id);
  if (!car) notFound();

  const t = await getTranslations("carDetail");
  const tSpecs = await getTranslations("specs");
  const tStatus = await getTranslations("status");
  const tFuel = await getTranslations("fuel");
  const tTrans = await getTranslations("transmission");
  const tCars = await getTranslations("cars");
  const tBody = await getTranslations("bodyType");
  const tDrive = await getTranslations("drivetrain");
  const tEuro = await getTranslations("euro");
  const tFeat = await getTranslations("features");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: car.title,
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: String(car.year),
    fuelType: car.fuel_type,
    vehicleTransmission: car.transmission,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.mileage,
      unitCode: "KMT",
    },
    ...(car.engine ? { vehicleEngine: { "@type": "EngineSpecification", name: car.engine } } : {}),
    ...(car.body_type ? { bodyType: car.body_type } : {}),
    ...(car.drivetrain ? { driveWheelConfiguration: car.drivetrain } : {}),
    ...(car.seats ? { seatingCapacity: car.seats } : {}),
    image: car.images,
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: car.currency,
      availability:
        car.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url: absoluteUrl(locale, id),
    },
  };

  // Every attribute the admin panel can fill. Entries whose column is empty
  // are dropped, so a partly-filled car still renders a tidy grid.
  const specs = [
    { icon: "calendar", label: tSpecs("year"), value: String(car.year) },
    { icon: "gauge", label: tSpecs("mileage"), value: `${formatNumber(car.mileage)} km` },
    { icon: "droplet", label: tSpecs("fuel"), value: tFuel(car.fuel_type) },
    { icon: "cog", label: tSpecs("transmission"), value: tTrans(car.transmission) },
    car.engine && { icon: "car", label: tSpecs("engine"), value: car.engine },
    car.body_type && { icon: `body-${car.body_type}`, label: tCars("bodyType"), value: tBody(car.body_type) },
    car.drivetrain && { icon: "swap", label: tSpecs("drivetrain"), value: tDrive(car.drivetrain) },
    car.euro_norm && { icon: "cloud", label: tSpecs("euro"), value: tEuro(car.euro_norm) },
    car.seats && { icon: "seat", label: tSpecs("seats"), value: String(car.seats) },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Gallery images={car.images} alt={car.title} />

          <div className="mt-8">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              {t("specs")}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map((s) => (
                <div key={s.label} className="card p-4">
                  <span className="text-accent">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <div className="mt-2 text-xs text-ink-faint">{s.label}</div>
                  <div className="font-medium text-ink">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {car.features?.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl font-semibold text-ink">
                {tCars("featuresLabel")}
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {car.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-ink-muted">
                    <span className="text-accent-hover">
                      <Icon name="check" size={16} />
                    </span>
                    {tFeat(f)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {car.description && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl font-semibold text-ink">
                {t("description")}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-ink-muted">
                {car.description}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <div className="card p-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <StatusBadge status={car.status as CarStatus} label={tStatus(car.status)} />
                {car.is_consignment && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-reserved/20 px-2.5 py-1 text-xs font-medium text-reserved">
                    <Icon name="tag" size={12} />
                    {tCars("consignmentBadge")}
                  </span>
                )}
              </div>
              {(car.is_consignment || car.has_home_delivery) && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {car.is_consignment && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                      <Icon name="user" size={13} />
                      {tCars("directFromOwner")}
                    </span>
                  )}
                  {car.has_home_delivery && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                      <Icon name="truck" size={13} />
                      {tCars("homeDelivery")}
                    </span>
                  )}
                </div>
              )}
              <h1 className="font-display text-2xl font-semibold text-ink">
                {car.title}
              </h1>
              <p className="mt-2 font-display text-3xl font-semibold text-accent-hover">
                {formatPrice(car.price, car.currency)}
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                {car.year} · {formatNumber(car.mileage)} km · {tFuel(car.fuel_type)} ·{" "}
                {tTrans(car.transmission)}
              </p>

              <a href={PHONE_HREF} className="btn-primary mt-5 w-full">
                <Icon name="phone" size={18} />
                {PHONE}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
