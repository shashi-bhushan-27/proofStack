import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: (
      <>
        <p>
          When you use proofStack, we collect information needed to evaluate and verify your candidate competencies
          securely:
        </p>
        <ul>
          <li>
            <strong>Account Information:</strong> Name, email address, and authentication credentials via secure
            Firebase Authentication.
          </li>
          <li>
            <strong>Candidate Documents:</strong> PDF resumes uploaded for extraction and analysis using PyMuPDF.
          </li>
          <li>
            <strong>Job Description Text:</strong> Target job requirements pasted into the evaluation wizard.
          </li>
          <li>
            <strong>Payment Information:</strong> We do not store raw credit card or bank numbers on our servers. All
            financial transactions are securely processed directly by our PCI-DSS compliant payment partner,{" "}
            <strong>Cashfree Payments</strong>.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>Your data is exclusively processed to power the proofStack intelligence pipeline:</p>
        <ul>
          <li>
            To extract resume competencies, match against target job criteria, and compute multi-dimensional evidence
            matrices.
          </li>
          <li>To conduct interactive AI interrogation sessions and generate verified STAR bullet points.</li>
          <li>To process subscription billing, manage daily analysis quotas, and provide customer support.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-security",
    title: "3. Data Security & Storage",
    content: (
      <p>
        We enforce strict data isolation using PostgreSQL Row-Level Security (RLS) and industry-standard TLS 1.3
        encryption in transit and AES-256 at rest. Guest user evaluations are isolated via short-lived cryptographic JWT
        tokens and automatically purged according to our retention policies.
      </p>
    ),
  },
  {
    id: "third-party-services",
    title: "4. Third-Party Services",
    content: (
      <>
        <p>We partner with trusted enterprise providers to deliver our services:</p>
        <ul>
          <li>
            <strong>Google Cloud & Gemini API:</strong> For structured LLM competency extraction and inference.
          </li>
          <li>
            <strong>Cashfree Payments:</strong> For secure UPI, card, and net-banking subscription billing in India.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "5. Contact Us",
    content: (
      <p>
        If you have questions regarding data privacy or wish to request complete deletion of your resume and analysis
        records, contact us at <strong>privacy@proofstack.com</strong> or <strong>support@proofstack.com</strong>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Data protection & privacy"
      title="Privacy Policy"
      lastUpdated="July 15, 2026"
      sections={sections}
      related={[
        { href: "/terms", label: "Terms of Service" },
        { href: "/refund", label: "Refund Policy" },
      ]}
    />
  );
}
