import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/utils";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm, type LegalDocOption } from "@/components/auth/sign-up-form";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { SupabaseConfigNotice } from "@/components/app/setup-notice";

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
          <AuthCard
            title="Create your account"
            description="A few details and you're in. You can change anything later."
          >
            <SignUpForm legalDocs={legalDocs} />
          </AuthCard>
        </div>
      </main>
    </div>
  );
}

