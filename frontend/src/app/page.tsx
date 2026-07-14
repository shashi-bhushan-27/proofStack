"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  Code2,
  Search,
  MessageSquareCode,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      <Header />

      <main className="flex-1">

        {/* =============================================
            HERO SECTION
            ============================================= */}
        <section className="relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
          <div
            className="absolute top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.15), transparent 70%)" }}
          />

          <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 pt-20 pb-28 sm:pt-28 sm:pb-36 lg:pt-36 lg:pb-44 flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2 text-sm font-semibold text-indigo-300 shadow-lg shadow-indigo-500/5 mb-10">
              <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0" />
              <span>Next-Gen AI Resume Evaluation — Beyond Simple Keywords</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl">
              Does your resume prove{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
                actual skill usage
              </span>{" "}
              or just list keywords?
            </h1>

            {/* Subtitle */}
            <p className="mt-8 max-w-2xl text-lg sm:text-xl text-slate-300/90 leading-relaxed">
              Traditional ATS reviewers pass candidates simply for typing{" "}
              <code className="text-indigo-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 text-sm font-mono">
                PostgreSQL
              </code>{" "}
              or{" "}
              <code className="text-indigo-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 text-sm font-mono">
                Kubernetes
              </code>{" "}
              into a skills section.{" "}
              <strong className="text-white">proofStack</strong> deep-scans your
              projects and work history to evaluate credible evidence of action,
              implementation depth, ownership, and measurable outcomes.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <Link
                href="/analysis/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-10 py-4.5 text-base font-bold text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:from-indigo-600 hover:to-violet-700 transition-all duration-200"
              >
                <span>Analyze Your Resume Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-slate-700 bg-slate-900/70 px-10 py-4.5 text-base font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all duration-200"
              >
                <span>See How It Works</span>
              </Link>
            </div>

            {/* Comparison Box */}
            <div className="mt-20 w-full max-w-4xl rounded-3xl border border-slate-700/60 bg-slate-900/50 p-8 sm:p-10 shadow-2xl backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ATS Card */}
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-6 sm:p-7 space-y-5">
                  <div className="flex items-center gap-3 text-rose-400 font-bold text-base">
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                    <span>Typical ATS / Keyword Matcher</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 font-mono text-sm text-slate-300 leading-relaxed">
                    &quot;Skills: Redis, Docker, FastAPI, AWS&quot;
                  </div>
                  <p className="text-sm text-rose-300/90 font-medium leading-relaxed">
                    ✓ 100% Keyword Match — even if the candidate has zero real
                    implementation depth or practical context!
                  </p>
                </div>

                {/* proofStack Card */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 sm:p-7 space-y-5">
                  <div className="flex items-center gap-3 text-emerald-400 font-bold text-base">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>proofStack Evidence Matrix</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 font-mono text-sm text-slate-200 leading-relaxed">
                    &quot;Designed Redis caching layer for ML inference, reducing
                    redundant API latency by 35%&quot;
                  </div>
                  <p className="text-sm text-emerald-300/90 font-medium leading-relaxed">
                    ★ Strong Evidence — Action + Context + Outcome +
                    Measurability verified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================
            6 EVIDENCE DIMENSIONS SECTION
            ============================================= */}
        <section
          id="evidence-dimensions"
          className="border-t border-slate-800/60 bg-slate-950/50"
        >
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 py-24 sm:py-32 lg:py-36">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 block mb-4">
                The Core Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                How We Evaluate Evidence Quality Across 6 Dimensions
              </h2>
              <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Every required skill in the job description is matched against
                your actual resume text across these rigorous verification
                criteria.
              </p>
            </div>

            {/* Dimension Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <Zap className="h-6 w-6 text-indigo-400" />,
                  title: "1. Action Demonstrated",
                  desc: "Did you use active technical verbs explaining what you personally built, designed, optimized, or deployed?",
                  badge: "Action Verbs",
                },
                {
                  icon: <Code2 className="h-6 w-6 text-violet-400" />,
                  title: "2. Technical Context",
                  desc: "Did you explain where, how, or why the technology was utilized within an architectural workflow?",
                  badge: "System Context",
                },
                {
                  icon: <Search className="h-6 w-6 text-blue-400" />,
                  title: "3. Implementation Depth",
                  desc: "Does the bullet demonstrate authentic engineering depth beyond superficial keyword drops?",
                  badge: "Engineering Depth",
                },
                {
                  icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
                  title: "4. Ownership Clarity",
                  desc: "Is it completely clear what you directly owned and delivered vs what the broader team handled?",
                  badge: "Personal Scope",
                },
                {
                  icon: <TrendingUp className="h-6 w-6 text-amber-400" />,
                  title: "5. Outcome Described",
                  desc: "Does the bullet describe a tangible impact, product feature, or operational improvement resulting from your work?",
                  badge: "Business Value",
                },
                {
                  icon: <Award className="h-6 w-6 text-rose-400" />,
                  title: "6. Measurability",
                  desc: "Is your impact quantified with specific numbers, latency reductions, scale metrics, or percentages where applicable?",
                  badge: "Quantified Metrics",
                },
              ].map((dim, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-7 sm:p-8 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/70 hover:shadow-xl flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-xl bg-slate-800/70">{dim.icon}</div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {dim.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{dim.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{dim.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
            HOW IT WORKS SECTION
            ============================================= */}
        <section
          id="how-it-works"
          className="border-t border-slate-800/60 bg-[#020617]"
        >
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 py-24 sm:py-32 lg:py-36">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 block mb-4">
                Step-by-Step Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                From PDF Upload to STAR-Aligned Bullet Interrogation
              </h2>
            </div>

            {/* Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {[
                {
                  step: "01",
                  title: "Upload Resume & Paste JD",
                  desc: "No registration needed to test. Upload your PDF resume and paste the target job description text to begin instantaneous extraction.",
                },
                {
                  step: "02",
                  title: "Instant Evidence Matrix",
                  desc: "Our deterministic scoring engine computes a transparent 0-100 fit score and classifies every skill as Strong, Moderate, Weak, or Missing.",
                },
                {
                  step: "03",
                  title: "AI Interrogation Chat",
                  desc: "Click any weak or missing skill to launch a progressive Q&A interview that extracts your real experiences into a STAR bullet point.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-8 sm:p-10 shadow-lg flex flex-col"
                >
                  <span className="text-5xl font-black text-indigo-500/15 mb-6 block leading-none">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================
            CTA SECTION
            ============================================= */}
        <section className="border-t border-slate-800/60 bg-gradient-to-b from-slate-950 to-[#020617]">
          <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
            <div className="rounded-3xl border border-indigo-500/25 bg-slate-900/80 p-10 sm:p-16 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center">
              <div className="p-5 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-8">
                <MessageSquareCode className="h-10 w-10" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white max-w-2xl leading-tight">
                Ready to find out what recruiters and ATS actually see?
              </h2>
              <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-300 leading-relaxed">
                No credit card, no sign-up required for your first analysis. Get
                actionable proof of what skills need strengthening before you
                submit your application.
              </p>
              <div className="mt-10">
                <Link
                  href="/analysis/new"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all duration-200"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Run Instant Free Analysis</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
