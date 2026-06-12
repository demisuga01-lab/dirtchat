import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env/server";
import { createAdminClient } from "@/lib/supabase/admin";

type EnvStatus = Record<string, boolean>;
type TableStatus = Record<string, boolean>;
type BucketStatus = Record<string, boolean>;

interface HealthResponse {
  ok: boolean;
  env: EnvStatus;
  database: {
    checked: boolean;
    tables: TableStatus;
    error?: string;
  };
  storage: {
    checked: boolean;
    buckets: BucketStatus;
    error?: string;
  };
}

const EXPECTED_TABLES = [
  "profiles",
  "provider_connections",
  "provider_connection_secrets",
  "provider_models",
  "model_capabilities",
  "chat_threads",
  "chat_messages",
  "chat_generation_runs",
];

const EXPECTED_BUCKETS = [
  "chat-attachments",
  "temp-uploads",
  "avatars",
];

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getServerEnv();

  const envStatus: EnvStatus = {
    NEXT_PUBLIC_SUPABASE_URL: env.supabaseIsConfigured,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.supabaseIsConfigured,
    SUPABASE_SERVICE_ROLE_KEY: env.supabaseServiceRoleConfigured,
    PROVIDER_KEY_ENCRYPTION_KEY: env.providerKeyEncryptionKeyConfigured,
  };

  const tableStatus: TableStatus = {};
  let dbError: string | undefined;
  let dbChecked = false;

  try {
    const admin = createAdminClient();
    const { data: tables, error } = await admin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", EXPECTED_TABLES);

    if (error) {
      dbError = "query failed";
    } else {
      dbChecked = true;
      const found = new Set((tables ?? []).map((t: { table_name: string }) => t.table_name));
      for (const name of EXPECTED_TABLES) {
        tableStatus[name] = found.has(name);
      }
    }
  } catch {
    dbError = "admin client not available";
  }

  const bucketStatus: BucketStatus = {};
  let storageError: string | undefined;
  let storageChecked = false;

  try {
    const admin = createAdminClient();
    const { data: buckets, error } = await admin
      .storage
      .listBuckets();

    if (error) {
      storageError = "query failed";
    } else {
      storageChecked = true;
      const found = new Set((buckets ?? []).map((b: { id: string }) => b.id));
      for (const name of EXPECTED_BUCKETS) {
        bucketStatus[name] = found.has(name);
      }
    }
  } catch {
    storageError = "admin client not available";
  }

  const allEnvOk = Object.values(envStatus).every(Boolean);
  const allTablesOk = dbChecked && Object.values(tableStatus).every(Boolean);
  const allBucketsOk = storageChecked && Object.values(bucketStatus).every(Boolean);

  const ok =
    allEnvOk &&
    (!dbChecked || allTablesOk) &&
    (!storageChecked || allBucketsOk);

  const response: HealthResponse = {
    ok,
    env: envStatus,
    database: {
      checked: dbChecked,
      tables: tableStatus,
      ...(dbError ? { error: dbError } : {}),
    },
    storage: {
      checked: storageChecked,
      buckets: bucketStatus,
      ...(storageError ? { error: storageError } : {}),
    },
  };

  return NextResponse.json(response, {
    status: ok ? 200 : 503,
  });
}
