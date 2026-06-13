# Dirtchat Authorization Hardening Audit

## 1. Project Context
* **Branch**: `main`
* **Latest Commit Checked**: `2b8fa77eea6363164cbff5d13ee1c7db972fa2b0`

## 2. Scope & Files Audited

### Files Inspected
* `src/middleware.ts`
* `src/app/(app)/layout.tsx`
* `src/lib/supabase/server.ts`
* `src/lib/supabase/admin.ts`
* `src/lib/auth/auth-service.ts`
* `src/lib/account/legal-service.ts`
* `src/lib/account/account-events.ts`
* `src/lib/dashboard/dashboard-service.ts`
* `src/lib/chat/chat-service.ts`
* `src/lib/models/model-discovery-service.ts`
* `src/lib/providers/provider-service.ts`
* All API route files under `src/app/api/**/*.ts`
* All database migration scripts in `supabase/migrations/`

### Tables Inspected
* `profiles`
* `user_preferences`
* `legal_documents`
* `user_legal_acceptances`
* `user_account_events`
* `provider_connections`
* `provider_connection_secrets`
* `provider_models`
* `model_capabilities`
* `model_discovery_runs`
* `model_discovery_events`
* `chat_threads`
* `chat_messages`
* `chat_generation_runs`

### Storage Buckets Inspected
* `avatars` (public bucket, restricted list metadata)
* `chat-attachments` (private bucket)
* `temp-uploads` (private bucket)

---

## 3. Gaps & Vulnerabilities Identified

### 3.1. Route Handler Gaps (GET/POST bypasses)
In `src/app/api/providers/[id]`, several routes were delegating authentication verification to the library service helper (`testConnection`, `refreshProviderModels`, etc.) rather than validating the session at the HTTP route handler layer. If unauthenticated requests hit these endpoints, they fell through to catch blocks returning `400 Bad Request` or `500 Server Error` instead of a standard `401 Unauthorized` response.
* Affected routes:
  * `/api/providers/[id]/test` (POST)
  * `/api/providers/[id]/models/refresh` (POST)
  * `/api/providers/[id]/models` (GET and POST)
  * `/api/providers/[id]/models/[modelId]/default` (POST)
  * `/api/chat/models` (GET)
  * `/api/chat/threads` (GET)

### 3.2. Admin Secret Query Isolation
In `src/lib/providers/provider-service.ts`, the functions `listProviders()` and `getProvider(id)` used the service-role `admin` client to query the `provider_connection_secrets` table without an explicit filter on `user_id`. Although user-ownership checks were performed on the parent `provider_connections` table, querying `provider_connection_secrets` without the matching `user_id` lacked defense-in-depth isolation.

### 3.3. Loose Legal Document SELECT Policy
The select policy for `legal_documents` was allowing authenticated users to select all legal documents, including inactive drafts. Guests (anonymous users) were blocked from selecting documents, requiring Server Components to use the admin client. The policy did not enforce that only active documents are fetched by normal user clients.

### 3.4. Redundant Insert Policy on `user_account_events`
An RLS policy `user_account_events_insert_own` existed allowing authenticated users to directly write arbitrary events to the audit trail. Since account event logging should only happen through trusted server-side code (using the admin service-role client), this policy presented a forging/log-manipulation risk.

---

## 4. Fixes Applied

### 4.1. Route Handler Hardening
Added explicit `supabase.auth.getUser()` session checks at the start of all protected route handlers, returning `401 Unauthorized` immediately if the user is unauthenticated:
* **GET/POST `/api/providers/[id]/models`**
* **POST `/api/providers/[id]/models/refresh`**
* **POST `/api/providers/[id]/models/[modelId]/default`**
* **POST `/api/providers/[id]/test`**
* **GET `/api/chat/models`**
* **GET `/api/chat/threads`**

### 4.2. Service-Role Secret Isolation
Modified `src/lib/providers/provider-service.ts` to include `.eq("user_id", userId)` in all queries to the `provider_connection_secrets` table via the `admin` client:
* **`listProviders()`**: Restricts the batch select of connection secrets to the current user's ID.
* **`getProvider(id)`**: Added `.eq("user_id", userId)` to the secret lookup.

### 4.3. Service-Layer Ownership Defense
Hardened `updateProfileDisplayName` in `src/lib/auth/auth-service.ts` by checking that the logged-in user's ID matches the requested `userId` parameter before executing the mutation, providing defense-in-depth security.

### 4.4. Database Migration (`supabase/migrations/20260613154000_harden_auth_policies.sql`)
* Removed direct user insert policy `user_account_events_insert_own` on `user_account_events`. All inserts now must go through trusted server-side code executing with service-role permissions.
* Replaced `legal_documents_select_authenticated` with `legal_documents_select_active` which permits SELECT queries to both `authenticated` and `anon` roles but restricts selection strictly to active documents (`is_active = true`).

---

## 5. Security & Verification Results

### 5.1. Database RLS Verification
Verified the policies applied to `legal_documents` and `user_account_events`:
* Simulated an authenticated user session in a Postgres transaction using `SET LOCAL request.jwt.claim.sub`.
* Confirmed that selecting from `legal_documents` returns only active documents (`is_active = true`) and excludes inactive drafts.
* Confirmed that inserting directly into `user_account_events` as an authenticated user fails with: `ERROR: 42501: new row violates row-level security policy`.
* Verified that SELECT queries on `provider_connection_secrets` yield 0 records for normal users since no SELECT policy is defined.

### 5.2. Automated Abuse Tests
Started Next.js development server locally and executed `scratch/test-auth-abuse.js`:
* All unauthenticated requests to protected endpoints (`/api/chat/models`, `/api/chat/threads`, `/api/settings/preferences`, etc.) returned `401 Unauthorized` with an error message.
* Confirmed no stack traces, raw environment variables, or database exception details are leaked by the `/api/health/runtime` endpoint.

### 5.3. Build & Linter Checks
* `npm run lint`: Passed with zero warnings or errors.
* `npx tsc --noEmit`: Completed successfully with no TypeScript compilation errors.
* `npm run build`: Production build succeeded.
* `git diff --check`: Passed with no whitespace issues.
