import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <p>
        By accessing or using proofStack (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If
        you do not agree to these terms, please do not use our AI resume evaluation and verification services.
      </p>
    ),
  },
  {
    id: "usage-license",
    title: "2. Platform Usage & License",
    content: (
      <>
        <p>
          proofStack grants you a limited, non-exclusive, non-transferable license to upload resumes, perform job
          description gap analyses, and utilize our AI interrogation interview system for your personal or
          organizational hiring evaluation workflows.
        </p>
        <ul>
          <li>You agree not to reverse engineer, scrape, or systematically extract data from the platform.</li>
          <li>You agree only to upload resumes and documents that you own or have explicit legal permission to analyze.</li>
        </ul>
      </>
    ),
  },
  {
    id: "subscriptions-billing",
    title: "3. Subscriptions & Billing",
    content: (
      <>
        <p>
          proofStack offers a Free Starter tier (up to 3 evaluations per day) and paid subscription upgrades (Pro
          Intelligence).
        </p>
        <ul>
          <li>
            All payments are processed securely via our licensed payment gateway partner,{" "}
            <strong>Cashfree Payments</strong>, in Indian Rupees (INR).
          </li>
          <li>
            For details regarding cancellations, 7-day money-back guarantees, and refund processing timelines, please
            review our comprehensive{" "}
            <Link href="/refund" className="font-medium text-primary-text underline underline-offset-4">
              Refund & Cancellation Policy
            </Link>
            .
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "4. Disclaimer of Warranties",
    content: (
      <p>
        proofStack uses advanced Large Language Models (LLMs) to verify resume competencies. While we implement strict
        schema enforcement and multi-stage verification matrices, AI-generated evaluations and recommendations are
        provided for informational and analytical assistance only and do not guarantee employment decisions or
        outcomes.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "5. Governing Law & Dispute Resolution",
    content: (
      <p>
        These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising
        out of platform usage or subscription transactions shall be resolved exclusively by courts having jurisdiction
        in Bengaluru, Karnataka, India.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="Legal agreement"
      title="Terms of Service"
      lastUpdated="July 15, 2026"
      sections={sections}
      related={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/contact", label: "Contact Us" },
      ]}
    />
  );
}
