# Dirtchat Auth/Env Repair Audit

**Date:** 2026-06-12  
**Branch:** main  
**Commit:** e634d65

## Files Read

- package.json, .gitignore, .env.example, README.md
- src/app/sign-in/page.tsx, src/app/sign-up/page.tsx
- src/components/auth/sign-in-form.tsx, sign-up-form.tsx, auth-card.tsx, sign-out-button.tsx
- src/components/app/setup-notice.tsx
- src/lib/utils.ts (getSupabaseEnv)
- src/lib/env/server.ts (getServerEnv, requireServiceRole)
- src/lib/supabase/client.ts, server.ts, admin.ts, middleware.ts
- src/lib/auth/auth-service.ts (full auth service - currently unused by API routes)
- src/lib/account/legal-service.ts, account-events.ts
- src/app/api/auth/sign-up/route.ts, sign-in-password/route.ts, request-otp/route.ts, verify-otp/route.ts, sign-out/route.ts
- src/app/api/legal/active/route.ts, accept/route.ts, acceptances/route.ts
- src/app/api/health/runtime/route.ts
- src/app/(app)/layout.tsx (ProtectedLayout)
- src/app/accept-terms/page.tsx, accept-terms-form.tsx
- src/app/auth/callback/route.ts
- src/middleware.ts
- supabase/migrations/20260612220000_auth_legal_profile_complete.sql

## .env.local Status

- EXISTS: Yes
- NEXT_PUBLIC_SUPABASE_URL: PRESENT
- NEXT_PUBLIC_SUPABASE_ANON_KEY: PRESENT
- SUPABASE_SERVICE_ROLE_KEY: PRESENT
- PROVIDER_KEY_ENCRYPTION_KEY: PRESENT
- Values type: Unknown (not printed) - verify with demo detection

## .env.example Status

- EXISTS: Yes
- Contains placeholders: your-project-ref, your-supabase-anon-key, your-supabase-service-role-key, base64-encoded-32-byte-key

## .gitignore Status

- Ignores .env, .env*.local, .env.development, .env.production, .env.test: YES
- Ignores .claude/, .agents/, .mcp.json: YES

## Root Cause of "Supabase is not configured" Bug

The `getSupabaseEnv()` function in `src/lib/utils.ts` only detects these placeholder patterns:

```
url.includes("your-project-ref")
anonKey.includes("your-supabase-anon-key")
```

It does NOT detect `DEMO_REPLACE` patterns, `PASTE_`, `REPLACE_`, or any other demo placeholder pattern. If `.env.local` uses demo placeholders like `DEMO_REPLACE_WITH_SUPABASE_ANON_KEY`, they will be treated as **real values** and the app will attempt to use them - failing with 'not configured' at runtime when the Supabase SDK rejects the fake URL/key.

Additionally, even when the env IS configured with real keys, the sign-in/sign-up pages do not show a demo-vs-missing distinction - they only show a binary `isConfigured` boolean.

## Current UI State

### Sign-in page
- Has SetupNotice when `!isConfigured` (binary)
- Has AuthCard with SignInForm when configured
- SignInForm has Password tab and Email code tab ✓
- Uses "Email code" label ✓
- No OAuth/social buttons ✓
- No magic-link wording ✓
- Missing: three-state detection (missing vs demo vs ready)

### Sign-up page
- Has SetupNotice when `!isConfigured`
- Has AuthCard with SignUpForm
- SignUpForm has: Display name, Email, Password
- Has Terms and Privacy checkboxes ✓
- Checkboxes not preselected ✓
- Missing: Confirm password field
- Missing: three-state detection
- Missing: demo placeholder warning

### API routes
- All 5 auth endpoints exist and are functional
- Sign-up records legal acceptances ✓
- Sign-up records account event ✓
- Sign-in-password records login event ✓
- Verify-otp records login event ✓
- Sign-out records logout event ✓
- Missing: Confirm password validation in sign-up route

## Current Legal Integration State

- legal_documents table created via migration ✓
- user_legal_acceptances table created ✓
- user_account_events table created ✓
- Profiles enhancement (onboarding_completed_at, last_seen_at, account_status, safe_metadata) ✓
- handle_new_user() trigger creates profile + preferences + account event ✓
- Terms v1.0.0 and Privacy v1.0.0 seeded ✓
- Legal gate in ProtectedLayout ✓
- Accept-terms page ✓
- Legal accept API ✓

## Supabase MCP Status

- MCP list_tables: Permission error (insufficient permissions for MCP -32600)
- MCP list_migrations: Zod error (tool parameter mismatch)
- MCP execute_sql: Permission error
- Cannot verify live Supabase state through MCP
- Migration file exists locally: 20260612220000_auth_legal_profile_complete.sql

## Implementation Plan

1. Fix `getSupabaseEnv()` to support three states: missing, demo, ready
2. Add demo placeholder detection for DEMO_REPLACE, your-supabase, PASTE_, REPLACE_ patterns
3. Update SetupNotice to show distinct UI for demo vs missing
4. Add confirm password field to sign-up form and route
5. Update sign-in/sign-up page components to use three-state detection
6. Fix ProtectedLayout for three-state support
7. Update README with auth setup docs
8. Add .env.example missing section about placeholder detection
9. Run lint, build, secret scan
10. Commit and push

## Risks

- If .env.local contains real keys (not confirmed), demo detection must not flag them
- The fix must not break existing auth flows that already work with real keys
- MCP cannot verify database state - migrations must be applied manually if not already done
