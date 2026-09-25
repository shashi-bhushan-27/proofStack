"use client";

import { XCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import type { TraceSummary } from "./TraceTable";

export interface TraceDetailData extends TraceSummary {
  total_tokens: number | null;
  retry_count: number;
  prompt_version: string;
  provider: string;
  analysis_id: string | null;
  user_id: string | null;
  error_type: string | null;
  error_message: string | null;
}

interface TraceDetailProps {
  trace: TraceDetailData | null;
  onClose: () => void;
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-fg-subtle">{label}</p>
      <p className="mt-1 text-sm text-fg">{children}</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-fg-muted">{label}</span>
      <span className="font-mono tabular-nums text-fg">{children}</span>
    </div>
  );
}

export function TraceDetail({ trace, onClose }: TraceDetailProps) {
  if (!trace) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title="Trace detail"
      titleAddon={
        <Badge tone={trace.status === "success" ? "success" : "danger"} size="sm" className="uppercase">
          {trace.status}
        </Badge>
      }
      description={<span className="break-all font-mono text-xs">{trace.trace_id}</span>}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Timestamp">{format(new Date(trace.created_at), "MMM d, yyyy HH:mm:ss")}</Stat>
          <Stat label="Operation">
            <span className="font-medium text-primary-text">{trace.operation}</span>
          </Stat>
          <Stat label="Model">{trace.model}</Stat>
          <Stat label="Latency">{trace.latency_ms}ms</Stat>
        </div>

        <div className="grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-fg">Tokens</h3>
            <div className="mt-2 divide-y divide-border text-sm">
              <Row label="Input">{trace.input_tokens || 0}</Row>
              <Row label="Output">{trace.output_tokens || 0}</Row>
              <div className="flex justify-between gap-4 py-2 font-semibold text-fg">
                <span>Total</span>
                <span className="font-mono tabular-nums">{trace.total_tokens || 0}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fg">Economics</h3>
            <div className="mt-2 divide-y divide-border text-sm">
              <Row label="Estimated cost">
                <span className="text-success">${trace.estimated_cost_usd.toFixed(6)}</span>
              </Row>
              <Row label="Retries">{trace.retry_count}</Row>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-fg">Context</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Prompt version", value: trace.prompt_version, mono: true },
              { label: "Provider", value: trace.provider },
              { label: "Analysis ID", value: trace.analysis_id || "N/A", mono: true },
              { label: "User ID", value: trace.user_id || "N/A", mono: true },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-surface-2/60 px-3 py-2.5">
                <dt className="text-xs text-fg-subtle">{item.label}</dt>
                <dd className={item.mono ? "mt-1 break-all font-mono text-xs text-fg" : "mt-1 text-sm text-fg"}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {trace.status === "failure" && (
          <div className="border-t border-border pt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-danger">
              <XCircle className="size-4" aria-hidden="true" /> Error details
            </h3>
            <div className="mt-3 rounded-lg border border-danger-border bg-danger-soft p-4">
              <p className="text-sm font-medium text-fg">Type: {trace.error_type || "unknown"}</p>
              <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-surface p-3 font-mono text-xs text-fg-muted">
                {trace.error_message || "No error message recorded."}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
