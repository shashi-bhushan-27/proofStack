import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx for conditional class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
 * Get color classes for evidence level badges.
 */
export function getEvidenceLevelColor(level: string): string {
  switch (level) {
    case "strong":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "moderate":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "weak":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "mentioned_only":
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    case "missing":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
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
 * Get color classes for importance badges.
 */
export function getImportanceColor(importance: string): string {
  switch (importance) {
    case "required":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    case "preferred":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "optional":
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

/**
 * Get color classes for recommendation priority.
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    case "high":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "medium":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "low":
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

/**
 * Get color for score value (0-100).
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  return "text-rose-400";
}

/**
 * Get background gradient for score value.
 */
export function getScoreGradient(score: number): string {
  if (score >= 80) return "from-emerald-500 to-emerald-600";
  if (score >= 60) return "from-blue-500 to-blue-600";
  if (score >= 40) return "from-amber-500 to-amber-600";
  return "from-rose-500 to-rose-600";
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
 * Get analysis status display info.
 */
export function getStatusInfo(status: string): {
  label: string;
  color: string;
  step: number;
} {
  const statuses: Record<string, { label: string; color: string; step: number }> = {
    pending: { label: "Starting...", color: "text-slate-400", step: 0 },
    extracting_resume: { label: "Extracting resume content", color: "text-blue-400", step: 1 },
    analyzing_requirements: { label: "Analyzing job requirements", color: "text-blue-400", step: 2 },
    matching_skills: { label: "Identifying candidate skills", color: "text-violet-400", step: 3 },
    finding_evidence: { label: "Finding supporting evidence", color: "text-violet-400", step: 4 },
    evaluating_strength: { label: "Evaluating evidence strength", color: "text-amber-400", step: 5 },
    generating_recommendations: { label: "Generating recommendations", color: "text-amber-400", step: 6 },
    completed: { label: "Analysis complete", color: "text-emerald-400", step: 7 },
    failed: { label: "Analysis failed", color: "text-rose-400", step: -1 },
  };
  return statuses[status] || { label: status, color: "text-slate-400", step: 0 };
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
