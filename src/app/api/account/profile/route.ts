import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordAccountEvent } from "@/lib/account/account-events";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { displayName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.displayName === "string" && body.displayName.trim().length > 0) {
    updates.display_name = body.displayName.trim();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userData.user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;
  const ua = request.headers.get("user-agent") ?? undefined;

  try {
    await recordAccountEvent(userData.user.id, "profile_updated", updates, ip, ua);
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ ok: true });
}
