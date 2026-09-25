import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx for conditional class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Semantic color tone shared by badges, meters and status indicators.
 */
export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string to include time.
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format file size in bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Round a 0-100 score for display.
 */
export function formatScore(score: number | null | undefined): number {
  return Math.round(score ?? 0);
}

/**
 * Get the tone for an evidence level badge.
 */
export function getEvidenceLevelTone(level: string): Tone {
  switch (level) {
    case "strong":
      return "success";
    case "moderate":
      return "info";
    case "weak":
      return "warning";
    case "missing":
      return "danger";
    default:
      return "neutral";
  }
}

/**
 * Get human-readable label for evidence level.
 */
export function getEvidenceLevelLabel(level: string): string {
  switch (level) {
    case "strong":
      return "Strong";
    case "moderate":
      return "Moderate";
    case "weak":
      return "Weak";
    case "mentioned_only":
      return "Mentioned Only";
    case "missing":
      return "Missing";
    default:
      return level;
  }
}

/**
 * Get the tone for a job requirement importance badge.
 */
export function getImportanceTone(importance: string): Tone {
  return importance === "required" ? "primary" : "neutral";
}

/**
 * Get the tone for a recommendation priority badge.
 */
export function getPriorityTone(priority: string): Tone {
  switch (priority) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "neutral";
  }
}

/**
 * Get the tone for a score value (0-100).
 */
export function getScoreTone(score: number): Tone {
  if (score >= 80) return "success";
  if (score >= 60) return "info";
  if (score >= 40) return "warning";
  return "danger";
}

/**
 * Get a human-readable verdict based on score.
 */
export function getScoreVerdict(score: number): string {
  if (score >= 85) return "Excellent match with strong evidence";
  if (score >= 70) return "Strong fit with some areas to improve";
  if (score >= 55) return "Good foundation, needs evidence strengthening";
  if (score >= 40) return "Partial match, significant gaps to address";
  if (score >= 25) return "Weak match, major improvements needed";
  return "Poor fit for this role based on current resume";
}

/**
 * Ordered stages of the analysis pipeline, as reported by the backend status field.
 */
export const ANALYSIS_STAGES = [
  { status: "extracting_resume", label: "Extracting resume content" },
  { status: "analyzing_requirements", label: "Analyzing job requirements" },
  { status: "matching_skills", label: "Identifying candidate skills" },
  { status: "finding_evidence", label: "Finding supporting evidence" },
  { status: "evaluating_strength", label: "Evaluating evidence strength" },
  { status: "generating_recommendations", label: "Generating recommendations" },
] as const;

/**
 * Get analysis status display info.
 */
export function getStatusInfo(status: string): { label: string; step: number } {
  if (status === "pending") return { label: "Starting...", step: 0 };
  if (status === "completed") return { label: "Analysis complete", step: 7 };
  if (status === "failed") return { label: "Analysis failed", step: -1 };
  const index = ANALYSIS_STAGES.findIndex((stage) => stage.status === status);
  return index >= 0 ? { label: ANALYSIS_STAGES[index].label, step: index + 1 } : { label: status, step: 0 };
}

/**
 * Truncate text to a maximum length.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Calculate percentage with bounds.
 */
export function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Extract a user-facing message from an API error.
 * The axios interceptor in lib/api.ts rejects with `{ status, detail }`.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const e = error as { detail?: unknown; message?: unknown; response?: { data?: { detail?: unknown } } };
    if (typeof e.detail === "string" && e.detail) return e.detail;
    if (typeof e.response?.data?.detail === "string" && e.response.data.detail) return e.response.data.detail;
    if (typeof e.message === "string" && e.message) return e.message;
  }
  return fallback;
}

/**
 * HTTP status of an API error rejected by the axios interceptor, or 0 if unknown.
 */
export function getErrorStatus(error: unknown): number {
  if (error && typeof error === "object" && "status" in error && typeof error.status === "number") {
    return error.status;
  }
  return 0;
}
