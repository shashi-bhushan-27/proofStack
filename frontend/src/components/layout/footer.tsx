import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const productLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/analysis/new", label: "New evaluation" },
  { href: "/billing", label: "Pricing" },
];

const companyLinks = [
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund", label: "Cancellation & Refund" },
];

function FooterLinks({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      <ul className="mt-3 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-fg-muted transition-colors hover:text-fg">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="rounded-md border border-border px-1.5 py-px text-[11px] font-medium text-fg-subtle">v1.0</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
              Personal AI resume coach &amp; evidence platform. Helping candidates build verifiable proof of skills and
              generate shortlist-ready STAR bullet points to beat modern ATS.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-4">
            <FooterLinks title="Product" links={productLinks} />
            <FooterLinks title="Company" links={companyLinks} />
          </div>

          <div className="md:col-span-4">
            <h2 className="text-sm font-semibold text-fg">Direct contact &amp; support</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-fg-muted">
              <li>
                <a
                  href="mailto:shashibhushan27072002@gmail.com"
                  className="inline-flex items-center gap-2.5 break-all transition-colors hover:text-fg"
                >
                  <Mail className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                  shashibhushan27072002@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+917060049677" className="inline-flex items-center gap-2.5 transition-colors hover:text-fg">
                  <Phone className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                  +91 7060049677
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                Haridwar, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} proofStack Technologies. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-success-solid" aria-hidden="true" />
            All Systems Operational
          </p>
        </div>
      </div>
    </footer>
  );
}
