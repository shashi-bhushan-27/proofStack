import { cn } from "@/lib/utils";
import { Header } from "./header";
import { Footer } from "./footer";

const containerSizes = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

interface ContainerProps extends React.ComponentProps<"div"> {
  size?: keyof typeof containerSizes;
}

export function Container({ size = "default", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", containerSizes[size], className)} {...props} />;
}

/**
 * Standard page frame: site header, a <main> landmark (target of the skip link) and the footer.
 */
export function PageShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className={cn("flex-1", className)}>
        {children}
      </main>
      <Footer />
    </>
  );
}

interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-sm font-medium text-primary-text">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-fg-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
