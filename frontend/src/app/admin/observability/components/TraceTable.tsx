import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface TraceSummary {
  id: string;
  trace_id: string;
  created_at: string;
  operation: string;
  model: string;
  latency_ms: number;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost_usd: number;
  status: string;
}

interface TraceTableProps {
  data: TraceSummary[];
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
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-fg">Trace explorer</h2>
        <span className="text-sm text-fg-subtle">
          Showing {data.length} of {total.toLocaleString()} traces
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-2/60 text-xs text-fg-muted">
            <tr>
              <th scope="col" className="whitespace-nowrap px-5 py-3 font-medium sm:px-6">Timestamp</th>
              <th scope="col" className="px-5 py-3 font-medium">Operation</th>
              <th scope="col" className="px-5 py-3 font-medium">Model</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Latency</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Tokens (in / out)</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Cost</th>
              <th scope="col" className="px-5 py-3 font-medium sm:pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((trace) => (
              <tr
                key={trace.id}
                onClick={() => onRowClick(trace.trace_id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick(trace.trace_id);
                  }
                }}
                tabIndex={0}
                aria-label={`View trace ${trace.trace_id}`}
                className="cursor-pointer text-fg-muted transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-offset-[-2px]"
              >
                <td className="whitespace-nowrap px-5 py-3 text-xs tabular-nums sm:px-6">
                  {format(new Date(trace.created_at), "MMM d, HH:mm:ss")}
                </td>
                <td className="whitespace-nowrap px-5 py-3 font-medium text-fg">{trace.operation}</td>
                <td className="whitespace-nowrap px-5 py-3">
                  <Badge size="sm">{trace.model}</Badge>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums">{trace.latency_ms}ms</td>
                <td className="whitespace-nowrap px-5 py-3 text-right text-xs tabular-nums">
                  {trace.input_tokens || 0} / {trace.output_tokens || 0}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right font-mono text-xs">
                  ${trace.estimated_cost_usd.toFixed(6)}
                </td>
                <td className="whitespace-nowrap px-5 py-3 sm:pr-6">
                  {trace.status === "success" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                      <CheckCircle2 className="size-4" aria-hidden="true" /> Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger">
                      <XCircle className="size-4" aria-hidden="true" /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-fg-subtle">
                  No traces found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 sm:px-6">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft aria-hidden="true" /> Previous
        </Button>
        <span className="text-xs text-fg-muted">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
