---
phase: quick
plan: 260415-q1c
subsystem: ui/responsiveness
tags: [mobile, responsive, overflow, css, tailwind]
key-files:
  modified:
    - src/app/globals.css
    - src/components/layout/Header.tsx
    - src/components/sections/HeroSection.tsx
    - src/components/sections/StatsSection.tsx
    - src/components/sections/TextImageSection.tsx
    - src/components/sections/ContactInfoSection.tsx
decisions:
  - overflow-x hidden on both html and body for belt-and-suspenders approach
  - StatsSection uses grid-cols-1 base with sm:grid-cols-2 (not md) for 640px sweet spot
  - HeroOverlayLayout uses justify-center base with md:justify-start/end (not max-md override)
  - ContactInfoSection -mt-6 on mobile preserves visual connection without clipping
metrics:
  duration: 2m25s
  completed: 2026-04-15
  tasks_completed: 2
  files_modified: 6
---

# Quick Task 260415-q1c: Fix mobil responsivitet — innhold faller utenfor

**One-liner:** Fixed 7 mobile overflow and spacing bugs across 6 files using overflow-x containment, responsive grid breakpoints, and corrected Tailwind utility ordering.

## What Was Built

All 7 mobile responsiveness audit issues resolved:

1. **Global overflow (globals.css):** Added `overflow-x: hidden` to both `html` and `body` to prevent any child element from causing horizontal scroll.

2. **StatsSection grid (StatsSection.tsx):** Changed `grid-cols-2` (fixed) to `grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8` — stats now stack vertically on phones below 640px, preventing large clamp-based numbers from overflowing narrow cells.

3. **TextImageSection spacing (TextImageSection.tsx):** Removed `max-md:space-y-0` from all four layout variants (OverlapLayout, SplitLayout, ContainedLayout, OffsetLayout). The class was actively zeroing out natural stack spacing on mobile. Each variant's existing `max-md:p-8` on the text card provides visual separation.

4. **Header logo sizing (Header.tsx):** Reduced logo from `h-[72px] w-[72px]` to `h-14 w-14 md:h-[72px] md:w-[72px]` — 56px on mobile gives cart icon and hamburger button room to breathe in the 80px header.

5. **ContactInfoSection margin (ContactInfoSection.tsx):** Changed `-mt-12` to `-mt-6 md:-mt-12` — reduces upward pull from 48px to 24px on mobile, preventing contact cards from clipping into the hero above.

6. **HeroSection padding (HeroSection.tsx):** Replaced inline `paddingTop: '6rem'` with Tailwind `pt-24` class on the mobile `<h1>`. Removes mixed styling and lets Tailwind purge/optimize correctly.

7. **HeroOverlayLayout justify (TextImageSection.tsx):** Changed from unconditional `justify-start`/`justify-end` with conditional breakpoint classes to `justify-center` base with `md:justify-start`/`md:justify-end`. The floating text card now centers on mobile instead of being pushed to one side.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | f30c7dc | Global overflow, header logo, hero padding |
| Task 2 | 6ead8ee | Stats grid, text-image spacing, contact margin, overlay justify |

## Verification

- `npx next build` passes without errors after both tasks
- Visual verification pending (checkpoint:human-verify Task 3)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — purely CSS/layout changes, no new network endpoints or auth paths.

## Self-Check: PASSED

Files exist:
- src/app/globals.css — modified, contains `overflow-x: hidden`
- src/components/layout/Header.tsx — modified, contains `md:h-[72px]`
- src/components/sections/HeroSection.tsx — modified, contains `pt-24`
- src/components/sections/StatsSection.tsx — modified, contains `grid-cols-1`
- src/components/sections/TextImageSection.tsx — modified, `max-md:space-y-0` removed
- src/components/sections/ContactInfoSection.tsx — modified, contains `-mt-6`

Commits exist: f30c7dc, 6ead8ee confirmed in git log.
