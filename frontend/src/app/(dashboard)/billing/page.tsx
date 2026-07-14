"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/providers";
import { billingApi } from "@/lib/api";
import { Check, Sparkles, ShieldCheck, Zap, AlertCircle, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Cashfree: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: "_self" | "_blank" | "_modal";
      }) => Promise<void>;
    };
  }
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  limits: { analyses_per_day: number };
}

export default function BillingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Cashfree SDK v3 Script
  useEffect(() => {
    if (!document.getElementById("cashfree-sdk")) {
      const script = document.createElement("script");
      script.id = "cashfree-sdk";
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Fetch Pricing Plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await billingApi.getPlans();
        setPlans(response.data.plans || []);
      } catch (err) {
        console.error("Failed to load plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      router.push("/login?redirect=/billing");
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const returnUrl = `${window.location.origin}/billing/status`;
      const response = await billingApi.createCheckout({
        plan_id: planId,
        return_url: returnUrl,
      });

      const { payment_session_id, order_id } = response.data;

      if (!payment_session_id) {
        setError("Could not create payment session. Please try again.");
        return;
      }

      if (!window.Cashfree) {
        setError("Cashfree SDK is still loading. Please wait a moment and try again.");
        return;
      }

      // Initialize Cashfree Checkout
      const cashfreeMode = (process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox") as "sandbox" | "production";
      const cashfree = window.Cashfree({
        mode: cashfreeMode,
      });

      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setError(
        err?.response?.data?.detail ||
          "Failed to initiate Cashfree checkout. Please check your network or try again."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your Pro subscription? You will return to the Free tier (3 analyses/day).")) {
      return;
    }

    setCancelLoading(true);
    setError(null);

    try {
      await billingApi.cancel();
      window.location.reload();
    } catch (err: any) {
      console.error("Cancellation failed:", err);
      setError(err?.response?.data?.detail || "Could not cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (authLoading || loadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const isPro = user?.subscription_tier === "pro";
  const dailyUsed = user?.daily_analyses_count || 0;
  const dailyLimit = isPro ? "Unlimited" : 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Billing & Subscriptions</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Choose Your Intelligence Tier
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400">
            Scale your AI resume analysis from targeted daily checks to unlimited, deep multi-dimensional evidence evaluations.
          </p>
        </div>

        {/* Current Plan & Usage Status Bar */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
                Current Plan
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                isPro
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}>
                {isPro ? "Pro Intelligence ⚡" : "Free Starter"}
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              {isPro
                ? "You have full access to unlimited AI analyses, deep scoring breakdowns, and priority queues."
                : "You are currently on the Free Starter tier with daily usage limits."}
            </p>
          </div>

          <div className="w-full md:w-80 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Today&apos;s Usage</span>
              <span className={isPro ? "text-cyan-400 font-bold" : dailyUsed >= 3 ? "text-red-400 font-bold" : "text-slate-200"}>
                {dailyUsed} / {dailyLimit} Analyses
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isPro ? "bg-cyan-400 w-full" : dailyUsed >= 3 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: isPro ? "100%" : `${Math.min((dailyUsed / 3) * 100, 100)}%` }}
              />
            </div>
            {!isPro && (
              <p className="text-[11px] text-slate-500">
                Resets daily at midnight UTC. Upgrade for unlimited evaluations.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = (plan.id === "pro" && isPro) || (plan.id === "free" && !isPro);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl transition-all duration-300 flex flex-col justify-between p-8 ${
                  plan.id === "pro"
                    ? "bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10 hover:border-cyan-500/60"
                    : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {plan.id === "pro" && (
                  <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      {plan.name}
                      {plan.id === "pro" && <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white">
                        {plan.currency === "INR" ? "₹" : "$"}{plan.price}
                      </span>
                      <span className="text-slate-400 text-sm">/{plan.interval}</span>
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  <ul className="space-y-3.5 text-sm text-slate-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/60">
                  {isCurrentPlan ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full py-3.5 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Current Active Plan</span>
                      </button>
                      {isPro && (
                        <button
                          onClick={handleCancel}
                          disabled={cancelLoading}
                          className="w-full py-2 text-xs text-slate-400 hover:text-red-400 transition font-medium"
                        >
                          {cancelLoading ? "Cancelling..." : "Cancel Subscription"}
                        </button>
                      )}
                    </div>
                  ) : plan.id === "pro" ? (
                    <button
                      onClick={() => handleUpgrade("pro")}
                      disabled={checkoutLoading}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Connecting to Cashfree...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-white" />
                          <span>Upgrade to Pro Now</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3.5 px-4 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-500 font-medium text-sm"
                    >
                      Free Tier Included
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
