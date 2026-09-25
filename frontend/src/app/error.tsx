"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Container, PageShell } from "@/components/layout/page";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell>
      <Container size="narrow" className="py-20">
        <Card>
          <EmptyState
            headingLevel="h1"
            icon={<AlertTriangle />}
            title="Something went wrong"
            description="An unexpected error occurred while loading this page. Please try again."
            action={
              <>
                <Button onClick={() => unstable_retry()}>
                  <RefreshCw aria-hidden="true" />
                  Try again
                </Button>
                <Link href="/" className={buttonVariants({ variant: "secondary" })}>
                  Go to homepage
                </Link>
              </>
            }
          />
        </Card>
      </Container>
    </PageShell>
  );
}
