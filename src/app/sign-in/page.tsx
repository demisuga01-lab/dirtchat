import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";
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
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
        <Link href="/" className="flex items-center">
          <DirtchatLogo size="sm" showWordmark />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100dvh-4rem)]">
        {/* Main Column: Form Area */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center p-8 lg:p-16 bg-background">
          <div className="w-full max-w-[400px] flex flex-col gap-6">
            <SupabaseConfigNotice />
            <Suspense
              fallback={
                <div className="flex flex-col gap-4">
                  <div className="h-10 w-32 animate-pulse bg-muted" />
                  <div className="h-48 animate-pulse bg-muted" />
                </div>
              }
            >
              <div className="flex flex-col gap-2 mb-2">
                <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Sign in</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Return to your workspace.
                </p>
              </div>
              <SignInForm />
            </Suspense>
          </div>
        </div>

        {/* Side Column: Technical Trust/Context Rail */}
        <div className="hidden lg:col-span-5 lg:flex flex-col justify-between p-16 border-l border-border bg-muted/10">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-accent uppercase mb-12">
              [ DIR-AUTH / RET-01 ]
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-3 leading-none">
                  Return to your workspace
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Threads, providers, and model choices stay organized when you sign in.
                </p>
              </div>

              {/* Trust parameters */}
              <div className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Threads</span>
                  <span className="text-xs text-muted-foreground">Continue saved work.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Providers</span>
                  <span className="text-xs text-muted-foreground">Keep your own keys.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Models</span>
                  <span className="text-xs text-muted-foreground">Switch when needed.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Privacy</span>
                  <span className="text-xs text-muted-foreground">Keep the workspace yours.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono tracking-wider text-muted-foreground">
            DIRTCHAT SECURE AUTH GATEWAY v0.1.0
          </div>
        </div>
      </main>
    </div>
  );
}
