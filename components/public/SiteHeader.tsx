"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import Icon from "@/components/ui/Icon";
import {
  EMAIL,
  EMAIL_HREF,
  PHONE,
  PHONE_HREF,
  SECONDARY_PHONE,
  SECONDARY_PHONE_HREF,
} from "@/lib/contact";

const navHrefs = [
  { href: "/", key: "home" },
  { href: "/cars", key: "cars" },
  { href: "/sell", key: "sell" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export default function SiteHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tContact = useTranslations("contact");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes; Tab is trapped inside the panel so focus can never land on
  // the page behind the overlay.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    // Move focus into the panel once the slide-in has started.
    const id = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 60);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(id);
    };
  }, [open, close]);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled
            ? "border-line bg-base/80 backdrop-blur-md"
            : "border-transparent bg-base"
        }`}
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Dennis Cars Carei">
            <Logo size="lg" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navHrefs.map((item) => {
              const isActive = isCurrent(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive}
                  className={`nav-link rounded px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-accent" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <span className="ml-2">
              <LanguageSwitcher />
            </span>
          </nav>

          {/* Mobile trigger — three bars that morph into a cross. */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={t("menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-line-strong active:scale-95 md:hidden"
          >
            <span className="relative block h-[14px] w-[22px]" aria-hidden="true">
              <span
                className={`absolute left-0 block h-[2px] w-full rounded-full bg-current transition-transform duration-300 ease-smooth motion-reduce:transition-none ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-[2px] rounded-full bg-accent transition-all duration-200 ease-smooth motion-reduce:transition-none ${
                  open ? "w-0 opacity-0" : "w-3/5 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-[2px] w-full rounded-full bg-current transition-transform duration-300 ease-smooth motion-reduce:transition-none ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <div
        className={`fixed inset-0 z-[60] transition-[visibility] duration-[420ms] md:hidden motion-reduce:transition-none ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={close}
          className={`absolute inset-0 w-full cursor-default bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t("menu")}
          tabIndex={-1}
          className={`absolute right-0 top-0 flex h-[100dvh] w-[88%] max-w-[400px] flex-col overflow-hidden border-l border-line-strong bg-base shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.85)] outline-none transition-transform duration-[420ms] ease-smooth motion-reduce:transition-none ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Ambient accent wash — the panel is a lit surface, not a grey slab. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 65% at 100% 0%, rgba(96,118,29,0.22) 0%, rgba(96,118,29,0.06) 38%, transparent 68%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-accent/70 via-accent/10 to-transparent"
          />

          {/* Panel header */}
          <div className="relative flex items-center justify-between gap-3 border-b border-line px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1.1rem)]">
            <Logo />
            <button
              type="button"
              onClick={close}
              aria-label={t("close")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-all duration-200 hover:rotate-90 hover:border-line-strong hover:text-ink active:scale-95 motion-reduce:hover:rotate-0"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="relative flex-1 overflow-y-auto overscroll-contain">
            <p className="px-5 pb-3 pt-5 text-[11px] font-medium uppercase tracking-[0.28em] text-ink-faint">
              {t("menuLead")}
            </p>

            <nav className="px-3">
              <ul>
                {navHrefs.map((item, index) => {
                  const isActive = isCurrent(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`group relative flex items-center gap-4 rounded-card px-3 py-3.5 transition-[transform,opacity,background-color] duration-500 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 active:scale-[0.99] motion-reduce:!translate-x-0 motion-reduce:!opacity-100 motion-reduce:transition-none ${
                          open
                            ? "translate-x-0 opacity-100"
                            : "translate-x-6 opacity-0"
                        } ${isActive ? "bg-accent-soft/50" : "hover:bg-surface"}`}
                        style={{
                          transitionDelay: open ? `${140 + index * 55}ms` : "0ms",
                        }}
                      >
                        {/* Active marker rail */}
                        <span
                          aria-hidden="true"
                          className={`absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-transform duration-300 ease-smooth ${
                            isActive ? "scale-y-100" : "scale-y-0"
                          }`}
                        />
                        <span
                          aria-hidden="true"
                          className={`w-6 shrink-0 font-display text-xs tabular-nums tracking-widest ${
                            isActive ? "text-accent" : "text-ink-faint"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block font-display text-xl font-semibold leading-tight ${
                              isActive ? "text-accent" : "text-ink"
                            }`}
                          >
                            {t(item.key)}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-ink-faint">
                            {t(`desc.${item.key}`)}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`shrink-0 transition-transform duration-300 ease-smooth group-hover:translate-x-1 ${
                            isActive ? "text-accent" : "text-ink-faint"
                          }`}
                        >
                          <Icon name="arrow-right" size={18} />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Quick contact */}
            <div
              className={`mt-6 px-5 transition-[transform,opacity] duration-500 ease-smooth motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
              style={{ transitionDelay: open ? "440ms" : "0ms" }}
            >
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-ink-faint">
                {t("quickContact")}
              </p>

              <a href={PHONE_HREF} className="btn-primary w-full">
                <Icon name="phone" size={16} />
                {tCommon("callNow")}
                <span className="font-normal opacity-80">· {PHONE}</span>
              </a>

              <ul className="mt-3 space-y-2.5 text-sm text-ink-muted">
                <li>
                  <a
                    href={SECONDARY_PHONE_HREF}
                    className="flex items-center gap-2.5 transition-colors hover:text-accent-hover"
                  >
                    <Icon name="phone" size={15} className="shrink-0 text-ink-faint" />
                    {SECONDARY_PHONE}
                  </a>
                </li>
                <li>
                  <a
                    href={EMAIL_HREF}
                    className="flex items-center gap-2.5 break-all transition-colors hover:text-accent-hover"
                  >
                    <Icon name="mail" size={15} className="shrink-0 text-ink-faint" />
                    {EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="pin" size={15} className="mt-0.5 shrink-0 text-ink-faint" />
                  <span>{tContact("address")}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="clock" size={15} className="mt-0.5 shrink-0 text-ink-faint" />
                  <span>{tContact("hoursValue")}</span>
                </li>
              </ul>
            </div>

            <div className="h-6" />
          </div>

          {/* Panel footer */}
          <div className="relative border-t border-line bg-surface/60 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-faint">
                {t("language")}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
