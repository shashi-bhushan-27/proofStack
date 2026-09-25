import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";

export interface TimeseriesPoint {
  date: string;
  requests: number;
  cost: number;
}

interface TimeseriesChartProps {
  data: TimeseriesPoint[];
  title: string;
}

export function TimeseriesChart({ data, title }: TimeseriesChartProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-4 text-xs text-fg-muted" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--chart-1)]" /> Requests
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--chart-2)]" /> Cost (USD)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="var(--chart-axis)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => format(parseISO(val), "MMM d")}
                />
                <YAxis
                  yAxisId="left"
                  stroke="var(--chart-axis)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--chart-axis)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    color: "var(--fg)",
                    fontSize: 12,
                  }}
                  itemStyle={{ color: "var(--fg)" }}
                  labelStyle={{ color: "var(--fg-muted)" }}
                  labelFormatter={(val) => (val ? format(parseISO(String(val)), "MMM d, yyyy") : "")}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                  name="Requests"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="cost"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCost)"
                  name="Cost (USD)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState className="h-[300px] justify-center" title="No data available" />
        )}
      </CardContent>
    </Card>
  );
}
