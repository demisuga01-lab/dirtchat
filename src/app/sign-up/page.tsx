import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/utils";
import { SignUpForm, type LegalDocOption } from "@/components/auth/sign-up-form";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { SupabaseConfigNotice } from "@/components/app/setup-notice";
import { DirtchatLogo } from "@/components/brand/dirtchat-logo";

export const metadata = {
  title: "Create your account",
};

export default async function SignUpPage() {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      redirect("/dashboard");
    }
  }

  // Fetch active legal documents for display on the sign-up form
  let legalDocs: LegalDocOption[] = [];
  if (isConfigured) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("legal_documents")
        .select("id, document_type, version, title")
        .eq("is_active", true);
      legalDocs = (data ?? []) as LegalDocOption[];
    } catch {
      // Non-fatal - form will render without checkboxes
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
            <div className="flex flex-col gap-2 mb-2">
              <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Create account</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Start building your workspace.
              </p>
            </div>
            <SignUpForm legalDocs={legalDocs} />
          </div>
        </div>

        {/* Side Column: Onboarding Steps */}
        <div className="hidden lg:col-span-5 lg:flex flex-col justify-between p-16 border-l border-border bg-muted/10">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-accent uppercase mb-12">
              [ DIR-AUTH / ONB-01 ]
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-3 leading-none">
                  Create your workspace
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Start with email and password. Add providers after sign-up.
                </p>
              </div>

              {/* Onboarding steps list */}
              <div className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">1. Create account</span>
                  <span className="text-xs text-muted-foreground">Register your credentials.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">2. Accept Terms</span>
                  <span className="text-xs text-muted-foreground">Review and agree to legal guidelines.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">3. Add providers</span>
                  <span className="text-xs text-muted-foreground">Input API keys in your private settings.</span>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">4. Start a thread</span>
                  <span className="text-xs text-muted-foreground">Begin chatting with your chosen models.</span>
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
