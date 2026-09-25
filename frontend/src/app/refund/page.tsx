import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

const sections: LegalSection[] = [
  {
    id: "cancellation",
    title: "1. Subscription Cancellation",
    content: (
      <>
        <p>
          At proofStack, we strive to provide exceptional value through our AI resume intelligence and verification
          platform. You may cancel your Pro Intelligence subscription at any time directly from your account Billing
          dashboard or by contacting our support team at <strong>support@proofstack.com</strong>.
        </p>
        <p>
          When you cancel a subscription, your Pro benefits (including unlimited evaluations, priority queues, and full
          interrogation history) will remain active until the end of your current paid billing cycle. Upon expiration of
          the cycle, your account will automatically downgrade to the Free Starter plan (3 analyses per day) without any
          future recurring charges.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility for Refunds",
    content: (
      <>
        <p>
          We offer a transparent <strong>7-Day Money-Back Guarantee</strong> for all first-time Pro Intelligence
          subscribers. If you are not completely satisfied with our AI evaluation results or platform capabilities within
          the first 7 days of your initial purchase, you are eligible for a full 100% refund, provided that:
        </p>
        <ul>
          <li>
            The refund request is submitted within exactly seven (7) calendar days of the initial transaction timestamp.
          </li>
          <li>Your account has not engaged in automated scraping, API abuse, or violation of our Terms of Service.</li>
        </ul>
        <p>
          <strong>Note:</strong> Renewal charges for subsequent monthly cycles are non-refundable once processed unless
          requested within 48 hours of the renewal timestamp due to accidental renewal or billing errors.
        </p>
      </>
    ),
  },
  {
    id: "processing",
    title: "3. Refund Processing Time & Payment Method",
    content: (
      <>
        <p>
          Once your refund request is approved by our billing department, the refund will be initiated immediately
          through our authorized payment gateway (<strong>Cashfree Payments</strong>).
        </p>
        <ul>
          <li>
            <strong>Processing Timelines:</strong> Refunds typically take <strong>5 to 7 business days</strong> to
            reflect in your bank account, debit card, credit card, or UPI account depending on your issuing bank&apos;s
            processing times.
          </li>
          <li>
            <strong>Original Payment Source:</strong> All refunds are strictly credited back to the original payment
            source and account used during the checkout transaction in compliance with Reserve Bank of India (RBI) and
            Cashfree merchant guidelines.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "failed-duplicate",
    title: "4. Failed & Duplicate Transactions",
    content: (
      <>
        <p>
          In the event of a failed online payment where funds are debited from your bank/UPI account but the subscription
          status is not immediately activated on proofStack due to network or gateway connectivity timeouts:
        </p>
        <ul>
          <li>
            Our automated daily gateway reconciliation process detects such orphan transactions and initiates an
            automatic reversal within 24 to 48 hours.
          </li>
          <li>
            If you experience a duplicate charge due to accidental double-clicking during checkout, please notify us
            within 3 business days for an immediate 100% reversal of the duplicate transaction.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "request-refund",
    title: "5. How to Request a Refund",
    content: (
      <>
        <p>To initiate a cancellation or refund request, simply contact our dedicated billing and customer care team:</p>
        <dl className="space-y-2 rounded-lg border border-border bg-surface p-4 text-sm">
          <div>
            <dt className="inline font-semibold text-fg">Email Support: </dt>
            <dd className="inline">support@proofstack.com</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-fg">Billing Department: </dt>
            <dd className="inline">billing@proofstack.com</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-fg">Required Details: </dt>
            <dd className="inline">
              Please include your registered proofStack account email and Cashfree Order ID (
              <code className="rounded bg-surface-2 px-1 font-mono text-xs">sub_...</code>) in your request email.
            </dd>
          </div>
        </dl>
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Compliance & billing"
      title="Cancellation & Refund Policy"
      lastUpdated="July 15, 2026"
      sections={sections}
      related={[{ href: "/billing", label: "Back to Billing & Plans" }]}
    />
  );
}
