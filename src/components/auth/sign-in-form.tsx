"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseEnv } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";

const RESEND_COOLDOWN_SECONDS = 60;

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
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const cooldownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cooldown timer
  function startCooldown() {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  React.useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const { isConfigured, configState } = getSupabaseEnv();
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
      startCooldown();
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
    <div className="flex flex-col gap-5">
      {!isConfigured ? (
        <div className="rounded-none border border-border bg-muted/40 p-4 text-[11px] font-mono leading-relaxed text-muted-foreground">
          {configState.status === "missing"
            ? `Missing environment variables: ${(configState as { missing: string[] }).missing.join(", ")}. Add them to .env.local and restart the dev server.`
            : `Demo placeholder keys detected in: ${(configState as { demo: string[] }).demo.join(", ")}. Replace them with real values in .env.local and restart the dev server.`}
        </div>
      ) : null}

      {/* Tab switcher */}
      <div className="flex border border-border p-0.5 bg-muted/10 rounded-none mb-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "password"}
          onClick={() => {
            setTab("password");
            setError(null);
            setOtpSent(false);
          }}
          className={`flex-1 rounded-none px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
            tab === "password"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "otp"}
          onClick={() => {
            setTab("otp");
            setError(null);
            setOtpSent(false);
          }}
          className={`flex-1 rounded-none px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
            tab === "otp"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Email code
        </button>
      </div>

      {tab === "password" ? (
        <form onSubmit={onPasswordSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
              Email
            </Label>
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
              className="rounded-none border-border bg-background focus-visible:ring-accent focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
              Password
            </Label>
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
              className="rounded-none border-border bg-background focus-visible:ring-accent focus-visible:ring-offset-0"
            />
          </div>
          {error ? (
            <p role="alert" className="rounded-none border border-destructive bg-destructive/5 p-4 text-[11px] font-mono tracking-wide text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={!isConfigured || loading} className="rounded-none text-xs font-bold uppercase tracking-widest h-11 bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otp-email" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
              Email
            </Label>
            <Input
              id="otp-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setOtpSent(false);
              }}
              placeholder="you@example.com"
              disabled={!isConfigured || loading || otpSent}
              className="rounded-none border-border bg-background focus-visible:ring-accent focus-visible:ring-offset-0"
            />
          </div>

          {otpSent ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="otp-code" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                One-time code
              </Label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                disabled={!isConfigured || loading}
                className="text-center text-sm font-mono tracking-[0.3em] rounded-none border-border bg-background focus-visible:ring-accent focus-visible:ring-offset-0 h-11"
              />
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-none border border-destructive bg-destructive/5 p-4 text-[11px] font-mono tracking-wide text-destructive">
              {error}
            </p>
          ) : null}

          {otpSent ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!isConfigured || loading || otpCode.length < 6}
                  className="flex-1 rounded-none text-xs font-bold uppercase tracking-widest h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? "Verifying…" : "Verify code"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                    setError(null);
                    setResendCooldown(0);
                  }}
                  className="rounded-none border-border bg-transparent hover:bg-secondary text-foreground text-xs font-bold uppercase tracking-widest h-11"
                >
                  Change email
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading || resendCooldown > 0}
                onClick={onRequestOtp}
                className="text-[10px] uppercase font-mono tracking-wider"
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend code"}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              disabled={!isConfigured || loading || !email}
              onClick={onRequestOtp}
              className="rounded-none text-xs font-bold uppercase tracking-widest h-11 bg-primary text-primary-foreground hover:bg-primary/90 w-full"
            >
              {loading ? "Sending code…" : "Send code"}
            </Button>
          )}
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
        New to Dirtchat?{" "}
        <Link
          href="/sign-up"
          className="font-bold text-foreground underline underline-offset-4 hover:text-success transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
