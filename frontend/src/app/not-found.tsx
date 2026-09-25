import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Container, PageShell } from "@/components/layout/page";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";

export default function NotFound() {
  return (
    <PageShell>
      <Container size="narrow" className="py-20">
        <Card>
          <EmptyState
            headingLevel="h1"
            icon={<FileSearch />}
            title="Page not found"
            description="The page you're looking for doesn't exist or has moved."
            action={
              <>
                <Link href="/" className={buttonVariants()}>
                  Go to homepage
                </Link>
                <Link href="/analysis/new" className={buttonVariants({ variant: "secondary" })}>
                  Check a resume
                </Link>
              </>
            }
          />
        </Card>
      </Container>
    </PageShell>
  );
}
