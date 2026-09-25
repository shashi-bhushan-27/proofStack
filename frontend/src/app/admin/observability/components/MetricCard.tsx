import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ title, value, icon: Icon, trend, trendUp }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-fg-muted">{title}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-fg">{value}</span>
        {trend && (
          <span className={cn("text-xs font-medium", trendUp ? "text-success" : "text-danger")}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
    </Card>
  );
}
