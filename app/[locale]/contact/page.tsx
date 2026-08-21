import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/public/ContactForm";
import MapEmbed from "@/components/public/MapEmbed";
import Icon from "@/components/ui/Icon";
import SplitWords from "@/components/ui/SplitWords";
import {
  EMAIL,
  EMAIL_HREF,
  PHONE,
  PHONE_HREF,
  PRIMARY_CONTACT_NAME,
  SECONDARY_CONTACT_NAME,
  SECONDARY_PHONE,
  SECONDARY_PHONE_HREF,
} from "@/lib/contact";

export const runtime = "edge";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("contactTitle"), description: t("contactDescription") };
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const info = [
    { icon: "pin", label: t("addressLabel"), value: t("address"), href: null },
    {
      icon: "phone",
      label: `${t("phoneLabel")} — ${PRIMARY_CONTACT_NAME}`,
      value: PHONE,
      href: PHONE_HREF,
    },
    {
      icon: "phone",
      label: `${t("phoneLabel")} — ${SECONDARY_CONTACT_NAME}`,
      value: SECONDARY_PHONE,
      href: SECONDARY_PHONE_HREF,
    },
    {
      icon: "mail",
      label: t("emailLabel"),
      value: EMAIL,
      href: EMAIL_HREF,
    },
    { icon: "clock", label: t("hoursLabel"), value: t("hoursValue"), href: null },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <SplitWords
          as="h1"
          text={t("title")}
          className="font-display text-4xl font-semibold text-ink"
        />
        <p className="mt-4 text-lg text-ink-muted">{t("lead")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4">
            {info.map((row) => (
              <div key={row.label} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-accent-soft text-accent">
                  <Icon name={row.icon} size={20} />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-wide text-ink-faint">
                    {row.label}
                  </div>
                  {row.href ? (
                    <a
                      href={row.href}
                      className="font-medium text-ink transition-colors hover:text-accent"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <div className="font-medium text-ink">{row.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              {t("formTitle")}
            </h2>
            <ContactForm />
          </div>
        </div>

        <div className="min-h-[420px]">
          <MapEmbed title={t("mapTitle")} />
        </div>
      </div>
    </div>
  );
}
