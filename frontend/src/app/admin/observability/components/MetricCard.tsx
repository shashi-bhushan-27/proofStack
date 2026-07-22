import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ title, value, icon: Icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <Icon className="h-5 w-5 text-indigo-400" />
        </div>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-black text-white">{value}</span>
        {trend && (
          <span
            className={`ml-3 text-xs font-bold ${
              trendUp ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
