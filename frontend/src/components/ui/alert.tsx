import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "danger" | "success" | "warning" | "info";

const toneStyles: Record<AlertTone, { box: string; icon: string; Icon: React.ElementType }> = {
  danger: { box: "border-danger-border bg-danger-soft", icon: "text-danger", Icon: AlertCircle },
  success: { box: "border-success-border bg-success-soft", icon: "text-success", Icon: CheckCircle2 },
  warning: { box: "border-warning-border bg-warning-soft", icon: "text-warning", Icon: TriangleAlert },
  info: { box: "border-info-border bg-info-soft", icon: "text-info", Icon: Info },
};

interface AlertProps extends Omit<React.ComponentProps<"div">, "title"> {
  tone?: AlertTone;
  title?: React.ReactNode;
  /** Optional trailing action, e.g. a retry button. */
  action?: React.ReactNode;
}

export function Alert({ tone = "danger", title, action, className, children, ...props }: AlertProps) {
  const { box, icon, Icon } = toneStyles[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", box, className)}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-fg">{title}</p>}
        {children && <div className={cn(title ? "mt-0.5 text-fg-muted" : "text-fg")}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
