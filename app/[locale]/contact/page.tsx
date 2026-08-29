import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/public/ContactForm";
import MapEmbed from "@/components/public/MapEmbed";
import Icon from "@/components/ui/Icon";
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
        <h1 className="font-display text-4xl font-semibold text-ink">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-ink-muted">{t("lead")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* One card per row from `lg` up: this column is already half the
              page, and splitting it again squeezed every label onto two lines
              and broke the e-mail across a line mid-word. */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {info.map((row) => {
              const body = (
                <>
                  <span className="tile-icon h-11 w-11 rounded-card">
                    <Icon name={row.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                      {row.label}
                    </span>
                    <span className="mt-1 block font-medium leading-snug text-ink [overflow-wrap:anywhere]">
                      {row.value}
                    </span>
                  </span>
                </>
              );
              const shell =
                "tile-card group flex h-full items-center gap-4 px-5 py-4";
              return row.href ? (
                <a key={row.label} href={row.href} className={shell}>
                  {body}
                </a>
              ) : (
                <div key={row.label} className={shell}>
                  {body}
                </div>
              );
            })}
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
