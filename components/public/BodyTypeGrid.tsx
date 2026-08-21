import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Icon from "@/components/ui/Icon";
import { BODY_TYPES } from "@/lib/types";

// "Search by body type" — one tile per body style, linking straight into the
// pre-filtered listings. `counts` comes from the catalogue, so a style nobody
// has in stock is rendered muted and non-clickable instead of leading the
// visitor to an empty result page.
export default function BodyTypeGrid({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const t = useTranslations("home");
  const tb = useTranslations("bodyType");

  return (
    <section className="border-y border-line bg-surface/40">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("bodyTitle")}
          </h2>
          <p className="mt-2 text-ink-muted">{t("bodySubtitle")}</p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {BODY_TYPES.map((body) => {
            const count = counts[body] ?? 0;
            const inner = (
              <>
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                    count > 0
                      ? "bg-accent-soft text-accent-hover group-hover:bg-accent group-hover:text-white"
                      : "bg-surface-2 text-ink-faint"
                  }`}
                >
                  <Icon name={`body-${body}`} size={30} />
                </span>
                <span className="mt-3 text-sm font-medium">{tb(body)}</span>
                <span className="mt-0.5 text-xs text-ink-faint">{count}</span>
              </>
            );

            const shell =
              "group flex h-full flex-col items-center rounded-card border p-4 text-center transition-all duration-200 ease-smooth";

            return (
              <li key={body}>
                {count > 0 ? (
                  <Link
                    href={{ pathname: "/cars", query: { body } }}
                    className={`${shell} border-line bg-surface text-ink hover:-translate-y-1 hover:border-accent`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    className={`${shell} cursor-default border-dashed border-line bg-surface/50 text-ink-faint`}
                    aria-disabled="true"
                  >
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
