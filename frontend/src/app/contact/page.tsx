"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Container, PageHeader, PageShell } from "@/components/layout/page";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "shashibhushan27072002@gmail.com",
    href: "mailto:shashibhushan27072002@gmail.com",
  },
  { icon: Phone, label: "Phone", value: "+91 7060049677", href: "tel:+917060049677" },
  { icon: MapPin, label: "Location", value: "Haridwar, India" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try emailing directly.";
      setErrorMessage(errorMessage);
    }
  };

  return (
    <PageShell>
      <Container className="py-10 sm:py-14">
        <PageHeader
          title="Contact us & support"
          description="Have a project in mind, an engineering challenge to discuss, or questions about proofStack resume evaluations? We would love to hear from you."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          {/* Contact details */}
          <div className="space-y-6 lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Direct contact</CardTitle>
                <CardDescription>
                  Available for consulting, collaborations, enterprise custom ATS integrations, and full-time
                  opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {contactMethods.map((method) => {
                    const content = (
                      <>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-fg-muted">
                          <method.icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs text-fg-subtle">{method.label}</span>
                          <span className="block break-all text-sm font-medium text-fg">{method.value}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={method.label}>
                        {method.href ? (
                          <a
                            href={method.href}
                            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2"
                          >
                            {content}
                          </a>
                        ) : (
                          <div className="-mx-2 flex items-center gap-3 px-2 py-2">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>proofStack support desks</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-border text-sm">
                  <div className="flex flex-wrap justify-between gap-2 py-2.5">
                    <dt className="text-fg-muted">Technical support</dt>
                    <dd className="font-medium text-fg">support@proofstack.com</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 py-2.5">
                    <dt className="text-fg-muted">Billing &amp; subscriptions</dt>
                    <dd className="font-medium text-fg">billing@proofstack.com</dd>
                  </div>
                </dl>
                <p className="mt-3 flex items-center gap-2 text-xs text-fg-subtle">
                  <Clock className="size-3.5" aria-hidden="true" />
                  Operating hours: Mon - Fri (9:00 AM - 6:00 PM IST)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact form */}
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
              <CardDescription>Fill out the form below and our team will get back to your inquiry promptly.</CardDescription>
            </CardHeader>
            <CardContent>
              {status === "success" ? (
                <div className="flex flex-col items-center rounded-lg border border-success-border bg-success-soft px-6 py-10 text-center" role="status">
                  <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-fg">Message sent successfully!</h3>
                  <p className="mt-1 max-w-sm text-sm text-fg-muted">
                    Thank you for reaching out. Your message has been delivered to shashibhushan27072002@gmail.com via
                    Resend.
                  </p>
                  <Button variant="secondary" className="mt-6" onClick={() => setStatus("idle")}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {status === "error" && <Alert title="Delivery error">{errorMessage}</Alert>}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" htmlFor="name" required>
                      <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Email" htmlFor="email" required>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>

                  <Field label="Subject" htmlFor="subject" optional>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                    />
                  </Field>

                  <Field label="Message" htmlFor="message" required>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project, integration requirement, or idea..."
                      className="resize-y"
                    />
                  </Field>

                  <div>
                    <Button type="submit" size="lg" isLoading={status === "loading"} loadingText="Sending message...">
                      <Send aria-hidden="true" />
                      Send message
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </PageShell>
  );
}
