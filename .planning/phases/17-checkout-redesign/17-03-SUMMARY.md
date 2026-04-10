---
phase: 17-checkout-redesign
plan: "03"
subsystem: checkout-ui
tags: [checkout, layout, header, grid, mobile, ui, session]
dependency_graph:
  requires: [17-01, 17-02]
  provides: [checkout-grid-layout, mobile-bottom-sheet, floating-pill-header, user-initials-avatar]
  affects: [src/app/(public)/checkout/page.tsx, src/components/layout/Header.tsx, src/app/api/auth/session/route.ts]
tech_stack:
  added: []
  patterns: [css-grid-1fr-fixed, fixed-bottom-sheet, floating-pill-header, initials-avatar]
key_files:
  created: []
  modified:
    - src/app/(public)/checkout/page.tsx
    - src/components/layout/Header.tsx
    - src/app/api/auth/session/route.ts
decisions:
  - "MobileOrderSummary defined as local function component inside page.tsx (not a separate file) — colocated with its only consumer, avoids extra file for a page-specific pattern"
  - "getInitials() handles both email-format strings (first char) and display-name strings (first+last initial) for forward compatibility"
  - "Avatar always bg-forest text-cream regardless of isTransparent — consistent visual recognition on both page types"
  - "Session API email return is safe — email is the user's own session data, not exposing other users' data (T-17-05 accepted in threat model)"
metrics:
  duration: "~2 minutes"
  completed: "2026-04-10T21:05:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
---

# Phase 17 Plan 03: Checkout Page Layout + Floating Pill Header Summary

**One-liner:** 1120px CSS grid checkout layout with fixed mobile bottom sheet, floating rounded-pill header on scroll, and green initials avatar for logged-in users derived from session email.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite checkout page with prototype grid layout, sidebar wiring, mobile bottom sheet | `e2703d6` | src/app/(public)/checkout/page.tsx |
| 2 | Floating pill header on scroll + user initials avatar | `61aaca9` | src/components/layout/Header.tsx, src/app/api/auth/session/route.ts |

## What Was Built

### Task 1 — Checkout Page Layout

Rewrote `checkout/page.tsx` from a 900px flex layout to the prototype's 1120px CSS grid:

**Page container:** `max-w-[1120px] px-8 pt-24 pb-20 max-lg:px-4 max-lg:pb-[120px]`
- `pb-[120px]` on mobile provides clearance above the fixed bottom sheet

**Page title:** `font-heading text-h2 font-bold text-forest mb-10` (reduced to `mb-6 text-[1.5rem]` on mobile)

**Main grid:** `grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-14 items-start`
- Left column: CheckoutForm via StripeElementsWrapper
- Right column (desktop only, `hidden lg:block`): `sticky top-24` wrapping OrderSummaryPanel with GiftCardInput as children slot

**MobileOrderSummary component** (local function, defined before default export):
- Fixed bottom sheet: `fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-[#e8e3da] bg-white shadow-[0_-4px_24px_rgba(27,67,50,0.1)] lg:hidden`
- Peek bar: always-visible button showing "Din bestilling" label + formatted total + ChevronUp icon (rotates 180deg when expanded)
- Expanded state: `max-h-[70vh] overflow-y-auto`, renders full OrderSummaryPanel + GiftCardInput
- `aria-expanded` on toggle button for WCAG compliance

**Removed:** old `<details>` mobile accordion, `summaryOpen`/`setSummaryOpen` state

### Task 2 — Floating Pill Header + Initials Avatar

**Session API** (`src/app/api/auth/session/route.ts`):
- Extended response: `{ authenticated: true, role, email }` — email added for avatar display
- Unauthenticated response unchanged: `{ authenticated: false }`

**Header floating pill** (`src/components/layout/Header.tsx`):
- When NOT scrolled: `top-0 left-0 right-0` (full-width, no rounding)
- When scrolled (>80px): `top-3 left-4 right-4 lg:left-6 lg:right-6 rounded-2xl shadow-lg`
- Transition: `motion-safe:transition-all motion-safe:duration-300` (up from 200ms)
- Color logic unchanged — hero pages get `bg-forest text-cream` when scrolled, non-hero pages get `bg-cream`

**User initials avatar:**
- New state: `userEmail: string | null` — populated from session fetch if authenticated
- `getInitials(email)` helper: email-format → first char uppercase; display-name → first+last initial uppercase; null → "?"
- Avatar button: `h-10 w-10 rounded-full bg-forest text-cream text-[14px] font-semibold hover:bg-forest/90 motion-safe:transition-colors`
- Always `bg-forest text-cream` regardless of page transparency — consistent recognition
- `User` icon import removed from lucide-react imports

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data wired. Items from `useCart()`, total calculated from real subtotal + shipping - giftCardDeduction, session email from real JWT via `getSession()`.

## Threat Flags

None new — T-17-05 (session API email disclosure) and T-17-06 (mobile bottom sheet z-index) were pre-assessed in the plan's threat model and accepted.

## Self-Check: PASSED

- `src/app/(public)/checkout/page.tsx` — exists, contains `grid-cols-[1fr_380px]` and `MobileOrderSummary`
- `src/components/layout/Header.tsx` — exists, contains `rounded-2xl` and `getInitials`
- `src/app/api/auth/session/route.ts` — exists, contains `email: session.email`
- Commit `e2703d6` — Task 1 (checkout page grid layout)
- Commit `61aaca9` — Task 2 (floating pill header + initials avatar)
- `npx tsc --noEmit` — passes with no errors after both tasks
