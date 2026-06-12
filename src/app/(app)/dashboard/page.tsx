import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Settings as SettingsIcon,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { isConfigured } = getSupabaseEnv();
  const supabase = isConfigured ? await createClient() : null;
  const { data } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const user = data.user;

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "there";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome, {displayName}
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground">
          Your workspace is ready. Auth, layout, multi-model routing, live
          chat streaming, and provider connections are all active.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Auth"
            value="Ready"
            description="Email/password sign in is ready."
            status={isConfigured ? "ready" : "pending"}
          />
        <StatusCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Workspace"
          value="Foundation scaffolded"
          description="App shell, sidebar, dashboard, and chat placeholder."
          status="ready"
        />
        <StatusCard
          icon={<KeyRound className="h-4 w-4" />}
          label="Providers"
          value="Connected"
          description="Bring your own API keys and switch between models."
          status="pending"
        />
        <StatusCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Chat"
          value="UI ready"
          description="Conversation shell, composer, model selector."
          status="ready"
        />
        <StatusCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Reasoning"
          value="Planned"
          description="Thinking controls and advanced model features in a future update."
          status="pending"
        />
        <StatusCard
          icon={<SettingsIcon className="h-4 w-4" />}
          label="Settings"
          value="Available"
          description="Profile, theme, and provider placeholders."
          status="ready"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open the chat workspace</CardTitle>
            <CardDescription>
              Start a conversation with your connected providers. Streaming
              chat is live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button href="/chat">
              Go to chat
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Configure your account</CardTitle>
            <CardDescription>
              Update your profile and preview the provider settings screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button href="/settings" variant="outline">
              Open settings
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  description,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  status: "ready" | "pending";
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {icon}
            {label}
          </div>
          <Badge variant={status === "ready" ? "success" : "outline"}>
            {status === "ready" ? "Ready" : "Pending"}
          </Badge>
        </div>
        <CardTitle className="text-base">{value}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
