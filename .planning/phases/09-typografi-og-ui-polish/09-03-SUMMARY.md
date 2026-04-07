---
phase: 09-typografi-og-ui-polish
plan: "03"
subsystem: ui
tags: [lucide-react, sonner, empty-state, konto, admin]

requires:
  - phase: 04-kundekonto
    provides: konto pages with EmptyState component usage

provides:
  - konto/EmptyState with optional icon (ElementType) and heading props
  - Consistent icon+heading empty states across all konto pages
  - admin/ordrer uses ShoppingBag icon in both EmptyState and DataTable empty state
  - Norwegian toast error on admin orders load failure

affects:
  - 09-typografi-og-ui-polish (UI consistency)

tech-stack:
  added: []
  patterns:
    - "konto/EmptyState accepts optional icon and heading for richer empty states"
    - "Admin client pages use toast.error with Norwegian message on Firestore load failure"

key-files:
  created: []
  modified:
    - src/components/konto/EmptyState.tsx
    - src/app/konto/page.tsx
    - src/app/konto/ordrer/page.tsx
    - src/app/konto/bookinger/page.tsx
    - src/app/admin/ordrer/page.tsx

key-decisions:
  - "Made icon and heading optional on konto/EmptyState for backward compatibility while requiring callers to supply them"
  - "Used sonner toast for Norwegian error feedback on Firestore failure in admin/ordrer — consistent with rest of app"

patterns-established:
  - "EmptyState callers supply icon (lucide-react ElementType) and heading — no hardcoded icons in the component"

requirements-completed:
  - UIPOL-04
  - UIPOL-05

duration: 15min
completed: 2026-04-07
---

# Phase 09 Plan 03: Konto EmptyState Polish Summary

**konto/EmptyState upgraded to icon+heading pattern via optional props; all 5 call sites updated with lucide-react icons; admin/ordrer empty state fixed from blank icon string to ShoppingBag with Norwegian error toast**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-07T00:00:00Z
- **Completed:** 2026-04-07T00:15:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Rewrote `konto/EmptyState.tsx` to accept optional `icon: ElementType` and `heading` props, removing the hardcoded Package icon
- Updated all 5 EmptyState call sites across konto pages with appropriate lucide-react icons (ShoppingBag for orders, CalendarDays for bookings) and Norwegian headings
- Fixed `admin/ordrer/page.tsx` — replaced `icon: ''` empty string with `ShoppingBag` in both standalone EmptyState and DataTable emptyState config; added `toast.error` with Norwegian message on Firestore load failure

## Task Commits

1. **Task 1: Oppgrader konto/EmptyState og oppdater alle kall** - `d764fc1` (feat)
2. **Task 2: Fiks admin/ordrer tomt-tilstand og verifiser norske feilmeldinger** - `6d1d37c` (feat)

## Files Created/Modified

- `src/components/konto/EmptyState.tsx` - Added optional `icon: ElementType` and `heading` props; removed hardcoded Package icon
- `src/app/konto/page.tsx` - Added ShoppingBag + CalendarDays imports; updated both EmptyState calls with icon and heading
- `src/app/konto/ordrer/page.tsx` - Added ShoppingBag import; updated EmptyState call with icon and heading
- `src/app/konto/bookinger/page.tsx` - Added CalendarDays import; updated both EmptyState calls with icon and heading
- `src/app/admin/ordrer/page.tsx` - Added ShoppingBag + toast imports; fixed icon: '' in EmptyState and DataTable; added catch with Norwegian toast.error

## Decisions Made

- Made `icon` and `heading` optional (not required) on `konto/EmptyState` to maintain backward compatibility signature, while enforcing their use at all existing call sites
- Kept `konto/EmptyState` separate from `shared/EmptyState` — they serve different contexts (konto uses `message` prop, shared uses `body` prop)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript error in `src/app/(public)/opplevelser/[slug]/page.tsx` (`locationLat`/`locationLng` not on `Experience` type) caused `npm run build` to fail. Confirmed pre-existing before my changes via git stash. Out of scope for this plan — logged for deferred tracking.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- konto/EmptyState is now consistent with the shared/EmptyState icon+heading pattern
- All empty states in konto and admin/ordrer pages show meaningful visual feedback
- Pre-existing `opplevelser/[slug]` TypeScript error should be addressed in a separate plan before production build

---
*Phase: 09-typografi-og-ui-polish*
*Completed: 2026-04-07*
