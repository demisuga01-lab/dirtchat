# DIRTCHAT FULL SITE REDESIGN & AUTH EXPERIENCE AUDIT

## 1. Environment & Context
- **Current Branch**: `main`
- **Current Commit**: `d9f3a3e` ("feat: full auth & brand rebuild with original logo, constellation landing, polished auth")
- **Repository**: `https://github.com/demisuga01-lab/dirtchat.git`

## 2. Files Read & Inspected
- `package.json` (Dependencies check, Next.js 15, React 19, Tailwind)
- `src/app/globals.css` (HSL variables mapping theme colors)
- `tailwind.config.ts` (Tailwind color name overrides)
- `src/app/layout.tsx` (Global root layout)
- `src/app/page.tsx` (Homepage loader)
- `src/components/marketing/landing-hero.tsx` (Hero layout and elements)
- `src/components/marketing/product-preview.tsx` (Mockup chat preview)
- `src/components/marketing/marketing-header.tsx` (Logo usage, navigation)
- `src/components/brand/dirtchat-logo.tsx` (Logo SVG definition)
- `src/components/brand/brand-mark.tsx` (SVG brand mark)
- `src/app/sign-in/page.tsx` (Sign-in loader & wrapper)
- `src/app/sign-up/page.tsx` (Sign-up loader & legal docs fetcher)
- `src/components/auth/sign-in-form.tsx` (Password/OTP sign-in component)
- `src/components/auth/sign-up-form.tsx` (Sign-up input & checkboxes)
- `src/app/accept-terms/page.tsx` (Legal acceptance gate page)
- `src/app/accept-terms/accept-terms-form.tsx` (Acceptance button actions)
- `src/app/api/auth/sign-up/route.ts` (Registration backend endpoint)
- `src/app/api/auth/sign-in-password/route.ts` (Password login backend endpoint)
- `src/app/api/auth/request-otp/route.ts` (OTP request endpoint)
- `src/app/api/auth/verify-otp/route.ts` (OTP verification endpoint)
- `src/app/api/legal/accept/route.ts` (Legal acceptance recorder endpoint)
- `src/lib/account/legal-service.ts` (Legal state database layer)
- `src/app/(app)/layout.tsx` (Protected area shell loader)
- `src/components/app/sidebar.tsx` (Application navigation & thread list)
- `src/components/dashboard/dashboard-home.tsx` (Dashboard landing workspace)
- `src/components/settings/settings-center.tsx` (Preferences manager tabs)

## 3. Current Design & Functional Problems

### 3.1 Public Site & Landing Page Problems
- **Theme**: Currently using an indigo/violet/purple theme (`#6366f1` / `#a78bfa`) mapped in Tailwind. This is a generic SaaS palette that feels amateur.
- **Backgrounds**: The dark mode uses blue-tinted dark backgrounds (`hsl(222 47% 6%)` / `hsl(222 47% 8%)`), which creates a cheap glassmorphism appearance.
- **Hero Headline**: Utilizes a purple-to-violet gradient (`bg-gradient-to-r from-[#6366f1] to-[#a78bfa]`), which is overly saturated and not restrained.
- **Hero Motif**: The core visual is the `ModelConstellation` component, which renders abstract floating orbit circles. The user explicitly rejected this motif.
- **Product Clarity**: The landing page looks like a generic placeholder rather than a serious, premium AI workspace for power users who bring their own keys.

### 3.2 Auth UI & UX Problems
- **Visual Weakness**: Auth pages use the generic blue-tinted background, dot grids (`radial-gradient(circle, hsl(var(--muted-foreground) / 0.07) 1px, transparent 1px)`), and heavy glassmorphism cards.
- **Sign-Up Checkbox Bug**: The form uses `canSubmit` logic requiring active `legalDocs` to render the checkboxes. If `legalDocs` fails to fetch or is empty, the checkboxes are hidden and `canSubmit` remains permanently `false`, leaving the "Create account" button disabled forever.
- **Disabled Feedback**: The submit button is disabled without immediate explanations when the form is invalid, or why checkboxes are required.
- **API Logic Defect**: The registration route (`POST /api/auth/sign-up`) accepts and records whatever legal document IDs are submitted in `acceptedLegalDocumentIds`, but it does *not* verify that the active Terms of Service and Privacy Policy IDs are actually present. This means logic-level bypass of legal gates is possible.
- **Magic-link Wording**: Mention of "magic links" was avoided, but needs verification to ensure only "Email code" or "One-time code" is displayed.

### 3.3 App Shell & Dashboard Problems
- **Inconsistent Branding**: Sidebar uses a hardcoded "D" block (`bg-primary text-primary-foreground`) instead of the official product logo or mark.
- **Palette Scattering**: Buttons and hover outlines in the dashboard and settings still use the legacy indigo accent colors or generic gray highlights. They must be aligned to the black-base + light-green accent system.

## 4. Supabase Live State (Verified)
- **Active Legal Documents**:
  - `terms_of_service` (v1.0.0, active, id: `340a881c-621b-4bf2-8b44-49ceee0998f8`)
  - `privacy_policy` (v1.0.0, active, id: `2da4b51b-94a5-4e97-bec9-b04dcca327e7`)
- **Row Level Security (RLS)**: Active and verified for all public tables (e.g., `profiles`, `user_preferences`, `user_legal_acceptances`, `chat_threads`).
- **Storage Buckets**: Verified `chat-attachments`, `temp-uploads`, `avatars` exist and are accessible under appropriate policies.

## 5. Design System Direction
- **Backgrounds**: Deep, true black (`hsl(240 10% 2% / 100%)`) or near-black (`hsl(240 10% 3.9% / 100%)`).
- **Foreground Text**: Crisp white (`#ffffff`) for readability.
- **Secondary Text**: Restrained warm gray (`#a1a1aa`).
- **Accents**: High-precision light green (`#22c55e` / `hsl(142 76% 45%)`) used sparingly (active states, input borders on focus, success indicators, subtle button borders).
- **Primary Buttons**: High-contrast white background with dark text, transitions to light-green borders/glows on hover.
- **Cards**: Dark graphite gray border (`#27272a`) on solid dark card backgrounds, no background dot patterns or orbits.

## 6. Implementation Plan
1. **Theme Overhaul**: Rewrite `src/app/globals.css` HSL variables, removing all purple/blue HSL definitions and styling. Replace with neutral black, crisp white, and restrained green.
2. **Original Logo Rebuild**: Update `src/components/brand/dirtchat-logo.tsx` and `src/components/brand/brand-mark.tsx` to render a modern geometric mark of a letter "D" structured with clean routing paths (representing multi-model organization), using green/white/black palette.
3. **Hero & Mockup Rebuild**: Replace `ModelConstellation` in `landing-hero.tsx` with a composed product UI preview. Rebuild `product-preview.tsx` to show a mockup workspace of Dirtchat: sidebar with threads, active workspace, model switcher, and streaming chat bubbles with clean white/green/gray coloring.
4. **Sign-Up Logic Fix**:
   - Hardcode fallback checkboxes in `SignUpForm` if DB fetch is empty, ensuring Terms and Privacy checkboxes are always displayed and mandatory.
   - Show clear validation warnings if passwords mismatch, are too short, or legal checkboxes are unchecked.
   - In `POST /api/auth/sign-up`, query active documents from database using the admin client, verify both terms and privacy document IDs are present in the request body, and reject the request with a detailed error message if not.
5. **Public Pages Pass**: Rewrite marketing sections in `/features`, `/about`, `/why-dirtchat`, `/privacy`, and `/terms` to reflect the new black-neutral/green palette and remove all constellation or purple/indigo references.
6. **App Shell Polish**: Standardize sidebar header with `DirtchatLogo` component. Update sidebar navigation, settings tabs, and profile controls to use green accents on dark neutral backgrounds.
7. **Build Validation**: Run lint, typechecks, and production build to guarantee zero compilation errors.

## 7. Risks & Edge Cases
- **Signup API Failures**: If writing legal acceptances fails or profile creation fails, ensure the database transaction handles it safely or logs it.
- **Hydration Mismatch**: In next-themes or layout, ensure backgrounds render consistently without flash of light color.
- **Secrets leakage**: Ensure `.env.local` remains untracked and no keys are printed in console or UI.
