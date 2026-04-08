---
phase: 12-fullstendig-qa
plan: "02"
subsystem: UI components
tags: [bug-fix, ux, dead-code]
requirements: [QA-04, QA-05, QA-06]

dependency_graph:
  requires: []
  provides: [hero-image-header-fix, experience-grid-empty-state, dynamicpage-removed]
  affects: [src/components/shared/HeroImage.tsx, src/components/experiences/FilterableExperienceGrid.tsx]

tech_stack:
  added: []
  patterns: [conditional-render-empty-state, fixed-header-offset-pt-20]

key_files:
  modified:
    - src/components/shared/HeroImage.tsx
    - src/components/experiences/FilterableExperienceGrid.tsx
  deleted:
    - src/components/sections/DynamicPage.tsx

decisions:
  - "Use outer pt-20 wrapper on HeroImage rather than modifying individual call sites — single fix propagates to all consumers"
  - "Empty state placed inside the grid div with col-span-full to prevent layout shift when switching from populated to empty filter"
  - "DynamicPage deleted rather than preserved — zero import sites confirmed before deletion"

metrics:
  duration: "~10 minutes"
  completed: "2026-04-07"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
---

# Phase 12 Plan 02: UX Bug Fixes and Dead Code Removal Summary

Two UX bugs fixed (HeroImage header overlap on blog pages, empty filter state on experience grid) and one dead component deleted.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix HeroImage header overlap on non-transparent pages | 64d1230 | src/components/shared/HeroImage.tsx |
| 2 | Add empty state to FilterableExperienceGrid + delete DynamicPage | cf2bc55 | src/components/experiences/FilterableExperienceGrid.tsx, src/components/sections/DynamicPage.tsx (deleted) |

## What Was Built

**Task 1 — HeroImage pt-20 offset**

Blog article pages (`/blogg/[slug]`) are not in the transparent-header list, so the header is fixed and opaque at 80px. HeroImage previously rendered at `top: 0`, meaning the header overlapped the top of every blog cover image. The fix wraps the entire component in `<div className="pt-20">` so the image starts below the header. The inner `heightClass` div is unchanged — the image still fills the intended height.

**Task 2 — FilterableExperienceGrid empty state**

When a category filter produced zero results, the grid rendered blank — no feedback to the user. Added a `col-span-full` empty state block inside the grid that shows "Ingen opplevelser i denne kategorien ennå." and a reset button ("Vis alle opplevelser") that calls `setActiveFilter('alle')`. The empty state is inside the grid div to prevent layout shift.

**Task 2 — DynamicPage deletion**

`src/components/sections/DynamicPage.tsx` had zero import sites across the codebase. Its functionality (fetching page content and rendering sections) is fully covered by `src/app/[slug]/page.tsx` which uses `SectionRenderer` directly. The file was deleted to reduce dead code surface.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| pt-20 present | `grep "pt-20" src/components/shared/HeroImage.tsx` | PASS |
| Empty state text | `grep "Ingen opplevelser" src/components/experiences/FilterableExperienceGrid.tsx` | PASS |
| DynamicPage deleted | `test -f src/components/sections/DynamicPage.tsx` | DELETED |
| TypeScript | `npx tsc --noEmit` | PASS (no output) |

## Known Stubs

None.

## Threat Flags

None — display-only component changes with no new network surfaces, auth paths, or schema changes.

## Self-Check: PASSED

- `src/components/shared/HeroImage.tsx` — FOUND, contains pt-20 wrapper
- `src/components/experiences/FilterableExperienceGrid.tsx` — FOUND, contains "Ingen opplevelser"
- `src/components/sections/DynamicPage.tsx` — DELETED as expected
- Commit 64d1230 — FOUND (Task 1)
- Commit cf2bc55 — FOUND (Task 2)
