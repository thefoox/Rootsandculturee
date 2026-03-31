---
phase: 04-kundekonto
plan: 01
subsystem: ui
tags: [firestore, next.js, server-actions, firebase-auth, react-19, useActionState, sonner]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Auth system (verifySession, session cookies, middleware), UI components (Button, Input, FormError), Firebase Admin SDK
  - phase: 03-01-handlekurv-checkout
    provides: Order and Booking types, Firestore data layer (orders.ts, bookings.ts)
  - phase: 03-02-booking-admin
    provides: OrderStatusBadge, BookingStatusBadge components
provides:
  - Customer dashboard at /konto with tab navigation
  - User profile data layer (getUserProfile)
  - Profile update and password change functionality
  - Order history with detail view for customers
  - Booking history with upcoming/past split
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [client-side Firebase Auth password change, useActionState for profile forms, user-filtered Firestore queries without cache]

key-files:
  created:
    - src/lib/data/users.ts
    - src/actions/profile.ts
    - src/app/konto/layout.tsx
    - src/app/konto/page.tsx
    - src/app/konto/ordrer/page.tsx
    - src/app/konto/ordrer/[id]/page.tsx
    - src/app/konto/bookinger/page.tsx
    - src/app/konto/profil/page.tsx
    - src/components/konto/KontoTabs.tsx
    - src/components/konto/OrderCard.tsx
    - src/components/konto/BookingCard.tsx
    - src/components/konto/EmptyState.tsx
    - src/components/konto/ProfileForm.tsx
    - src/components/konto/PasswordChangeForm.tsx
  modified:
    - src/lib/data/orders.ts
    - src/lib/data/bookings.ts

key-decisions:
  - "Password change happens client-side via Firebase Auth reauthenticateWithCredential + updatePassword (server action only validates form data)"
  - "User-filtered queries (getOrdersByUser, getBookingsByUser) are not cached since user-specific data should be fresh on each load"
  - "Zod .issues used instead of .errors for error extraction (TypeScript-correct API)"

patterns-established:
  - "Konto data layer: user-filtered Firestore queries without unstable_cache (user-specific = no caching)"
  - "Client-side auth mutations: Firebase Auth operations (password change) must happen client-side, server action validates only"
  - "Tab navigation: KontoTabs with usePathname for active state, aria-current='page' for accessibility"

requirements-completed: [CUST-01, CUST-02, CUST-03, CUST-04]

# Metrics
duration: 4min
completed: 2026-03-31
---

# Phase 04 Plan 01: Kundekonto Summary

**Customer dashboard with tab navigation, order/booking history, profile editing, and password change via Firebase Auth**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-31T00:05:51Z
- **Completed:** 2026-03-31T00:10:21Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- Complete /konto section with 4 tab pages (overview, orders, bookings, profile) and auth-guarded layout
- Order history with clickable cards and detail view including security check (customerId match)
- Booking history split into upcoming and past sections with whatToBring info on upcoming bookings
- Profile editing (name, address) via server action with Zod validation, and client-side password change with old password verification

## Task Commits

Each task was committed atomically:

1. **Task 1: Data layer, server actions, and konto route structure** - `0757452` (feat)
2. **Task 2: Profile edit form and password change with client interactivity** - `8621639` (feat)

## Files Created/Modified
- `src/lib/data/users.ts` - getUserProfile for Firestore user document access
- `src/lib/data/orders.ts` - getOrdersByUser added (user-filtered order queries)
- `src/lib/data/bookings.ts` - getBookingsByUser added (user-filtered booking queries)
- `src/actions/profile.ts` - updateProfileAction and changePasswordAction server actions with Zod validation
- `src/app/konto/layout.tsx` - Auth-guarded layout with KontoTabs navigation and "Min konto" heading
- `src/app/konto/page.tsx` - Overview page with greeting, last 3 orders, last 3 bookings
- `src/app/konto/ordrer/page.tsx` - Full order history list
- `src/app/konto/ordrer/[id]/page.tsx` - Order detail with items, address, price summary, and security check
- `src/app/konto/bookinger/page.tsx` - Bookings split into upcoming/past sections
- `src/app/konto/profil/page.tsx` - Profile page rendering ProfileForm and PasswordChangeForm
- `src/components/konto/KontoTabs.tsx` - Horizontal tab navigation with active state via usePathname
- `src/components/konto/OrderCard.tsx` - Order summary card with date, total, status badge, item count
- `src/components/konto/BookingCard.tsx` - Booking card with experience name, date, confirmation code, whatToBring
- `src/components/konto/EmptyState.tsx` - Empty state with Package icon and message
- `src/components/konto/ProfileForm.tsx` - Profile edit form with useActionState, read-only email, sonner toast
- `src/components/konto/PasswordChangeForm.tsx` - Client-side password change with Firebase Auth reauthentication

## Decisions Made
- Password change handled client-side via Firebase Auth (reauthenticateWithCredential + updatePassword) since server-side Firebase Auth requires active user auth state
- User-filtered queries skip unstable_cache since user-specific data should not be cached across requests
- Zod `.issues` property used instead of `.errors` for TypeScript correctness

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod error property from .errors to .issues**
- **Found during:** Task 1 (Build verification)
- **Issue:** Zod v3 `ZodError` uses `.issues` not `.errors` for accessing validation errors. TypeScript build failed.
- **Fix:** Changed `parsed.error.errors` to `parsed.error.issues` in both updateProfileAction and changePasswordAction
- **Files modified:** src/actions/profile.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 0757452 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for TypeScript correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All CUST requirements (CUST-01 through CUST-04) fully implemented
- This is the final phase of the v1 milestone -- all features are now complete
- Ready for full milestone verification

## Self-Check: PASSED

- All 14 created files verified on disk
- Commit 0757452 (Task 1) verified in git log
- Commit 8621639 (Task 2) verified in git log

---
*Phase: 04-kundekonto*
*Completed: 2026-03-31*
