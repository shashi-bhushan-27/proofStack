import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 pt-12 pb-8 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 pb-10 border-b border-slate-800/60">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                proof<span className="text-indigo-400">Stack</span>
              </span>
              <span className="ml-2 rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Evidence-Based AI Resume Intelligence Platform. Evaluating real candidate skill implementation depth through deep-dive AI interrogation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#how-it-works" className="hover:text-cyan-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/analysis/new" className="hover:text-cyan-400 transition-colors">
                  New Evaluation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-cyan-400 transition-colors text-cyan-400">
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cyan-400 transition-colors font-medium text-indigo-400">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Real Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              Direct Contact & Support
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <a 
                href="mailto:shashibhushan27072002@gmail.com" 
                className="flex items-center gap-2.5 hover:text-cyan-400 transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/30">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span>shashibhushan27072002@gmail.com</span>
              </a>
              <a 
                href="tel:+917060049677" 
                className="flex items-center gap-2.5 hover:text-cyan-400 transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-400 group-hover:border-indigo-500/30">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>+91 7060049677</span>
              </a>
              <div className="flex items-center gap-2.5 text-slate-400">
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>Haridwar, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} proofStack Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
