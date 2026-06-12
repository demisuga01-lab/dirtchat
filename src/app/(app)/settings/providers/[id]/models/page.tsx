import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/utils";
import { listProviderModels } from "@/lib/models/model-discovery-service";
import { ModelCatalog } from "@/components/models/model-catalog";
import { SetupNotice } from "@/components/app/setup-notice";
import type { LastRunSummary } from "@/components/models/model-discovery-panel";

export const metadata = {
  title: "Models",
};

export const dynamic = "force-dynamic";

async function loadLastRun(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  providerConnectionId: string
): Promise<LastRunSummary | null> {
  const { data, error } = await supabase
    .from("model_discovery_runs")
    .select(
      "status, started_at, completed_at, models_found, models_added, models_updated, models_marked_unavailable, errors_count, safe_summary, safe_error, request_latency_ms, raw_response_shape"
    )
    .eq("user_id", userId)
    .eq("provider_connection_id", providerConnectionId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as {
    status: string;
    started_at: string;
    completed_at: string | null;
    models_found: number;
    models_added: number;
    models_updated: number;
    models_marked_unavailable: number;
    errors_count: number;
    safe_summary: string | null;
    safe_error: string | null;
    request_latency_ms: number | null;
    raw_response_shape: string | null;
  };
  return {
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    modelsFound: row.models_found,
    modelsAdded: row.models_added,
    modelsUpdated: row.models_updated,
    modelsMarkedUnavailable: row.models_marked_unavailable,
    errorsCount: row.errors_count,
    safeSummary: row.safe_summary,
    safeError: row.safe_error,
    latencyMs: row.request_latency_ms,
    rawResponseShape: row.raw_response_shape,
  };
}

export default async function ProviderModelsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    return (
      <SetupNotice
        title="Backend is not configured"
        description="Set up your environment variables, then restart the dev server."
      />
    );
  }
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    redirect("/sign-in");
  }
  const userId = userData.user.id;

  // Verify provider ownership.
  const { data: provider, error: providerErr } = await supabase
    .from("provider_connections")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (providerErr) {
    return (
      <SetupNotice
        title="Could not load provider"
        description="Try again in a moment. If the problem persists, sign out and back in."
      />
    );
  }
  if (!provider) {
    notFound();
  }

  let models = [] as Awaited<ReturnType<typeof listProviderModels>>["models"];
  let hasSecret = false;
  try {
    const result = await listProviderModels(id);
    models = result.models;
    hasSecret = result.hasSecret;
  } catch {
    models = [];
  }

  const lastRunSummary = await loadLastRun(supabase, userId, id);

  return (
    <ModelCatalog
      provider={provider as Awaited<ReturnType<typeof listProviderModels>>["provider"]}
      initialModels={models}
      hasSecret={hasSecret}
      lastRunSummary={lastRunSummary}
    />
  );
}
