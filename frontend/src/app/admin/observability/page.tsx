"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import { MetricCard } from "./components/MetricCard";
import { TimeseriesChart } from "./components/TimeseriesChart";
import { OperationBreakdown } from "./components/OperationBreakdown";
import { TraceTable } from "./components/TraceTable";
import { TraceDetail } from "./components/TraceDetail";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Coins,
  Loader2,
  RefreshCcw,
  Zap,
} from "lucide-react";

export default function AdminObservabilityPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<any>(null);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  
  const [traces, setTraces] = useState<any[]>([]);
  const [tracePage, setTracePage] = useState(1);
  const [traceTotal, setTraceTotal] = useState(0);
  
  const [selectedTrace, setSelectedTrace] = useState<any>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, timeRes, opRes] = await Promise.all([
        adminApi.getObservabilitySummary(),
        adminApi.getObservabilityTimeseries(30),
        adminApi.getObservabilityByOperation(),
      ]);
      setSummary(sumRes.data);
      setTimeseries(timeRes.data);
      setOperations(opRes.data);
      
      await loadTraces(1);
    } catch (err: any) {
      if (err?.status === 403) {
        setError("You do not have permission to access the admin dashboard.");
      } else {
        setError(err?.detail || "Failed to load observability data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadTraces = async (page: number) => {
    try {
      const res = await adminApi.getTraces(page, 15);
      setTraces(res.data.items);
      setTraceTotal(res.data.total);
      setTracePage(page);
    } catch (err) {
      console.error("Failed to load traces", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const handleRowClick = async (traceId: string) => {
    try {
      const res = await adminApi.getTraceDetail(traceId);
      setSelectedTrace(res.data);
    } catch (err) {
      alert("Failed to load trace details");
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#020617] text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#020617] text-white">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-white">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-6 w-6 text-indigo-400" /> Observability
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              System telemetry, LLM token usage, and cost tracking.
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Requests"
              value={summary.total_requests.toLocaleString()}
              icon={BrainCircuit}
            />
            <MetricCard
              title="Success Rate"
              value={`${summary.success_rate}%`}
              icon={summary.success_rate >= 99 ? Zap : AlertTriangle}
              trend={summary.error_count > 0 ? `${summary.error_count} errors` : undefined}
              trendUp={false}
            />
            <MetricCard
              title="Total Cost"
              value={`$${summary.estimated_cost_usd.toFixed(2)}`}
              icon={Coins}
            />
            <MetricCard
              title="Avg Latency"
              value={`${summary.avg_latency_ms}ms`}
              icon={Activity}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimeseriesChart data={timeseries} title="Usage & Cost (30 Days)" />
          </div>
          <div>
            <OperationBreakdown data={operations} />
          </div>
        </div>

        <div>
          <TraceTable
            data={traces}
            page={tracePage}
            pageSize={15}
            total={traceTotal}
            onPageChange={loadTraces}
            onRowClick={handleRowClick}
          />
        </div>
      </main>

      {selectedTrace && (
        <TraceDetail
          trace={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />
      )}

      <Footer />
    </div>
  );
}
