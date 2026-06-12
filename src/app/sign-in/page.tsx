import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { SupabaseConfigNotice } from "@/components/app/setup-notice";

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
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border/60 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            D
          </div>
          Dirtchat
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
