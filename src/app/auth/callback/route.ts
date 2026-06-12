import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback route. Exchanges a Supabase auth code for a session
 * cookie and redirects the user to the requested URL (default: /dashboard).
 *
 * Used for OAuth providers and magic-link email confirmation flows.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fall back to sign-in with an error marker.
  return NextResponse.redirect(`${origin}/sign-in?error=auth-callback-failed`);
}
