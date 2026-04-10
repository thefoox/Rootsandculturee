---
phase: 17-checkout-redesign
plan: "02"
subsystem: checkout
tags: [ui, checkout, wcag, focus-management, step-indicator]
dependency_graph:
  requires: []
  provides: [CheckoutForm-redesign]
  affects: [checkout-page]
tech_stack:
  added: []
  patterns: [section-card-with-accent-bar, programmatic-focus-management, step-indicator-with-checkmark]
key_files:
  created: []
  modified:
    - src/components/checkout/CheckoutForm.tsx
decisions:
  - "Both tasks implemented atomically in a single file write since all changes were to CheckoutForm.tsx"
  - "Used cn() from @/lib/utils for PaymentElement container conditional classes (pointer-events-none opacity-60)"
  - "Spread operator used for aria-label on completed step circle to avoid React warning about spreading undefined attributes"
metrics:
  duration: "~12 minutes"
  completed: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 17 Plan 02: CheckoutForm Redesign Summary

**One-liner:** Premium checkout form with 40px step indicator circles (Check icon on completed), bark-accented section cards, bark/30 payment border, and WCAG AA focus management on step advance.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Redesign step indicator, section cards, payment section, CTA buttons | 9b28f4c | src/components/checkout/CheckoutForm.tsx |
| 2 | Add focus management and scrollIntoView on step advance | 9b28f4c | src/components/checkout/CheckoutForm.tsx |

Both tasks were implemented atomically in a single commit since all changes target the same file with no logical separation boundary.

---

## What Was Built

### Step Indicator Upgrade
- Circles enlarged from 32px (`h-8 w-8`) to 40px (`h-10 w-10`) with `text-body` size
- Active step: `bg-forest text-cream ring-2 ring-offset-2 ring-forest/20` depth ring
- Completed step: `bg-forest text-cream` with `<Check className="h-4 w-4" aria-hidden="true" />` icon instead of number; circle has `aria-label="Fullfort"` for screen readers
- Inactive step: `bg-card border border-forest/20 text-body/40`
- Connector widened from `h-px` to `h-0.5` (2px)
- Step labels changed from `text-forest/60` to `text-body` color (legible body text)
- Indicator wrapper changed from `mb-8` to `mb-10`

### Section Cards with Left Accent Bar
- Contact and shipping sections wrapped in `rounded-xl border border-forest/10 bg-card p-6 mb-6`
- Left accent bar via CSS pseudo-element: `before:content-[''] before:absolute before:left-0 before:top-6 before:bottom-6 before:w-0.5 before:bg-bark/40 before:rounded-full`
- Card requires `relative overflow-hidden` for pseudo-element positioning
- Section headings: `tracking-[-0.015em]` letter-spacing added, `mb-5` (from `mb-4`)
- Input spacing: `space-y-5` (from `space-y-4`)

### Step 2 Recap Card
- Border changed from `rounded-lg border border-forest/8 bg-card p-4` to `rounded-xl border border-forest/10 bg-card p-5`
- Added "Dine opplysninger" section label (`text-label font-normal text-body`) above name/email block
- fullName paragraph changed from `font-medium` to `font-normal` per UI-SPEC weight mapping

### Payment Section
- Stripe PaymentElement container border changed from `border-forest/20` to `border-bark/30` (warmer)
- Container changed from `rounded-lg` to `rounded-xl`
- LockKeyhole trust signal icon changed from `text-body` to `text-success`
- Payment section `mb-8` changed to `mb-6`

### CTA Buttons
- "Ga til betaling" (step 1): `min-h-[48px] font-bold` added
- "Betal na" (step 2): `min-h-[48px] font-bold shadow-md` added

### WCAG AA Focus Management
- `useRef` added to import alongside `useState`
- `step2HeadingRef = useRef<HTMLHeadingElement>(null)` for step 2 heading
- `formRef = useRef<HTMLDivElement>(null)` for step 1 wrapper
- `handleNextStep` updated: on success, focuses `step2HeadingRef` and calls `scrollIntoView({ behavior: 'smooth', block: 'start' })` after 100ms timeout
- On validation failure: focuses first `[aria-invalid="true"]` field after 50ms timeout
- Step 2 "Betaling" heading: `tabIndex={-1}` (programmatic focus only) + `outline-none` (no visible ring for screen-reader-only focus) + `ref={step2HeadingRef}`
- Step 1 wrapper `<div ref={formRef}>` for error field querying
- PaymentElement container: `cn("rounded-xl border border-bark/30 bg-card p-6", loading && "pointer-events-none opacity-60")` — dims and disables interaction during payment processing

---

## Deviations from Plan

### Auto-combined Tasks
Tasks 1 and 2 were specified as separate tasks but were implemented together in a single write and commit. Both tasks target the same file (`CheckoutForm.tsx`) with no dependency boundary between them. The combined implementation ensures consistency and avoids a redundant intermediate commit.

### cn() Utility Import Added
The plan specified using `cn()` for the PaymentElement container conditional classes. `cn` was imported from `@/lib/utils` (already existed in project). This is an additive change not listed in plan imports but consistent with CLAUDE.md conventions (`clsx + tailwind-merge`).

---

## Known Stubs

None. All data flows are wired — no placeholder content, empty arrays, or TODO stubs.

---

## Threat Flags

None. All changes are purely presentational and interaction-focused. No new network endpoints, auth paths, file access patterns, or schema changes introduced.

---

## Self-Check

Verified file exists:
- src/components/checkout/CheckoutForm.tsx: FOUND

Verified commit exists:
- 9b28f4c: FOUND (feat(17-02): redesign CheckoutForm...)

TypeScript: `npx tsc --noEmit` — PASS (no errors)

All acceptance criteria grep checks: PASS

## Self-Check: PASSED
