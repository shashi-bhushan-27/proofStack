"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Loader2, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { analysisApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import type { Analysis } from "@/types";
import { formatDate, formatScore, getErrorMessage, getScoreVerdict, getStatusInfo } from "@/lib/utils";
import { Container, PageHeader, PageShell } from "@/components/layout/page";
import { ScoreRing } from "@/components/analysis/score-ring";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState, Progress, Skeleton } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast";

const FREE_DAILY_LIMIT = 3;

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Analysis | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    async function fetchAnalyses() {
      if (!isAuthenticated) return;
      try {
        const res = await analysisApi.list();
        setAnalyses(res.data.items || []);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load evaluation history"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalyses();
  }, [isAuthenticated, reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await analysisApi.delete(pendingDelete.id);
      setAnalyses((prev) => prev.filter((a) => a.id !== pendingDelete.id));
      toast({ title: "Evaluation deleted", tone: "success" });
    } catch {
      toast({ title: "Failed to delete analysis", description: "Please try again in a moment.", tone: "danger" });
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  const completedScores = analyses
    .filter((a) => a.status === "completed" && a.overall_score !== null)
    .map((a) => a.overall_score as number);
  const averageScore = completedScores.length
    ? Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
    : null;
  const isPro = user?.subscription_tier === "pro";
  const usedToday = user?.daily_analyses_count ?? 0;

  const showSkeleton = isAuthLoading || isLoading;

  return (
    <PageShell>
      <Container className="py-10 sm:py-12">
        <PageHeader
          title="Dashboard"
          description="Track your candidate fit scores across applications and revisit past evaluations and AI interviews."
          actions={
            <Link href="/analysis/new" className={buttonVariants()}>
              <Plus aria-hidden="true" />
              New evaluation
            </Link>
          }
        />

        {/* Summary */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Evaluations" loading={showSkeleton}>
            {analyses.length}
          </StatCard>
          <StatCard label="Average fit score" loading={showSkeleton}>
            {averageScore !== null ? (
              <>
                {averageScore}
                <span className="ml-1 text-sm font-normal text-fg-subtle">/ 100</span>
              </>
            ) : (
              <span className="text-fg-subtle">—</span>
            )}
          </StatCard>
          <StatCard
            label="Today's checks"
            loading={isAuthLoading}
            aside={
              isPro ? (
                <Badge tone="primary">Pro plan</Badge>
              ) : (
                <Link href="/billing" className="text-xs font-medium text-primary-text hover:underline">
                  Upgrade
                </Link>
              )
            }
            footer={
              !isPro && (
                <Progress
                  value={(usedToday / FREE_DAILY_LIMIT) * 100}
                  tone={usedToday >= FREE_DAILY_LIMIT ? "danger" : "primary"}
                  label="Free checks used today"
                  className="mt-3"
                />
              )
            }
          >
            {isPro ? (
              "Unlimited"
            ) : (
              <>
                {usedToday}
                <span className="ml-1 text-sm font-normal text-fg-subtle">/ {FREE_DAILY_LIMIT} free</span>
              </>
            )}
          </StatCard>
        </div>

        {/* History */}
        <section className="mt-10" aria-labelledby="history-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="history-heading" className="text-base font-semibold text-fg">
              Evaluation history
            </h2>
            {!showSkeleton && analyses.length > 0 && (
              <span className="text-sm text-fg-subtle">
                {analyses.length} {analyses.length === 1 ? "report" : "reports"}
              </span>
            )}
          </div>

          {showSkeleton ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading evaluations">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="mt-5 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert
              title="We couldn't load your evaluations"
              action={
                <Button variant="secondary" size="sm" onClick={handleRetry}>
                  <RefreshCw aria-hidden="true" />
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          ) : analyses.length === 0 ? (
            <Card>
              <EmptyState
                icon={<FileText />}
                title="No evaluation reports yet"
                description="Run your first evidence evaluation against any target job description to verify your skill depth and unlock AI recommendations."
                action={
                  <Link href="/analysis/new" className={buttonVariants()}>
                    <Sparkles aria-hidden="true" />
                    Start first analysis
                  </Link>
                }
              />
            </Card>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {analyses.map((item) => (
                <AnalysisCard key={item.id} analysis={item} onDelete={() => setPendingDelete(item)} />
              ))}
            </ul>
          )}
        </section>
      </Container>

      <ConfirmDialog
        open={pendingDelete !== null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        tone="danger"
        title="Delete this evaluation report?"
        description={
          <>
            <strong className="font-medium text-fg">{pendingDelete?.job_title || "Target Role Evaluation"}</strong> will be
            permanently removed, including its evidence matrix and recommendations.
          </>
        }
        confirmLabel="Delete report"
      />
    </PageShell>
  );
}

interface StatCardProps {
  label: string;
  loading: boolean;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

function StatCard({ label, loading, aside, footer, children }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-fg-muted">{label}</p>
        {!loading && aside}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-fg">{children}</p>
          {footer}
        </>
      )}
    </Card>
  );
}

function AnalysisCard({ analysis, onDelete }: { analysis: Analysis; onDelete: () => void }) {
  const title = analysis.job_title || "Target Role Evaluation";
  const score = formatScore(analysis.overall_score);
  const isCompleted = analysis.status === "completed";
  const isFailed = analysis.status === "failed";

  return (
    <li className="relative">
      <Link
        href={`/analysis/${analysis.id}`}
        className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-xs transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-md"
      >
        <div className="flex items-start gap-4 pr-8">
          {isCompleted ? (
            <ScoreRing score={score} />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-fg-subtle">
              {isFailed ? <FileText className="size-5" aria-hidden="true" /> : <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-semibold text-fg">{title}</h3>
            <p className="mt-1 text-xs text-fg-subtle">{formatDate(analysis.created_at)}</p>
          </div>
        </div>

        <div className="mt-4 flex-1">
          {isCompleted ? (
            <p className="text-sm text-fg-muted">{getScoreVerdict(analysis.overall_score || 0)}</p>
          ) : isFailed ? (
            <Badge tone="danger">Analysis failed</Badge>
          ) : (
            <Badge tone="info">{getStatusInfo(analysis.status).label}</Badge>
          )}
        </div>

        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary-text">
          View report
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        className="absolute right-3 top-3 hover:bg-danger-soft hover:text-danger"
        aria-label={`Delete evaluation: ${title}`}
        title="Delete report"
      >
        <Trash2 />
      </Button>
    </li>
  );
}
