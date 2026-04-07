---
phase: 05-checkout-bekreftelse-wiring
plan: 01
subsystem: payments
tags: [stripe, firestore, firebase-admin, react, server-actions, checkout, booking]

# Dependency graph
requires:
  - phase: 03-betaling-og-booking
    provides: Stripe webhook writes stripePaymentIntentId to bookings collection; ConfirmationModal skeleton with bookings prop; order polling useEffect
  - phase: 04-kundekonto
    provides: getOrderByStripePaymentIntent action pattern used as reference
provides:
  - getBookingsByPaymentIntent Firestore query in src/lib/data/bookings.ts
  - getBookingsByPaymentIntentAction public server action for client polling
  - stripePaymentIntentId field on Booking type
  - Combined order+booking polling in ConfirmationModal
  - Customer email threaded from CheckoutForm through checkout page to ConfirmationModal
affects:
  - Any future phase that reads the Booking type (stripePaymentIntentId field now required)
  - Any future phase modifying ConfirmationModal or CheckoutForm

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Combined Promise.all polling: fetch order and bookings in parallel inside a single polling loop"
    - "Public server action pattern: getBookingsByPaymentIntentAction has no auth guard — safe because paymentIntentId is already client-exposed by Stripe and data is the customer's own booking"
    - "polledBookings vs prop bookings merge: polledBookings takes precedence, prop bookings as fallback"

key-files:
  created: []
  modified:
    - src/types/index.ts
    - src/lib/data/bookings.ts
    - src/actions/bookings.ts
    - src/components/checkout/CheckoutForm.tsx
    - src/app/(public)/checkout/page.tsx
    - src/components/checkout/ConfirmationModal.tsx

key-decisions:
  - "getBookingsByPaymentIntent does not use unstable_cache — real-time polling after payment requires fresh data every 2 seconds"
  - "getBookingsByPaymentIntentAction has no session/auth guard — paymentIntentId is already exposed to the client by Stripe, and the booking data matches what the customer receives via email"
  - "Combined polling via Promise.all stops as soon as either order OR bookings are found — correct for booking-only, product-only, and mixed purchases"
  - "polledBookings takes precedence over prop bookings (allBookings = polledBookings.length > 0 ? polledBookings : bookings) to allow backward compat with any parent passing bookings directly"

patterns-established:
  - "Public server action: server actions callable from client without auth are acceptable when the input is a non-secret Stripe ID and the output is the customer's own purchase data"
  - "Combined polling: use Promise.all to fetch multiple resources in a single poll iteration rather than separate polling loops"

requirements-completed: [BOOK-05, PROD-06]

# Metrics
duration: 3min
completed: 2026-04-07
---

# Phase 05 Plan 01: Checkout Confirmation Wiring Summary

**Booking confirmation details and real customer email now appear in the ConfirmationModal by adding a Firestore query on stripePaymentIntentId, a public server action for client polling, combined order+booking polling via Promise.all, and threading email through the CheckoutForm callback**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-07T16:27:58Z
- **Completed:** 2026-04-07T16:30:43Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added `stripePaymentIntentId: string` field to the `Booking` interface and mapped it in `docToBooking`, closing the type/Firestore mismatch (webhook was writing the field but the type and query layer ignored it)
- Added `getBookingsByPaymentIntent` Firestore query and `getBookingsByPaymentIntentAction` public server action, enabling the client to poll for booking confirmation after payment
- Replaced the order-only polling loop in ConfirmationModal with a combined `Promise.all` loop that fetches both order and bookings in parallel, making booking-only and mixed purchases show confirmation details
- Fixed customer email display: `onPaymentSuccess` now passes `email` as second argument, and `handlePaymentSuccess` in checkout/page.tsx now calls `setCustomerEmail(email)` so the real email replaces the `'kunde@example.com'` fallback

## Task Commits

1. **Task 1: Add stripePaymentIntentId to Booking type and getBookingsByPaymentIntentAction** - `0195442` (feat)
2. **Task 2: Thread customer email and wire booking polling in ConfirmationModal** - `0f98f81` (feat)

## Files Created/Modified

- `src/types/index.ts` - Added `stripePaymentIntentId: string` to Booking interface
- `src/lib/data/bookings.ts` - Added `stripePaymentIntentId` mapping in `docToBooking`; added `getBookingsByPaymentIntent` function with Firestore where clause
- `src/actions/bookings.ts` - Added `getBookingsByPaymentIntentAction` public server action; updated imports
- `src/components/checkout/CheckoutForm.tsx` - Updated `onPaymentSuccess` signature and call site to pass `email` as second argument
- `src/app/(public)/checkout/page.tsx` - Updated `handlePaymentSuccess` to accept `email` parameter and call `setCustomerEmail(email)`
- `src/components/checkout/ConfirmationModal.tsx` - Added `getBookingsByPaymentIntentAction` import; added `polledBookings` state; replaced order-only polling with combined Promise.all polling; added `allBookings` merge variable; updated booking display to use `allBookings`

## Decisions Made

- No auth guard on `getBookingsByPaymentIntentAction`: the paymentIntentId is already exposed to the client by Stripe's `confirmPayment` response, and the booking data returned (name, date, confirmation code) matches what the customer receives via email — no additional PII exposure
- No `unstable_cache` on `getBookingsByPaymentIntent`: real-time polling immediately after payment requires fresh Firestore reads
- `Promise.all` stops polling when either order OR bookings are found, covering booking-only, product-only, and mixed purchase flows correctly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

- `src/app/(public)/checkout/page.tsx` line 50: `{ email: 'placeholder@init.no' }` — pre-existing stub used to initialize the Stripe PaymentIntent before the user fills in the form. This is intentional and predates this plan. The plan's goal (real email in the modal) is fully achieved — the real email is now threaded via the `onPaymentSuccess` callback. This stub does not affect confirmation display.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries introduced beyond what is documented in the plan's threat model. `getBookingsByPaymentIntentAction` is a public server action — threat T-05-01 disposition `accept` is documented in the plan's threat model.

## Next Phase Readiness

- BOOK-05 (on-page booking confirmation) fully closed
- PROD-06 (customer email in confirmation) fully closed
- ConfirmationModal now handles booking-only, product-only, and mixed purchases correctly
- No blockers for subsequent phases

## Self-Check: PASSED

---
*Phase: 05-checkout-bekreftelse-wiring*
*Completed: 2026-04-07*
