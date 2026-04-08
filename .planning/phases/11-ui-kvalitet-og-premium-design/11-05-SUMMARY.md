---
phase: 11-ui-kvalitet-og-premium-design
plan: 05
subsystem: ui-components
tags: [hero, trust-bar, animation, typography, dark-variant]
dependency_graph:
  requires: [11-01-PLAN.md, 11-03-PLAN.md]
  provides: [hero-load-animation, trust-bar-dark-variant]
  affects: [src/components/sections/HeroSection.tsx, src/components/sections/TrustBarSection.tsx]
tech_stack:
  added: []
  patterns: [motion-safe-animation, variant-prop-pattern, css-arbitrary-values-tailwind-v4]
key_files:
  created: []
  modified:
    - src/components/sections/HeroSection.tsx
    - src/components/sections/TrustBarSection.tsx
decisions:
  - Used Tailwind v4 arbitrary value syntax [animation:hero-enter_...] for motion-safe staggered load animation
  - dark-surface class added to TrustBarSection dark variant for correct focus ring colour inheritance
  - variant prop defaults to 'light' — fully backward compatible, no callers need updating
metrics:
  duration: ~8 minutes
  completed: 2026-04-07
---

# Phase 11 Plan 05: Hero + TrustBar Visual Upgrades Summary

**One-liner:** Staggered hero load animation with Merriweather 300 subheading and bottom vignette; TrustBarSection gains dark forest variant with cream text, h-10 icons, and column dividers.

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Upgrade HeroSection — load animation, subheading weight, gradient, hero-texture, CTA | `251015c` | `HeroSection.tsx` |
| 2 | Add dark variant to TrustBarSection | `aecdc83` | `TrustBarSection.tsx` |

---

## What Was Built

### Task 1 — HeroSection upgrades

- `hero-texture` class added to `<section>` — activates the grain SVG overlay from Plan 01 globals.css
- Bottom vignette layer added: `absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/50 to-transparent` — ensures CTA readability regardless of image content in the lower third
- `<h1>` gains `tracking-tighter` (-0.025em) and `motion-safe:[animation:hero-enter_600ms_ease-out_100ms_both]`
- Subheading switches from `font-body` to `font-heading font-light` (Merriweather 300, loaded in Plan 01) with 250ms delay
- CTA Link upgraded from `px-7 py-3.5` to `px-8 py-4 shadow-lg shadow-forest/30` with 400ms delay
- All animations use `motion-safe:` guard — no motion for users with prefers-reduced-motion

### Task 2 — TrustBarSection dark variant

- New `variant?: 'dark' | 'light'` prop (default `'light'`) — backward compatible
- Dark: `bg-forest py-12 md:py-16 dark-surface` on `<section>`
- Dark: `sm:divide-x sm:divide-cream/15` on grid for desktop column dividers
- Dark: icons `h-10 w-10 text-cream/80` (larger, cream-tinted)
- Dark: label `text-cream`, description `text-cream/70`
- Light: entirely unchanged — all existing callers unaffected

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None. Both components are fully wired to real data (PageSection from CMS / Firestore). No placeholder or mock data paths added.

---

## Threat Flags

None. Changes are className-only for HeroSection (no new data paths). TrustBarSection variant prop is a string enum used exclusively for className selection with no data access or side effects — as documented in plan threat register (T-11-09, accepted).

---

## Self-Check

- [x] `src/components/sections/HeroSection.tsx` — exists and contains all 5 upgrades
- [x] `src/components/sections/TrustBarSection.tsx` — exists and contains variant prop + dark variant
- [x] Commit `251015c` — verified in git log
- [x] Commit `aecdc83` — verified in git log
- [x] TypeScript: `npx tsc --noEmit` — clean (no output)

## Self-Check: PASSED
