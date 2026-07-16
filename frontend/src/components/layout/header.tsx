"use client";

import Link from "next/link";
import { useAuth } from "@/providers/providers";
import { ShieldCheck, LogOut, LayoutDashboard, Sparkles } from "lucide-react";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            proof<span className="text-indigo-400">Stack</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/#evidence-dimensions" className="hover:text-white transition-colors">
            Shortlist Criteria
          </Link>
          <Link href="/billing" className="hover:text-white transition-colors flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Pricing & Billing
          </Link>
          {(isAuthenticated || (isLoading && user)) && (
            <Link href="/dashboard" className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-3 animate-pulse py-1">
              <div className="h-6 w-20 rounded-full bg-slate-800/60 hidden sm:block" />
              <div className="h-8 w-24 rounded-lg bg-slate-800/60" />
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/billing"
                className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  user?.subscription_tier === "pro"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/50 shadow-sm shadow-cyan-500/20"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600"
                }`}
              >
                {user?.subscription_tier === "pro" ? "⚡ Pro Plan" : "Free Plan"}
              </Link>
              <span className="hidden sm:inline-block text-xs text-slate-400">
                Hi, <strong className="text-slate-200">{user?.full_name || "Candidate"}</strong>
              </span>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/analysis/new"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Check Resume Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
