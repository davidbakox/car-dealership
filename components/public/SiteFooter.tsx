import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Logo from "./Logo";
import TbiBankBadge from "./TbiBankBadge";
import MapEmbed from "./MapEmbed";
import CookieSettingsButton from "./CookieSettingsButton";
import FooterWaves from "./FooterWaves";
import Particles from "@/components/ui/Particles";
import { LEGAL_NAME } from "@/lib/contact";

const links = [
  { href: "/", key: "home" },
  { href: "/cars", key: "cars" },
  { href: "/sell", key: "sell" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

const legalLinks = [
  { href: "/legal", key: "legalInformation" },
  { href: "/privacy", key: "privacyPolicy" },
  { href: "/cookies", key: "cookiePolicy" },
] as const;

export default function SiteFooter() {
  const t = useTranslations();

  // The wave band *is* the footer's top edge — its front layer is filled with
  // the surface colour — so the footer element itself carries no top border and
  // no background; the body wrapper below does.
  return (
    <footer className="mt-18">
      <FooterWaves />

      <div className="relative isolate bg-surface">
        <Particles count={28} seed={7} className="text-accent-hover" intensity={1.15} />

        <div className="relative mx-auto grid max-w-content gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="text-xs text-ink-faint">
                {t("footer.financingBy")}
              </span>
              <TbiBankBadge size="sm" />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-ink">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-accent"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-ink">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-accent"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton className="text-left text-sm text-ink-muted transition-colors hover:text-accent">
                  {t("footer.cookieSettings")}
                </CookieSettingsButton>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-ink">
              {t("footer.contact")}
            </h3>
            <address className="space-y-2 not-italic text-sm text-ink-muted">
              <p>{t("contact.address")}</p>
            </address>
            <div className="mt-4">
              <MapEmbed title={t("contact.mapTitle")} compact />
            </div>
          </div>
        </div>

        <div className="relative border-t border-line">
          <div className="mx-auto flex max-w-content flex-col gap-5 px-4 py-5 text-xs text-ink-faint sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <span>
                © {new Date().getFullYear()} {LEGAL_NAME} · Dennis Cars Carei.{" "}
                {t("footer.rights")}
              </span>
            </div>

            <a
              href="https://reclamatiisal.anpc.ro/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("footer.anpcSal")}
              className="inline-flex w-fit shrink-0 self-start overflow-hidden rounded bg-white transition-opacity hover:opacity-90"
            >
              <Image
                src="/images/legal/anpc-sal-2026.png"
                alt={t("footer.anpcSal")}
                width={250}
                height={50}
                className="h-[50px] w-[250px]"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
