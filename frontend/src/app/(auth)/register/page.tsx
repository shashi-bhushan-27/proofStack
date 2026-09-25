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
import { Field, fieldErrorId, fieldHintId } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithProvider } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchQuery = useBrowserValue(() => window.location.search, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await register(fullName, email, password);
      router.push(getPostAuthRedirect());
    } catch (err) {
      setError(getErrorMessage(err, "Could not create account. Email may already be registered."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithProvider(provider);
      router.push(getPostAuthRedirect());
    } catch (err) {
      setError(getErrorMessage(err, `Failed to sign up with ${provider}`));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <AuthShell
      title="Create your free account"
      description="Save every evaluation, unlock AI interview coaching, and track your fit scores over time."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login${searchQuery}`} className="font-medium text-primary-text hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SocialAuthButtons disabled={isLoading} onSelect={handleSocialSignup} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full name" htmlFor="full-name">
          <Input
            id="full-name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Alex Rivera"
          />
        </Field>

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

        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={fieldHintId("password")}
          />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="confirm-password"
          error={confirmMismatch ? "Passwords do not match" : undefined}
        >
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={confirmMismatch || undefined}
            aria-describedby={confirmMismatch ? fieldErrorId("confirm-password") : undefined}
          />
        </Field>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" fullWidth isLoading={isLoading} loadingText="Creating account..." className="mt-2">
          Create account
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>
    </AuthShell>
  );
}
