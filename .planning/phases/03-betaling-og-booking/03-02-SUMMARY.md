---
phase: 03-betaling-og-booking
plan: 02
subsystem: booking
tags: [firestore-onSnapshot, real-time-availability, date-picker, admin-dashboard, booking-management, order-management]

# Dependency graph
requires:
  - phase: 03-betaling-og-booking
    provides: Cart system (CartProvider, useCart), Stripe checkout pipeline, webhook handler, order/booking types, order server actions
  - phase: 02-butikkvindu-og-admin
    provides: Experience types, experience data layer, admin CMS patterns (AdminShell, DataTable, DeleteConfirmDialog), SpotsRemaining component
provides:
  - DateCardPicker with real-time Firestore onSnapshot for live seat availability
  - BookingInfoPanel with add-to-cart CTA and capacity block (BOOK-06)
  - DateCard component with selected/sold-out/default states
  - Admin orders list page with DataTable and status badges
  - Admin order detail page with status update
  - Admin bookings list page with experience/date filtering and cancel dialog
  - Booking server actions with atomic seat reversal on cancellation
  - Order and booking data layers with unstable_cache
affects: [customer-dashboard, admin-enhancements]

# Tech tracking
tech-stack:
  added: []
  patterns: [Firestore onSnapshot for client-side real-time updates, admin filter-by-relation pattern, atomic cancellation with seat reversal]

key-files:
  created:
    - src/components/experiences/DateCard.tsx
    - src/components/experiences/DateCardPicker.tsx
    - src/components/experiences/BookingInfoPanel.tsx
    - src/actions/bookings.ts
    - src/lib/data/orders.ts
    - src/lib/data/bookings.ts
    - src/components/admin/OrderStatusBadge.tsx
    - src/components/admin/BookingStatusBadge.tsx
    - src/components/admin/BookingFilterRow.tsx
    - src/app/admin/ordrer/page.tsx
    - src/app/admin/ordrer/[id]/page.tsx
    - src/app/admin/bookinger/page.tsx
  modified:
    - src/app/(public)/opplevelser/[slug]/page.tsx
    - src/components/admin/AdminSidebar.tsx
    - src/components/admin/DeleteConfirmDialog.tsx

key-decisions:
  - "DeleteConfirmDialog extended with optional heading/body/confirmLabel/cancelLabel props for reuse across delete and cancel flows"
  - "Booking filter uses client-side filtering (data already loaded) to avoid extra server calls"
  - "DateCardPicker uses Firestore onSnapshot only for the selected date (not all dates) to minimize listeners"

patterns-established:
  - "Admin filter pattern: derive filter options from loaded data, apply client-side, reset on parent change"
  - "Date card pattern: button with aria-pressed for toggle selection, aria-disabled for sold-out"
  - "Capacity block pattern: role=alert with red styling when availableSeats <= 0"

requirements-completed: [BOOK-03, BOOK-04, BOOK-05, BOOK-06, BOOK-08, ADMN-05, ADMN-06]

# Metrics
duration: 7min
completed: 2026-03-30
---

# Phase 03 Plan 02: Booking og Admin Summary

**Date card picker with real-time Firestore availability, booking-to-cart integration, and admin order/booking management dashboards**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-30T21:20:24Z
- **Completed:** 2026-03-30T21:28:16Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Complete booking date picker flow: DateCard with selected/sold-out/default states, DateCardPicker with Firestore onSnapshot real-time seat updates, BookingInfoPanel with spots remaining, price, and add-to-cart CTA
- Capacity block (BOOK-06): when all seats filled, shows "Alle plasser er fylt" with role="alert" instead of CTA button
- Admin sidebar updated with "ORDRE" section containing Ordrer (ShoppingCart icon) and Bookinger (CalendarCheck icon) links
- Admin orders: list page with DataTable showing all orders, detail page with status update via select + server action
- Admin bookings: list page with experience/date filtering, cancellation with confirmation dialog that atomically reverses seat reservation via Firestore transaction
- Order and booking data layers with unstable_cache for efficient data fetching
- DeleteConfirmDialog made reusable with optional custom heading, body, and button labels

## Task Commits

Each task was committed atomically:

1. **Task 1: Booking date picker components and experience page integration** - `7bc63ff` (feat)
2. **Task 2: Admin order management, admin booking management, and sidebar update** - `6e53dd4` (feat)

## Files Created/Modified
- `src/components/experiences/DateCard.tsx` - Individual date button with available/selected/sold-out states
- `src/components/experiences/DateCardPicker.tsx` - Date card grid with Firestore onSnapshot real-time listener
- `src/components/experiences/BookingInfoPanel.tsx` - Booking info panel with spots, price, add-to-cart CTA, capacity block
- `src/app/(public)/opplevelser/[slug]/page.tsx` - Updated with DateCardPicker replacing disabled placeholder
- `src/actions/bookings.ts` - Booking server actions (cancelBooking with transaction, getBookingsFiltered)
- `src/lib/data/orders.ts` - Order data functions with unstable_cache
- `src/lib/data/bookings.ts` - Booking data functions with unstable_cache
- `src/components/admin/AdminSidebar.tsx` - Added ORDRE section with Ordrer and Bookinger links
- `src/components/admin/OrderStatusBadge.tsx` - Order status badge with Norwegian labels
- `src/components/admin/BookingStatusBadge.tsx` - Booking status badge with Norwegian labels
- `src/components/admin/BookingFilterRow.tsx` - Filter row for bookings by experience/date
- `src/components/admin/DeleteConfirmDialog.tsx` - Extended with custom heading/body/confirm/cancel props
- `src/app/admin/ordrer/page.tsx` - Admin orders list page with DataTable
- `src/app/admin/ordrer/[id]/page.tsx` - Admin order detail page with status update
- `src/app/admin/bookinger/page.tsx` - Admin bookings list page with filters and cancel dialog

## Decisions Made
- Extended DeleteConfirmDialog with optional custom text props rather than creating a separate CancelDialog -- maintains single reusable component
- Booking filters derived from loaded booking data (experience names, dates) rather than separate API calls -- reduces server round trips
- onSnapshot listener only fires for the currently selected date to minimize Firestore reads
- Booking cancellation reverses both bookedSeats and availableSeats atomically in a Firestore transaction

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Extended DeleteConfirmDialog with custom text props**
- **Found during:** Task 2 (Bookings page implementation)
- **Issue:** Plan specified custom heading/body text for booking cancellation dialog, but DeleteConfirmDialog only supported hardcoded "Slett {itemName}?" text
- **Fix:** Added optional heading, body, confirmLabel, cancelLabel props with fallbacks to existing defaults
- **Files modified:** src/components/admin/DeleteConfirmDialog.tsx
- **Committed in:** 6e53dd4

---

**Total deviations:** 1 auto-fixed (1 missing critical functionality)
**Impact on plan:** Minimal enhancement to existing component. No scope creep.

## Issues Encountered
- Pre-existing Firebase client SDK build error (auth/invalid-api-key during prerendering) continues from baseline. TypeScript compilation passes clean. Not caused by this plan.

## Known Stubs
None -- all components are wired to real data sources. DateCardPicker reads live data from Firestore onSnapshot. Admin pages fetch from Firestore via data layer functions. Booking cancellation performs atomic Firestore transaction.

## Next Phase Readiness
- Complete booking flow operational: date selection -> add to cart -> Stripe checkout -> webhook creates booking with confirmation code
- Admin has full order and booking management capabilities
- Phase 3 (Betaling og Booking) is now complete -- all plans executed
- Ready for Phase 4 (customer dashboard, profile management)

## Self-Check: PASSED

All 12 created files verified on disk. Both task commits (7bc63ff, 6e53dd4) verified in git log.

---
*Phase: 03-betaling-og-booking*
*Completed: 2026-03-30*
