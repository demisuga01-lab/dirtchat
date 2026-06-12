import "server-only";

import { createClient as createUserClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DashboardSummary = {
  user: {
    email: string | undefined;
    displayName: string | undefined;
    createdAt: string | undefined;
  };
  readiness: {
    accountReady: boolean;
    providersCount: number;
    modelsCount: number;
    chatsCount: number;
    defaultModelId: string | undefined;
  };
  recentChats: DashboardThread[];
  preferences: {
    theme: string;
    density: string;
    chatEnterToSend: boolean;
    chatShowTimestamps: boolean;
    chatShowTokenUsage: boolean;
  } | null;
};

export type DashboardThread = {
  id: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt: string | undefined;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

async function requireUserId(): Promise<{ userId: string; email?: string | undefined; displayName?: string | undefined; createdAt?: string | undefined }> {
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("You must be signed in.");
  }
  const u = data.user;
  return {
    userId: u.id,
    email: u.email,
    displayName: (u.user_metadata?.display_name as string) ?? u.email?.split("@")[0],
    createdAt: u.created_at,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { userId, email, displayName, createdAt } = await requireUserId();
  const supabase = await createUserClient();

  // Count providers, models, chats
  const [
    { count: providersCount },
    { count: modelsCount },
    { count: chatsCount },
    { data: recentChats },
    { data: prefs },
  ] = await Promise.all([
    supabase.from("provider_connections").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("provider_models").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_available", true),
    supabase.from("chat_threads").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_archived", false),
    supabase.from("chat_threads")
      .select("id, title, is_pinned, is_archived, last_message_at, created_at")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("is_pinned", { ascending: false })
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(10),
    supabase.from("user_preferences")
      .select("theme, density, chat_enter_to_send, chat_show_timestamps, chat_show_token_usage")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const recentChatsList: DashboardThread[] = (recentChats ?? []).map((t: Record<string, unknown>) => ({
    id: t.id as string,
    title: t.title as string,
    isPinned: Boolean(t.is_pinned),
    isArchived: Boolean(t.is_archived),
    lastMessageAt: t.last_message_at as string | undefined,
    createdAt: t.created_at as string,
  }));

  return {
    user: {
      email,
      displayName,
      createdAt,
    },
    readiness: {
      accountReady: true,
      providersCount: providersCount ?? 0,
      modelsCount: modelsCount ?? 0,
      chatsCount: chatsCount ?? 0,
      defaultModelId: undefined,
    },
    recentChats: recentChatsList,
    preferences: prefs ? {
      theme: (prefs as Record<string, unknown>).theme as string,
      density: (prefs as Record<string, unknown>).density as string,
      chatEnterToSend: Boolean((prefs as Record<string, unknown>).chat_enter_to_send),
      chatShowTimestamps: Boolean((prefs as Record<string, unknown>).chat_show_timestamps),
      chatShowTokenUsage: Boolean((prefs as Record<string, unknown>).chat_show_token_usage),
    } : null,
  };
}

export function timeOfDay(): string {
  return getTimeOfDay();
}
