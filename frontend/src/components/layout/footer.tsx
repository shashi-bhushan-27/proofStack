import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              proof<span className="text-indigo-400">Stack</span>
            </span>
            <span className="ml-2 rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-500 text-center md:text-left">
            Evidence-Based AI Resume Intelligence Platform. Evaluating real candidate skill implementation depth.
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
            <Link href="/#how-it-works" className="hover:text-slate-200 transition-colors">
              How It Works
            </Link>
            <Link href="/login" className="hover:text-slate-200 transition-colors">
              Sign In
            </Link>
            <Link href="/analysis/new" className="hover:text-slate-200 transition-colors">
              New Analysis
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
