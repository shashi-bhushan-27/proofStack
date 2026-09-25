import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Logo({ href = "/", className, size = "md" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 rounded-lg font-semibold tracking-tight text-fg", className)}
      aria-label="proofStack home"
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
          size === "sm" ? "size-7" : "size-8"
        )}
      >
        <ShieldCheck className={size === "sm" ? "size-4" : "size-[18px]"} aria-hidden="true" />
      </span>
      <span className={size === "sm" ? "text-base" : "text-lg"}>
        proof<span className="text-primary-text">Stack</span>
      </span>
    </Link>
  );
}
