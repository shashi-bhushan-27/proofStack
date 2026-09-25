import Link from "next/link";
import { Container, PageShell } from "./page";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
  related: { href: string; label: string }[];
}

/**
 * Shared layout for policy pages: header, sticky table of contents (desktop) and readable prose.
 */
export function LegalPage({ eyebrow, title, lastUpdated, sections, related }: LegalPageProps) {
  return (
    <PageShell>
      <Container className="py-10 sm:py-14">
        <header className="max-w-3xl border-b border-border pb-8">
          <p className="text-sm font-medium text-primary-text">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-fg-subtle">Last updated: {lastUpdated}</p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">On this page</p>
              <ol className="mt-3 space-y-1 border-l border-border text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent py-1 pl-3 text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="max-w-3xl space-y-10 text-[0.9375rem] leading-7 text-fg-muted [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                <h2 className="text-lg font-semibold text-fg">{section.title}</h2>
                {section.content}
              </section>
            ))}

            <div className="flex flex-wrap gap-3 border-t border-border pt-8">
              {related.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg shadow-xs transition-colors hover:border-border-strong hover:bg-surface-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </article>
        </div>
      </Container>
    </PageShell>
  );
}
