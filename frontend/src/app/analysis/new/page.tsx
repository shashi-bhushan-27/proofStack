"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { resumeApi, analysisApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import { useBrowserValue } from "@/lib/hooks";
import { ANALYSIS_STAGES, cn, formatFileSize, getErrorMessage, getStatusInfo } from "@/lib/utils";
import { Container, PageShell } from "@/components/layout/page";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, fieldErrorId, fieldHintId } from "@/components/ui/field";
import { Progress, Skeleton } from "@/components/ui/feedback";
import { Input, Textarea } from "@/components/ui/input";

type Step = 1 | 2 | 3 | 4;

const WIZARD_STEPS: { step: Step; label: string }[] = [
  { step: 1, label: "Upload resume" },
  { step: 2, label: "Target job" },
  { step: 3, label: "Review" },
  { step: 4, label: "Analysis" },
];

const FREE_DAILY_LIMIT = 3;
const MIN_JD_LENGTH = 100;

function readGuestCount() {
  try {
    return localStorage.getItem("guest_analyses_count");
  } catch {
    return null;
  }
}

export default function NewAnalysisWizard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>(1);

  const storedGuestCount = useBrowserValue(readGuestCount, null);
  const [guestCountOverride, setGuestCountOverride] = useState<number | null>(null);
  const guestCount = guestCountOverride ?? parseInt(storedGuestCount || "0", 10);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  const isFreeLimitReached =
    (isAuthenticated && user?.subscription_tier === "free" && (user?.daily_analyses_count ?? 0) >= FREE_DAILY_LIMIT) ||
    (!isAuthenticated && guestCount >= FREE_DAILY_LIMIT);

  // Step 1 State: Resume upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Step 2 State: Job Description
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdError, setJdError] = useState<{ field: "jobTitle" | "jd"; message: string } | null>(null);

  // Step 3 & 4 State: Analysis creation & live polling
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Handle File Upload
  const handleFileUpload = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      setUploadError("Please upload a valid PDF file (.pdf)");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10 MB limit");
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
    setIsUploading(true);

    try {
      const res = await resumeApi.upload(selectedFile);
      setResumeId(res.data.id);
      setStep(2);
    } catch (err) {
      setUploadError(getErrorMessage(err, "Failed to upload resume. Please try again."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileUpload(dropped);
  };

  // Validate Step 2 and proceed to Step 3
  const handleProceedToReview = () => {
    if (!jobTitle.trim() || jobTitle.trim().length < 2) {
      setJdError({ field: "jobTitle", message: "Please enter a valid job title (at least 2 characters)." });
      return;
    }
    if (!jdText.trim() || jdText.trim().length < MIN_JD_LENGTH) {
      setJdError({ field: "jd", message: "Please paste a complete job description (at least 100 characters)." });
      return;
    }
    setJdError(null);
    setStep(3);
  };

  // Step 3: Create Analysis
  const handleStartAnalysis = async () => {
    if (!resumeId) return;
    setIsSubmitting(true);
    setAnalysisError(null);

    try {
      const res = await analysisApi.create({
        resume_id: resumeId,
        job_title: jobTitle.trim(),
        company_name: companyName.trim() || undefined,
        job_description_text: jdText.trim(),
      });

      const createdId = res.data.analysis.id;
      if (res.data.guest_token) {
        localStorage.setItem(`guest_token_${createdId}`, res.data.guest_token);
        const newCount = guestCount + 1;
        setGuestCountOverride(newCount);
        localStorage.setItem("guest_analyses_count", newCount.toString());
      } else if (isAuthenticated) {
        refreshUser();
      }
      setAnalysisId(createdId);
      setAnalysisStatus(res.data.analysis.status || "pending");
      setStep(4);
    } catch (err) {
      setAnalysisError(getErrorMessage(err, "Failed to start analysis. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Poll analysis status every 2 seconds until completed or failed
  useEffect(() => {
    if (step !== 4 || !analysisId) return;

    const token = localStorage.getItem(`guest_token_${analysisId}`);

    const interval = setInterval(async () => {
      try {
        const res = await analysisApi.get(analysisId, token || undefined);
        const currentStatus = res.data.status;
        setAnalysisStatus(currentStatus);

        if (currentStatus === "completed") {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/analysis/${analysisId}`);
          }, 1000);
        } else if (currentStatus === "failed") {
          clearInterval(interval);
          setAnalysisError("Analysis pipeline failed. Please ensure the resume text is legible and try again.");
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [step, analysisId, router]);

  const currentStepInfo = getStatusInfo(analysisStatus);
  const progressPercent = Math.round(((currentStepInfo.step + 1) / 8) * 100);
  const jdLength = jdText.trim().length;

  return (
    <PageShell>
      <Container size="narrow" className="py-10 sm:py-14">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">Check your resume fit</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-fg-muted sm:text-base">
            Upload your resume and paste your target job description to get your shortlist score and see which skills
            need stronger evidence.
          </p>
        </div>

        {!isAuthLoading && !isFreeLimitReached && (
          <QuotaNote
            isAuthenticated={isAuthenticated}
            tier={user?.subscription_tier}
            used={isAuthenticated ? (user?.daily_analyses_count ?? 0) : guestCount}
          />
        )}

        <Stepper current={step} />

        <div className="mt-8">
          {isAuthLoading ? (
            <Card className="p-6">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-3 h-4 w-72" />
              <Skeleton className="mt-6 h-48 w-full rounded-xl" />
            </Card>
          ) : isFreeLimitReached ? (
            <Card className="animate-fade-in px-6 py-10 text-center sm:px-10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-warning-soft text-warning">
                <Sparkles className="size-6" aria-hidden="true" />
              </div>
              <Badge tone="warning" className="mt-5">
                Daily limit reached ({FREE_DAILY_LIMIT}/{FREE_DAILY_LIMIT})
              </Badge>
              <h2 className="mt-3 text-xl font-semibold text-fg">You&apos;ve used all 3 free resume checks today</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
                Upgrade to Pro to unlock unlimited resume checks, deep STAR-bullet interview coaching, and priority
                evidence generation.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/billing" className={buttonVariants()}>
                  <Sparkles aria-hidden="true" />
                  Upgrade to Pro
                </Link>
                <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
                  View my past checks
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {/* STEP 1: Upload Resume */}
              {step === 1 && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Upload your resume</CardTitle>
                    <CardDescription>
                      We analyze your work history and project sections to check how strongly each skill is evidenced.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!isUploading) setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors focus-within:border-ring focus-within:bg-primary-soft/40",
                        isDragging ? "border-primary bg-primary-soft" : "border-border-strong bg-surface-2/50 hover:border-fg-subtle hover:bg-surface-2",
                        isUploading && "pointer-events-none"
                      )}
                    >
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                          e.target.value = "";
                        }}
                        disabled={isUploading}
                        aria-describedby="resume-upload-hint"
                      />
                      <span className="flex size-12 items-center justify-center rounded-full border border-border bg-surface text-primary-text shadow-xs">
                        {isUploading ? (
                          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
                        ) : (
                          <UploadCloud className="size-6" aria-hidden="true" />
                        )}
                      </span>
                      <span className="mt-4 text-sm font-medium text-fg">
                        {isUploading ? (
                          "Uploading & extracting text..."
                        ) : (
                          <>
                            <span className="text-primary-text">Click to upload</span> or drag and drop your resume
                          </>
                        )}
                      </span>
                      <span id="resume-upload-hint" className="mt-1 text-xs text-fg-subtle">
                        PDF only, up to 10 MB
                      </span>
                    </label>

                    {uploadError && <Alert className="mt-4">{uploadError}</Alert>}

                    {resumeId && file && !isUploading && (
                      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-success-border bg-success-soft p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText className="size-5 shrink-0 text-success" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-fg">{file.name}</p>
                            <p className="text-xs text-fg-muted">{formatFileSize(file.size)} · Text extracted and ready</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => setStep(2)}>
                          Continue
                          <ArrowRight aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* STEP 2: Job Description */}
              {step === 2 && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Target job details</CardTitle>
                    <CardDescription>
                      Paste the exact job description so our AI coach can match your experience to what recruiters are
                      looking for.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Job title"
                        htmlFor="job-title"
                        required
                        error={jdError?.field === "jobTitle" ? jdError.message : undefined}
                      >
                        <Input
                          id="job-title"
                          icon={<Briefcase />}
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g. Senior Python / ML Engineer"
                          aria-invalid={jdError?.field === "jobTitle" || undefined}
                          aria-describedby={jdError?.field === "jobTitle" ? fieldErrorId("job-title") : undefined}
                        />
                      </Field>
                      <Field label="Company name" htmlFor="company-name" optional>
                        <Input
                          id="company-name"
                          icon={<Building2 />}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. proofStack AI"
                        />
                      </Field>
                    </div>

                    <Field
                      label="Job description"
                      htmlFor="job-description"
                      required
                      error={jdError?.field === "jd" ? jdError.message : undefined}
                      hint={
                        <span className="flex justify-between gap-3">
                          <span>Include requirements, qualifications, and responsibilities.</span>
                          <span className={cn("shrink-0 tabular-nums", jdLength >= MIN_JD_LENGTH && "text-success")}>
                            {jdLength >= MIN_JD_LENGTH
                              ? `${jdText.length.toLocaleString()} characters`
                              : `${MIN_JD_LENGTH - jdLength} more characters needed`}
                          </span>
                        </span>
                      }
                    >
                      <Textarea
                        id="job-description"
                        rows={10}
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the full job description here..."
                        aria-invalid={jdError?.field === "jd" || undefined}
                        aria-describedby={jdError?.field === "jd" ? fieldErrorId("job-description") : fieldHintId("job-description")}
                      />
                    </Field>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ArrowLeft aria-hidden="true" />
                      Back
                    </Button>
                    <Button onClick={handleProceedToReview}>
                      Review summary
                      <ArrowRight aria-hidden="true" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* STEP 3: Review Input */}
              {step === 3 && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Review &amp; start</CardTitle>
                    <CardDescription>
                      Check your resume and target job details before launching the 7-stage AI review pipeline.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="divide-y divide-border rounded-lg border border-border text-sm">
                      <ReviewRow label="Resume" onEdit={() => setStep(1)} editLabel="Change resume" disabled={isSubmitting}>
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <FileText className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                          <span className="truncate">{file?.name || "Uploaded PDF"}</span>
                        </span>
                      </ReviewRow>
                      <ReviewRow label="Target role" onEdit={() => setStep(2)} editLabel="Edit job details" disabled={isSubmitting}>
                        {jobTitle}
                      </ReviewRow>
                      {companyName && <ReviewRow label="Company">{companyName}</ReviewRow>}
                      <div className="px-4 py-3">
                        <dt className="text-fg-muted">Job description</dt>
                        <dd className="mt-2 line-clamp-4 whitespace-pre-line rounded-md bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-fg-muted">
                          {jdText}
                        </dd>
                      </div>
                    </dl>

                    {analysisError && <Alert className="mt-4">{analysisError}</Alert>}
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button variant="ghost" onClick={() => setStep(2)} disabled={isSubmitting}>
                      <ArrowLeft aria-hidden="true" />
                      Edit job details
                    </Button>
                    <Button onClick={handleStartAnalysis} isLoading={isSubmitting} loadingText="Starting analysis...">
                      <Sparkles aria-hidden="true" />
                      Start AI resume check
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* STEP 4: Live Polling */}
              {step === 4 && (
                <Card className="animate-fade-in p-6 sm:p-10">
                  <div className="flex flex-col items-center text-center" aria-live="polite">
                    <span
                      className={cn(
                        "flex size-14 items-center justify-center rounded-full",
                        analysisStatus === "completed"
                          ? "bg-success-soft text-success"
                          : analysisStatus === "failed"
                            ? "bg-danger-soft text-danger"
                            : "bg-primary-soft text-primary-text"
                      )}
                    >
                      {analysisStatus === "completed" ? (
                        <CheckCircle2 className="size-7" aria-hidden="true" />
                      ) : analysisStatus === "failed" ? (
                        <AlertCircle className="size-7" aria-hidden="true" />
                      ) : (
                        <Loader2 className="size-7 animate-spin" aria-hidden="true" />
                      )}
                    </span>
                    <h2 className="mt-5 text-xl font-semibold text-fg">
                      {analysisStatus === "completed"
                        ? "Evaluation complete! Redirecting..."
                        : analysisStatus === "failed"
                          ? "Analysis failed"
                          : "Analyzing your resume evidence"}
                    </h2>
                    <p className="mt-1.5 text-sm text-fg-muted">{currentStepInfo.label}</p>
                  </div>

                  {analysisStatus !== "failed" && (
                    <div className="mx-auto mt-8 max-w-md">
                      <div className="mb-2 flex justify-between text-xs text-fg-subtle">
                        <span>Stage {Math.max(1, currentStepInfo.step)} of 7</span>
                        <span className="tabular-nums">{currentStepInfo.step >= 7 ? "100%" : `${progressPercent}%`}</span>
                      </div>
                      <Progress value={currentStepInfo.step >= 7 ? 100 : progressPercent} label="Analysis progress" />

                      <ol className="mt-6 space-y-3">
                        {ANALYSIS_STAGES.map((stage, index) => {
                          const stageNumber = index + 1;
                          const isDone = currentStepInfo.step > stageNumber;
                          const isActive = currentStepInfo.step === stageNumber;
                          return (
                            <li key={stage.status} className="flex items-center gap-3 text-sm">
                              <span
                                className={cn(
                                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                                  isDone && "border-success-solid bg-success-solid text-white",
                                  isActive && "border-primary text-primary-text",
                                  !isDone && !isActive && "border-border-strong"
                                )}
                                aria-hidden="true"
                              >
                                {isDone ? (
                                  <Check className="size-3" strokeWidth={3} />
                                ) : isActive ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : null}
                              </span>
                              <span className={cn(isDone ? "text-fg-muted" : isActive ? "font-medium text-fg" : "text-fg-subtle")}>
                                {stage.label}
                              </span>
                              <span className="sr-only">{isDone ? "(done)" : isActive ? "(in progress)" : "(pending)"}</span>
                            </li>
                          );
                        })}
                      </ol>
                      <p className="mt-6 text-center text-xs text-fg-subtle">
                        You&apos;ll be taken to your report automatically when it&apos;s ready.
                      </p>
                    </div>
                  )}

                  {analysisError && (
                    <div className="mx-auto mt-6 max-w-md">
                      <Alert>{analysisError}</Alert>
                      <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setAnalysisError(null);
                            setStep(3);
                          }}
                        >
                          <ArrowLeft aria-hidden="true" />
                          Back to review
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setAnalysisError(null);
                            setStep(1);
                          }}
                        >
                          Upload a different resume
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </Container>
    </PageShell>
  );
}

function Stepper({ current }: { current: Step }) {
  return (
    <nav aria-label="Evaluation progress" className="mt-8">
      <ol className="flex items-center">
        {WIZARD_STEPS.map((item, index) => {
          const isComplete = current > item.step;
          const isCurrent = current === item.step;
          return (
            <li key={item.step} className={cn("flex items-center", index < WIZARD_STEPS.length - 1 && "flex-1")}>
              <span className="flex items-center gap-2" aria-current={isCurrent ? "step" : undefined}>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary-soft text-primary-text",
                    !isComplete && !isCurrent && "border-border-strong bg-surface text-fg-subtle"
                  )}
                >
                  {isComplete ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : item.step}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isCurrent ? "font-medium text-fg" : "hidden text-fg-muted sm:inline",
                  )}
                >
                  {item.label}
                  {isComplete && <span className="sr-only"> (completed)</span>}
                </span>
              </span>
              {index < WIZARD_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("mx-3 h-px flex-1 transition-colors", isComplete ? "bg-primary" : "bg-border")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function QuotaNote({ isAuthenticated, tier, used }: { isAuthenticated: boolean; tier?: string; used: number }) {
  if (isAuthenticated && tier === "pro") {
    return (
      <p className="mt-4 text-center text-sm text-fg-subtle">
        <Badge tone="primary">Pro plan</Badge> <span className="ml-1">Unlimited resume checks</span>
      </p>
    );
  }
  if (isAuthenticated && tier !== "free") return null;

  const remaining = Math.max(0, FREE_DAILY_LIMIT - used);
  return (
    <p className="mt-4 text-center text-sm text-fg-subtle">
      {remaining} of {FREE_DAILY_LIMIT} free checks left today
      {!isAuthenticated && (
        <>
          {" · "}
          <Link href="/login?redirect=%2Fanalysis%2Fnew" className="font-medium text-primary-text hover:underline">
            Sign in
          </Link>{" "}
          to save reports to your dashboard
        </>
      )}
    </p>
  );
}

interface ReviewRowProps {
  label: string;
  onEdit?: () => void;
  editLabel?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ReviewRow({ label, onEdit, editLabel, disabled, children }: ReviewRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-fg-muted">{label}</dt>
        <dd className="mt-0.5 truncate font-medium text-fg">{children}</dd>
      </div>
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled} aria-label={editLabel}>
          Edit
        </Button>
      )}
    </div>
  );
}
