import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getPathname, Link } from "@/i18n/routing";
import Gallery from "@/components/public/Gallery";
import InquiryForm from "@/components/public/InquiryForm";
import StatusBadge from "@/components/ui/StatusBadge";
import Icon from "@/components/ui/Icon";
import { formatPrice, formatNumber } from "@/lib/format";
import { SITE_URL } from "@/lib/env";
import {
  PHONE,
  PHONE_HREF,
  SECONDARY_PHONE,
  SECONDARY_PHONE_HREF,
  ADDRESS,
  CITY,
} from "@/lib/contact";
import { FEATURE_GROUPS, type Car, type CarStatus } from "@/lib/types";

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
  const tGroups = await getTranslations("featureGroups");
  const tTrust = await getTranslations("trust");
  const tContact = await getTranslations("contact");

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
    ...(car.engine
      ? { vehicleEngine: { "@type": "EngineSpecification", name: car.engine } }
      : {}),
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

  // Only the attributes this car actually has — an empty column is dropped
  // rather than rendered as a blank tile.
  const specs = [
    { icon: "calendar", label: tSpecs("year"), value: String(car.year) },
    { icon: "gauge", label: tSpecs("mileage"), value: `${formatNumber(car.mileage)} km` },
    { icon: "droplet", label: tSpecs("fuel"), value: tFuel(car.fuel_type) },
    { icon: "cog", label: tSpecs("transmission"), value: tTrans(car.transmission) },
    car.engine && { icon: "car", label: tSpecs("engine"), value: car.engine },
    car.body_type && {
      icon: `body-${car.body_type}`,
      label: tCars("bodyType"),
      value: tBody(car.body_type),
    },
    car.drivetrain && {
      icon: "swap",
      label: tSpecs("drivetrain"),
      value: tDrive(car.drivetrain),
    },
    car.euro_norm && { icon: "cloud", label: tSpecs("euro"), value: tEuro(car.euro_norm) },
    car.seats && { icon: "seat", label: tSpecs("seats"), value: String(car.seats) },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  const owned = new Set(car.features ?? []);
  const featureGroups = FEATURE_GROUPS.map((g) => ({
    ...g,
    present: g.items.filter((i) => owned.has(i)),
  })).filter((g) => g.present.length > 0);

  const trustItems = [
    { icon: "shield", label: tTrust("warranty") },
    { icon: "repeat", label: tTrust("tradein") },
    { icon: "wallet", label: tTrust("buyback") },
    { icon: "key", label: tTrust("rental") },
  ];

  const sectionTitle =
    "mb-4 flex items-center gap-2.5 font-display text-xl font-semibold text-ink";

  return (
    <div className="pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-content px-4 py-6 sm:px-6">
        <nav
          aria-label="breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-faint"
        >
          <Link href="/" className="transition-colors hover:text-accent-hover">
            {tCars("homeCrumb")}
          </Link>
          <span>/</span>
          <Link href="/cars" className="transition-colors hover:text-accent-hover">
            {tCars("carsCrumb")}
          </Link>
          <span>/</span>
          <span className="text-ink-muted">{car.title}</span>
        </nav>

        {/* Three grid children, explicitly placed on desktop. On mobile they
            stack in DOM order — photo, then the headline/price/CTA, then the
            detail sections — which is the order a buyer reads in. */}
        <div className="grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* --- Gallery --- */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <Gallery
              images={car.images}
              alt={car.title}
              overlay={
                <>
                  <StatusBadge
                    status={car.status as CarStatus}
                    label={tStatus(car.status)}
                    className="absolute right-3 top-3 shadow-lg shadow-black/30"
                  />
                  {car.images.length > 1 && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-base/80 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur">
                      <Icon name="search" size={12} />
                      {car.images.length}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-base/80 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur">
                    <Icon name="pin" size={12} />
                    {CITY}
                  </span>
                </>
              }
            />
          </div>

          {/* --- Headline, price, actions. Sticky rail on desktop. --- */}
          <aside className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <div className="lg:sticky lg:top-24 lg:space-y-4">
              <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {car.is_consignment && (
                    <span className="inline-flex items-center gap-1.5 rounded bg-reserved/20 px-2.5 py-1 text-xs font-medium text-reserved">
                      <Icon name="tag" size={12} />
                      {tCars("consignmentBadge")}
                    </span>
                  )}
                  {car.has_home_delivery && (
                    <span className="inline-flex items-center gap-1.5 rounded bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-hover">
                      <Icon name="truck" size={12} />
                      {tCars("homeDelivery")}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  {car.title}
                </h1>
                <p className="mt-1 text-sm uppercase tracking-wide text-ink-faint">
                  {[car.engine, tFuel(car.fuel_type), tTrans(car.transmission)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                <p className="mt-4 font-display text-4xl font-semibold text-accent-hover">
                  {formatPrice(car.price, car.currency)}
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
                  {[
                    [tSpecs("year"), String(car.year)],
                    [tSpecs("mileage"), `${formatNumber(car.mileage)} km`],
                    car.drivetrain
                      ? [tSpecs("drivetrain"), tDrive(car.drivetrain)]
                      : [tSpecs("fuel"), tFuel(car.fuel_type)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">
                        {label}
                      </dt>
                      <dd className="mt-0.5 truncate text-sm font-medium text-ink">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <a href={PHONE_HREF} className="btn-primary mt-5 w-full">
                  <Icon name="phone" size={18} />
                  {PHONE}
                </a>
                <a
                  href={SECONDARY_PHONE_HREF}
                  className="btn-outline mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm"
                >
                  <Icon name="phone" size={16} />
                  {SECONDARY_PHONE}
                </a>
                <a
                  href="#inquiry"
                  className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-accent-hover transition-colors hover:text-accent"
                >
                  <Icon name="mail" size={15} />
                  {t("sendInquiry")}
                </a>
              </div>

              {/* Why buy here — the same promises the homepage makes. */}
              <ul className="hidden rounded-card border border-line bg-surface p-5 lg:block">
                {trustItems.map((item, i) => (
                  <li
                    key={item.label}
                    className={`flex items-start gap-3 text-sm text-ink-muted ${i > 0 ? "mt-3" : ""}`}
                  >
                    <span className="mt-0.5 shrink-0 text-accent-hover">
                      <Icon name={item.icon} size={16} />
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>

              <div className="hidden rounded-card border border-line bg-surface p-5 lg:block">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="text-accent-hover">
                    <Icon name="pin" size={16} />
                  </span>
                  {tContact("mapTitle")}
                </p>
                <p className="text-sm leading-relaxed text-ink-muted">{ADDRESS}</p>
                <p className="mt-3 flex items-start gap-2 text-sm text-ink-muted">
                  <span className="mt-0.5 shrink-0 text-accent-hover">
                    <Icon name="clock" size={15} />
                  </span>
                  {tContact("hoursValue")}
                </p>
              </div>
            </div>
          </aside>

          {/* --- Specs, equipment, description --- */}
          <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-2">
            <section>
              <h2 className={sectionTitle}>
                <span className="text-accent-hover">
                  <Icon name="gauge" size={20} />
                </span>
                {t("specs")}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-hover">
                      <Icon name={s.icon} size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-wide text-ink-faint">
                        {s.label}
                      </div>
                      <div className="truncate font-medium text-ink">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {featureGroups.length > 0 && (
              <section>
                <h2 className={sectionTitle}>
                  <span className="text-accent-hover">
                    <Icon name="check" size={20} />
                  </span>
                  {tCars("featuresLabel")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {featureGroups.map((g) => (
                    <div
                      key={g.key}
                      className="rounded-card border border-line bg-surface p-5"
                    >
                      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                        <span className="text-accent-hover">
                          <Icon name={g.icon} size={16} />
                        </span>
                        {tGroups(g.key)}
                        <span className="text-ink-faint">({g.present.length})</span>
                      </p>
                      <ul className="space-y-2">
                        {g.present.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm text-ink-muted"
                          >
                            <span className="mt-0.5 shrink-0 text-accent-hover">
                              <Icon name="check" size={14} />
                            </span>
                            {tFeat(f)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {car.description && (
              <section>
                <h2 className={sectionTitle}>
                  <span className="text-accent-hover">
                    <Icon name="mail" size={20} />
                  </span>
                  {t("description")}
                </h2>
                <div className="rounded-card border border-line bg-surface p-5">
                  <p className="whitespace-pre-line leading-relaxed text-ink-muted">
                    {car.description}
                  </p>
                </div>
              </section>
            )}

            {/* Mobile-only: the promises and address the desktop rail carries. */}
            <section className="lg:hidden">
              <ul className="grid grid-cols-2 gap-3">
                {trustItems.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start gap-2.5 rounded-card border border-line bg-surface p-3.5 text-sm text-ink-muted"
                  >
                    <span className="mt-0.5 shrink-0 text-accent-hover">
                      <Icon name={item.icon} size={16} />
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
              <div className="mt-3 rounded-card border border-line bg-surface p-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="text-accent-hover">
                    <Icon name="pin" size={16} />
                  </span>
                  {tContact("mapTitle")}
                </p>
                <p className="text-sm leading-relaxed text-ink-muted">{ADDRESS}</p>
                <p className="mt-2 text-sm text-ink-muted">{tContact("hoursValue")}</p>
              </div>
            </section>

            <section id="inquiry" className="scroll-mt-24">
              <h2 className={sectionTitle}>
                <span className="text-accent-hover">
                  <Icon name="mail" size={20} />
                </span>
                {t("sendInquiry")}
              </h2>
              <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
                <p className="mb-4 text-sm text-ink-muted">{t("inquiryHint")}</p>
                <InquiryForm carId={car.id} />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Mobile call bar. The price stays in view while the buyer scrolls the
          specs, so the number to call is never more than a thumb away. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-ink-faint">
              {car.title}
            </div>
            <div className="truncate font-display text-lg font-semibold text-ink">
              {formatPrice(car.price, car.currency)}
            </div>
          </div>
          <a href={PHONE_HREF} className="btn-primary ml-auto shrink-0 px-5 py-2.5">
            <Icon name="phone" size={16} />
            {t("call")}
          </a>
        </div>
      </div>
    </div>
  );
}
