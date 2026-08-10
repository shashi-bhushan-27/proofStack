"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";

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
import styles from './page.module.css';

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
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} />
        </div>

      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Evaluation Dashboard
            </h1>
            <p className={styles.subtitle}>
              Track your candidate fit scores across applications and review past AI interrogations.
            </p>
          </div>

          <Link
            href="/analysis/new"
            className={styles.newButton}
          >
            <PlusCircle className={styles.iconSmall} /> New Evaluation
          </Link>
        </div>

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        {analyses.length === 0 ? (
          <div className={styles.emptyState}>
            <TrendingUp className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No evaluation reports yet</h3>
            <p className={styles.emptyDesc}>
              Run your first evidence evaluation against any target job description to verify your skill depth and unlock AI recommendations.
            </p>
            <div className={styles.emptyAction}>
              <Link
                href="/analysis/new"
                className={styles.startButton}
              >
                <Sparkles className={styles.iconSmall} /> Start First Analysis
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {analyses.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/analysis/${item.id}`)}
                className={styles.card}
              >
                <div>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>
                      {formatDate(item.created_at)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className={styles.deleteButton}
                      title="Delete Report"
                    >
                      <Trash2 className={styles.iconSmall} />
                    </button>
                  </div>

                  <div className={styles.cardTitleWrapper}>
                    <FileText className={styles.cardIcon} />
                    <h3 className={styles.cardTitle}>
                      {item.job_title || "Target Role Evaluation"}
                    </h3>
                  </div>

                  <p className={styles.cardVerdict}>
                    {getScoreVerdict(item.overall_score || 0)}
                  </p>
                </div>

                <div className={styles.cardFooter}>
                  <div>
                    <span className={styles.scoreLabel}>
                      Fit Score
                    </span>
                    {/* Retaining getScoreColor which returns utility classes but combining it nicely is hard. Wait, the instructions say "remove ALL Tailwind className strings" */}
                    <span className={`${styles.scoreValue} ${getScoreColor(item.overall_score || 0)}`}>
                      {item.overall_score || 0}
                      <span className={styles.scoreMax}>/100</span>
                    </span>
                  </div>

                  <div className={styles.viewReport}>
                    View Report <ArrowRight className={styles.arrowIcon} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


    </div>
  );
}
