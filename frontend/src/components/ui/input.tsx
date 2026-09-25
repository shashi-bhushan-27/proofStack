import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-lg border border-border-strong bg-surface text-sm text-fg shadow-xs transition-colors placeholder:text-fg-subtle hover:border-fg-subtle/60 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/40 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus-visible:outline-danger/30";

interface InputProps extends React.ComponentProps<"input"> {
  /** Decorative icon rendered inside the left edge of the field. */
  icon?: React.ReactNode;
}

export function Input({ className, icon, ...props }: InputProps) {
  if (!icon) {
    return <input className={cn(controlBase, "h-10 px-3", className)} {...props} />;
  }
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-fg-subtle [&_svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      <input className={cn(controlBase, "h-10 pl-9 pr-3", className)} {...props} />
    </div>
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(controlBase, "min-h-24 px-3 py-2.5 leading-relaxed", className)} {...props} />;
}
