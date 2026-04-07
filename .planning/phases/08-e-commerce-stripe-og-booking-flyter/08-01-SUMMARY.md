---
phase: 08-e-commerce-stripe-og-booking-flyter
plan: 01
subsystem: payments
tags: [stripe, checkout, payment-intent, server-actions, firebase-auth]

# Dependency graph
requires:
  - phase: 03-betaling-og-booking
    provides: createPaymentIntent, CheckoutForm, StripeElementsWrapper, checkout page flow
  - phase: 04-kundekonto
    provides: verifySession, dal.ts, jose session cookies
provides:
  - updatePaymentIntentMetadata server action (stripe.paymentIntents.update with validated metadata)
  - getCheckoutUser server action (returns session email for client components)
  - Fixed CheckoutForm that updates existing PI instead of creating a second one
  - CheckoutPage that extracts PI id from clientSecret and passes it to CheckoutForm
  - Logged-in user email pre-fill in checkout
affects: [08-02-e-commerce-stripe-og-booking-flyter, webhooks/stripe]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PI metadata update pattern: extract PI id from clientSecret via split('_secret_')[0], then call stripe.paymentIntents.update() before confirmPayment"
    - "getCheckoutUser server action pattern: call verifySession() from a server action to expose session email to client components without exposing HttpOnly cookie"

key-files:
  created: []
  modified:
    - src/actions/checkout.ts
    - src/components/checkout/CheckoutForm.tsx
    - src/app/(public)/checkout/page.tsx

key-decisions:
  - "Use stripe.paymentIntents.update() on submit instead of creating a new PI — Stripe Elements must remain bound to original PI client_secret"
  - "Extract PI id from clientSecret string split rather than a separate server round-trip — clientSecret format pi_xxx_secret_yyy is stable Stripe API"
  - "Expose session email via getCheckoutUser server action rather than converting page to Server Component — page has too much client state to restructure"

patterns-established:
  - "PI id extraction from clientSecret: clientSecret.split('_secret_')[0]"
  - "Server action returning session data to client component: getCheckoutUser() pattern"

requirements-completed: [ECOM-05, ECOM-06]

# Metrics
duration: 15min
completed: 2026-04-07
---

# Phase 08 Plan 01: PaymentIntent Metadata Fix Summary

**Fixed critical checkout bug where webhook received placeholder@init.no by adding stripe.paymentIntents.update() call on form submit to set real customer metadata on the PI Stripe Elements is bound to**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-07T09:00:00Z
- **Completed:** 2026-04-07T09:15:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `updatePaymentIntentMetadata` server action that re-validates cart items against Firestore and calls `stripe.paymentIntents.update()` with complete customer metadata
- Added `getCheckoutUser` server action to expose session email to the client-side checkout page
- Fixed `CheckoutForm` to accept `paymentIntentId` prop and call `updatePaymentIntentMetadata` on submit instead of creating a second orphaned PaymentIntent
- Fixed `CheckoutPage` to extract PI id from clientSecret, load logged-in user email, and pass both to `CheckoutForm`
- Webhook will now receive `payment_intent.succeeded` with correct `customerEmail`, `customerName`, `shippingAddress`, etc.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add updatePaymentIntentMetadata server action** - `8f4cd2c` (feat)
2. **Task 2: Fix CheckoutForm + CheckoutPage** - `d25da41` (fix)

## Files Created/Modified

- `src/actions/checkout.ts` — Added `updatePaymentIntentMetadata` (updates existing PI with real customer metadata) and `getCheckoutUser` (returns session email for client-side use)
- `src/components/checkout/CheckoutForm.tsx` — Added `paymentIntentId` prop, replaced `createPaymentIntent` call with `updatePaymentIntentMetadata`, updated import
- `src/app/(public)/checkout/page.tsx` — Added `initPaymentIntentId` state (extracted from clientSecret), `userEmail` state (from `getCheckoutUser`), passes both to `CheckoutForm`

## Decisions Made

- **Update not create:** `stripe.paymentIntents.update()` is used on submit so the PI that Stripe Elements is bound to (via its `client_secret`) gets correct metadata. Creating a new PI on submit would charge the original PI (with `placeholder@init.no`) when `stripe.confirmPayment()` is called.
- **PI id extraction from clientSecret:** The Stripe `client_secret` format is `pi_xxx_secret_yyy` — splitting on `_secret_` extracts the PI id without an extra server round-trip. This is safe because the `clientSecret` comes from our own `createPaymentIntent` call stored in component state (not user-supplied).
- **getCheckoutUser server action:** Rather than restructuring the checkout page from a client to server component (which manages many pieces of client state), a lightweight server action exposes the session email to the client via `useEffect`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The checkout flow now correctly populates PaymentIntent metadata before confirmation
- Webhook handler (`src/app/api/webhooks/stripe/route.ts`) will receive `customerEmail` = real customer email, enabling correct order/booking creation in Firestore
- Ready for Plan 08-02 (end-to-end checkout and booking flow verification)

---
*Phase: 08-e-commerce-stripe-og-booking-flyter*
*Completed: 2026-04-07*
