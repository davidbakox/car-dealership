import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link, getPathname } from "@/i18n/routing";
import { createPublicClient } from "@/lib/supabase/public";
import CarCard from "@/components/public/CarCard";
import SearchPanel from "@/components/public/SearchPanel";
import BodyTypeGrid from "@/components/public/BodyTypeGrid";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import Particles from "@/components/ui/Particles";
import { formatPrice } from "@/lib/format";
import { sortByAvailability } from "@/lib/pricing";
import { modelsByMake } from "@/lib/car-filters";
import { PHONE_HREF } from "@/lib/contact";
import type { Car } from "@/lib/types";

export const runtime = "edge";

const trustIcons = ["shield", "repeat", "wallet", "key"] as const;
const trustKeys = ["warranty", "tradein", "buyback", "rental"] as const;
const whyItems = [
  { icon: "shield", key: "verified" },
  { icon: "wallet", key: "warranty" },
  { icon: "repeat", key: "tradein" },
  { icon: "pin", key: "local" },
] as const;

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const supabase = createPublicClient();

  const [latestRes, makesRes, countRes] = await Promise.all([
    // All statuses, available-first, so a car that gets reserved/sold stays on
    // the homepage (badged) instead of vanishing.
    supabase
      .from("cars")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    // Whole catalogue (small, and cached for 60s) — feeds the make/model
    // dropdowns and the per-body-type counts on the tiles.
    supabase.from("cars").select("*"),
    // "In stock" counter reflects available cars only.
    supabase
      .from("cars")
      .select("id", { count: "exact", head: true })
      .eq("status", "available"),
  ]);

  const latest = sortByAvailability((latestRes.data ?? []) as Car[]);
  const allCars = (makesRes.data ?? []) as Car[];
  const makes = Array.from(new Set(allCars.map((c) => c.make).filter(Boolean))).sort();
  const models = modelsByMake(allCars);
  // Only available cars are counted, so a tile never promises stock that is
  // already sold.
  const bodyCounts = allCars.reduce<Record<string, number>>((acc, c) => {
    if (c.body_type && c.status === "available") acc[c.body_type] = (acc[c.body_type] ?? 0) + 1;
    return acc;
  }, {});
  const stockCount = countRes.count ?? latest.length;

  // Hero visual: prefer an AVAILABLE featured car with a photo.
  const heroCar =
    latest.find((c) => c.status === "available" && c.is_featured && c.images.length > 0) ??
    latest.find((c) => c.status === "available" && c.images.length > 0) ??
    latest.find((c) => c.images.length > 0) ??
    null;

  const carsPath = getPathname({ href: "/cars", locale: locale as "ro" | "hu" });

  return (
    <div>
      <Hero
        heroCar={heroCar}
        makes={makes}
        models={models}
        carsPath={carsPath}
        stockCount={stockCount}
      />

      <BodyTypeGrid counts={bodyCounts} />

      <section className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <SectionHeading title={t("latestTitle")} />
          <Link
            href="/cars"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            {t("ctaPrimary")} →
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="text-ink-muted">{t("featuredEmpty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((car, i) => (
              <Reveal key={car.id} index={i % 4} as="article">
                <CarCard car={car} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <SellStrip />
      <FinancingStrip locale={locale as "ro" | "hu"} />
      <WhyChooseUs />
      <CustomerGallery />
      <CtaBand />
    </div>
  );
}

function Hero({
  heroCar,
  makes,
  models,
  carsPath,
  stockCount,
}: {
  heroCar: Car | null;
  makes: string[];
  models: Record<string, string[]>;
  carsPath: string;
  stockCount: number;
}) {
  const t = useTranslations("home");
  const tt = useTranslations("trust");
  const cover = heroCar?.images[0];

  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Full-bleed backdrop: the featured car's real photo, heavily darkened
          so the type + search panel stay readable. Falls back to a gradient. */}
      <div className="absolute inset-0">
        {cover ? (
          <>
            <Image
              src={cover}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-base via-base/85 to-base/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-base/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,theme(colors.accent.soft),transparent_60%)]" />
        )}
      </div>

      {/* Motes drift over the darkened photo, never over the copy: the field
          is a sibling of the backdrop, and everything below is `relative`. */}
      <Particles count={46} seed={3} className="text-accent-hover" intensity={1.25} />

      <div className="relative mx-auto max-w-content px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <Reveal>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent-hover">
            <span className="h-px w-8 bg-accent" />
            {t("inStock", { count: stockCount })}
          </div>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
            {t("heroTitle")}
          </h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {t("heroSubtitle")}
          </p>
        </Reveal>

        {/* The centerpiece: quick search straight into filtered listings. */}
        <Reveal index={2} className="mt-8">
          <SearchPanel makes={makes} modelsByMake={models} action={carsPath} />
        </Reveal>

        {/* Featured-car credit + trust chips under the panel. */}
        <Reveal index={3}>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {trustKeys.map((key, i) => (
                <span
                  key={key}
                  className="flex items-center gap-1.5 text-xs font-medium text-ink-muted"
                >
                  <span className="text-accent">
                    <Icon name={trustIcons[i]} size={14} />
                  </span>
                  {tt(key)}
                </span>
              ))}
            </div>
            {heroCar && (
              <Link
                href={{ pathname: "/cars/[id]", params: { id: heroCar.id } }}
                className="group flex items-center gap-2 text-xs text-ink-faint transition-colors hover:text-ink"
              >
                <span className="uppercase tracking-wide">{t("heroFeatured")}:</span>
                <span className="font-medium text-ink-muted group-hover:text-accent-hover">
                  {heroCar.title} · {formatPrice(heroCar.price, heroCar.currency)}
                </span>
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const t = useTranslations("home");
  const tw = useTranslations("why");
  return (
    <section className="mx-auto max-w-content px-4 py-14 sm:px-6">
      <div className="mb-10 max-w-xl">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {t("whyTitle")}
        </h2>
        <p className="mt-3 text-ink-muted">{t("whySubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {whyItems.map((item, i) => (
          <Reveal key={item.key} index={i}>
            <div className="card h-full p-6 transition-all duration-200 ease-smooth hover:-translate-y-1 hover:border-line-strong">
              <span className="flex h-11 w-11 items-center justify-center rounded bg-accent-soft text-accent">
                <Icon name={item.icon} size={22} />
              </span>
              <h3 className="mt-4 font-medium text-ink">
                {tw(`${item.key}Title`)}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">
                {tw(`${item.key}Text`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const customerPhotos = [1, 2, 3, 4, 5, 6, 7, 8];
const customerTilts = [
  "-rotate-3",
  "rotate-2",
  "-rotate-1",
  "rotate-3",
  "-rotate-2",
  "rotate-1",
  "-rotate-2",
  "rotate-2",
] as const;

function CustomerGallery() {
  const t = useTranslations("home");
  const groups = [false, true] as const;

  return (
    <section className="overflow-hidden border-t border-line bg-surface py-14">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading title={t("customersTitle")} />
        <p className="mt-3 max-w-xl text-ink-muted">{t("customersSubtitle")}</p>
      </div>
      <div className="customer-gallery-viewport mt-10">
        <div className="customer-gallery-track">
          {groups.map((duplicate) => (
            <div
              key={duplicate ? "duplicate" : "primary"}
              className="customer-gallery-group"
              aria-hidden={duplicate || undefined}
            >
              {customerPhotos.map((n, index) => (
                <div
                  key={`${duplicate ? "duplicate" : "primary"}-${n}`}
                  className={`customer-gallery-card ${customerTilts[index]}`}
                >
                  <div className="relative h-64 w-48 overflow-hidden rounded sm:h-72 sm:w-56">
                    <Image
                      src={`/images/customers/customer-${n}.webp`}
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 767px) 192px, 224px"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Financing-partner section. The bank's banner creative must appear as-is,
// so it stays untouched — but it's framed like every other section (heading,
// lead, CTA in site typography) so it reads as site content, not an ad slot.
function FinancingStrip({ locale }: { locale: "ro" | "hu" }) {
  const t = useTranslations("home");
  const banner =
    locale === "hu"
      ? {
          src: "/images/partners/tbi-bank-maghiara.jpg",
          alt: "TBI Bank finanszírozási információk",
        }
      : {
          src: "/images/partners/tbi-bank-romana.jpg",
          alt: "Informații despre finanțarea prin TBI Bank",
        };

  return (
    <section className="mx-auto max-w-content px-4 py-14 sm:px-6">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        <Reveal>
          <SectionHeading title={t("financingTitle")} />
          <p className="mt-4 max-w-md text-ink-muted">{t("financingText")}</p>
          <Link href="/contact" className="btn-primary mt-6">
            {t("financingCta")}
          </Link>
        </Reveal>
        <Reveal index={1}>
          <Link
            href="/contact"
            aria-label={t("financingCta")}
            className="group block overflow-hidden rounded-card border border-line transition-all duration-200 ease-smooth hover:-translate-y-1 hover:border-line-strong hover:shadow-lg hover:shadow-black/30"
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              width={1748}
              height={900}
              sizes="(min-width: 1024px) 660px, (min-width: 640px) 768px, calc(100vw - 2rem)"
              className="h-auto w-full transition-transform duration-300 ease-smooth group-hover:scale-[1.02]"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function CtaBand() {
  const t = useTranslations("home");
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
        <Reveal>
          <div className="relative isolate flex flex-col items-start gap-6 overflow-hidden rounded-card border border-accent/30 bg-accent-soft p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <Particles count={22} seed={11} className="text-accent-hover" intensity={1.2} />
            <p className="relative max-w-md font-display text-xl font-semibold text-ink sm:text-2xl">
              {t("ctaBandText")}
            </p>
            <div className="relative flex shrink-0 gap-3">
              <Link href="/contact" className="btn-primary">
                {t("ctaBandButton")}
              </Link>
              <a href={PHONE_HREF} className="btn-outline" aria-label="Call">
                <Icon name="phone" size={18} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Consignment teaser strip: three-step pitch + CTA to the sell page.
function SellStrip() {
  const t = useTranslations("sell");
  const steps = [
    { icon: "mail", title: t("step1Title"), text: t("step1Text") },
    { icon: "check", title: t("step2Title"), text: t("step2Text") },
    { icon: "wallet", title: t("step3Title"), text: t("step3Text") },
  ] as const;

  return (
    <section className="relative isolate overflow-hidden border-y border-line bg-surface">
      <Particles count={30} seed={5} className="text-accent-hover" intensity={1.1} />
      <div className="relative mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={t("title")} />
          <Link href="/sell" className="btn-primary">
            {t("submit")}
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} index={i}>
              <div className="flex items-start gap-4 rounded-card border border-line bg-base p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-accent-soft text-accent">
                  <Icon name={s.icon} size={20} />
                </span>
                <div>
                  <h3 className="font-medium text-ink">{s.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-6 w-1 rounded-full bg-accent" />
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
    </div>
  );
}
