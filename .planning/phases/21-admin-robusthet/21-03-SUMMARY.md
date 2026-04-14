---
phase: 21-admin-robusthet
plan: "03"
subsystem: admin-ui
tags: [loading-states, skeleton-ui, error-handling, accessibility, ux]
dependency_graph:
  requires: []
  provides: [admin-list-loading-skeletons, order-detail-error-handling]
  affects: [admin/produkter, admin/opplevelser, admin/artikler, admin/ordrer/[id]]
tech_stack:
  added: []
  patterns: [animate-pulse skeleton UI, setTimeout timeout pattern, explicit loading/error state]
key_files:
  created: []
  modified:
    - src/app/admin/produkter/page.tsx
    - src/app/admin/opplevelser/page.tsx
    - src/app/admin/artikler/page.tsx
    - src/app/admin/ordrer/[id]/page.tsx
decisions:
  - Skeleton columns match actual table column widths per page (5 cols for produkter, 4 for opplevelser and artikler)
  - 15-second timeout chosen for order detail — long enough for slow connections, short enough to not leave users stuck
  - Separate loading and error render paths (not combined) for clarity and correct ARIA semantics
  - role=status + aria-label on skeleton containers for WCAG 2.1 AA compliance
metrics:
  duration: "12 minutes"
  completed: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 21 Plan 03: Admin Loading States and Error Handling Summary

Animated skeleton loading UI added to all 3 admin list pages, plus timeout/error handling on the order detail page to prevent indefinite loading.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add loading skeletons to admin list pages | ba9e0b9 | produkter/page.tsx, opplevelser/page.tsx, artikler/page.tsx |
| 2 | Add timeout and error state to order detail page | 10bbe17 | ordrer/[id]/page.tsx |

## What Was Built

**Task 1 — Animated skeleton loading (3 pages):**

All three list pages (produkter, opplevelser, artikler) previously showed the DataTable immediately with an empty `data` array, causing the empty-state UI to flash prematurely while data loaded. Each page now has:

- `const [loading, setLoading] = useState(true)` — starts true, set false after fetch resolves or rejects
- `setLoading(false)` called in both `.then()` and `.catch()` — no stuck loading states
- Skeleton table UI with `animate-pulse` rows while loading is true
- Skeleton structure matches actual table column count and proportions per page
- `role="status"` + `aria-label="Laster ..."` on skeleton container for WCAG 2.1 AA
- DataTable only renders once loading is false

**Task 2 — Order detail timeout and error state:**

The order detail page previously showed "Laster ordre..." indefinitely if the order was not found or the network hung. The page now has:

- Explicit `loading` and `error` state variables
- 15-second `setTimeout` that sets error and clears loading if the fetch has not resolved
- `clearTimeout` in both `.then()` and `.catch()` callbacks — timeout cleaned up on success or failure
- Explicit not-found handling: when `getOrderById` returns `null`, sets error "Ordren ble ikke funnet."
- Error render with Norwegian message and "Tilbake til ordrer" navigation link
- Separate loading and error render paths before the main order content
- Cleanup via `return () => clearTimeout(timeout)` in useEffect

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all changes wire real data and state.

## Threat Flags

No new network endpoints, auth paths, or trust boundaries introduced. T-21-06 (DoS — indefinite loading state) mitigated by 15-second timeout as specified in plan threat register.

## Self-Check: PASSED

- ba9e0b9 found in git log
- 10bbe17 found in git log
- animate-pulse present in all 3 list pages (10, 8, 8 occurrences)
- setTimeout and "Tilbake til ordrer" present in ordrer/[id]/page.tsx
- npx tsc --noEmit passes with no errors
