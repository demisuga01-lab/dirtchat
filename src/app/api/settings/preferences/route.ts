import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_BOOLEANS = [
  "sidebar_collapsed",
  "chat_enter_to_send",
  "chat_show_timestamps",
  "chat_show_token_usage",
  "chat_auto_scroll",
  "chat_markdown_enabled",
  "chat_code_copy_enabled",
];

const ALLOWED_TEXT = ["theme", "density"];

const THEME_VALUES = ["light", "dark", "system"];
const DENSITY_VALUES = ["compact", "comfortable", "spacious"];

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = data.user.id;

  const { data: prefs, error: prefError } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (prefError) {
    return NextResponse.json({ error: "Failed to load preferences" }, { status: 500 });
  }

  return NextResponse.json(prefs ?? { user_id: userId });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = data.user.id;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  for (const key of ALLOWED_BOOLEANS) {
    if (key in body) {
      updates[key] = Boolean(body[key]);
    }
  }

  for (const key of ALLOWED_TEXT) {
    if (key in body) {
      const val = String(body[key]);
      if (key === "theme" && !THEME_VALUES.includes(val)) {
        return NextResponse.json({ error: `Invalid theme value: ${val}` }, { status: 400 });
      }
      if (key === "density" && !DENSITY_VALUES.includes(val)) {
        return NextResponse.json({ error: `Invalid density value: ${val}` }, { status: 400 });
      }
      updates[key] = val;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data: result, error: upsertError } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, ...updates }, { onConflict: "user_id" })
    .select()
    .single();

  if (upsertError) {
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }

  return NextResponse.json(result);
}
