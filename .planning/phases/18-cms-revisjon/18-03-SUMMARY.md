---
phase: 18-cms-revisjon
plan: 03
subsystem: api
tags: [next-cache, revalidateTag, server-actions, auth, json-parse, security]

# Dependency graph
requires:
  - phase: 18-cms-revisjon
    provides: "Research audit identifying 22 revalidateTag misuses, missing auth, unprotected JSON.parse"
provides:
  - "Correct single-arg revalidateTag calls across all 24 call sites"
  - "Auth-protected updateOrderStatus with admin role check"
  - "Try-catch wrapped JSON.parse in all form-handling server actions"
affects: [admin, orders, products, articles, experiences, bookings, cms]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JSON.parse from FormData always wrapped in try-catch with Norwegian error return"
    - "All order-mutating server actions require verifySession admin check"

key-files:
  created: []
  modified:
    - src/actions/orders.ts
    - src/actions/products.ts
    - src/actions/articles.ts
    - src/actions/experiences.ts
    - src/actions/bookings.ts
    - src/actions/site-content.ts
    - src/actions/refunds.ts
    - src/app/api/webhooks/stripe/route.ts
    - src/app/api/page-content/[pageId]/route.ts
    - src/app/admin/ordrer/[id]/page.tsx

key-decisions:
  - "updateOrderStatus return type changed from void to { success, error } for caller error handling"
  - "Admin order page updated to handle new return type instead of try-catch on void"

patterns-established:
  - "revalidateTag single-arg: always revalidateTag('tag') never revalidateTag('tag', 'max')"
  - "JSON.parse guard: parse before schema validation, return { success: false, errors: { field } } on failure"

requirements-completed: [CMS-AUDIT-CACHE, CMS-AUDIT-QUALITY]

# Metrics
duration: 4min
completed: 2026-04-12
---

# Phase 18 Plan 03: Server Action Fixes Summary

**Fixed 24 revalidateTag misuses, added admin auth to updateOrderStatus, and wrapped all JSON.parse calls in try-catch across 10 server action files**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-12T19:22:58Z
- **Completed:** 2026-04-12T19:26:31Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Removed invalid second argument from all 24 revalidateTag call sites (22 planned + 2 discovered in page-content route) ensuring cache invalidation works correctly
- Added verifySession + admin role check to updateOrderStatus preventing unauthorized order status changes
- Wrapped all JSON.parse calls in products, articles, and experiences server actions with try-catch returning Norwegian error messages

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix revalidateTag calls across all files** - `97ffda4` (fix)
2. **Task 2: Add auth to updateOrderStatus and wrap JSON.parse in try-catch** - `b1d439b` (fix)

## Files Created/Modified
- `src/actions/articles.ts` - Removed 'max' from 3 revalidateTag calls, wrapped 2 JSON.parse (coverImage) in try-catch
- `src/actions/orders.ts` - Removed 'max' from 3 revalidateTag calls, added verifySession + try-catch to updateOrderStatus
- `src/actions/products.ts` - Removed 'max' from 3 revalidateTag calls, wrapped 4 JSON.parse (images, variants) in try-catch
- `src/actions/bookings.ts` - Removed 'max' from 2 revalidateTag calls
- `src/actions/site-content.ts` - Removed 'max' from 1 revalidateTag call
- `src/actions/experiences.ts` - Removed 'max' from 6 revalidateTag calls, wrapped 4 JSON.parse (images, dates) in try-catch
- `src/actions/refunds.ts` - Removed 'max' from 1 revalidateTag call
- `src/app/api/webhooks/stripe/route.ts` - Removed 'max' from 3 revalidateTag calls
- `src/app/api/page-content/[pageId]/route.ts` - Removed 'max' from 2 revalidateTag calls (deviation)
- `src/app/admin/ordrer/[id]/page.tsx` - Updated to handle new updateOrderStatus return type

## Decisions Made
- Changed updateOrderStatus return type from `Promise<void>` to `Promise<{ success: boolean; error?: string }>` for proper error handling
- Updated the admin order detail page caller to use return value instead of try-catch on void function

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed 2 additional revalidateTag calls in page-content route**
- **Found during:** Task 1 (verification step)
- **Issue:** `src/app/api/page-content/[pageId]/route.ts` had 2 revalidateTag calls with 'max' argument not listed in the plan
- **Fix:** Applied same fix (removed second argument) to both PUT and DELETE handlers
- **Files modified:** src/app/api/page-content/[pageId]/route.ts
- **Verification:** grep confirms zero remaining occurrences
- **Committed in:** 97ffda4 (Task 1 commit)

**2. [Rule 1 - Bug] Updated admin order page caller for new return type**
- **Found during:** Task 2 (after changing updateOrderStatus return type)
- **Issue:** Admin order detail page called updateOrderStatus with try-catch expecting thrown errors, but new implementation returns error object
- **Fix:** Changed caller to inspect `result.success` and `result.error` instead of catching exceptions
- **Files modified:** src/app/admin/ordrer/[id]/page.tsx
- **Verification:** Code correctly handles both success and error cases
- **Committed in:** b1d439b (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Threat Mitigations

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-18-10 | Mitigated | verifySession + admin role check added to updateOrderStatus |
| T-18-11 | Mitigated | All JSON.parse calls wrapped in try-catch with error returns |
| T-18-12 | Mitigated | All 24 revalidateTag calls fixed to single-argument form |

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All cache invalidation calls use correct API
- All order mutations require admin authentication
- All form data parsing handles malformed JSON gracefully

## Self-Check: PASSED

All 11 files verified present. Both commit hashes (97ffda4, b1d439b) confirmed in git log.

---
*Phase: 18-cms-revisjon*
*Completed: 2026-04-12*
