# Auth, Dashboard, Settings & Workspace Polish Audit

**Date:** 2026-06-12
**Branch:** main
**Commit:** 7d5ca2f
**Remote:** https://github.com/demisuga01-lab/dirtchat.git

## Files Read (audit phase)
- All `src/app/(app)/` pages: layout, dashboard, chat, settings, providers
- All `src/components/app/` components: app-shell, sidebar, mobile-nav, theme-toggle, setup-notice
- All `src/components/chat/` components: workspace, thread-sidebar, message-list, message, message-content, composer, model-selector, empty-state, placeholder, conversation-sidebar (prototype), use-chat-stream hook
- All `src/app/api/` routes: chat/models, chat/threads, chat/threads/[id], chat/threads/[id]/messages, chat/stream, providers/[id]/models, providers/[id]/models/refresh, providers/[id]/models/default, providers/[id]/test, health/runtime
- Migration files: all 5 SQL migrations
- `src/lib/chat/types.ts`, `src/lib/chat/chat-service.ts`
- `src/middleware.ts`

## App Shell State
- `AppShell` is client-side, renders Sidebar + Topbar + children
- Topbar has hamburger (mobile), title, userLabel (hidden mobile), theme toggle, sign-out (hidden mobile)
- Mobile nav drawer works via `useEffect` auto-close on route change
- Sidebar only has 4 nav links (Dashboard/Chat/Settings/Providers) — no chat history
- NO user account menu, NO profile info, NO conversation list in sidebar

## Dashboard State (CRITICAL)
- 6 status cards with HARDCODED readiness values ("Providers: Pending")
- Two CTA buttons to Chat and Settings
- No welcome time-of-day greeting
- No recent chats
- No real data — just static placeholder copy
- No dashboard service exists

## Chat Sidebar/History State
- `ChatThreadSidebar` (304 lines, complex) exists inside `ChatWorkspace`
- Thread sidebar shows pinned/recent sections, search, context menu (rename/pin/archive/delete)
- But this is ONLY visible inside `/chat` — NOT in the app sidebar or on dashboard
- The main app sidebar has no chat history at all

## Settings State (CRITICAL)
- Only 4 static cards: Profile (email, display name, user ID), Preferences (static text only), Providers (link), Session (sign out)
- No appearance settings (theme, density)
- No chat behavior preferences
- No persisted preferences
- No data/privacy settings section
- No account editing form

## Authorization State
All API routes are properly secured:
- All derive user from server-side Supabase session (never from client body)
- All DB queries filter by `user_id = session.user.id`
- Thread ownership verified before any operation (`loadThreadOrThrow`)
- Provider connection ownership verified (`loadProviderConnectionOrThrow`)
- Secret decryption scoped to user_id

**No authorization gaps found.** ✅

## Supabase MCP State
- `list_tables` → "You do not have permission" — MCP not authenticated to a project
- Cannot use MCP for schema changes or verification
- Will create local migration SQL for manual application

## User Preferences Table
- Does NOT exist
- Need `user_preferences` table with theme, density, chat settings, defaults
- Should be separate from `profiles` (profiles = identity, preferences = app settings)

## Implementation Plan

### Phase 1: User Preferences Migration
1. Create `supabase/migrations/20260612000600_user_preferences.sql`
2. Table: user_preferences with RL + RLS policies

### Phase 2: Dashboard Service & Enhanced Dashboard
1. Create `src/lib/dashboard/dashboard-service.ts` — load real user data
2. Rewrite `src/app/(app)/dashboard/page.tsx` — real readiness, recent chats, quick actions
3. Create `src/components/dashboard/dashboard-home.tsx` — client component

### Phase 3: Enhanced App Sidebar
1. Show chat history in sidebar (real threads)
2. Add New Chat + Search in sidebar
3. Add account/profile menu at bottom
4. Keep existing nav structure but add conversation section

### Phase 4: Settings Center
1. Create `src/components/settings/settings-center.tsx` — tabbed settings
2. Account settings — display name update, email display, sign out
3. Appearance settings — theme, density (persisted)
4. Chat behavior — enter-to-send, timestamps, token usage (persisted)
5. Provider/model links
6. Data/privacy section
7. Create `src/app/api/settings/preferences/route.ts` — GET/PATCH

### Phase 5: Authorization Polish
1. All routes already verified — no changes needed
2. Health route: keep public but ensure no secrets exposed

### Phase 6: Validation
1. npm run lint
2. npm run build
3. Secret scan
4. Commit and push

## Risks
- MCP unavailable → migration must be applied manually
- Chat sidebar in main app sidebar duplicates ChatThreadSidebar? No — app sidebar shows list, ChatThreadSidebar shows full thread management. They complement each other.
- Profile vs preferences — profiles for identity, user_preferences for settings. No overlap of columns.
