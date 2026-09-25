import { cn, getScoreTone, type Tone } from "@/lib/utils";

const toneStroke: Record<Tone, string> = {
  neutral: "var(--neutral-solid)",
  primary: "var(--primary)",
  success: "var(--success-solid)",
  warning: "var(--warning-solid)",
  danger: "var(--danger-solid)",
  info: "var(--info-solid)",
};

interface ScoreRingProps {
  /** Rounded 0-100 score. */
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Show "/100" under the number (large rings only). */
  showMax?: boolean;
  className?: string;
}

export function ScoreRing({ score, size = 48, strokeWidth = 4, label = "Fit score", showMax = false, className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      role="img"
      aria-label={`${label}: ${clamped} out of 100`}
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneStroke[getScoreTone(clamped)]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none" aria-hidden="true">
        <span className="font-semibold tabular-nums text-fg" style={{ fontSize: Math.round(size * 0.3) }}>
          {clamped}
        </span>
        {showMax && <span className="mt-1 text-xs text-fg-subtle">/ 100</span>}
      </span>
    </div>
  );
}
