"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseEnv } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";

type Tab = "password" | "otp";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const [tab, setTab] = React.useState<Tab>("password");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { isConfigured } = getSupabaseEnv();
  const redirectTo = searchParams?.get("next") ?? "/dashboard";

  async function onPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) {
      setError("Supabase environment is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sign-in-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Sign-in failed");
        return;
      }
      push({
        title: "Welcome back",
        description: "You're now signed in.",
        variant: "success",
      });
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onRequestOtp() {
    if (!isConfigured) {
      setError("Supabase environment is not configured.");
      return;
    }
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Failed to send code");
        return;
      }
      setOtpSent(true);
      push({
        title: "Code sent",
        description: "Check your email for a one-time code.",
        variant: "success",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) {
      setError("Supabase environment is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otpCode }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Verification failed");
        return;
      }
      push({
        title: "Welcome back",
        description: "You're now signed in.",
        variant: "success",
      });
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!isConfigured ? (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Authentication is not configured. Sign-in is unavailable right now.
        </div>
      ) : null}

      {/* Tab switcher */}
      <div className="flex rounded-lg border border-border p-0.5 bg-muted/30" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "password"}
          onClick={() => { setTab("password"); setError(null); setOtpSent(false); }}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "password"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "otp"}
          onClick={() => { setTab("otp"); setError(null); setOtpSent(false); }}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "otp"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Email code
        </button>
      </div>

      {tab === "password" ? (
        <form onSubmit={onPasswordSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={!isConfigured || loading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={!isConfigured || loading}
            />
          </div>
          {error ? (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={!isConfigured || loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="otp-email">Email</Label>
            <Input
              id="otp-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setOtpSent(false); }}
              placeholder="you@example.com"
              disabled={!isConfigured || loading || otpSent}
            />
          </div>

          {otpSent ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="otp-code">One-time code</Label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter the code from your email"
                disabled={!isConfigured || loading}
                className="text-center text-lg tracking-widest"
              />
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {otpSent ? (
            <div className="flex gap-2">
              <Button type="submit" disabled={!isConfigured || loading || otpCode.length < 6} className="flex-1">
                {loading ? "Verifying…" : "Verify code"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => { setOtpSent(false); setOtpCode(""); setError(null); }}
              >
                Change email
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              disabled={!isConfigured || loading || !email}
              onClick={onRequestOtp}
            >
              {loading ? "Sending code…" : "Send code"}
            </Button>
          )}
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        New to Dirtchat?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
