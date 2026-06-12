import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordAccountEvent } from "@/lib/account/account-events";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Record login event
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user) {
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;
    const ua = request.headers.get("user-agent") ?? undefined;
    try {
      await recordAccountEvent(userData.user.id, "login", { method: "password" }, ip, ua);
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json({ ok: true });
}
