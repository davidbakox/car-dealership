import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createPublicClient } from "@/lib/supabase/public";
import { Link } from "@/i18n/routing";
import CarCard from "@/components/public/CarCard";
import CarFilterSidebar from "@/components/public/CarFilterSidebar";
import CarSort from "@/components/public/CarSort";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import SplitWords from "@/components/ui/SplitWords";
import Icon from "@/components/ui/Icon";
import {
  type CarFilters,
  PAGE_SIZE,
  filterCars,
  sortCars,
  parseSort,
  parsePage,
  modelsByMake,
  activeFilterCount,
} from "@/lib/car-filters";
import type { Car } from "@/lib/types";

export const runtime = "edge";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("carsTitle"), description: t("carsDescription") };
}

export default async function CarsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: CarFilters;
}) {
  setRequestLocale(locale);
  const t = await getTranslations("cars");
  const supabase = createPublicClient();

  // One cached read of the whole catalogue; filtering/sorting/paging happen in
  // lib/car-filters over that snapshot (see the note there on why).
  const { data } = await supabase.from("cars").select("*");
  const all = (data ?? []) as Car[];

  const sort = parseSort(searchParams.sort);
  const matched = sortCars(filterCars(all, searchParams), sort);

  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = parsePage(searchParams.page, totalPages);
  const from = (page - 1) * PAGE_SIZE;
  const cars = matched.slice(from, from + PAGE_SIZE);

  const makes = Array.from(new Set(all.map((c) => c.make).filter(Boolean))).sort();
  const models = modelsByMake(all);
  const hasFilters = activeFilterCount(searchParams) > 0;

  // Page links keep every other param; `page` is the only thing that changes.
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v === undefined) continue;
      for (const item of Array.isArray(v) ? v : [v]) if (item) params.append(k, item);
    }
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  };

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <nav aria-label="breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-ink-faint">
        <Link href="/" className="transition-colors hover:text-accent-hover">
          {t("homeCrumb")}
        </Link>
        <span>/</span>
        <span className="text-ink-muted">{t("carsCrumb")}</span>
      </nav>

      <div className="mb-6">
        <SplitWords
          as="h1"
          text={t("title")}
          className="font-display text-3xl font-semibold text-ink sm:text-4xl"
        />
        <p className="mt-1.5 text-ink-muted">
          {t("resultsCount", { count: matched.length })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr] lg:items-start">
        <aside>
          <CarFilterSidebar
            makes={makes}
            modelsByMake={models}
            current={searchParams}
            sort={sort}
          />
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {matched.length > 0
                ? t("showing", {
                    from: from + 1,
                    to: from + cars.length,
                    total: matched.length,
                  })
                : ""}
            </p>
            <CarSort current={sort} />
          </div>

          {cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-ink-faint">
                <Icon name="search" size={26} />
              </span>
              <p className="mt-4 font-medium text-ink">{t("empty")}</p>
              <p className="mt-1 text-sm text-ink-muted">{t("emptyHint")}</p>
              {hasFilters && (
                <a href="?" className="btn-outline mt-5 inline-flex h-10 items-center px-4">
                  {t("resetAll")}
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car, i) => (
                <Reveal key={car.id} index={i % 3} as="article">
                  <TiltCard className="rounded-card">
                    <CarCard car={car} />
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="pagination"
              className="mt-8 flex items-center justify-center gap-2"
            >
              <a
                href={pageHref(page - 1)}
                aria-disabled={page === 1}
                className={`btn-outline flex h-10 items-center gap-1.5 px-3 ${
                  page === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <span className="rotate-180">
                  <Icon name="arrow-right" size={15} />
                </span>
                {t("prev")}
              </a>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <a
                  key={n}
                  href={pageHref(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                    n === page
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {n}
                </a>
              ))}

              <a
                href={pageHref(page + 1)}
                aria-disabled={page === totalPages}
                className={`btn-outline flex h-10 items-center gap-1.5 px-3 ${
                  page === totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                {t("next")}
                <Icon name="arrow-right" size={15} />
              </a>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
