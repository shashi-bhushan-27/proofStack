"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShieldAlert, RefreshCw, CheckCircle2, Clock, Mail } from "lucide-react";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10 animate-fade-in">
          {/* Page Header */}
          <div className="space-y-3 border-b border-slate-800 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Compliance & Billing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Cancellation & Refund Policy
            </h1>
            <p className="text-sm text-slate-400">
              Last updated: July 15, 2026
            </p>
          </div>

          {/* Policy Content Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-slate-300">
            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                1. Subscription Cancellation
              </h2>
              <p>
                At proofStack, we strive to provide exceptional value through our AI resume intelligence and verification platform. You may cancel your Pro Intelligence subscription at any time directly from your account Billing dashboard or by contacting our support team at <strong className="text-cyan-400">support@proofstack.com</strong>.
              </p>
              <p>
                When you cancel a subscription, your Pro benefits (including unlimited evaluations, priority queues, and full interrogation history) will remain active until the end of your current paid billing cycle. Upon expiration of the cycle, your account will automatically downgrade to the Free Starter plan (3 analyses per day) without any future recurring charges.
              </p>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-cyan-400" />
                2. Eligibility for Refunds
              </h2>
              <p>
                We offer a transparent <strong>7-Day Money-Back Guarantee</strong> for all first-time Pro Intelligence subscribers. If you are not completely satisfied with our AI evaluation results or platform capabilities within the first 7 days of your initial purchase, you are eligible for a full 100% refund, provided that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                <li>The refund request is submitted within exactly seven (7) calendar days of the initial transaction timestamp.</li>
                <li>Your account has not engaged in automated scraping, API abuse, or violation of our Terms of Service.</li>
              </ul>
              <p>
                <strong>Note:</strong> Renewal charges for subsequent monthly cycles are non-refundable once processed unless requested within 48 hours of the renewal timestamp due to accidental renewal or billing errors.
              </p>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                3. Refund Processing Time & Payment Method
              </h2>
              <p>
                Once your refund request is approved by our billing department, the refund will be initiated immediately through our authorized payment gateway (<strong>Cashfree Payments</strong>).
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                <li><strong>Processing Timelines:</strong> Refunds typically take <strong>5 to 7 business days</strong> to reflect in your bank account, debit card, credit card, or UPI account depending on your issuing bank&apos;s processing times.</li>
                <li><strong>Original Payment Source:</strong> All refunds are strictly credited back to the original payment source and account used during the checkout transaction in compliance with Reserve Bank of India (RBI) and Cashfree merchant guidelines.</li>
              </ul>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                4. Failed & Duplicate Transactions
              </h2>
              <p>
                In the event of a failed online payment where funds are debited from your bank/UPI account but the subscription status is not immediately activated on proofStack due to network or gateway connectivity timeouts:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                <li>Our automated daily gateway reconciliation process detects such orphan transactions and initiates an automatic reversal within 24 to 48 hours.</li>
                <li>If you experience a duplicate charge due to accidental double-clicking during checkout, please notify us within 3 business days for an immediate 100% reversal of the duplicate transaction.</li>
              </ul>
            </section>

            <section className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-400" />
                5. How to Request a Refund
              </h2>
              <p>
                To initiate a cancellation or refund request, simply contact our dedicated billing and customer care team:
              </p>
              <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <p><strong>Email Support:</strong> <span className="text-cyan-400">support@proofstack.com</span></p>
                <p><strong>Billing Department:</strong> <span className="text-cyan-400">billing@proofstack.com</span></p>
                <p><strong>Required Details:</strong> Please include your registered proofStack account email and Cashfree Order ID (`sub_...`) in your request email.</p>
              </div>
            </section>
          </div>

          <div className="pt-6 flex justify-center">
            <Link
              href="/billing"
              className="rounded-xl bg-slate-800 border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Back to Billing & Plans
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
