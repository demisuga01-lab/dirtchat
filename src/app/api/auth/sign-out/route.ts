import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordAccountEvent } from "@/lib/account/account-events";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      await recordAccountEvent(userData.user.id, "logout", {}).catch(() => {});
    }
  } catch {
    // Non-fatal
  }

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
