import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";
import { AppShell } from "@/components/app/app-shell";
import { SupabaseConfigNotice } from "@/components/app/setup-notice";
import { checkUserNeedsAcceptance } from "@/lib/account/legal-service";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col gap-4 px-4 py-12">
        <SupabaseConfigNotice />
        {children}
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/sign-in");
  }

  // Legal acceptance gate — redirect to /accept-terms if pending
  try {
    const { needsAcceptance } = await checkUserNeedsAcceptance(data.user.id);
    if (needsAcceptance) {
      redirect("/accept-terms");
    }
  } catch {
    // Fail open if legal check errors
  }

  const userLabel = data.user.email ?? data.user.user_metadata?.display_name ?? undefined;

  let initialSidebarCollapsed = false;
  try {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("sidebar_collapsed")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (prefs) {
      initialSidebarCollapsed = !!prefs.sidebar_collapsed;
    }
  } catch {
    // Fail silent
  }

  return (
    <AppShell
      title="Dirtchat"
      userLabel={userLabel}
      userEmail={data.user.email}
      initialSidebarCollapsed={initialSidebarCollapsed}
    >
      {children}
    </AppShell>
  );
}
