import { Loader2 } from "lucide-react";
import { cn, type Tone } from "@/lib/utils";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex">
      <Loader2 className={cn("size-5 animate-spin text-fg-subtle", className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-md bg-surface-3/70", className)} aria-hidden="true" {...props} />;
}

const progressFill: Record<Tone, string> = {
  neutral: "bg-neutral-solid",
  primary: "bg-primary",
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  info: "bg-info-solid",
};

interface ProgressProps {
  value: number;
  tone?: Tone;
  label?: string;
  className?: string;
}

export function Progress({ value, tone = "primary", label, className }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", progressFill[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Use "h1" when the empty state is the whole page (404, error, blocked states). */
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
}

export function EmptyState({ icon, title, description, action, headingLevel = "h3", className }: EmptyStateProps) {
  const Heading = headingLevel;
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-fg-subtle [&_svg]:size-6">
          {icon}
        </div>
      )}
      <Heading className={cn("font-semibold text-fg", headingLevel === "h1" ? "text-xl" : "text-base")}>{title}</Heading>
      {description && <p className="mt-1.5 max-w-md text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
