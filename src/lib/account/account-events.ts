import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function recordAccountEvent(
  userId: string,
  eventType: string,
  eventData: Record<string, unknown> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("user_account_events").insert({
    user_id: userId,
    event_type: eventType,
    event_data: eventData,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
  });
  if (error) throw error;
}
