import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import StatusBadge from "@/components/ui/StatusBadge";
import Icon from "@/components/ui/Icon";
import { formatPrice, formatNumber } from "@/lib/format";
import { isNewInStock } from "@/lib/car-filters";
import { CITY } from "@/lib/contact";
import type { Car } from "@/lib/types";

// Listing tile. Everything below the photo is driven by what the car actually
// has: a spec row is skipped entirely when its column is empty, so cars added
// before the catalogue-attributes migration still render cleanly.
export default function CarCard({ car }: { car: Car }) {
  const t = useTranslations();
  const tc = useTranslations("cars");
  const cover = car.images[0];
  const isSold = car.status === "sold";
  const isNew = isNewInStock(car);

  // [icon, value] pairs — nulls filtered out so the grid never shows a gap.
  const specs: [string, string][] = [
    ["calendar", String(car.year)],
    ["gauge", `${formatNumber(car.mileage)} km`],
    car.drivetrain ? (["swap", t(`drivetrain.${car.drivetrain}`)] as [string, string]) : null,
    ["cog", t(`transmission.${car.transmission}`)],
    car.euro_norm ? (["cloud", t(`euro.${car.euro_norm}`)] as [string, string]) : null,
    car.seats ? (["seat", String(car.seats)] as [string, string]) : null,
  ].filter(Boolean) as [string, string][];

  return (
    <Link
      href={{ pathname: "/cars/[id]", params: { id: car.id } }}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-200 ease-smooth hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-black/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-base">
        {cover ? (
          <Image
            src={cover}
            alt={car.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-300 ease-smooth group-hover:scale-105 ${isSold ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">
            <Icon name="car" size={40} />
          </div>
        )}

        {isNew && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white shadow-lg shadow-black/30">
            <Icon name="sparkle" size={13} />
            {tc("newInStock")}
          </span>
        )}

        {car.is_featured && (
          <span className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-reserved text-amber-950 shadow-lg shadow-black/30">
            <Icon name="star" size={16} />
          </span>
        )}

        {/* Per-car promises the owner opts into from the admin panel. The
            consignment one is not optional marketing: a consignment car is
            legally sold by its owner, so the buyer must see that up front.
            `left-14` keeps the row clear of the featured star. */}
        {(car.is_consignment || car.has_home_delivery) && (
          <div className="absolute bottom-3 left-14 right-3 flex flex-wrap justify-end gap-1.5">
            {car.is_consignment && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-reserved px-3 py-1.5 text-xs font-medium text-amber-950 shadow-lg shadow-black/30">
                <Icon name="user" size={13} />
                {tc("directFromOwner")}
              </span>
            )}
            {car.has_home_delivery && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-base/85 px-3 py-1.5 text-xs font-medium text-ink shadow-lg shadow-black/30 backdrop-blur">
                <Icon name="truck" size={13} />
                {tc("homeDelivery")}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-display text-lg font-semibold text-ink">
          {car.title}
        </h3>
        <p className="mt-0.5 truncate text-xs uppercase tracking-wide text-ink-faint">
          {[car.engine, t(`fuel.${car.fuel_type}`)].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={car.status} label={t(`status.${car.status}`)} />
          {car.is_consignment && (
            <span className="inline-flex items-center gap-1.5 rounded bg-reserved/20 px-2.5 py-1 text-xs font-medium text-reserved">
              <Icon name="tag" size={12} />
              {tc("consignmentBadge")}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-ink-faint">
            <Icon name="pin" size={13} />
            {CITY}
          </span>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line pt-3 text-sm text-ink-muted">
          {specs.map(([icon, value]) => (
            <div key={icon} className="flex items-center gap-1.5">
              <span className="text-accent-hover">
                <Icon name={icon} size={15} />
              </span>
              <dd className="truncate">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p className="font-display text-xl font-semibold text-ink">
            {formatPrice(car.price, car.currency)}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors group-hover:bg-accent-hover">
            {tc("details")}
            <Icon name="arrow-right" size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
