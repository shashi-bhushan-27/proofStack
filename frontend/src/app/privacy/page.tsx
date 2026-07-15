"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Shield, Lock, Eye, Database, Globe } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10 animate-fade-in">
          {/* Page Header */}
          <div className="space-y-3 border-b border-slate-800 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5" />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-400">
              Last updated: July 15, 2026
            </p>
          </div>

          {/* Policy Content Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-slate-300">
            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-400" />
                1. Information We Collect
              </h2>
              <p>
                When you use proofStack, we collect information needed to evaluate and verify your candidate competencies securely:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                <li><strong>Account Information:</strong> Name, email address, and authentication credentials via secure Firebase Authentication.</li>
                <li><strong>Candidate Documents:</strong> PDF resumes uploaded for extraction and analysis using PyMuPDF.</li>
                <li><strong>Job Description Text:</strong> Target job requirements pasted into the evaluation wizard.</li>
                <li><strong>Payment Information:</strong> We do not store raw credit card or bank numbers on our servers. All financial transactions are securely processed directly by our PCI-DSS compliant payment partner, <strong>Cashfree Payments</strong>.</li>
              </ul>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-cyan-400" />
                2. How We Use Your Information
              </h2>
              <p>
                Your data is exclusively processed to power the proofStack intelligence pipeline:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                <li>To extract resume competencies, match against target job criteria, and compute multi-dimensional evidence matrices.</li>
                <li>To conduct interactive AI interrogation sessions and generate verified STAR bullet points.</li>
                <li>To process subscription billing, manage daily analysis quotas, and provide customer support.</li>
              </ul>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-400" />
                3. Data Security & Storage
              </h2>
              <p>
                We enforce strict data isolation using PostgreSQL Row-Level Security (RLS) and industry-standard TLS 1.3 encryption in transit and AES-256 at rest. Guest user evaluations are isolated via short-lived cryptographic JWT tokens and automatically purged according to our retention policies.
              </p>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-400" />
                4. Third-Party Services
              </h2>
              <p>
                We partner with trusted enterprise providers to deliver our services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                <li><strong>Google Cloud & Gemini API:</strong> For structured LLM competency extraction and inference.</li>
                <li><strong>Cashfree Payments:</strong> For secure UPI, card, and net-banking subscription billing in India.</li>
              </ul>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white">5. Contact Us</h2>
              <p>
                If you have questions regarding data privacy or wish to request complete deletion of your resume and analysis records, contact us at <strong className="text-cyan-400">privacy@proofstack.com</strong> or <strong className="text-cyan-400">support@proofstack.com</strong>.
              </p>
            </section>
          </div>

          <div className="pt-6 flex justify-center gap-4">
            <Link
              href="/terms"
              className="rounded-xl bg-slate-900 border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/refund"
              className="rounded-xl bg-slate-900 border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
