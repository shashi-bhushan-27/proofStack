"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, BrainCircuit, Coins, RefreshCcw, ShieldAlert, Zap } from "lucide-react";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import { getErrorMessage, getErrorStatus } from "@/lib/utils";
import { Container, PageHeader, PageShell } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";
import { MetricCard } from "./components/MetricCard";
import { TimeseriesChart, type TimeseriesPoint } from "./components/TimeseriesChart";
import { OperationBreakdown, type OperationStat } from "./components/OperationBreakdown";
import { TraceTable, type TraceSummary } from "./components/TraceTable";
import { TraceDetail, type TraceDetailData } from "./components/TraceDetail";

interface ObservabilitySummary {
  total_requests: number;
  success_rate: number;
  error_count: number;
  estimated_cost_usd: number;
  avg_latency_ms: number;
}

const TRACE_PAGE_SIZE = 15;

export default function AdminObservabilityPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status: number } | null>(null);

  const [summary, setSummary] = useState<ObservabilitySummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [operations, setOperations] = useState<OperationStat[]>([]);

  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [tracePage, setTracePage] = useState(1);
  const [traceTotal, setTraceTotal] = useState(0);

  const [selectedTrace, setSelectedTrace] = useState<TraceDetailData | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const loadTraces = useCallback(async (page: number) => {
    try {
      const res = await adminApi.getTraces(page, TRACE_PAGE_SIZE);
      setTraces(res.data.items);
      setTraceTotal(res.data.total);
      setTracePage(page);
    } catch (err) {
      console.error("Failed to load traces", err);
    }
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!isAuthenticated) return;
      try {
        const [sumRes, timeRes, opRes] = await Promise.all([
          adminApi.getObservabilitySummary(),
          adminApi.getObservabilityTimeseries(30),
          adminApi.getObservabilityByOperation(),
        ]);
        setSummary(sumRes.data);
        setTimeseries(timeRes.data);
        setOperations(opRes.data);
        setError(null);

        await loadTraces(1);
      } catch (err) {
        const status = getErrorStatus(err);
        setError({
          status,
          message:
            status === 403
              ? "You do not have permission to access the admin dashboard."
              : getErrorMessage(err, "Failed to load observability data."),
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [isAuthenticated, loadTraces, reloadKey]);

  const loadDashboardData = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const handleRowClick = async (traceId: string) => {
    try {
      const res = await adminApi.getTraceDetail(traceId);
      setSelectedTrace(res.data);
    } catch {
      toast({ title: "Failed to load trace details", tone: "danger" });
    }
  };

  const showSkeleton = isAuthLoading || (isLoading && !summary);

  if (error && !showSkeleton) {
    const forbidden = error.status === 403;
    return (
      <PageShell>
        <Container size="narrow" className="py-16">
          <Card>
            <EmptyState
              headingLevel="h1"
              icon={forbidden ? <ShieldAlert /> : <AlertTriangle />}
              title={forbidden ? "Access denied" : "Couldn't load observability data"}
              description={error.message}
              action={
                !forbidden && (
                  <Button onClick={loadDashboardData} isLoading={isLoading}>
                    <RefreshCcw aria-hidden="true" />
                    Try again
                  </Button>
                )
              }
            />
          </Card>
        </Container>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Container size="wide" className="py-10 sm:py-12">
        <PageHeader
          eyebrow="Admin"
          title="Observability"
          description="System telemetry, LLM token usage, and cost tracking."
          actions={
            <Button variant="secondary" onClick={loadDashboardData} isLoading={isLoading && !showSkeleton} loadingText="Refreshing...">
              <RefreshCcw aria-hidden="true" />
              Refresh
            </Button>
          }
        />

        {showSkeleton ? (
          <div className="mt-8 space-y-6" aria-busy="true" aria-label="Loading observability data">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-4 h-7 w-20" />
                </Card>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-[380px] rounded-xl lg:col-span-2" />
              <Skeleton className="h-[380px] rounded-xl" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {summary && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total requests" value={summary.total_requests.toLocaleString()} icon={BrainCircuit} />
                <MetricCard
                  title="Success rate"
                  value={`${summary.success_rate}%`}
                  icon={summary.success_rate >= 99 ? Zap : AlertTriangle}
                  trend={summary.error_count > 0 ? `${summary.error_count} errors` : undefined}
                  trendUp={false}
                />
                <MetricCard title="Total cost" value={`$${summary.estimated_cost_usd.toFixed(2)}`} icon={Coins} />
                <MetricCard title="Avg latency" value={`${summary.avg_latency_ms}ms`} icon={Activity} />
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TimeseriesChart data={timeseries} title="Usage & cost (30 days)" />
              </div>
              <OperationBreakdown data={operations} />
            </div>

            <TraceTable
              data={traces}
              page={tracePage}
              pageSize={TRACE_PAGE_SIZE}
              total={traceTotal}
              onPageChange={loadTraces}
              onRowClick={handleRowClick}
            />
          </div>
        )}
      </Container>

      <TraceDetail trace={selectedTrace} onClose={() => setSelectedTrace(null)} />
    </PageShell>
  );
}
