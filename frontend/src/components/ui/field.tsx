import { cn } from "@/lib/utils";

interface FieldProps {
  label: React.ReactNode;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Extra content aligned to the right of the label (e.g. a "Forgot password" link). */
  labelAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label + control + hint/error wrapper. Pair the control's `aria-describedby`
 * with `fieldHintId(htmlFor)` / `fieldErrorId(htmlFor)` for screen readers.
 */
export function Field({ label, htmlFor, required, optional, hint, error, labelAction, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
          {optional && <span className="ml-1.5 font-normal text-fg-subtle">(optional)</span>}
        </label>
        {labelAction}
      </div>
      {children}
      {error ? (
        <p id={fieldErrorId(htmlFor)} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={fieldHintId(htmlFor)} className="text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const fieldHintId = (id: string) => `${id}-hint`;
export const fieldErrorId = (id: string) => `${id}-error`;
