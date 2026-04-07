# Phase 05 Code Review — Checkout Bekreftelse Wiring

**Scope:** Files specified by caller (phase 05 gap-closure changes)
**Files reviewed:** 6
- `src/actions/bookings.ts`
- `src/app/(public)/checkout/page.tsx`
- `src/components/checkout/CheckoutForm.tsx`
- `src/components/checkout/ConfirmationModal.tsx`
- `src/lib/data/bookings.ts`
- `src/types/index.ts`

TypeScript: `npx tsc --noEmit` passes with zero errors.

---

## Code Review Results

### Critical (auto-fixed)

None found.

---

### Important

| # | File | Issue | Confidence | Suggested Fix |
|---|------|-------|-----------|---------------|
| 1 | `src/actions/bookings.ts:90-94` | `getBookingsByPaymentIntentAction` has no auth guard. Any client that can call a Server Action can query bookings by payment intent ID. A guest who guesses a payment intent ID could retrieve another customer's booking data (name, phone, confirmation code). | 88 | Add a session check: require either (a) the caller owns the payment intent (match `customerEmail` in session), or (b) restrict to admin. At minimum, validate that the payment intent ID format matches Stripe's `pi_…` pattern before hitting Firestore. |
| 2 | `src/app/(public)/checkout/page.tsx:77` | Fallback `'kunde@example.com'` is used when `customerEmail` is empty string at render time. In practice `customerEmail` is always set before `paymentIntentId` (both come from `handlePaymentSuccess`), so the string will never be empty here — but the fallback hides a future bug and the fake address would appear in the confirmation modal's "En bekreftelse er sendt til …" copy if state ever diverged. | 82 | Remove the fallback and assert the invariant: `customerEmail={customerEmail}`. If empty is a real risk, gate the render on `customerEmail` being non-empty alongside `paymentIntentId`. |
| 3 | `src/components/checkout/ConfirmationModal.tsx:64-65` | `b.date instanceof Date ? b.date.toISOString() : String(b.date)` — Server Actions serialize dates as plain objects across the network boundary; by the time `bookingResults` arrives in the client component `b.date` will be a plain `string` (JSON-serialized), not a `Date` instance. The `instanceof Date` branch will never be taken, and `String(b.date)` on an already-ISO string is harmless but misleading. | 80 | Replace with `typeof b.date === 'string' ? b.date : new Date(b.date as unknown as number).toISOString()` — or, simpler, just use `String(b.date)` unconditionally since the Server Action already sends a serialized value. |

---

### Minor

| # | File | Issue | Confidence |
|---|------|-------|-----------|
| 1 | `src/lib/data/bookings.ts:122-134` | `getBookingsByPaymentIntent` has no `unstable_cache` wrapper unlike the other top-level query `getBookings`. This is intentional for a polling query, but there is no in-code comment explaining the omission, which may confuse a future developer who adds caching uniformly. | 55 |
| 2 | `src/components/checkout/ConfirmationModal.tsx:40` | `polledBookings` state is initialised from the `bookings` prop default (`[]`) via `allBookings` merge on line 133, but the prop `bookings` is also in `ConfirmationModalProps` (line 24). The prop is never passed from `checkout/page.tsx` (line 74-78), so it is always `[]`. The dead prop adds surface area without value. | 52 |
| 3 | `src/components/checkout/ConfirmationModal.tsx:79` | Catch block silently swallows all errors during polling (comment says "// retry"). A persistent Firestore or network error will silently exhaust `maxAttempts` with no user feedback beyond the timeout path. | 58 |
| 4 | `src/app/(public)/checkout/page.tsx:44-64` | The initial `createPaymentIntent` call uses a hardcoded placeholder email `'placeholder@init.no'` (line 51). `checkout.ts` has a matching `isInitCall` bypass on line 59. This coupling is fragile — a string constant shared across two files with no shared symbol. | 57 |

---

**Summary:** 0 critical (0 auto-fixed), 3 important, 4 minor

---

## Wiring Assessment (Phase 05 Goals)

### Goal 1 — Thread customerEmail through CheckoutForm → page → ConfirmationModal

Correctly implemented. `CheckoutForm.onPaymentSuccess(piId, email)` passes `email` at line 138 of `CheckoutForm.tsx`. `checkout/page.tsx` stores it in state via `handlePaymentSuccess` (line 66-69) and passes it as `customerEmail` prop to `ConfirmationModal` (line 76). The `ConfirmationModal` renders it in the confirmation copy at line 249. The wiring is end-to-end and type-safe (`CheckoutFormProps.onPaymentSuccess: (paymentIntentId: string, email: string) => void`).

Minor concern: the `|| 'kunde@example.com'` fallback on page line 77 (Important issue #2 above).

### Goal 2 — getBookingsByPaymentIntent query + ConfirmationModal polling

`getBookingsByPaymentIntent` is correctly added to `src/lib/data/bookings.ts` (lines 122-134) and re-exported as a Server Action via `getBookingsByPaymentIntentAction` in `src/actions/bookings.ts` (lines 90-94). `ConfirmationModal` imports and calls both actions in a single `Promise.all` poll loop (lines 51-54), stops polling on the first successful result, and merges booking results into `polledBookings` state for display. The booking cards render confirmation code, experience name, formatted date, price, and `whatToBring` checklist. Functionality is correct.

Open risks: the auth-guard gap on `getBookingsByPaymentIntentAction` (Important issue #1) and the date serialization mismatch (Important issue #3).
