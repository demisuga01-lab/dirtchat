# Dirtchat Dashboard & Chat Workspace Refinement Audit

## 1. Project Context
* **Branch**: `main`
* **Commit**: `fff78f9`

## 2. Files Read
* `src/app/(app)/layout.tsx`
* `src/app/(app)/dashboard/page.tsx`
* `src/app/(app)/chat/page.tsx`
* `src/app/(app)/settings/page.tsx`
* `src/components/app/app-shell.tsx`
* `src/components/app/sidebar.tsx`
* `src/components/app/mobile-nav.tsx`
* `src/components/dashboard/dashboard-home.tsx`
* `src/components/chat/chat-workspace.tsx`
* `src/components/chat/chat-thread-sidebar.tsx`
* `src/components/chat/chat-message.tsx`
* `src/components/chat/chat-message-list.tsx`
* `src/components/chat/chat-composer.tsx`
* `src/components/chat/chat-model-selector.tsx`
* `src/components/chat/chat-empty-state.tsx`
* `src/components/chat/use-chat-stream.ts`
* `src/components/settings/settings-center.tsx`
* `src/app/globals.css`
* `tailwind.config.ts`

## 3. Current Dashboard Problems
* **Lack of Structure and Hierarchy**: The current home dashboard feels sparse with generic quick action buttons and readiness chips that look too plain.
* **Bare Spacing and Weak Typography**: Uses generic grey borders and low-contrast text.
* **Horizontal Scroll**: Potential overflow on smaller screen widths.

## 4. Current Sidebar Problems
* **No Minimize/Collapse Control**: The `WorkspaceSidebar` has a fixed width `md:w-64` and cannot be minimized or collapsed to save screen space.
* **No Collapsed Layout State**: Lacks a compact rail layout for desktop/tablet screens.
* **No Persistence**: The preferences database field `sidebar_collapsed` is not loaded or synchronized with the sidebar state.

## 5. Current Chat UI Problems
* **Bubble Layout vs. Centered ChatGPT Layout**: The messages are currently aligned as separate left/right chat bubbles (`justify-end` / `justify-start` with background fills), which consumes horizontal space. It needs a centered, clean, maximum-width message column (ChatGPT style).
* **Weak Composer Styling**: The text editor needs better padding, keyboard-friendly height adjustments, and cleaner integration. Double wrapping borders/margins are present when no thread is active.
* **Muted/Low Contrast Text**: Overuse of low-contrast slate/gray colors.

## 6. Current Provider/Custom Provider Support Risks
* **Assumption Handling**: Must ensure custom providers or OpenAI-compatible backends are supported cleanly without assuming hardcoded vendor names, and fall back safely if model metadata or capabilities are unknown.

## 7. Muted Text/Token Usage Found
* Heavy usage of `text-muted-foreground` and HSL `--muted-foreground` values (`hsl(0 0% 63.9%)` in dark mode) which yield a low-contrast ratio (less than 4.5:1).
* Hardcoded colors like `text-slate-400`, `text-zinc-400`, and `text-gray-400` that wash out the interface.

## 8. Authorization-Sensitive Areas
* API endpoints must remain protected by the server-side session checks.
* Scoped database RLS rules on `chat_threads`, `chat_messages`, and `provider_connections` must not be bypassed or broken.

## 9. Implementation Plan
1. **Collapsible Sidebar**:
   * Add a `collapsed` state to `WorkspaceSidebar`.
   * Add minimize/expand buttons with tooltips.
   * Persist the sidebar state in `user_preferences` through a state update call.
   * Shrink `WorkspaceSidebar` width to `w-16` when collapsed, hiding text labels and showing only icons.
2. **Refined Dashboard**:
   * Redesign the dashboard with a clean Swiss International grid layout.
   * Elevate the layout contrast, clean up cards, and improve typography.
   * Ensure responsiveness and avoid horizontal scrollbar.
3. **ChatGPT-style Chat Interaction**:
   * Modify the message list layout to use a centered, max-width (`max-w-3xl`) column.
   * Make user and assistant messages align together in a clean timeline view with high-contrast text.
   * Retain Dirtchat's visual Swiss design (thin dividers, dark-mode first, minimal green accents).
4. **Contrast Adjustment**:
   * Adjust `--muted-foreground` HSL colors in `src/app/globals.css` to increase contrast.
   * Map `text-muted-foreground` to a crisp, legible grey.
5. **Lint and Build Validation**:
   * Run full code validation (`npm run lint`, `npx tsc`, `npm run build`).

## 10. Risks
* Breaking CSS layout on route transition due to sidebar size changes.
* Breaking responsive mobile width when collapsing sidebar.
* Storing API secrets: must verify secrets are kept server-side only.
