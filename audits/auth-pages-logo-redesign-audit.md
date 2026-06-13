# Audit: Auth Pages & Logo Redesign

## 1. Project Context
* **Current Branch**: `main`
* **Current Commit**: `57d521d` (fix: remove fake landing preview and harden auth UX)
* **GitHub Repository**: `https://github.com/demisuga01-lab/dirtchat.git`
* **Local Path**: `E:\nvidiatest\hosting`
* **Design Direction**: Swiss International + Dark Mode First

## 2. Files Inspected
* `src/app/sign-in/page.tsx`
* `src/app/sign-up/page.tsx`
* `src/components/auth/sign-in-form.tsx`
* `src/components/auth/sign-up-form.tsx`
* `src/components/brand/dirtchat-logo.tsx`
* `src/components/brand/brand-mark.tsx`
* `src/components/marketing/marketing-header.tsx`
* `src/components/app/sidebar.tsx`
* `src/components/app/mobile-nav.tsx`
* `src/app/layout.tsx`
* `src/app/globals.css`
* `src/app/icon.svg`
* `public/dirtchat-mark.svg`
* `src/app/api/auth/sign-up/route.ts`
* `src/lib/auth/auth-service.ts`
* `src/lib/account/legal-service.ts`

## 3. Current Problems

### 3.1. Sign-In Page Flaws
* **Weak Presentation**: A tiny centered form card with huge empty vertical/horizontal space. No solid branding presence.
* **Lack of Swiss Structure**: The layout lacks a grid-based columns system that presents a technical, professional aesthetic.
* **No Side Content**: No informational/spec panels to explain the value proposition of logging in (threads, keys, ownership).

### 3.2. Sign-Up Page Flaws
* **Cramped Layout**: Form fields are vertically squashed, label-input pairs lack breathing room.
* **Cluttered Acceptance Checkboxes**: The legal acceptance rows feel bolted on rather than structured.
* **Rough Validation Checklist**: The requirements list is styled like a basic debug console output rather than an elegant onboarding checklist.
* **Visual States**: The disabled submit button is plain grey and feels broken.
* **Disabled Reason**: The warning alert text is styled like a basic error message rather than a normal, clean validation prompt.

### 3.3. Logo Flaws
* **Generic Icon**: The current D mark is too plain and doesn't strongly convey the "multi-model routing" or "workspace thread" concept.
* **Non-Unified Formats**: Different files (`dirtchat-logo.tsx`, `brand-mark.tsx`, `icon.svg`, `dirtchat-mark.svg`) have mismatching paths or details.

## 4. Stitch MCP Logo Plan
* **Goal**: Use Stitch MCP tools only to explore and align on a geometric, technical "D" mark incorporating thread routing logic with a single green accent point.
* **Constraint**: Do not upload secrets or layout changes to Stitch. Execute only the logo search/generation and translate the resulting concept into local inline SVG code.

## 5. Auth Logic Risks
* **Preservation**: The API endpoints (`/api/auth/sign-up`, `/api/auth/sign-in-password`, `/api/auth/request-otp`, etc.) must not be broken or altered in their underlying request/response flow.
* **Checkboxes & API Validation**: The Terms of Service and Privacy Policy checkboxes must remain unselected by default. The Sign-Up form must disable the submit button and show the appropriate error reason if they are unchecked, matching the API's strict legal document check.
* **Public/Private Env Keys**: Rendering logic must only rely on public keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and must fail gracefully if they are missing or still placeholder values.

## 6. Implementation Plan
1. **Explore Logo in Stitch**: Invoke Stitch MCP to generate design variants for the technical logo.
2. **Refine Logo Components**:
   * Implement the final clean SVG logo in `src/components/brand/dirtchat-logo.tsx` and `src/components/brand/brand-mark.tsx`.
   * Update the static asset `public/dirtchat-mark.svg` and the Next.js standard `src/app/icon.svg`.
3. **Redesign Sign-In Page (`src/app/sign-in/page.tsx`)**:
   * Set up a two-column grid on desktop (`grid-cols-1 lg:grid-cols-12`).
   * Main column (left/center) contains the sign-in form card.
   * Right column (side panel) contains the clean Swiss product info rail: *Return to your workspace*, *Threads*, *Providers*, *Models*, *Privacy*.
4. **Redesign Sign-Up Page (`src/app/sign-up/page.tsx`)**:
   * Set up a matching two-column grid layout on desktop.
   * Side panel displays: *Create your workspace*, *Create account*, *Accept Terms*, *Add providers*, *Start a thread*.
5. **Polish Sign-In Form (`src/components/auth/sign-in-form.tsx`)**:
   * Standardize layout margins, tab headers, and input spacing.
6. **Polish Sign-Up Form (`src/components/auth/sign-up-form.tsx`)**:
   * Improve vertical margins, input spacing, and alignment.
   * Redesign the requirements checklist with a clean Swiss typographic style.
   * Polish the disabled submit button styling and the disabled reason prompt.
7. **Verify & Build**:
   * Run dev server (`npm run dev`), visually inspect `/sign-in` and `/sign-up`.
   * Run `npm run lint`, typecheck, and `npm run build` to verify correctness.
   * Conduct a secret scan.
8. **Git Commit**: Stage and commit modified files.
