---
phase: 18-cms-revisjon
plan: 01
subsystem: database, api
tags: [firestore, security-rules, firebase, upload, admin]

# Dependency graph
requires:
  - phase: 01-fundament
    provides: Firestore security rules foundation and admin role pattern
provides:
  - Complete Firestore security rules covering all 11 collections
  - Admin-only upload endpoint
  - Removed debug endpoint from production
affects: [18-cms-revisjon]

# Tech tracking
tech-stack:
  added: []
  patterns: [admin-only Firestore rules for sensitive collections, role-based API route guards]

key-files:
  created: []
  modified:
    - firestore.rules
    - src/app/api/upload/route.ts

key-decisions:
  - "Articles rule simplified to status-only check (no OR with publishedAt)"
  - "pageContent, giftCards, and order notes all admin-only (no public read)"

patterns-established:
  - "Firestore rules: all sensitive collections use inline get() admin check"
  - "API routes: admin-only endpoints check session.role !== 'admin'"

requirements-completed: [CMS-AUDIT-SEC, CMS-AUDIT-RULES]

# Metrics
duration: 1min
completed: 2026-04-12
---

# Phase 18 Plan 01: Security Hardening Summary

**Firestore rules expanded to all 11 collections, debug endpoint deleted, upload route admin-gated, error message corrected**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-12T19:22:24Z
- **Completed:** 2026-04-12T19:23:40Z
- **Tasks:** 2
- **Files modified:** 2 modified, 1 deleted

## Accomplishments
- Added admin-only Firestore security rules for pageContent, giftCards, and orders/notes subcollection
- Fixed articles rule OR logic that could expose draft articles to public
- Deleted debug-firestore endpoint that leaked environment variable information
- Restricted upload route to admin role only (was any authenticated user)
- Fixed upload error message from "maks 5 MB" to "maks 10 MB" to match actual limit

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Firestore security rules and delete debug endpoint** - `1630b5b` (fix)
2. **Task 2: Restrict upload route to admin role and fix error message** - `a798576` (fix)

## Files Created/Modified
- `firestore.rules` - Added rules for pageContent, giftCards, orders/notes; fixed articles rule
- `src/app/api/upload/route.ts` - Added admin role check, fixed file size error message
- `src/app/api/debug-firestore/route.ts` - Deleted (security risk, leaked env vars)

## Decisions Made
- Articles rule simplified to `status == 'published'` only, removing redundant publishedAt OR condition that could expose drafts
- All three new collections (pageContent, giftCards, order notes) set as admin-only for both read and write since they contain sensitive/draft data

## Deviations from Plan

None - plan executed exactly as written.

## Threat Surface Scan

No new threat surface introduced. All changes reduce attack surface:
- T-18-02: Upload endpoint now admin-only (mitigated)
- T-18-03: Debug endpoint deleted (mitigated)
- T-18-04: Missing Firestore rules added (mitigated)
- T-18-05: Articles rule fixed (mitigated)

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Firestore rules are now complete for all collections
- Ready for Plan 02 (CMS API auth hardening) and Plan 03 (CMS UI improvements)

## Self-Check: PASSED

---
*Phase: 18-cms-revisjon*
*Completed: 2026-04-12*
