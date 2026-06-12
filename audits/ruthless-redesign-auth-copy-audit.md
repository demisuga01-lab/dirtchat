# DIRTCHAT RUTHLESS REDESIGN & AUTH AUDIT PLAN

This document outlines the visual layout changes, typography settings, color system, and auth validation state behaviors that will guide the implementation.

## 1. Visual Layout & Theme Critique
- **Current Issue**: Walled-off gradients, orbit visuals, and generic Terminal panels. It looks like a standard vibecoded landing page.
- **Goal**: Establish technical credibility. Black-green design language.
- **Palette**:
  - Background: `#050806` (deep near-black green)
  - elevated surface: `#0B100D` (rich black-green charcoal)
  - Border: `#18201B` (subtle low-contrast green-gray)
  - Primary text: `#FFFFFF`
  - Secondary text: `#A2B0A7` (high-contrast neutral muted green-gray)
  - Accent: `#22C55E` (restrained success green)
  - Accent Hover: `#4ADE80` (slightly brighter green)
- **Bans**: No text gradients, no orbit graphics, no fake `dirtchat_workspace_preview.sh` labels.

## 2. Typography & Hierarchy
- **Primary Font**: Inter / Sans for readability.
- **Headings**: Clean geometric headers, desktop H1 kept at a maximum of `text-5xl` to `text-6xl` (max `72px`), using `text-wrap: balance`. Paragraph line length capped under `75ch`.

## 3. Product Preview UI Rebuild
- Replace the fake shell script file container `dirtchat_workspace_preview.sh` with a clean mock browser or app-shell header labeled `dirtchat.app/chat`.
- Make it reflect the actual dashboard layout: Sidebar with threads, active window with Claude 3.5 Sonnet / GPT-4o toggle, and messaging bubbles matching the actual chat UI structure.

## 4. Auth Pages (Sign-Up / Sign-In) Edge Cases
- **Sign-up form validation reasons**:
  - Show precise validation errors under the disabled "Create account" button.
  - Require passwords of at least 8 characters.
  - Enforce Terms and Privacy checkboxes on both client and server.
- **Validation state messages**:
  - If email invalid: `"Enter a valid email."`
  - If password < 8 characters: `"Use at least 8 characters."`
  - If password mismatch: `"Passwords do not match."`
  - If both checklists unchecked: `"Accept the Terms and Privacy Policy to continue."`
  - If only Terms unchecked: `"Accept the Terms to continue."`
  - If only Privacy unchecked: `"Accept the Privacy Policy to continue."`

## 5. Implementation Roadmap
- **Step 1**: Update `globals.css` base colors to use the new HSL codes for background (`#050806`), surface (`#0B100D`), and border (`#18201B`).
- **Step 2**: Rebuild the public pages using the revised copy and black-green theme:
  - Homepage (`src/app/page.tsx` via `landing-hero.tsx`, `feature-grid.tsx`, `how-it-works.tsx`, `why-dirtchat-section.tsx`, `cta-band.tsx`)
  - Features page (`src/app/features/page.tsx`)
  - About page (`src/app/about/page.tsx`)
  - Why Dirtchat page (`src/app/why-dirtchat/page.tsx`)
  - Privacy/Terms pages (`src/app/privacy/page.tsx` and `src/app/terms/page.tsx`)
- **Step 3**: Rebuild `product-preview.tsx` to display `dirtchat.app/chat` and replicate real app UI.
- **Step 4**: Polish the sign-up page (`src/components/auth/sign-up-form.tsx` and `src/app/api/auth/sign-up/route.ts`) to require 8 characters, Terms/Privacy checkboxes, and display the precise reason near the button.
- **Step 5**: Polish the sign-in page (`src/components/auth/sign-in-form.tsx`) to support email-code tabs with standard "Email code" nomenclature.
