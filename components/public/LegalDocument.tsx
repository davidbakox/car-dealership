import CookieSettingsButton from "./CookieSettingsButton";
import type { LegalDocumentContent } from "@/lib/legal-content";

export default function LegalDocument({
  content,
}: {
  content: LegalDocumentContent;
}) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="border-b border-line pb-8">
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
          {content.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-muted">
          {content.lead}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-sm text-ink-faint">{content.updated}</p>
          {content.settingsAction && (
            <CookieSettingsButton className="btn-outline px-4 py-2">
              {content.settingsAction}
            </CookieSettingsButton>
          )}
        </div>
      </header>

      <div className="mt-10 space-y-10">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-2xl font-semibold text-ink">
              {section.title}
            </h2>

            {section.warning && (
              <div className="mt-4 rounded-card border border-reserved/40 bg-reserved/10 px-4 py-3 text-sm leading-relaxed text-ink">
                {section.warning}
              </div>
            )}

            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 leading-7 text-ink-muted"
              >
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-muted marker:text-accent">
                {section.bullets.map((item) => (
                  <li key={item} className="pl-1 leading-7">
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {section.table && (
              <div className="mt-5 overflow-x-auto rounded-card border border-line">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-surface-2 text-ink">
                    <tr>
                      {section.table.headers.map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="border-b border-line px-4 py-3 font-medium"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {section.table.rows.map((row) => (
                      <tr key={row.join("|")} className="align-top">
                        {row.map((cell, index) => (
                          <td
                            key={`${index}-${cell}`}
                            className="min-w-40 px-4 py-3 leading-relaxed text-ink-muted"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {section.footnotes?.map((note) => (
              <p key={note} className="mt-4 text-sm leading-7 text-ink-faint">
                {note}
              </p>
            ))}

            {section.links && (
              <div className="mt-5 flex flex-wrap gap-3">
                {section.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent-hover underline underline-offset-4"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
