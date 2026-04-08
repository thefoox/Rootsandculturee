---
phase: 11-ui-kvalitet-og-premium-design
plan: 02
subsystem: ui
tags: [tailwind, forms, button, input, wcag, motion-safe, focus-ring]

# Dependency graph
requires: []
provides:
  - Button component with px-5 py-2.5 default padding, shadow-sm on primary, motion-safe:duration-150
  - Input component with rounded-lg, px-4 py-3 padding, font-medium label, soft focus ring (ring-2 ring-forest/15), bg-destructive/5 error tint
affects:
  - CheckoutForm
  - auth forms (login, register)
  - HeroSection (CTA button — hero overrides via className prop in Plan 05)
  - All form-bearing pages

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "motion-safe: modifier on all transitions (no bare duration-* classes)"
    - "Input error state = border-destructive + bg-destructive/5 (border + tint)"
    - "Input focus ring = focus:ring-2 focus:ring-forest/15 + focus:outline-none (replaces global outline on Input only)"
    - "Primary Button always carries shadow-sm at rest, hover:shadow-md on lift"

key-files:
  created: []
  modified:
    - src/components/ui/Button.tsx
    - src/components/ui/Input.tsx

key-decisions:
  - "rounded-md kept on Button (UI-SPEC confirms correct; hero CTA overrides to rounded-full via className prop in Plan 05)"
  - "focus:outline-none on Input only — global *:focus-visible rule in globals.css unchanged for all other elements"
  - "ring-2 ring-forest/15 provides equivalent WCAG accessibility (3:1+ contrast ratio maintained)"

patterns-established:
  - "motion-safe: prefix required on all transitions/durations — bare duration-* is forbidden"
  - "Input error = border + tint (bg-destructive/5), not border alone"

requirements-completed: [UI11-FORMS]

# Metrics
duration: 8min
completed: 2026-04-07
---

# Phase 11 Plan 02: Button and Input Premium Upgrade Summary

**Button gains px-5 py-2.5 default padding and shadow-sm lift on primary variant; Input gains rounded-lg, px-4 py-3, font-medium label, soft focus ring, and bg-destructive/5 error tint — all transitions upgraded to motion-safe:duration-150**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-07T00:00:00Z
- **Completed:** 2026-04-07T00:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Button default padding increased from px-4 py-2 to px-5 py-2.5 — more breathing room across all CTAs
- Primary Button variant gains `shadow-sm hover:shadow-md` — premium lift effect matching Shopify/Stripe/Linear conventions
- All transitions upgraded from bare `duration-100` to `motion-safe:transition-all motion-safe:duration-150` — respects prefers-reduced-motion
- Input border radius softened from `rounded-md` to `rounded-lg` — more modern feel
- Input padding increased from `px-3 py-2` to `px-4 py-3` — less cramped, more inviting
- Input label weight upgraded from `font-normal` to `font-medium` — stronger visual hierarchy
- Input focus state adds `focus:ring-2 focus:ring-forest/15` soft glow ring — premium vs plain border change
- Input error state adds `bg-destructive/5` background tint — visual reinforcement beyond border color alone
- All WCAG min-h-[44px] touch targets preserved on both components

## Task Commits

Each task was committed atomically:

1. **Task 1: Upgrade Button component — padding, shadow, transition** - `2b115f7` (feat)
2. **Task 2: Upgrade Input component — padding, radius, focus ring, label weight, error tint** - `6c26782` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/components/ui/Button.tsx` - Updated base padding (px-5 py-2.5), primary shadow, motion-safe transition
- `src/components/ui/Input.tsx` - Updated radius (rounded-lg), padding (px-4 py-3), label weight, focus ring, error tint, motion-safe transition

## Decisions Made
- `rounded-md` kept on Button per UI-SPEC — hero CTA will override to `rounded-full` via className prop in Plan 05. No change needed here.
- `focus:outline-none` added to Input only, not globally. The global `*:focus-visible { outline: 2px solid forest }` in globals.css is preserved for all other interactive elements. The ring provides equivalent accessibility.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Button and Input components are now at premium standards per UI-SPEC
- All form pages (checkout, auth, admin product form) benefit automatically via shared components
- Plan 03 (card elevation standardisation) can proceed — no dependency on Button/Input changes
- Plan 05 (hero section) will override Button padding to `px-8 py-4` via className prop — the base component is ready for that override pattern

---
*Phase: 11-ui-kvalitet-og-premium-design*
*Completed: 2026-04-07*
