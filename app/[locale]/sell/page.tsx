import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SellForm from "@/components/public/SellForm";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { PHONE, PHONE_HREF } from "@/lib/contact";

export const runtime = "edge";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("sellTitle"), description: t("sellDescription") };
}

// Consignment page: the dealership lists and sells qualifying customer cars.
// Submissions land in the dedicated admin consignment inbox.
export default async function SellPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("sell");

  const steps = [
    { icon: "mail", title: t("step1Title"), text: t("step1Text") },
    { icon: "check", title: t("step2Title"), text: t("step2Text") },
    { icon: "wallet", title: t("step3Title"), text: t("step3Text") },
  ] as const;

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
          <Reveal>
            <h1 className="font-display text-4xl font-semibold text-ink">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted">{t("lead")}</p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {steps.map((s, i) => (
            <Reveal key={s.title} index={i}>
              <div className="tile-card group flex items-start gap-4 p-5">
                <span className="tile-icon relative h-11 w-11">
                  <Icon name={s.icon} size={22} />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent font-display text-[11px] font-semibold text-white transition-colors duration-300 group-hover:bg-white group-hover:text-accent">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h2 className="font-medium text-ink">{s.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal index={3}>
            <div className="rounded-card border border-accent/30 bg-accent-soft p-5">
              <h2 className="font-display text-lg font-semibold text-ink">
                {t("feeTitle")}
              </h2>
              <dl className="mt-4 space-y-3">
                <div className="flex items-start justify-between gap-4 border-b border-accent/15 pb-3">
                  <dt className="text-sm text-ink-muted">
                    {t("commissionLabel")}
                  </dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {t("commissionValue")}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-ink-muted">
                    {t("parkingLabel")}
                  </dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {t("parkingValue")}
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal index={4}>
            <a
              href={PHONE_HREF}
              className="tile-card group flex items-center justify-center gap-2 p-5 font-medium text-ink"
            >
              <span className="transition-transform duration-300 ease-smooth group-hover:-rotate-12 group-hover:scale-110">
                <Icon name="phone" size={20} />
              </span>
              {PHONE}
            </a>
          </Reveal>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6 sm:p-8">
            <h2 className="mb-5 font-display text-xl font-semibold text-ink">
              {t("formTitle")}
            </h2>
            <SellForm />
          </div>
        </div>
      </div>
    </div>
  );
}
