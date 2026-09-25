"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { analysisApi, interrogationApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import type {
  AnalysisReport,
  EvidenceLevel,
  InterrogationSession,
  ReportJobRequirement,
  ReportRecommendation,
  ReportSkillEvidence,
} from "@/types";
import {
  cn,
  formatDate,
  formatScore,
  getErrorMessage,
  getErrorStatus,
  getEvidenceLevelLabel,
  getEvidenceLevelTone,
  getImportanceTone,
  getPriorityTone,
  getScoreTone,
  getScoreVerdict,
  getStatusInfo,
  type Tone,
} from "@/lib/utils";
import { Container, PageShell } from "@/components/layout/page";
import { InterviewPanel } from "@/components/analysis/interview-panel";
import { ScoreRing } from "@/components/analysis/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState, Progress, Skeleton } from "@/components/ui/feedback";

type LevelFilter = "all" | EvidenceLevel;

const LEVEL_ORDER: EvidenceLevel[] = ["strong", "moderate", "weak", "mentioned_only", "missing"];

const levelDot: Record<Tone, string> = {
  neutral: "bg-neutral-solid",
  primary: "bg-primary",
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  info: "bg-info-solid",
};

const PRIORITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const UNKNOWN_REQUIREMENT: Pick<ReportJobRequirement, "skill_name" | "importance" | "category"> = {
  skill_name: "Unknown Skill",
  importance: "optional",
  category: "tool",
};

export default function AnalysisReportPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status: number } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Selected skill evidence item for inspection & interrogation
  const [selectedSkill, setSelectedSkill] = useState<ReportSkillEvidence | null>(null);
  const [filterLevel, setFilterLevel] = useState<LevelFilter>("all");
  const detailRef = useRef<HTMLDivElement>(null);

  // Interrogation Chat State
  const [interrogationSession, setInterrogationSession] = useState<InterrogationSession | null>(null);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Fetch full analysis detail
  useEffect(() => {
    async function fetchDetail() {
      try {
        const token = localStorage.getItem(`guest_token_${analysisId}`);
        const res = await analysisApi.get(analysisId, token || undefined);
        setAnalysis(res.data);
        setError(null);
        if (res.data.skill_evidences && res.data.skill_evidences.length > 0) {
          setSelectedSkill(res.data.skill_evidences[0]);
        }
      } catch (err) {
        setError({ message: getErrorMessage(err, "Could not load analysis report."), status: getErrorStatus(err) });
      } finally {
        setIsLoading(false);
      }
    }
    if (analysisId) fetchDetail();
  }, [analysisId, reloadKey]);

  const reload = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const selectSkill = (skill: ReportSkillEvidence) => {
    setSelectedSkill(skill);
    setInterrogationSession(null);
    setChatError(null);
    // On stacked (mobile/tablet) layouts, bring the detail panel into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  // Start Interrogation for selected skill
  const handleStartInterrogation = async (evidenceId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/analysis/${analysisId}`)}`);
      return;
    }
    setIsStartingChat(true);
    setChatError(null);
    try {
      const res = await interrogationApi.start(analysisId, { skill_evidence_id: evidenceId });
      setInterrogationSession(res.data);
    } catch (err) {
      setChatError(getErrorMessage(err, "Could not start AI interrogation session."));
    } finally {
      setIsStartingChat(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !interrogationSession) return false;
    setIsSendingMsg(true);
    setChatError(null);

    let delivered = false;
    try {
      await interrogationApi.sendMessage(interrogationSession.id, { content: textToSend });
      delivered = true;
      // Reload session
      const res = await interrogationApi.getSession(interrogationSession.id);
      setInterrogationSession(res.data);
    } catch (err) {
      setChatError(getErrorMessage(err, "Failed to send message."));
    } finally {
      setIsSendingMsg(false);
    }
    return delivered;
  };

  if (isLoading) {
    return (
      <PageShell>
        <ReportSkeleton />
      </PageShell>
    );
  }

  if (error || !analysis) {
    const status = error?.status ?? 0;
    return (
      <PageShell>
        <Container size="narrow" className="py-16">
          <Card>
            <EmptyState
              headingLevel="h1"
              icon={<XCircle />}
              title={
                status === 401
                  ? "Sign in to view this report"
                  : status === 404
                    ? "Report not found"
                    : "We couldn't load this report"
              }
              description={
                status === 401
                  ? "This evaluation belongs to an account. Sign in with that account to open it."
                  : error?.message
              }
              action={
                status === 401 ? (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/analysis/${analysisId}`)}`}
                    className={buttonVariants()}
                  >
                    Sign in
                  </Link>
                ) : (
                  <>
                    {status !== 404 && (
                      <Button onClick={reload}>
                        <RefreshCw aria-hidden="true" />
                        Try again
                      </Button>
                    )}
                    <Link
                      href={isAuthenticated ? "/dashboard" : "/analysis/new"}
                      className={buttonVariants({ variant: "secondary" })}
                    >
                      {isAuthenticated ? "Back to dashboard" : "Start a new evaluation"}
                    </Link>
                  </>
                )
              }
            />
          </Card>
        </Container>
      </PageShell>
    );
  }

  if (analysis.status !== "completed") {
    const failed = analysis.status === "failed";
    return (
      <PageShell>
        <Container size="narrow" className="py-16">
          <Card>
            <EmptyState
              headingLevel="h1"
              icon={failed ? <XCircle /> : <Loader2 className="animate-spin" />}
              title={failed ? "This evaluation couldn't be completed" : "Your evaluation is still running"}
              description={
                failed
                  ? "The analysis pipeline failed. Please ensure the resume text is legible and try a new evaluation."
                  : `${getStatusInfo(analysis.status).label}. Check back in a moment.`
              }
              action={
                failed ? (
                  <Link href="/analysis/new" className={buttonVariants()}>
                    <Plus aria-hidden="true" />
                    New evaluation
                  </Link>
                ) : (
                  <Button onClick={reload}>
                    <RefreshCw aria-hidden="true" />
                    Refresh status
                  </Button>
                )
              }
            />
          </Card>
        </Container>
      </PageShell>
    );
  }

  const skillEvidences = analysis.skill_evidences || [];
  const requirements = analysis.job_requirements || [];

  // Helper to get requirement name
  const getReqInfo = (reqId: string) => requirements.find((r) => r.id === reqId) || UNKNOWN_REQUIREMENT;

  // Filter skills
  const filteredSkills = skillEvidences.filter((se) => (filterLevel === "all" ? true : se.evidence_level === filterLevel));

  const levelCounts = LEVEL_ORDER.map((level) => ({
    level,
    count: skillEvidences.filter((se) => se.evidence_level === level).length,
  }));

  const overall = formatScore(analysis.overall_score);
  const subScores = [
    { label: "Required skill coverage", value: analysis.required_coverage_score },
    { label: "Evidence strength", value: analysis.evidence_strength_score },
    { label: "Preferred skill coverage", value: analysis.preferred_coverage_score },
    { label: "Experience relevance", value: analysis.experience_relevance_score },
    { label: "Resume communication", value: analysis.communication_score },
    { label: "Supported claims ratio", value: analysis.unsupported_claims_score },
  ].filter((sub): sub is { label: string; value: number } => typeof sub.value === "number");

  const breakdown = analysis.scoring_breakdown;
  const recommendations = [...(analysis.recommendations || [])].sort(
    (a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9)
  );

  return (
    <PageShell>
      <Container size="wide" className="py-8 sm:py-10">
        {isAuthenticated && (
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        )}

        {/* Report header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary-text">Evidence report · {formatDate(analysis.created_at)}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              {analysis.job_title || "Resume fit evaluation"}
            </h1>
            <p className="mt-2 text-sm text-fg-muted">
              Candidate evidence evaluated against {requirements.length} extracted job competencies.
            </p>
          </div>
          <Link href="/analysis/new" className={buttonVariants({ variant: "secondary" })}>
            <Plus aria-hidden="true" />
            New evaluation
          </Link>
        </div>

        {/* Score overview */}
        <Card className="mt-8 grid gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex items-center gap-5 md:flex-col md:gap-3 md:px-4 md:text-center">
            <ScoreRing score={overall} size={128} strokeWidth={10} showMax label="Overall fit score" />
            <div className="md:max-w-44">
              <p className="text-sm font-medium text-fg-muted">Overall fit score</p>
              <p className="mt-1 text-sm font-semibold text-fg">{getScoreVerdict(analysis.overall_score || 0)}</p>
            </div>
          </div>

          <div className="md:border-l md:border-border md:pl-8">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {subScores.map((sub) => {
                const value = formatScore(sub.value);
                return (
                  <div key={sub.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-sm text-fg-muted">{sub.label}</dt>
                      <dd className="text-sm font-semibold tabular-nums text-fg">{value}%</dd>
                    </div>
                    <Progress value={value} tone={getScoreTone(value)} label={sub.label} className="mt-2" />
                  </div>
                );
              })}
            </dl>
            {breakdown && typeof breakdown.total_required_skills === "number" && (
              <p className="mt-6 border-t border-border pt-4 text-sm text-fg-muted">
                <span className="font-medium text-fg">
                  {breakdown.covered_required_skills ?? 0} of {breakdown.total_required_skills}
                </span>{" "}
                required skills covered
                {typeof breakdown.total_preferred_skills === "number" && breakdown.total_preferred_skills > 0 && (
                  <>
                    {" · "}
                    <span className="font-medium text-fg">
                      {breakdown.covered_preferred_skills ?? 0} of {breakdown.total_preferred_skills}
                    </span>{" "}
                    preferred
                  </>
                )}
              </p>
            )}
          </div>
        </Card>

        {/* Skill evidence */}
        <section className="mt-12" aria-labelledby="evidence-heading">
          <div className="flex flex-col gap-1">
            <h2 id="evidence-heading" className="text-lg font-semibold text-fg">
              Skill evidence matrix
            </h2>
            <p className="text-sm text-fg-muted">
              How strongly your resume proves each skill the job asks for. Select a skill to see why.
            </p>
          </div>

          {skillEvidences.length > 0 && (
            <div className="mt-5 flex h-2 w-full overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
              {levelCounts
                .filter((entry) => entry.count > 0)
                .map((entry) => (
                  <div
                    key={entry.level}
                    className={levelDot[getEvidenceLevelTone(entry.level)]}
                    style={{ width: `${(entry.count / skillEvidences.length) * 100}%` }}
                  />
                ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter skills by evidence level">
            <FilterChip active={filterLevel === "all"} onClick={() => setFilterLevel("all")}>
              All <span className="text-fg-subtle">{skillEvidences.length}</span>
            </FilterChip>
            {levelCounts.map((entry) => (
              <FilterChip
                key={entry.level}
                active={filterLevel === entry.level}
                onClick={() => setFilterLevel(entry.level)}
                disabled={entry.count === 0}
              >
                <span className={cn("size-2 rounded-full", levelDot[getEvidenceLevelTone(entry.level)])} aria-hidden="true" />
                {getEvidenceLevelLabel(entry.level)} <span className="text-fg-subtle">{entry.count}</span>
              </FilterChip>
            ))}
          </div>

          <div className="mt-5 grid items-start gap-6 lg:grid-cols-12">
            {/* Skill list */}
            <Card className="overflow-hidden lg:col-span-7">
              {filteredSkills.length === 0 ? (
                <EmptyState
                  icon={<FileSearch />}
                  title="No skills match this filter"
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setFilterLevel("all")}>
                      Show all skills
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y divide-border">
                  {filteredSkills.map((se) => {
                    const req = getReqInfo(se.job_requirement_id);
                    const isSelected = selectedSkill?.id === se.id;
                    const tone = getEvidenceLevelTone(se.evidence_level);
                    return (
                      <li key={se.id}>
                        <button
                          type="button"
                          onClick={() => selectSkill(se)}
                          aria-pressed={isSelected}
                          className={cn(
                            "relative flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:px-5",
                            isSelected ? "bg-primary-soft/70" : "hover:bg-surface-2"
                          )}
                        >
                          {isSelected && <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" aria-hidden="true" />}
                          <span className={cn("size-2 shrink-0 rounded-full", levelDot[tone])} aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-fg">{req.skill_name}</span>
                              <Badge tone={getImportanceTone(req.importance)} size="sm" className="capitalize">
                                {req.importance}
                              </Badge>
                            </span>
                            <span className="mt-0.5 line-clamp-1 text-xs text-fg-muted">{se.classification_explanation}</span>
                          </span>
                          <Badge tone={tone} className="hidden sm:inline-flex">
                            {getEvidenceLevelLabel(se.evidence_level)}
                          </Badge>
                          <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Skill detail */}
            <div ref={detailRef} className="scroll-mt-20 lg:sticky lg:top-20 lg:col-span-5">
              {selectedSkill ? (
                <SkillDetail
                  skill={selectedSkill}
                  requirement={getReqInfo(selectedSkill.job_requirement_id)}
                >
                  <InterviewPanel
                    key={selectedSkill.id}
                    session={interrogationSession}
                    isAuthenticated={isAuthenticated}
                    isStarting={isStartingChat}
                    isSending={isSendingMsg}
                    error={chatError}
                    onStart={() => handleStartInterrogation(selectedSkill.id)}
                    onSend={handleSendMessage}
                  />
                </SkillDetail>
              ) : (
                <Card>
                  <EmptyState
                    icon={<FileSearch />}
                    title="Select a skill"
                    description="Pick any skill from the matrix to inspect its exact evidence dimensions."
                  />
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-12" aria-labelledby="recommendations-heading">
            <div className="flex flex-col gap-1">
              <h2 id="recommendations-heading" className="flex items-center gap-2 text-lg font-semibold text-fg">
                <Lightbulb className="size-5 text-warning" aria-hidden="true" />
                Actionable improvements
              </h2>
              <p className="text-sm text-fg-muted">Ordered by priority. Start at the top for the biggest gains.</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {recommendations.map((rec) => {
                const related = rec.skill_evidence_id
                  ? skillEvidences.find((se) => se.id === rec.skill_evidence_id)
                  : undefined;
                return (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    relatedSkillName={related ? getReqInfo(related.job_requirement_id).skill_name : undefined}
                    onViewSkill={
                      related
                        ? () => {
                            setFilterLevel("all");
                            selectSkill(related);
                            document.getElementById("evidence-heading")?.scrollIntoView({ behavior: "smooth" });
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </section>
        )}
      </Container>
    </PageShell>
  );
}

function FilterChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-fg bg-fg text-bg [&_.text-fg-subtle]:text-bg/70"
          : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg"
      )}
    >
      {children}
    </button>
  );
}

const DIMENSIONS: { key: keyof ReportSkillEvidence; label: string }[] = [
  { key: "action_demonstrated", label: "Action demonstrated" },
  { key: "technical_context", label: "Technical context" },
  { key: "implementation_depth", label: "Implementation depth" },
  { key: "ownership_clarity", label: "Ownership clarity" },
  { key: "outcome_described", label: "Outcome described" },
  { key: "measurability", label: "Measurability" },
];

function SkillDetail({
  skill,
  requirement,
  children,
}: {
  skill: ReportSkillEvidence;
  requirement: Pick<ReportJobRequirement, "skill_name" | "importance" | "category">;
  children: React.ReactNode;
}) {
  const passed = DIMENSIONS.filter((d) => skill[d.key] === true).length;
  return (
    <Card className="animate-fade-in">
      <div className="border-b border-border p-5 sm:p-6">
        <p className="text-xs font-medium text-fg-subtle">Inspecting skill</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-fg">{requirement.skill_name}</h3>
          <Badge tone={getEvidenceLevelTone(skill.evidence_level)}>
            {getEvidenceLevelLabel(skill.evidence_level)} · {skill.score} pts
          </Badge>
        </div>
        <Badge tone={getImportanceTone(requirement.importance)} size="sm" className="mt-2 capitalize">
          {requirement.importance}
        </Badge>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-semibold text-fg">6-dimension verification</h4>
            <span className="text-xs tabular-nums text-fg-subtle">{passed} of 6 passed</span>
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DIMENSIONS.map((dimension) => {
              const pass = skill[dimension.key] === true;
              return (
                <li
                  key={dimension.key}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs",
                    pass ? "border-success-border bg-success-soft text-fg" : "border-border bg-surface-2/60 text-fg-subtle"
                  )}
                >
                  {pass ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <XCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className="font-medium">{dimension.label}</span>
                  <span className="sr-only">{pass ? "passed" : "not shown"}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {skill.supporting_text && (
          <div>
            <h4 className="text-sm font-semibold text-fg">Best supporting resume snippet</h4>
            <blockquote className="mt-2 border-l-2 border-primary-soft-border pl-3 text-sm italic leading-relaxed text-fg-muted">
              &ldquo;{skill.supporting_text}&rdquo;
            </blockquote>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-fg">Why this rating?</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{skill.classification_explanation}</p>
        </div>

        {children}
      </div>
    </Card>
  );
}

function RecommendationCard({
  recommendation: rec,
  relatedSkillName,
  onViewSkill,
}: {
  recommendation: ReportRecommendation;
  relatedSkillName?: string;
  onViewSkill?: () => void;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={getPriorityTone(rec.priority)} className="capitalize">
          {rec.priority} priority
        </Badge>
        {rec.category && <span className="text-xs text-fg-subtle">{rec.category}</span>}
      </div>
      <h3 className="mt-3 font-semibold text-fg">{rec.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{rec.description}</p>

      {rec.example_text && (
        <div className="mt-4 rounded-lg border border-border bg-surface-2/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-fg-subtle">Illustrative STAR example</p>
            <CopyButton text={rec.example_text} variant="ghost" />
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-fg">{rec.example_text}</p>
        </div>
      )}

      {relatedSkillName && onViewSkill && (
        <button
          type="button"
          onClick={onViewSkill}
          className="mt-4 inline-flex items-center gap-1 self-start text-xs font-medium text-primary-text hover:underline"
        >
          View {relatedSkillName} evidence
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </Card>
  );
}

function ReportSkeleton() {
  return (
    <Container size="wide" className="py-8 sm:py-10" aria-busy="true" aria-label="Loading report">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-3 h-8 w-80 max-w-full" />
      <Skeleton className="mt-3 h-4 w-64" />
      <Card className="mt-8 flex flex-col gap-8 p-6 sm:p-8 md:flex-row">
        <Skeleton className="size-32 shrink-0 rounded-full" />
        <div className="grid flex-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-1.5 w-full" />
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <Card className="space-y-4 p-5 lg:col-span-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
        <Card className="space-y-4 p-5 lg:col-span-5">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>
    </Container>
  );
}
