import { X } from "lucide-react";
import { format } from "date-fns";

interface TraceDetailProps {
  trace: any | null;
  onClose: () => void;
}

export function TraceDetail({ trace, onClose }: TraceDetailProps) {
  if (!trace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              Trace Detail
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                trace.status === "success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}>
                {trace.status.toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">{trace.trace_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Timestamp</p>
              <p className="text-sm text-slate-300">{format(new Date(trace.created_at), "MMM d, yyyy HH:mm:ss")}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Operation</p>
              <p className="text-sm font-medium text-indigo-400">{trace.operation}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Model</p>
              <p className="text-sm text-slate-300">{trace.model}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Latency</p>
              <p className="text-sm text-slate-300">{trace.latency_ms}ms</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Tokens</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between border-b border-slate-800/50 pb-1">
                  <span className="text-slate-400">Input</span>
                  <span className="font-mono">{trace.input_tokens || 0}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1">
                  <span className="text-slate-400">Output</span>
                  <span className="font-mono">{trace.output_tokens || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1">
                  <span>Total</span>
                  <span className="font-mono">{trace.total_tokens || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Economics</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between border-b border-slate-800/50 pb-1">
                  <span className="text-slate-400">Estimated Cost</span>
                  <span className="font-mono text-emerald-400">${trace.estimated_cost_usd.toFixed(6)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Retries</span>
                  <span>{trace.retry_count}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Context</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Prompt Version</span>
                <span className="text-sm font-mono text-indigo-300">{trace.prompt_version}</span>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Provider</span>
                <span className="text-sm text-slate-300">{trace.provider}</span>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Analysis ID</span>
                <span className="text-sm font-mono text-slate-400">{trace.analysis_id || "N/A"}</span>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">User ID</span>
                <span className="text-sm font-mono text-slate-400">{trace.user_id || "N/A"}</span>
              </div>
            </div>
          </div>

          {trace.status === "failure" && (
            <div className="border-t border-rose-900/50 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Error Details
              </p>
              <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                <p className="text-sm font-bold text-rose-400 mb-2">Type: {trace.error_type || "unknown"}</p>
                <div className="text-xs text-rose-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto bg-black/20 p-3 rounded-lg">
                  {trace.error_message || "No error message recorded."}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
