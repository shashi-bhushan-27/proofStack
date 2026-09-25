import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Award,
  CheckCircle2,
  Code2,
  FileSearch,
  MessageSquareText,
  Search,
  ShieldCheck,
  TrendingUp,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import { Container, PageShell } from "@/components/layout/page";
import { buttonVariants } from "@/components/ui/button";

const dimensions = [
  {
    icon: Zap,
    title: "Strong action verbs",
    description:
      "We check if you use powerful technical verbs that clearly explain what you personally designed, built, optimized, or deployed.",
  },
  {
    icon: Code2,
    title: "Technical context",
    description: "We ensure your bullets explain where, how, and why each tool was used within the broader system architecture.",
  },
  {
    icon: Search,
    title: "Engineering depth",
    description: "We help you highlight authentic problem-solving and technical complexity beyond superficial keyword drops.",
  },
  {
    icon: ShieldCheck,
    title: "Personal scope & ownership",
    description: "We verify that your individual contributions and exact scope of ownership shine through clearly to recruiters.",
  },
  {
    icon: TrendingUp,
    title: "Tangible outcomes",
    description:
      "We guide you to describe specific product features, performance gains, or operational improvements caused by your work.",
  },
  {
    icon: Award,
    title: "Quantified impact",
    description: "We prompt you to quantify your success with real numbers, latency reductions, scale metrics, and exact percentages.",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload resume & target job",
    description:
      "Upload your existing PDF resume and paste any job description you want to apply for. No sign-up required to test.",
  },
  {
    icon: FileSearch,
    title: "Get your fit score & feedback",
    description:
      "Our AI computes a transparent 0-100 fit score and reveals exactly which required skills lack strong proof in your resume.",
  },
  {
    icon: MessageSquareText,
    title: "Chat & copy STAR bullets",
    description:
      "Chat with our AI coach to answer probing questions about your projects, and copy high-impact STAR bullets into your resume.",
  },
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium text-primary-text">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-fg-muted">{description}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        />
        <Container size="wide" className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div className="animate-fade-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-fg-muted shadow-xs">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Personal AI resume coach &amp; evidence verification
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              Don&apos;t just list keywords. <span className="text-primary-text">Prove real skill impact</span> and get
              shortlisted.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
              Modern ATS and hiring managers quickly reject resumes that simply list{" "}
              <code className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
                PostgreSQL
              </code>{" "}
              or{" "}
              <code className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
                Kubernetes
              </code>{" "}
              without proof. proofStack checks your experience against your target job, flags weak evidence, and helps
              you write shortlist-ready STAR bullets in minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/analysis/new" className={buttonVariants({ size: "lg" })}>
                Check your resume free
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="#how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                See how it works
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-subtle">
              {["No sign-up needed", "3 free checks per day", "PDF resumes up to 10 MB"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Before / after example */}
          <figure className="animate-fade-in rounded-2xl border border-border bg-surface p-4 shadow-lg sm:p-6 [animation-delay:120ms]">
            <figcaption className="mb-4 flex items-center justify-between text-xs font-medium text-fg-subtle">
              <span>Example rewrite</span>
              <span className="rounded-md bg-surface-2 px-2 py-0.5">Redis · FastAPI</span>
            </figcaption>
            <div className="rounded-xl border border-danger-border bg-danger-soft p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <XCircle className="size-4 text-danger" aria-hidden="true" />
                Before: keyword-only resume
              </p>
              <p className="mt-3 rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed text-fg-muted">
                &quot;Skills: Redis, Docker, FastAPI, AWS&quot;
              </p>
              <p className="mt-3 text-xs leading-relaxed text-fg-muted">
                Rejected by modern screeners: lacks implementation details, clear ownership, and measurable business
                outcomes.
              </p>
            </div>
            <div className="flex justify-center py-2 text-fg-subtle" aria-hidden="true">
              <ArrowDown className="size-4" />
            </div>
            <div className="rounded-xl border border-success-border bg-success-soft p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                After: proofStack-optimized bullet
              </p>
              <p className="mt-3 rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed text-fg">
                &quot;Designed and deployed a high-throughput Redis caching layer for FastAPI endpoints, reducing API
                latency by 35%&quot;
              </p>
              <p className="mt-3 text-xs leading-relaxed text-fg-muted">
                Shortlist-ready: proves real action, engineering depth, personal ownership, and verified impact.
              </p>
            </div>
          </figure>
        </Container>
      </section>

      {/* Six evidence dimensions */}
      <section id="evidence-dimensions" className="py-20 sm:py-28">
        <Container size="wide">
          <SectionHeading
            eyebrow="Your shortlist advantage"
            title="How proofStack checks your resume across 6 dimensions"
            description="We scan your resume against your target job description using these exact criteria, showing you what to fix so your application stands out at top tech companies."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dimensions.map((dimension, index) => (
              <div
                key={dimension.title}
                className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-border-strong"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
                    <dimension.icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium text-fg-subtle">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-fg">{dimension.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{dimension.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-surface py-20 sm:py-28">
        <Container size="wide">
          <SectionHeading
            eyebrow="3 simple steps to get shortlisted"
            title="Upgrade your resume & generate STAR bullets in minutes"
          />
          <ol className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                {index < steps.length - 1 && (
                  <div aria-hidden="true" className="absolute left-12 right-0 top-5 hidden h-px bg-border md:block" />
                )}
                <div className="relative flex size-10 items-center justify-center rounded-full border border-border bg-bg text-sm font-semibold text-fg">
                  {index + 1}
                </div>
                <h3 className="mt-5 flex items-center gap-2 text-base font-semibold text-fg">
                  <step.icon className="size-4 text-primary-text" aria-hidden="true" />
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Final call to action */}
      <section className="py-20 sm:py-28">
        <Container size="narrow" className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Ready to transform your resume and win more interviews?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
            No credit card or sign-up required for your first check. Identify weak evidence and build shortlist-ready
            bullet points before submitting your application.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/analysis/new" className={buttonVariants({ size: "lg" })}>
              Check &amp; improve your resume free
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/billing" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              View pricing
            </Link>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
