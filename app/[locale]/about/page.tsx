import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Reveal from "@/components/ui/Reveal";
import SplitWords from "@/components/ui/SplitWords";
import Icon from "@/components/ui/Icon";
import { PHONE_HREF } from "@/lib/contact";

export const runtime = "edge";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("aboutTitle"), description: t("aboutDescription") };
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const chapters = [
    { title: t("originTitle"), paragraphs: [t("originText1"), t("originText2")] },
    {
      title: t("experienceTitle"),
      paragraphs: [t("experienceText1"), t("experienceText2")],
    },
    { title: t("valuesTitle"), paragraphs: [t("valuesText1"), t("valuesText2")] },
    { title: t("supportTitle"), paragraphs: [t("supportText1"), t("supportText2")] },
  ];

  const facts = [
    { icon: "calendar", value: "2025", label: t("factFounded") },
    { icon: "check", value: "20+", label: t("factExperience") },
    { icon: "shield", value: "12", label: t("factWarranty") },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto max-w-content px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <Reveal>
            <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-accent-hover">
              <span className="h-px w-8 bg-accent" />
              {t("eyebrow")}
            </div>
            <SplitWords
              as="h1"
              text={t("title")}
              highlightLast={2}
              className="block max-w-3xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl"
            />
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted sm:text-xl">
              {t("lead")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-12">
          <article className="space-y-10 sm:space-y-12">
            {chapters.map((chapter, index) => (
              <Reveal key={chapter.title} index={index}>
                <section className="border-l-2 border-accent/60 pl-5 sm:pl-7">
                  <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                    {chapter.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-8 text-ink-muted sm:text-lg">
                    {chapter.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </article>

          <aside className="grid gap-3 sm:grid-cols-3 lg:sticky lg:top-28 lg:grid-cols-1">
            <Reveal className="sm:col-span-3 lg:col-span-1">
              <figure className="relative aspect-[3/4] overflow-hidden rounded-card border border-line bg-surface shadow-xl sm:aspect-[16/9] lg:aspect-[3/4]">
                <Image
                  src="/images/dennis-cars-family.jpg"
                  alt={t("imageAlt")}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 768px, 304px"
                  className="object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-accent/20" />
              </figure>
            </Reveal>
            {facts.map((fact, index) => (
              <Reveal key={fact.label} index={index}>
                <div className="card flex h-full items-center gap-4 p-5 lg:p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-accent-soft text-accent-hover">
                    <Icon name={fact.icon} size={21} />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-semibold text-ink">
                      {fact.value}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-ink-muted">
                      {fact.label}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </aside>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-16">
          <Reveal>
            <div className="relative grid items-center gap-8 overflow-hidden rounded-card border border-accent/30 bg-gradient-to-br from-accent-soft to-surface px-6 py-9 text-center shadow-lg shadow-accent/5 sm:px-10 sm:py-11 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:text-left">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
              />
              <div className="relative min-w-0 lg:flex lg:items-center lg:gap-6">
                <span className="relative mx-auto flex h-14 w-14 shrink-0 items-center justify-center lg:mx-0">
                  <span className="absolute inset-0 rounded-full bg-accent motion-safe:animate-heart-ring" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-md shadow-accent/30">
                    <Icon
                      name="heart"
                      size={26}
                      fill="currentColor"
                      className="motion-safe:animate-heartbeat"
                    />
                  </span>
                </span>
                <p className="mx-auto mt-5 max-w-3xl font-sans text-base font-medium leading-7 text-ink sm:text-lg sm:leading-8 lg:mx-0 lg:mt-0">
                  {t("closing")}
                </p>
              </div>
              <div className="relative mx-auto flex shrink-0 gap-3 lg:mx-0">
                <Link
                  href="/contact"
                  className="btn-primary min-w-44 rounded-full px-7 py-3.5 text-base"
                >
                  {t("ctaButton")}
                </Link>
                <a
                  href={PHONE_HREF}
                  className="btn-outline rounded-full px-4"
                  aria-label="Call"
                >
                  <Icon name="phone" size={18} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
