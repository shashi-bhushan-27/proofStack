"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Mail, MapPin, Phone, Clock, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12 animate-fade-in">
          {/* Page Header */}
          <div className="space-y-3 text-center border-b border-slate-800 pb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Get in Touch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Contact Us & Support
            </h1>
            <p className="max-w-xl mx-auto text-sm text-slate-400">
              Have a project in mind, an engineering challenge to discuss, or inquiries about proofStack AI resume competency evaluations? We would love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Direct & Support Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Contact Card */}
              <div className="space-y-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Direct Contact Details
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Available for consulting, collaborations, enterprise custom ATS integrations, and full-time opportunities. Reach out through any of the channels below.
                </p>
                
                <div className="space-y-4 text-sm text-slate-300 pt-2 border-t border-slate-800/80">
                  <a 
                    href="mailto:shashibhushan27072002@gmail.com"
                    className="flex items-start gap-3 hover:text-cyan-400 transition-colors group"
                  >
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/40 shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Direct</p>
                      <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">shashibhushan27072002@gmail.com</p>
                    </div>
                  </a>

                  <a 
                    href="tel:+917060049677"
                    className="flex items-start gap-3 hover:text-indigo-400 transition-colors group"
                  >
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:border-indigo-500/40 shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</p>
                      <p className="font-medium text-white group-hover:text-indigo-400 transition-colors">+91 7060049677</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</p>
                      <p className="font-medium text-white">Haridwar, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Channels & Operating Hours Card */}
              <div className="space-y-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 sm:p-8 text-sm">
                <h3 className="font-semibold text-white text-base">proofStack Support Desks</h3>
                <div className="space-y-3 text-slate-400 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-500">Technical Support:</span>
                    <span className="text-slate-300 font-medium">support@proofstack.com</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-500">Billing & Subscriptions:</span>
                    <span className="text-slate-300 font-medium">billing@proofstack.com</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Operating Hours: Mon - Fri (9:00 AM - 6:00 PM IST)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Resend Contact Form */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-xl shadow-slate-950/50">
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Send a Message</h2>
                <p className="text-sm text-slate-400">
                  Fill out the form below and our team will get back to your inquiry promptly.
                </p>
              </div>

              {status === "success" ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center space-y-4 animate-fade-in">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Message Sent Successfully!</h3>
                    <p className="text-sm text-slate-300">
                      Thank you for reaching out. Your message has been delivered to <span className="text-cyan-400 font-medium">shashibhushan27072002@gmail.com</span> via Resend.
                    </p>
                  </div>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === "error" && (
                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3 text-sm text-rose-300 animate-fade-in">
                      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-rose-200">Delivery Error</p>
                        <p className="text-xs text-rose-300/80 mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project, integration requirement, or idea..."
                      className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all resize-y"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
