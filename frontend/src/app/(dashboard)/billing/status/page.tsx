"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { billingApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import { Container, PageShell } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function StatusIcon({ tone, children }: { tone: "primary" | "success" | "danger"; children: React.ReactNode }) {
  const styles = {
    primary: "bg-primary-soft text-primary-text",
    success: "bg-success-soft text-success",
    danger: "bg-danger-soft text-danger",
  };
  return (
    <span className={`mx-auto flex size-14 items-center justify-center rounded-full ${styles[tone]} [&_svg]:size-7`}>
      {children}
    </span>
  );
}

function VerifyingState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="py-4" role="status">
      <StatusIcon tone="primary">
        <Loader2 className="animate-spin" aria-hidden="true" />
      </StatusIcon>
      <h1 className="mt-5 text-xl font-semibold text-fg">{title}</h1>
      {description && <p className="mt-2 text-sm text-fg-muted">{description}</p>}
    </div>
  );
}

function BillingStatusContent() {
  const searchParams = useSearchParams();
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
        if (response.data.status === "active") {
          setSuccess(true);
          await refreshUser();
        } else {
          setSuccess(false);
          setErrorMsg(`Payment status: ${response.data.status}. If you completed the payment, it may take a moment to process.`);
        }
      } catch {
        setErrorMsg("Could not verify order status from server. Please check your billing page in a few minutes.");
      } finally {
        setVerifying(false);
      }
    };

    verifyStatus();
  }, [orderId, urlStatus, refreshUser]);

  if (verifying) {
    return <VerifyingState title="Verifying your subscription..." description="Synchronizing with the Cashfree payments server." />;
  }

  if (success) {
    return (
      <div className="animate-fade-in py-4">
        <StatusIcon tone="success">
          <CheckCircle2 aria-hidden="true" />
        </StatusIcon>
        <Badge tone="primary" className="mt-5">
          Account upgraded
        </Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-fg">Welcome to Pro Intelligence!</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Your payment was confirmed. You now have unlimited AI resume analyses, priority LLM queues, and full interview
          history.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className={buttonVariants()}>
            Go to dashboard
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/billing" className={buttonVariants({ variant: "secondary" })}>
            Billing info
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-4">
      <StatusIcon tone="danger">
        <XCircle aria-hidden="true" />
      </StatusIcon>
      <h1 className="mt-5 text-xl font-semibold text-fg">Verification incomplete</h1>
      <p className="mt-2 text-sm text-fg-muted">
        {errorMsg || "We couldn't confirm your subscription payment at this time."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/billing" className={buttonVariants()}>
          Return to billing
        </Link>
        <Link href="/contact" className={buttonVariants({ variant: "secondary" })}>
          Contact support
        </Link>
      </div>
    </div>
  );
}

export default function BillingStatusPage() {
  return (
    <PageShell>
      <Container size="narrow" className="flex justify-center py-16 sm:py-24">
        <Card className="w-full max-w-md p-8 text-center">
          <Suspense fallback={<VerifyingState title="Loading verification..." />}>
            <BillingStatusContent />
          </Suspense>
        </Card>
      </Container>
    </PageShell>
  );
}
