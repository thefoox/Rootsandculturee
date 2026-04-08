---
phase: 11-ui-kvalitet-og-premium-design
plan: "06"
subsystem: ui-polish
tags:
  - footer
  - scroll-reveal
  - checkout
  - animation
  - accessibility
dependency_graph:
  requires:
    - 11-01-PLAN.md
    - 11-02-PLAN.md
  provides:
    - ScrollReveal component (src/components/ui/ScrollReveal.tsx)
    - useScrollReveal hook (src/hooks/useScrollReveal.ts)
  affects:
    - src/components/layout/Footer.tsx
    - src/components/checkout/CheckoutForm.tsx
tech_stack:
  added: []
  patterns:
    - IntersectionObserver with once:true cleanup and prefers-reduced-motion bypass
    - motion-safe: Tailwind modifier for all transition classes
    - Animated connector fill via inline style width transition
key_files:
  created:
    - src/hooks/useScrollReveal.ts
    - src/components/ui/ScrollReveal.tsx
  modified:
    - src/components/layout/Footer.tsx
    - src/components/checkout/CheckoutForm.tsx
decisions:
  - Used motion-safe:opacity-0 and motion-safe:translate-y-4 as initial hidden state so elements never flash hidden on reduced-motion devices
  - Observer cleanup via observer.disconnect() in useEffect return satisfies T-11-10 (no observer accumulation)
  - Newsletter layout uses flex row on desktop (md:flex-row md:items-end md:justify-between) for editorial left-heading + right-form split
metrics:
  duration: "~8 minutes"
  completed: "2026-04-07"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 4
---

# Phase 11 Plan 06: Footer, ScrollReveal, and Checkout Step Indicator Summary

Footer grounded with bg-card + editorial newsletter layout; IntersectionObserver ScrollReveal hook and component with motion guard; CheckoutForm step indicator upgraded with labels and animated connector fill.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Footer visual upgrade | fd424f0 | src/components/layout/Footer.tsx |
| 2 | ScrollReveal hook + component; CheckoutForm step indicator | bbeebe6 | src/hooks/useScrollReveal.ts, src/components/ui/ScrollReveal.tsx, src/components/checkout/CheckoutForm.tsx |

---

## What Was Built

### Task 1 — Footer (fd424f0)

Five targeted upgrades to `Footer.tsx`:

1. **bg-cream → bg-card** on the `<footer>` element — warmer surface separates footer from the last `bg-cream` page section, reinforcing the alternating section rhythm.
2. **Brand description text-label → text-body** — 13px was too small for a brand statement; 15px reads as body copy.
3. **Link hover: removed hover:underline** — replaced with `motion-safe:transition-colors motion-safe:duration-150 hover:text-forest` on all footer links (both external `<a>` and internal `<Link>`).
4. **Newsletter section: left-aligned editorial layout** — replaced `mx-auto max-w-md` centered block with `flex flex-col gap-3 md:flex-row md:items-end md:justify-between`, placing heading+description on the left and the signup form (`md:min-w-[320px]`) on the right at desktop.
5. **Copyright text-body/50 → text-forest/40** — matches the bg-card surface for correct chromatic alignment.

### Task 2 — ScrollReveal + CheckoutForm (bbeebe6)

**`src/hooks/useScrollReveal.ts`**
- `useScrollReveal(options)` hook with `threshold: 0.15` and `once: true` defaults
- `useEffect` checks `window.matchMedia('(prefers-reduced-motion: reduce)')` first — sets `isVisible = true` immediately if reduced motion, no observer created
- `IntersectionObserver` watches the ref'd element; on intersection sets `isVisible = true` and calls `observer.unobserve(element)` when `once: true`
- Cleanup: `observer.disconnect()` in effect return (satisfies T-11-10)

**`src/components/ui/ScrollReveal.tsx`**
- Wraps children in a `<div>` with `ref` from the hook
- Initial hidden state: `motion-safe:opacity-0 motion-safe:translate-y-4` — these classes are prefixed so they never apply when motion is reduced
- Visible state: `opacity-100 translate-y-0` (no motion-safe prefix — always applied when `isVisible`)
- Transition: `motion-safe:transition-all motion-safe:duration-500`
- Optional `delay` prop: 0 | 100 | 200 | 300ms via `motion-safe:[transition-delay:Xms]` arbitrary value class

**`src/components/checkout/CheckoutForm.tsx`** — Step indicator upgrade:
- Wrapped step circles in `flex flex-col items-center gap-1` containers
- Added `<span className="text-label text-forest/60">Kontaktinfo</span>` below circle 1
- Added `<span className="text-label text-forest/60">Betaling</span>` below circle 2
- Connector replaced with two-layer div: `absolute inset-0 bg-forest/12` (full unfilled track) + `absolute inset-y-0 left-0 bg-forest motion-safe:transition-all motion-safe:duration-300` with `style={{ width: step >= 2 ? '100%' : '0%' }}` (animated fill)

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None. All changes are visual/interaction upgrades to existing functional components. No data sources or dynamic content was stubbed.

---

## Threat Flags

None. Changes are purely UI/CSS. The `useScrollReveal` hook only reads element position via IntersectionObserver (no user data). The CheckoutForm connector is client-side state display only.

---

## Self-Check: PASSED

- [x] `src/hooks/useScrollReveal.ts` — created, confirmed
- [x] `src/components/ui/ScrollReveal.tsx` — created, confirmed
- [x] `src/components/layout/Footer.tsx` — modified, bg-card + text-body + hover:text-forest + flex newsletter + text-forest/40 all confirmed
- [x] `src/components/checkout/CheckoutForm.tsx` — modified, Kontaktinfo + Betaling labels + animated connector confirmed
- [x] Commit fd424f0 — exists
- [x] Commit bbeebe6 — exists
- [x] TypeScript compiles clean (no output from tsc --noEmit)
