"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, CreditCard, LayoutDashboard, LogOut, Menu, Plus, X } from "lucide-react";
import { useAuth } from "@/providers/providers";
import type { User } from "@/types";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  href: string;
  label: string;
}

const marketingNav: NavItem[] = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#evidence-dimensions", label: "Shortlist criteria" },
  { href: "/billing", label: "Pricing" },
];

function getInitials(user: User | null) {
  const source = user?.full_name?.trim() || user?.email || "";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase() || "?";
}

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signInHref =
    pathname && pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register")
      ? `/login?redirect=${encodeURIComponent(pathname)}`
      : "/login";

  const showAccount = isAuthenticated || (isLoading && user);
  const navItems: NavItem[] = showAccount ? [{ href: "/dashboard", label: "Dashboard" }, ...marketingNav] : marketingNav;
  const isPro = user?.subscription_tier === "pro";
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <a
        href="#main"
        className="sr-only rounded-md bg-surface px-3 py-2 text-sm font-medium text-fg shadow-lg focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-fg" : "text-fg-muted hover:text-fg"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-2 md:flex">
            {isLoading ? (
              <Skeleton className="h-9 w-40 rounded-lg" />
            ) : isAuthenticated ? (
              <>
                <Link href="/billing" className="rounded-md" aria-label={`Current plan: ${isPro ? "Pro" : "Free"}`}>
                  <Badge tone={isPro ? "primary" : "neutral"}>{isPro ? "Pro plan" : "Free plan"}</Badge>
                </Link>
                <Link href="/analysis/new" className={buttonVariants({ size: "sm" })}>
                  <Plus aria-hidden="true" />
                  New evaluation
                </Link>
                <UserMenu user={user} initials={getInitials(user)} onLogout={logout} />
              </>
            ) : (
              <>
                <Link href={signInHref} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Sign in
                </Link>
                <Link href="/analysis/new" className={buttonVariants({ size: "sm" })}>
                  Check resume free
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-border bg-surface md:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                aria-current={pathname === item.href ? "page" : undefined}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg aria-[current=page]:text-fg"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 border-t border-border pt-3">
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 px-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">{user?.full_name || "Candidate"}</p>
                      <p className="truncate text-xs text-fg-subtle">{user?.email}</p>
                    </div>
                    <Badge tone={isPro ? "primary" : "neutral"}>{isPro ? "Pro plan" : "Free plan"}</Badge>
                  </div>
                  <Link href="/analysis/new" onClick={closeMobile} className={buttonVariants({ fullWidth: true })}>
                    <Plus aria-hidden="true" />
                    New evaluation
                  </Link>
                  <Button variant="secondary" fullWidth onClick={logout}>
                    <LogOut aria-hidden="true" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href={signInHref} onClick={closeMobile} className={buttonVariants({ variant: "secondary" })}>
                    Sign in
                  </Link>
                  <Link href="/analysis/new" onClick={closeMobile} className={buttonVariants()}>
                    Check resume free
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

interface UserMenuProps {
  user: User | null;
  initials: string;
  onLogout: () => void;
}

function UserMenu({ user, initials, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg [&_svg]:size-4";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="user-menu"
        aria-label="Account menu"
        className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-text">
          {initials}
        </span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div
          id="user-menu"
          className="absolute right-0 top-full mt-2 w-64 animate-slide-up rounded-xl border border-border bg-surface p-1.5 shadow-lg"
        >
          <div className="border-b border-border px-2.5 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-medium text-fg">{user?.full_name || "Candidate"}</p>
            <p className="truncate text-xs text-fg-subtle">{user?.email}</p>
          </div>
          <div className="flex flex-col py-1.5">
            <Link href="/dashboard" className={itemClass} onClick={() => setOpen(false)}>
              <LayoutDashboard aria-hidden="true" />
              Dashboard
            </Link>
            <Link href="/billing" className={itemClass} onClick={() => setOpen(false)}>
              <CreditCard aria-hidden="true" />
              Plans &amp; billing
            </Link>
          </div>
          <div className="border-t border-border pt-1.5">
            <button type="button" className={itemClass} onClick={onLogout}>
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
