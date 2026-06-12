import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, KeyRound } from "lucide-react";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { isConfigured } = getSupabaseEnv();
  const supabase = isConfigured ? await createClient() : null;
  const { data } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const user = data.user;

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "—";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="max-w-2xl text-muted-foreground">
          Manage your profile, theme preferences, and provider placeholders.
          Provider keys are not collected in Prompt 1.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your account information from Supabase Auth.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Field label="Email" value={user?.email ?? "Not signed in"} />
            <Field
              label="Display name"
              value={displayName}
            />
            <Field
              label="User ID"
              value={user?.id ?? "—"}
              mono
            />
            <Field
              label="Auth provider"
              value={user?.app_metadata?.provider ?? "email"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Theme and appearance. Toggle in the top right.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Field label="Theme" value="System (toggle in the top right)" />
            <Field
              label="Time zone"
              value={
                Intl.DateTimeFormat().resolvedOptions().timeZone || "—"
              }
            />
            <p className="text-xs text-muted-foreground">
              Additional preferences (model defaults, reasoning toggle, etc.)
              arrive in later prompts.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Providers</CardTitle>
              <Badge variant="outline">Coming next</Badge>
            </div>
            <CardDescription>
              TokenRouter, OpenRouter, OpenAI, Anthropic, and custom routers
              are stubbed here for now. Real key storage ships in Prompt 2.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button href="/settings/providers" variant="outline">
              <KeyRound className="h-4 w-4" />
              Open provider placeholders
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Sign out of this device. Your data is preserved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={
          mono
            ? "rounded-md bg-muted/40 px-2 py-1 font-mono text-xs"
            : "text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
