"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { billingApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

function BillingStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const orderId = searchParams.get("order_id");
  const urlStatus = searchParams.get("status") || searchParams.get("order_status");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const verifyStatus = async () => {
      if (!orderId) {
        setErrorMsg("No order ID found in verification request.");
        setVerifying(false);
        return;
      }

      try {
        const response = await billingApi.getStatus(orderId);
        if (response.data.status === "active" || urlStatus === "PAID" || urlStatus === "SUCCESS") {
          setSuccess(true);
          await refreshUser();
        } else {
          setSuccess(false);
          setErrorMsg("Payment authorization is pending or failed.");
        }
      } catch (err: any) {
        if (urlStatus === "PAID" || urlStatus === "SUCCESS" || urlStatus === "ACTIVE") {
          setSuccess(true);
          await refreshUser();
        } else {
          setErrorMsg("Could not verify order status from server.");
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyStatus();
  }, [orderId, urlStatus, refreshUser]);

  return (
    <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
      {verifying ? (
        <div className="space-y-4 py-6">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Verifying Subscription...</h2>
          <p className="text-sm text-slate-400">
            Synchronizing with Cashfree payments server...
          </p>
        </div>
      ) : success ? (
        <div className="space-y-6 py-4 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto text-cyan-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Account Upgraded</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Welcome to Pro Intelligence!</h2>
            <p className="text-sm text-slate-300">
              Your payment was confirmed. You now have unlimited AI resume analyses, priority LLM queues, and full interrogation history.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/billing"
              className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
            >
              Billing Info
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6 py-4">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Verification Incomplete</h2>
            <p className="text-sm text-slate-400">
              {errorMsg || "We couldn't confirm your subscription payment at this time."}
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/billing"
              className="w-full block py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              Return to Billing Page
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingStatusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Loading Verification...</h2>
          </div>
        }
      >
        <BillingStatusContent />
      </Suspense>
    </div>
  );
}

