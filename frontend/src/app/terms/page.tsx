"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FileText, CheckCircle2, AlertTriangle, Scale, CreditCard } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10 animate-fade-in">
          {/* Page Header */}
          <div className="space-y-3 border-b border-slate-800 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-400">
              Last updated: July 15, 2026
            </p>
          </div>

          {/* Terms Content Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-slate-300">
            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using proofStack (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our AI resume evaluation and verification services.
              </p>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-cyan-400" />
                2. Platform Usage & License
              </h2>
              <p>
                proofStack grants you a limited, non-exclusive, non-transferable license to upload resumes, perform job description gap analyses, and utilize our AI interrogation interview system for your personal or organizational hiring evaluation workflows.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                <li>You agree not to reverse engineer, scrape, or systematically extract data from the platform.</li>
                <li>You agree only to upload resumes and documents that you own or have explicit legal permission to analyze.</li>
              </ul>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                3. Subscriptions & Billing
              </h2>
              <p>
                proofStack offers a Free Starter tier (up to 3 evaluations per day) and paid subscription upgrades (Pro Intelligence).
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                <li>All payments are processed securely via our licensed payment gateway partner, <strong>Cashfree Payments</strong>, in Indian Rupees (INR).</li>
                <li>For details regarding cancellations, 7-day money-back guarantees, and refund processing timelines, please review our comprehensive <Link href="/refund" className="text-cyan-400 underline">Refund & Cancellation Policy</Link>.</li>
              </ul>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                4. Disclaimer of Warranties
              </h2>
              <p>
                proofStack uses advanced Large Language Models (LLMs) to verify resume competencies. While we implement strict schema enforcement and multi-stage verification matrices, AI-generated evaluations and recommendations are provided for informational and analytical assistance only and do not guarantee employment decisions or outcomes.
              </p>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white">5. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising out of platform usage or subscription transactions shall be resolved exclusively by courts having jurisdiction in Bengaluru, Karnataka, India.
              </p>
            </section>
          </div>

          <div className="pt-6 flex justify-center gap-4">
            <Link
              href="/privacy"
              className="rounded-xl bg-slate-900 border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="rounded-xl bg-slate-900 border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
