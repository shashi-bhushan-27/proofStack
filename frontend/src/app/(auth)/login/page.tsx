"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/providers";
import { ShieldCheck, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithProvider } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchQuery(window.location.search);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || params.get("returnUrl") || "/dashboard";
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithProvider(provider);
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || params.get("returnUrl") || "/dashboard";
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.detail || err?.message || `Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              proof<span className="text-indigo-400">Stack</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Sign In to Your Account</h1>
          <p className="mt-1 text-xs text-slate-400">
            Access your saved evaluation history, AI interrogation chat, and recommendations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 hover:border-slate-600 transition-all disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialLogin("github")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 hover:border-slate-600 transition-all disabled:opacity-50"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <span className="relative bg-slate-900/60 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href={`/register${searchQuery}`} className="font-semibold text-indigo-400 hover:text-indigo-300">
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
}
