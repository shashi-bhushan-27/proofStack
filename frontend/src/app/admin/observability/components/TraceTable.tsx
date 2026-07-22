import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

interface TraceTableProps {
  data: any[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowClick: (traceId: string) => void;
}

export function TraceTable({
  data,
  page,
  pageSize,
  total,
  onPageChange,
  onRowClick,
}: TraceTableProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-lg overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Trace Explorer
        </h3>
        <span className="text-xs text-slate-500">
          Showing {data.length} of {total} traces
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Timestamp</th>
              <th className="px-6 py-4 font-semibold">Operation</th>
              <th className="px-6 py-4 font-semibold">Model</th>
              <th className="px-6 py-4 font-semibold">Latency</th>
              <th className="px-6 py-4 font-semibold">Tokens</th>
              <th className="px-6 py-4 font-semibold">Cost</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((trace) => (
              <tr
                key={trace.id}
                onClick={() => onRowClick(trace.trace_id)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                  {format(new Date(trace.created_at), "MMM d, HH:mm:ss")}
                </td>
                <td className="px-6 py-4 font-medium text-indigo-300">
                  {trace.operation}
                </td>
                <td className="px-6 py-4 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {trace.model}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {trace.latency_ms}ms
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {trace.input_tokens || 0} / {trace.output_tokens || 0}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">
                  ${trace.estimated_cost_usd.toFixed(6)}
                </td>
                <td className="px-6 py-4">
                  {trace.status === "success" ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Success
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                      <XCircle className="h-4 w-4" /> Failed
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No traces found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <span className="text-xs font-medium text-slate-400">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
