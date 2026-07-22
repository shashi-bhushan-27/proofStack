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

interface TimeseriesChartProps {
  data: any[];
  title: string;
}

export function TimeseriesChart({ data, title }: TimeseriesChartProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col shadow-lg">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
        {title}
      </h3>
      <div className="flex-1 min-h-[300px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => format(parseISO(val), "MMM d")}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  color: "#f8fafc",
                }}
                itemStyle={{ color: "#f8fafc" }}
                labelFormatter={(val: any) => val ? format(parseISO(String(val)), "MMM d, yyyy") : ""}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="requests"
                stroke="#818cf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRequests)"
                name="Requests"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCost)"
                name="Cost (USD)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 text-sm">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
