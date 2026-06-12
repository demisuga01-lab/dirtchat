import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { SupabaseConfigNotice } from "@/components/app/setup-notice";
import { DirtchatLogo } from "@/components/brand/dirtchat-logo";

export const metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const { isConfigured } = getSupabaseEnv();
  if (isConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-background">
      {/* Dot grid background pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--muted-foreground) / 0.07) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-sm">
        <Link href="/" className="flex items-center">
          <DirtchatLogo size="sm" showWordmark />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-md flex-col gap-4">
          <SupabaseConfigNotice />
          <Suspense
            fallback={
              <AuthCard title="Sign in" description="Loading…">
                <div className="h-24 animate-pulse-soft rounded-md bg-muted" />
              </AuthCard>
            }
          >
            <AuthCard
              title="Welcome back"
              description="Sign in to continue to your Dirtchat workspace."
            >
              <SignInForm />
            </AuthCard>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
