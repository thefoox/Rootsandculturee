---
phase: 11-ui-kvalitet-og-premium-design
plan: "03"
subsystem: navigation
tags: [header, sticky, scroll, animation, mega-menu, motion-safe]
dependency_graph:
  requires:
    - 11-01-PLAN.md
  provides:
    - useScrollPosition hook
    - fixed header with scroll-triggered background
    - animated nav underlines
  affects:
    - src/components/layout/Header.tsx
    - src/components/layout/MegaMenuNav.tsx
tech_stack:
  added: []
  patterns:
    - useScrollPosition hook (passive scroll listener, useState + useEffect)
    - cn() for conditional className composition
    - after: pseudo-element animated underline via Tailwind
    - motion-safe: guard on all transitions
key_files:
  created:
    - src/hooks/useScrollPosition.ts
  modified:
    - src/components/layout/Header.tsx
    - src/components/layout/MegaMenuNav.tsx
decisions:
  - Fixed positioning chosen over sticky to ensure header never scrolls out of view even on fast flings
  - after:bg-current for underline color so it auto-adapts to text-cream/text-forest header states
  - passive:true on scroll listener per T-11-05 threat mitigation
metrics:
  duration: "~10 minutes"
  completed: "2026-04-08T04:15:46Z"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
---

# Phase 11 Plan 03: Sticky Header + Animated Nav Underlines Summary

Fixed header with scroll-triggered bg-transparent/bg-forest/bg-cream transitions and animated 2px CSS underline on MegaMenuNav top-level links.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | useScrollPosition hook + fixed header | 8af4804 | src/hooks/useScrollPosition.ts, src/components/layout/Header.tsx |
| 2 | Animated underline on MegaMenuNav | a4ee8e0 | src/components/layout/MegaMenuNav.tsx |

---

## What Was Built

### Task 1 — useScrollPosition hook + fixed Header

Created `src/hooks/useScrollPosition.ts` — a client-side hook that returns `window.scrollY`, updated via a passive scroll listener with cleanup on unmount.

Updated `src/components/layout/Header.tsx`:
- Converted `<header>` from `absolute top-0` to `fixed top-0`
- Imported `useScrollPosition` and computed `isScrolled = scrollY > 80`
- Replaced inline template string className with `cn()` for clean conditional composition
- Hero pages (isTransparent=true): `bg-transparent` at top → `bg-forest text-cream shadow-md` when scrolled
- Non-hero pages (isTransparent=false): `bg-cream/95 backdrop-blur-md` at top → `bg-cream shadow-md` when scrolled
- `motion-safe:transition-all motion-safe:duration-200` for smooth 200ms transitions

### Task 2 — Animated underline on MegaMenuNav

Updated `src/components/layout/MegaMenuNav.tsx`:
- Removed `hover:underline` from both button (items with children) and Link (items without children) top-level nav items
- Added CSS `after:` pseudo-element pattern: `relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-current after:motion-safe:transition-all after:motion-safe:duration-200 hover:after:w-full`
- `after:bg-current` means underline matches text color: cream on transparent header, forest on opaque header
- Motion-safe guard on the after: transition — static rendering for prefers-reduced-motion users
- Dropdown panel links (inside `role="menu"`) left unchanged

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. The useScrollPosition hook reads `window.scrollY` client-side only — no trust boundary crossed. T-11-05 mitigation (`{ passive: true }` + cleanup on unmount) confirmed applied.

---

## Known Stubs

None.

---

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| src/hooks/useScrollPosition.ts exists | FOUND |
| src/components/layout/Header.tsx exists | FOUND |
| src/components/layout/MegaMenuNav.tsx exists | FOUND |
| Commit 8af4804 exists | FOUND |
| Commit a4ee8e0 exists | FOUND |
