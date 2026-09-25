"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Lock, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/providers/providers";
import { billingApi } from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";
import { Container, PageHeader, PageShell } from "@/components/layout/page";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Progress, Skeleton } from "@/components/ui/feedback";

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
  const [plansError, setPlansError] = useState(false);
  const [plansReloadKey, setPlansReloadKey] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
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
        setPlansError(false);
      } catch (err) {
        console.error("Failed to load plans:", err);
        setPlansError(true);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [plansReloadKey]);

  const retryPlans = () => {
    setLoadingPlans(true);
    setPlansReloadKey((key) => key + 1);
  };

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

      const { payment_session_id } = response.data;

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
    } catch (err) {
      console.error("Checkout failed:", err);
      setError(
        getErrorMessage(err, "Failed to initiate Cashfree checkout. Please check your network or try again.")
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    setError(null);

    try {
      await billingApi.cancel();
      window.location.reload();
    } catch (err) {
      console.error("Cancellation failed:", err);
      setError(getErrorMessage(err, "Could not cancel subscription."));
      setConfirmCancelOpen(false);
    } finally {
      setCancelLoading(false);
    }
  };

  const isPro = user?.subscription_tier === "pro";
  const dailyUsed = user?.daily_analyses_count || 0;
  const isLoading = authLoading || loadingPlans;

  return (
    <PageShell>
      <Container className="py-10 sm:py-14">
        <PageHeader
          title="Plans & billing"
          description="Scale your AI resume analysis from targeted daily checks to unlimited, deep multi-dimensional evidence evaluations."
        />

        {/* Current plan */}
        <div className="mt-8">
          {authLoading ? (
            <Card className="p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            </Card>
          ) : user ? (
            <Card className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-fg-muted">Current plan</p>
                  <Badge tone={isPro ? "primary" : "neutral"}>{isPro ? "Pro Intelligence" : "Free Starter"}</Badge>
                </div>
                <p className="mt-2 max-w-xl text-sm text-fg">
                  {isPro
                    ? "You have full access to unlimited AI analyses, deep scoring breakdowns, and priority queues."
                    : "You are currently on the Free Starter tier with daily usage limits."}
                </p>
                {isPro && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setConfirmCancelOpen(true)}
                    className="mt-2 text-fg-subtle hover:text-danger"
                  >
                    Cancel subscription
                  </Button>
                )}
              </div>

              <div className="w-full shrink-0 rounded-lg border border-border bg-surface-2/60 p-4 md:w-80">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-fg-muted">Today&apos;s usage</span>
                  <span className={cn("font-semibold tabular-nums", !isPro && dailyUsed >= 3 ? "text-danger" : "text-fg")}>
                    {dailyUsed} / {isPro ? "Unlimited" : 3} analyses
                  </span>
                </div>
                <Progress
                  className="mt-3"
                  value={isPro ? 100 : Math.min((dailyUsed / 3) * 100, 100)}
                  tone={isPro ? "primary" : dailyUsed >= 3 ? "danger" : "info"}
                  label="Analyses used today"
                />
                {!isPro && (
                  <p className="mt-2 text-xs text-fg-subtle">
                    Resets daily at midnight UTC. Upgrade for unlimited evaluations.
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <Alert
              tone="info"
              title="Sign in to see your plan and usage"
              action={
                <Link href="/login?redirect=/billing" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  Sign in
                </Link>
              }
            >
              You can compare plans below. Upgrading requires an account.
            </Alert>
          )}
        </div>

        {error && <Alert className="mt-6">{error}</Alert>}

        {/* Plans */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-8">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-4 h-10 w-28" />
                <div className="mt-8 space-y-3">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="mt-8 h-11 w-full rounded-lg" />
              </Card>
            ))
          ) : plansError ? (
            <Alert
              className="md:col-span-2"
              title="We couldn't load pricing plans"
              action={
                <Button variant="secondary" size="sm" onClick={retryPlans}>
                  <RefreshCw aria-hidden="true" />
                  Retry
                </Button>
              }
            >
              Please check your connection and try again.
            </Alert>
          ) : (
            plans.map((plan) => {
              const isCurrentPlan = (plan.id === "pro" && isPro) || (plan.id === "free" && !isPro);
              const highlighted = plan.id === "pro";

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col p-6 sm:p-8",
                    highlighted && "border-primary shadow-md ring-1 ring-primary"
                  )}
                >
                  {highlighted && (
                    <Badge tone="primary" className="absolute -top-3 right-6 border-primary bg-primary text-primary-foreground">
                      Most popular
                    </Badge>
                  )}

                  <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
                    {plan.name}
                    {highlighted && <Zap className="size-4 fill-current text-primary-text" aria-hidden="true" />}
                  </h2>
                  <p className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-fg">
                      {plan.currency === "INR" ? "₹" : "$"}
                      {plan.price}
                    </span>
                    <span className="text-sm text-fg-muted">/{plan.interval}</span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                        <span className="text-fg-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {user && isCurrentPlan ? (
                      <Button variant="secondary" fullWidth disabled>
                        <ShieldCheck aria-hidden="true" />
                        Current plan
                      </Button>
                    ) : plan.id === "pro" ? (
                      <Button
                        fullWidth
                        size="lg"
                        onClick={() => handleUpgrade("pro")}
                        isLoading={checkoutLoading}
                        loadingText="Connecting to Cashfree..."
                      >
                        <Zap aria-hidden="true" />
                        {user ? "Upgrade to Pro" : "Sign in to upgrade"}
                      </Button>
                    ) : (
                      <Button variant="secondary" fullWidth disabled>
                        Free tier included
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <p className="mt-8 text-center text-sm text-fg-subtle">
          <Lock className="-mt-0.5 mr-1.5 inline size-3.5" aria-hidden="true" />
          Payments are processed securely by Cashfree Payments in INR. See our{" "}
          <Link href="/refund" className="font-medium text-fg-muted underline-offset-4 hover:text-fg hover:underline">
            cancellation &amp; refund policy
          </Link>
          .
        </p>
      </Container>

      <ConfirmDialog
        open={confirmCancelOpen}
        onCancel={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancel}
        isLoading={cancelLoading}
        tone="danger"
        title="Cancel your Pro subscription?"
        description="You will return to the Free tier (3 analyses/day)."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep Pro"
      />
    </PageShell>
  );
}
