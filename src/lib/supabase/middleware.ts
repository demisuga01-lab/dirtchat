import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/utils";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Middleware-side Supabase client. Used to refresh the user session
 * cookie on every request and to gate protected routes.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    // Without env vars we cannot talk to Supabase, but we still let
    // the request proceed. Pages will render a "not configured" state.
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: must call getUser() to refresh the session cookie.
  await supabase.auth.getUser();

  return response;
}
