# Full Auth & Brand Landing Rebuild — Pre-Implementation Audit

**Date:** 2026-06-13
**Commit:** 4a34153
**Branch:** main (clean, no uncommitted changes)

## Repository State

- 11 commits on main
- No uncommitted changes, no staged files
- `.env.local` exists (contents not printed)
- `.commandcode/` is untracked (ignored)

## Supabase Project Verification (dilfbodsntbnewrlluia)

### Tables (15 total, all RLS enabled)

| Table | Rows | RLS |
|---|---|---|
| profiles | 0 | ✅ |
| provider_connections | 0 | ✅ |
| provider_connection_secrets | 0 | ✅ |
| provider_models | 0 | ✅ |
| model_capabilities | 0 | ✅ |
| model_discovery_runs | 0 | ✅ |
| model_discovery_events | 0 | ✅ |
| chat_threads | 0 | ✅ |
| chat_messages | 0 | ✅ |
| chat_generation_runs | 0 | ✅ |
| user_preferences | 0 | ✅ |
| legal_documents | 2 | ✅ |
| user_legal_acceptances | 0 | ✅ |
| user_account_events | 0 | ✅ |
| mcp_connection_test | 1 | ✅ (no policies) |

### RLS Policies — All user-owned tables verified

- All user-owned tables have SELECT/INSERT/UPDATE/DELETE policies with `auth.uid() = user_id`
- UPDATE policies have both USING and WITH CHECK ✅
- `provider_connection_secrets` has NO SELECT policy ✅ (by design)
- `legal_documents` has read-only SELECT for authenticated ✅

### Legal Documents

- Terms of Service v1.0.0 — active ✅
- Privacy Policy v1.0.0 — active ✅

### Storage Buckets (3)

| Bucket | Public | Size Limit | Policies |
|---|---|---|---|
| chat-attachments | No | 50MB | select/insert/update/delete (own) |
| avatars | Yes | 5MB | select (public), insert/update/delete (own) |
| temp-uploads | No | 100MB | select/insert/update/delete (own) |

### Migrations (8 in Supabase, 7 local)

Remote has `mcp_connection_test_table` from earlier test (expected).

### Security Advisor Findings

1. **WARN**: `handle_new_user()` SECURITY DEFINER callable by anon/authenticated
2. **WARN**: `rls_auto_enable()` SECURITY DEFINER callable by anon/authenticated
3. **WARN**: `avatars` public bucket allows listing
4. **INFO**: `mcp_connection_test` has no RLS policies
5. **WARN**: `set_updated_at()` has mutable search_path

## Existing Auth System Assessment

### What works

- Three-state env detection (missing/demo/ready) ✅
- Sign-in form with Password/Email code tabs ✅
- Sign-up form with display name, email, password, confirm, terms/privacy checkboxes ✅
- API routes: sign-up, sign-in-password, request-otp, verify-otp, sign-out ✅
- Legal acceptance gate in protected layout ✅
- Account event recording ✅
- Middleware session refresh ✅

### What needs improvement

- Config state messages could be more specific (show exact missing var names)
- Sign-in/Sign-up pages have basic AuthCard styling (could be more polished)
- No resend/countdown on OTP tab
- Logo is just a "D" in a colored square — needs original mark
- Landing animation is gradient-only — generic
- No unique product visual
- Security advisors have 5 warnings to fix

## Tools Available

- **Supabase MCP**: 17 tools, all verified working
- **Stitch**: 14 tools available, no existing projects
- **Git**: clean working tree

## Implementation Plan

1. Fix security advisor warnings via migration
2. Create Stitch project and design system for Dirtchat
3. Design key screens in Stitch for direction
4. Implement original Dirtchat logo/brand mark
5. Rebuild landing with unique animation
6. Polish auth pages with better config state messaging
7. Polish public pages
8. Update README and .env.example
9. Build, lint, secret scan
10. Commit and push
