"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Mail, MapPin, Clock, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12 animate-fade-in">
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
              Have questions about our AI resume competency matrix, enterprise subscriptions, or need billing help? Our team is ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details Card */}
            <div className="space-y-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-cyan-400" />
                Support Channels
              </h2>
              
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">General & Technical Support</p>
                    <p className="text-slate-400">support@proofstack.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Billing & Cancellations</p>
                    <p className="text-slate-400">billing@proofstack.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Registered Office</p>
                    <p className="text-slate-400">proofStack Technologies Pvt. Ltd.<br />Indiranagar, Bengaluru, Karnataka 560038, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Operating Hours</p>
                    <p className="text-slate-400">Monday - Friday: 9:00 AM - 6:00 PM IST<br />Average email response time: &lt;4 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Inquiry Box */}
            <div className="space-y-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Need Quick Assistance?</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  For immediate support with subscription upgrades or webhook transaction verifications, please include your registered account email and Cashfree Order ID (<code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded text-xs">sub_...</code>) when reaching out.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-cyan-950/40 border border-slate-800 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Enterprise Custom Integrations</p>
                <p className="text-xs text-slate-400">Looking to integrate proofStack AI interrogation directly into your custom ATS or HR portal?</p>
                <a
                  href="mailto:support@proofstack.com?subject=Enterprise%20Integration%20Inquiry"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-cyan-300 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" /> Send us an enterprise inquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
