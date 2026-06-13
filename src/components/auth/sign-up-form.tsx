"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseEnv } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";

export type LegalDocOption = {
  id: string;
  document_type: string;
  version: string;
  title: string;
};

export function SignUpForm({ legalDocs }: { legalDocs: LegalDocOption[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = React.useState(false);
  const { isConfigured, configState } = getSupabaseEnv();

  const termsDoc = legalDocs.find((d) => d.document_type === "terms");
  const privacyDoc = legalDocs.find((d) => d.document_type === "privacy");
  const emailValid = email.includes("@");
  const passwordLengthValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

  const canSubmit = acceptedTerms && acceptedPrivacy && passwordsMatch && passwordLengthValid && emailValid;

  const disabledReason = React.useMemo(() => {
    if (!isConfigured) {
      if (configState.status === "missing") {
        return "Supabase env is missing.";
      }
      return "Replace demo Supabase keys in .env.local.";
    }
    if (loading) return "Creating account…";
    if (!email || !emailValid) return "Enter a valid email.";
    if (!password || !passwordLengthValid) return "Use at least 8 characters.";
    if (!confirmPassword || !passwordsMatch) return "Passwords do not match.";
    if (!acceptedTerms && !acceptedPrivacy) return "Accept the Terms and Privacy Policy to continue.";
    if (!acceptedTerms) return "Accept the Terms to continue.";
    if (!acceptedPrivacy) return "Accept the Privacy Policy to continue.";
    return null;
  }, [isConfigured, configState, loading, email, emailValid, password, passwordLengthValid, confirmPassword, passwordsMatch, acceptedTerms, acceptedPrivacy]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) {
      setError("Supabase environment is not configured.");
      return;
    }
    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordLengthValid) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptedTerms || !acceptedPrivacy) {
      setError("You must accept both the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const acceptedIds: string[] = [];
      if (termsDoc) acceptedIds.push(termsDoc.id);
      if (privacyDoc) acceptedIds.push(privacyDoc.id);

      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName || email.split("@")[0],
          acceptedLegalDocumentIds: acceptedIds,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Sign-up failed");
        return;
      }
      if (data.session) {
        push({
          title: "Welcome to Dirtchat",
          description: "Your account is ready.",
          variant: "success",
        });
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setInfo(
        "Check your email to confirm your account, then sign in. You can close this tab."
      );
    } catch {
      setError("Something went wrong while creating your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {!isConfigured ? (
        <div className="rounded-none border border-border bg-muted/40 p-4 text-[11px] font-mono leading-relaxed text-muted-foreground">
          {configState.status === "missing"
            ? `Missing environment variables: ${(configState as { missing: string[] }).missing.join(", ")}. Add them to .env.local and restart the dev server.`
            : `Demo placeholder keys detected in: ${(configState as { demo: string[] }).demo.join(", ")}. Replace them with real values in .env.local and restart the dev server.`}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="display-name" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
          Display name
        </Label>
        <Input
          id="display-name"
          name="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          disabled={!isConfigured || loading}
          className="rounded-none border-border bg-background focus-visible:ring-accent focus-visible:ring-offset-0 h-11"
        />
      </div>

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
          className="rounded-none border-border bg-background focus-visible:ring-accent focus-visible:ring-offset-0 h-11"
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          disabled={!isConfigured || loading}
          className="rounded-none border-border bg-background focus-visible:ring-accent focus-visible:ring-offset-0 h-11"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-password" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
          Confirm password
        </Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          disabled={!isConfigured || loading}
          className="rounded-none border-border bg-background focus-visible:ring-accent focus-visible:ring-offset-0 h-11"
        />
      </div>

      {/* Legal acceptance checkboxes */}
      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 border border-border p-3 cursor-pointer bg-background hover:bg-muted/10 transition-colors rounded-none">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={loading}
            className="mt-0.5 h-4 w-4 shrink-0 rounded-none border-border text-accent focus:ring-accent accent-accent"
          />
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground leading-relaxed">
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-bold text-foreground underline underline-offset-4 hover:text-accent"
            >
              Terms of Service
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-3 border border-border p-3 cursor-pointer bg-background hover:bg-muted/10 transition-colors rounded-none">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            disabled={loading}
            className="mt-0.5 h-4 w-4 shrink-0 rounded-none border-border text-accent focus:ring-accent accent-accent"
          />
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground leading-relaxed">
            I agree to the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-bold text-foreground underline underline-offset-4 hover:text-accent"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      {error ? (
        <p role="alert" className="rounded-none border border-destructive bg-destructive/5 p-4 text-[11px] font-mono tracking-wide text-destructive">
          {error}
        </p>
      ) : null}

      {info ? (
        <p role="status" className="rounded-none border border-border bg-muted/40 p-4 text-[11px] font-mono tracking-wide text-foreground">
          {info}
        </p>
      ) : null}

      {/* Registration Checklist */}
      {isConfigured && !canSubmit && (
        <div className="border border-border p-4 bg-muted/5 rounded-none flex flex-col gap-3">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            [ REGISTRATION CHECKLIST ]
          </div>
          <ul className="grid grid-cols-1 gap-2 text-[11px] font-mono">
            <ChecklistRequirement checked={emailValid} label="Valid email address" />
            <ChecklistRequirement checked={passwordLengthValid} label="Password (8+ characters)" />
            <ChecklistRequirement checked={passwordsMatch && !!password} label="Passwords match" />
            <ChecklistRequirement checked={acceptedTerms} label="Accept Terms of Service" />
            <ChecklistRequirement checked={acceptedPrivacy} label="Accept Privacy Policy" />
          </ul>
        </div>
      )}

      {/* Disabled Reason Prompt */}
      {!canSubmit && disabledReason && (
        <div className="border border-border bg-muted/10 px-4 py-3 text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Status: {disabledReason}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isConfigured || loading || !canSubmit}
        className={`w-full rounded-none text-xs font-bold uppercase tracking-widest h-11 transition-all ${
          canSubmit
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
        }`}
      >
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-2 font-mono">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-bold text-foreground underline underline-offset-4 hover:text-success transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

function ChecklistRequirement({ checked, label }: { checked: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 bg-current transition-colors ${
          checked ? "text-accent" : "text-muted-foreground/30"
        }`}
      />
      <span className={checked ? "text-foreground" : "text-muted-foreground/50"}>
        {label}
      </span>
    </li>
  );
}
