import "server-only";
import { createClient } from "@/lib/supabase/server";
import { recordAccountEvent } from "@/lib/account/account-events";
import { recordLegalAcceptance } from "@/lib/account/legal-service";

export type SignUpResult =
  | { ok: true; session: boolean; userId: string }
  | { ok: false; error: string };

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  acceptedLegalDocumentIds: string[],
  ipAddress?: string,
  userAgent?: string
): Promise<SignUpResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || email.split("@")[0] },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data.user) {
    return { ok: false, error: "Could not create user." };
  }

  // Record legal acceptances using admin client (bypasses RLS)
  for (const docId of acceptedLegalDocumentIds) {
    try {
      await recordLegalAcceptance(data.user.id, docId, ipAddress, userAgent);
    } catch {
      // Non-fatal: acceptance can be done later via the gate
    }
  }

  return {
    ok: true,
    session: !!data.session,
    userId: data.user.id,
  };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Record login event
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      await recordAccountEvent(userData.user.id, "login", { method: "password" });
    }
  } catch {
    // Non-fatal
  }

  return { ok: true };
}

export async function requestOtp(email: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function verifyOtp(email: string, token: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Record login event
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      await recordAccountEvent(userData.user.id, "login", { method: "otp" });
    }
  } catch {
    // Non-fatal
  }

  return { ok: true };
}

export async function signOut(): Promise<void> {
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
}

export async function updateProfileDisplayName(userId: string, displayName: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  try {
    await recordAccountEvent(userId, "profile_updated", { display_name: displayName });
  } catch {
    // Non-fatal
  }

  return { ok: true };
}
