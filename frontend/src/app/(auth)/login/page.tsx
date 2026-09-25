"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/providers";
import { getPostAuthRedirect, useBrowserValue } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/utils";
import { AuthShell, PasswordInput, SocialAuthButtons } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithProvider } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchQuery = useBrowserValue(() => window.location.search, "");

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
      router.push(getPostAuthRedirect());
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithProvider(provider);
      router.push(getPostAuthRedirect());
    } catch (err) {
      setError(getErrorMessage(err, `Failed to sign in with ${provider}`));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to access your saved evaluations, AI interview coaching, and recommendations."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={`/register${searchQuery}`} className="font-medium text-primary-text hover:underline">
            Create a free account
          </Link>
        </>
      }
    >
      <SocialAuthButtons disabled={isLoading} onSelect={handleSocialLogin} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </Field>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" fullWidth isLoading={isLoading} loadingText="Signing in..." className="mt-2">
          Sign in
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>
    </AuthShell>
  );
}
