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
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = React.useState(false);
  const { isConfigured } = getSupabaseEnv();

  const termsDoc = legalDocs.find((d) => d.document_type === "terms_of_service");
  const privacyDoc = legalDocs.find((d) => d.document_type === "privacy_policy");
  const canSubmit = acceptedTerms && acceptedPrivacy;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) {
      setError("Supabase environment is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const acceptedIds: string[] = [];
      if (acceptedTerms && termsDoc) acceptedIds.push(termsDoc.id);
      if (acceptedPrivacy && privacyDoc) acceptedIds.push(privacyDoc.id);

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
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {!isConfigured ? (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Authentication is not configured. Sign-up is unavailable right now.
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
          placeholder="What should we call you?"
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          disabled={!isConfigured || loading}
        />
      </div>

      {/* Legal acceptance checkboxes */}
      {termsDoc ? (
        <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/30 transition-colors">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={loading}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="text-sm text-muted-foreground leading-relaxed">
            I have read and agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
          </span>
        </label>
      ) : null}

      {privacyDoc ? (
        <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/30 transition-colors">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            disabled={loading}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="text-sm text-muted-foreground leading-relaxed">
            I have read and agree to the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {info ? (
        <p
          role="status"
          className="rounded-md border border-border bg-muted/40 p-3 text-sm text-foreground"
        >
          {info}
        </p>
      ) : null}
      <Button type="submit" disabled={!isConfigured || loading || !canSubmit}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
      {!canSubmit && isConfigured ? (
        <p className="text-xs text-muted-foreground text-center">
          You must agree to the Terms of Service and Privacy Policy to create an account.
        </p>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
