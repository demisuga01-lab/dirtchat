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

  const termsDoc = legalDocs.find((d) => d.document_type === "terms_of_service");
  const privacyDoc = legalDocs.find((d) => d.document_type === "privacy_policy");
  const emailValid = email.includes("@");
  const passwordLengthValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const passwordMismatch = password && confirmPassword && !passwordsMatch;

  const canSubmit = acceptedTerms && acceptedPrivacy && passwordsMatch && passwordLengthValid && emailValid;

  const disabledReason = React.useMemo(() => {
    if (!isConfigured) {
      if (configState.status === "missing") {
        return `Missing environment variables: ${(configState as { missing: string[] }).missing.join(", ")}`;
      }
      return "Replace demo Supabase keys in .env.local, then restart the dev server.";
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4.5" noValidate>
      {!isConfigured ? (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          {configState.status === "missing"
            ? `The following environment variables are not set: ${(configState as { missing: string[] }).missing.join(", ")}. Add them to .env.local and restart the dev server.`
            : `Demo placeholder keys detected in: ${(configState as { demo: string[] }).demo.join(", ")}. Replace them with real values in .env.local and restart the dev server.`}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="display-name">Display name</Label>
        <Input
          id="display-name"
          name="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          disabled={!isConfigured || loading}
        />
      </div>

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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          disabled={!isConfigured || loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
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
        />
        {passwordMismatch ? (
          <p className="text-xs text-destructive">Passwords do not match.</p>
        ) : null}
      </div>

      {/* Legal acceptance checkboxes — always rendered */}
      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/20 transition-colors">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={loading}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-success focus:ring-success accent-success"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I have read and agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-medium text-foreground underline underline-offset-4 hover:text-success"
            >
              Terms of Service
            </Link>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/20 transition-colors">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            disabled={loading}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-success focus:ring-success accent-success"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I have read and agree to the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium text-foreground underline underline-offset-4 hover:text-success"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in"
        >
          {error}
        </p>
      ) : null}

      {info ? (
        <p
          role="status"
          className="rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground animate-fade-in"
        >
          {info}
        </p>
      ) : null}

      {/* Account creation requirements checklist */}
      {isConfigured && !canSubmit && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
          <span className="font-semibold text-muted-foreground block mb-2">Registration checklist:</span>
          <ul className="space-y-1.5 font-medium">
            <ChecklistRequirement checked={emailValid} label="Valid email address" />
            <ChecklistRequirement checked={passwordLengthValid} label="Password (8+ characters)" />
            <ChecklistRequirement checked={passwordsMatch && !!password} label="Passwords match" />
            <ChecklistRequirement checked={acceptedTerms} label="Accept Terms of Service" />
            <ChecklistRequirement checked={acceptedPrivacy} label="Accept Privacy Policy" />
          </ul>
        </div>
      )}

      {/* Disabled reason prompt */}
      {!canSubmit && disabledReason && (
        <div className="rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-center text-xs text-amber-500 animate-fade-in font-medium">
          {disabledReason}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isConfigured || loading || !canSubmit}
        className="w-full"
      >
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-2">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline hover:text-success transition-colors"
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
        className={`h-2 w-2 rounded-full transition-colors ${
          checked ? "bg-success" : "bg-muted-foreground/30"
        }`}
      />
      <span className={checked ? "text-foreground" : "text-muted-foreground/70"}>
        {label}
      </span>
    </li>
  );
}
