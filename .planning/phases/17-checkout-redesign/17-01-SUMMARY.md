---
phase: 17-checkout-redesign
plan: "01"
subsystem: checkout-ui
tags: [checkout, ui, forms, stripe, design]
dependency_graph:
  requires: []
  provides: [underline-input-variant, redesigned-checkout-form]
  affects: [src/components/checkout/CheckoutForm.tsx, src/components/ui/Input.tsx]
tech_stack:
  added: []
  patterns: [tailwind-underline-input, 3-step-icon-indicator, split-name-fields]
key_files:
  created: []
  modified:
    - src/components/ui/Input.tsx
    - src/components/checkout/CheckoutForm.tsx
decisions:
  - "Split fullName into firstName+lastName at form level; concatenate before passing to server action to keep CheckoutFormData interface unchanged"
  - "Used native <button> elements with direct Tailwind CTA styles instead of Button component to achieve exact 52px min-height and prototype hover states"
  - "Defined fadeUp animation via motion-safe:animate-[fadeUp_350ms_ease-out] inline; animation keyframes already in globals.css from prototype"
metrics:
  duration: "~12 minutes"
  completed: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 2
---

# Phase 17 Plan 01: Checkout Form Redesign Summary

Premium checkout form visual upgrade — 3-step icon indicator with User/CreditCard/Check icons, bottom-border underline input variant, split Fornavn/Etternavn fields, section descriptions, recap card, SSL badge, and 52px forest CTA buttons matching the approved prototype.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add underline variant to Input component | `ce1cdc7` | src/components/ui/Input.tsx |
| 2 | Redesign CheckoutForm with icon steps, split name, recap card, premium styling | `565d0cf` | src/components/checkout/CheckoutForm.tsx |

## What Was Built

### Task 1 — Input underline variant

Added optional `variant` prop (`'boxed' | 'underline'`) to the Input component:

- Default remains `'boxed'` — all existing Input usages throughout the codebase are unaffected
- `variant="underline"`: `bg-transparent border-0 border-b-[1.5px] rounded-none px-3 py-3 placeholder:text-body/35`
- Focus state for underline: `focus:border-forest focus:outline-none` (no ring, only bottom border)
- Error state for underline: `border-destructive` (bottom border turns red)
- Red asterisk (`<span className="ml-0.5 text-rust">*</span>`) rendered after label when `required + variant="underline"`

### Task 2 — CheckoutForm redesign

**Step indicator:** Replaced 2-step numbered circles with 3-step icon-based indicator centered with `mb-12`:
- Step 1 (Kontakt): User icon — `bg-forest text-cream` when active/done
- Step 2 (Betaling): CreditCard icon — `bg-forest text-cream` when active, `border-forest/20 text-forest/20` when upcoming
- Step 3 (Bekreftelse): Check icon — always upcoming in this form (visual progress indicator only)
- Connector 1: `border-solid border-forest` when step > 1, else `border-dashed border-forest/20`
- Connector 2: always `border-dashed border-forest/20`
- Labels hidden on mobile (`hidden sm:inline`)

**Name fields split:** `fullName` state replaced with `firstName` + `lastName`. Individual validation fires first (`Fornavn er påkrevd.` / `Etternavn er påkrevd.`), then Zod schema runs with `fullName: \`${firstName} ${lastName}\`.trim()`. Server action interface `CheckoutFormData.fullName` is unchanged.

**Step 1 layout:**
- Section heading + `text-body/60` description paragraph for both Kontaktinformasjon and Leveringsadresse
- Fornavn/Etternavn in `grid grid-cols-1 sm:grid-cols-2 gap-6`
- Postnummer/Sted in `grid grid-cols-[160px_1fr] gap-6`
- All inputs use `variant="underline"` with correct autoComplete and placeholder values
- CTA: native `<button>` with `min-h-[52px] bg-forest rounded-lg font-semibold` + ArrowRight icon

**Step 2 layout:**
- Recap card: `rounded-[10px] border border-forest/8 bg-cream px-6 py-5` showing firstName+lastName, email, phone, address with "Endre" text button
- Payment section heading + description
- Security badge: `LockKeyhole h-3.5 w-3.5` + "Sikret med SSL-kryptering" at `text-[12px] text-body/50`
- Stripe box: `bg-white rounded-[10px] border-[1.5px] border-forest/20 p-6`
- Submit CTA: same 52px forest button with LockKeyhole + "Fullfør betaling", disabled states preserved

**Animations:** Step content wrapped in `motion-safe:animate-[fadeUp_350ms_ease-out]` — respects `prefers-reduced-motion` automatically. `@keyframes fadeUp` already defined in globals.css from prototype.

**Import cleanup:** Removed `Button` (from ui/Button), `ArrowLeft`. Added `User, CreditCard, Check` from lucide-react, `cn` from lib/utils.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all form fields are wired to real state. Payment element is live Stripe.

## Threat Flags

None — no new network endpoints or auth paths introduced. Changes are purely visual/presentational. Server action `updatePaymentIntentMetadata` interface unchanged.

## Self-Check: PASSED

- `src/components/ui/Input.tsx` — exists, contains `variant` prop
- `src/components/checkout/CheckoutForm.tsx` — exists, contains `firstName`, `lastName`, `User`, `CreditCard`, `Check`
- Commit `ce1cdc7` — Task 1 (Input underline variant)
- Commit `565d0cf` — Task 2 (CheckoutForm redesign)
- `npx tsc --noEmit` — passes with no errors
