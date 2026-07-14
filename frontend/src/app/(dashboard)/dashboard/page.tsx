"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { analysisApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import { getScoreColor, getScoreVerdict, formatDate } from "@/lib/utils";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  FileText,
  Trash2,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    async function fetchAnalyses() {
      if (!isAuthenticated) return;
      try {
        const res = await analysisApi.list();
        setAnalyses(res.data.items || []);
      } catch (err: any) {
        setError(err?.detail || "Could not load evaluation history");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalyses();
  }, [isAuthenticated]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this evaluation report?")) return;
    try {
      await analysisApi.delete(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete analysis");
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#020617] text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-white">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Evaluation Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track your candidate fit scores across applications and review past AI interrogations.
            </p>
          </div>

          <Link
            href="/analysis/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all"
          >
            <PlusCircle className="h-4 w-4" /> New Evaluation
          </Link>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {analyses.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center max-w-lg mx-auto my-12">
            <TrendingUp className="h-12 w-12 text-indigo-400 mx-auto mb-4 opacity-75" />
            <h3 className="text-lg font-bold text-white">No evaluation reports yet</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Run your first evidence evaluation against any target job description to verify your skill depth and unlock AI recommendations.
            </p>
            <div className="mt-6">
              <Link
                href="/analysis/new"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Sparkles className="h-4 w-4" /> Start First Analysis
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/analysis/${item.id}`)}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-500 font-medium">
                      {formatDate(item.created_at)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      Target Role Evaluation
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 mb-6 line-clamp-2">
                    {getScoreVerdict(item.overall_score || 0)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Fit Score
                    </span>
                    <span className={`text-2xl font-black ${getScoreColor(item.overall_score || 0)}`}>
                      {item.overall_score || 0}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    View Report <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
