---
phase: 22-ecommerce-robusthet
plan: "01"
subsystem: checkout
tags:
  - stripe
  - ux
  - robustness
  - mobile
dependency_graph:
  requires: []
  provides:
    - timeout-safe-confirmation-modal
    - stripe-payment-timeout
    - 3ds-redirect-error-persistence
  affects:
    - src/components/checkout/ConfirmationModal.tsx
    - src/components/checkout/CheckoutForm.tsx
    - src/app/(public)/checkout/page.tsx
tech_stack:
  added: []
  patterns:
    - Promise.race for client-side timeout on Stripe SDK calls
    - window.history.replaceState to avoid Next.js re-render on URL cleanup
    - Split dismiss handlers for conditional clearCart
key_files:
  created: []
  modified:
    - src/components/checkout/ConfirmationModal.tsx
    - src/components/checkout/CheckoutForm.tsx
    - src/app/(public)/checkout/page.tsx
decisions:
  - timedOut state triggers on polling exhaustion (30 attempts x 2s = 60s) with no clearCart
  - Promise.race timeout resolves with sentinel string PAYMENT_TIMEOUT (not reject) to keep error path uniform
  - window.history.replaceState chosen over router.replace to prevent App Router re-render
metrics:
  duration: "~10 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 22 Plan 01: Checkout Robustness Bug Fixes Summary

**One-liner:** Three checkout UX bugs fixed — ConfirmationModal escape button + timedOut state, 30s Promise.race timeout on stripe.confirmPayment, and window.history.replaceState for 3DS redirect error persistence.

## What Was Built

### Task 1: ConfirmationModal — escape button, timedOut state, conditional clearCart (commit `91cce15`)

**File:** `src/components/checkout/ConfirmationModal.tsx`

- Added `timedOut` boolean state (initially `false`), set to `true` when the poll loop exhausts `maxAttempts` (30 attempts, 60 seconds) without finding an order or booking.
- Split the single `handleDismiss` function into two:
  - `handleDismissSuccess` — calls `clearCart()` then `router.push('/')`. Used only when `hasOrder || hasBookings` is confirmed.
  - `handleDismissTimeout` — calls `router.push('/')` only, no `clearCart()`. Used during loading spinner and after timeout.
- Added an escape button ("Avbryt og ga tilbake") inside the loading spinner section — visible from second 0, users are never trapped.
- Added a `timedOut` block rendered when `!loading && timedOut && !hasOrder && !hasBookings` with a Norwegian `role="alert"` message: "Betalingen er under behandling. Sjekk e-posten din for bekreftelse, eller kontakt oss hvis du ikke mottar noe innen 24 timer."
- The success view (when `hasOrder || hasBookings`) uses `handleDismissSuccess` for its dismiss button.
- `clearCart()` is now guaranteed to only fire after confirmed fulfillment.

### Task 2: 30s Promise.race timeout + 3DS redirect fix (commit `17670d4`)

**Files:** `src/components/checkout/CheckoutForm.tsx`, `src/app/(public)/checkout/page.tsx`

**CheckoutForm.tsx:**
- Added `const PAYMENT_TIMEOUT_MS = 30_000` at module level (outside component).
- Replaced direct `stripe.confirmPayment(...)` call with `Promise.race([stripeCall, timeoutPromise])`. The timeout promise resolves (not rejects) with `{ error: { message: 'PAYMENT_TIMEOUT' } }` after 30s, keeping the error path uniform.
- Added sentinel check: when `confirmResult.error.message === 'PAYMENT_TIMEOUT'`, shows Norwegian error "Betalingen tok for lang tid. Sjekk at betalingen gikk gjennom, eller prov igjen."
- Extracted `paymentIntent` from `confirmResult` safely via `'paymentIntent' in confirmResult` guard.

**checkout/page.tsx:**
- Replaced `router.replace('/checkout')` with `window.history.replaceState({}, '', '/checkout')` in the 3DS redirect handler.
- Removed `router` from the `useEffect` dependency array for that effect (it is no longer used inside it). `router` is still used elsewhere in the component for the empty-cart redirect.
- This prevents the Next.js App Router from triggering a full component re-render (which was resetting `initError` state), so the "Betalingen mislyktes" error message now persists correctly.

## Deviations from Plan

None — plan executed exactly as written.

## Decisions Made

1. **Timeout resolves, not rejects:** The plan showed two patterns — one with `Promise.race` where the timeout rejects, and one where it resolves with a sentinel. Resolving was chosen because it keeps error handling in a single `if ('error' in confirmResult)` branch and avoids needing a try/catch just for the timeout case. The existing `catch` block handles genuinely unexpected throws.

2. **`router` stays imported in checkout/page.tsx:** The router is still used on line 144 for `router.push('/handlekurv')` (empty-cart redirect). Only removed from the 3DS redirect effect's dependency array.

3. **No change to timedOut + success case:** If `timedOut` is true but `hasOrder || hasBookings` also becomes true (webhook arrived late), the component renders the normal success view with `handleDismissSuccess`. This is correct — the timedOut block only renders when `!hasOrder && !hasBookings`.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

- `src/components/checkout/ConfirmationModal.tsx` — FOUND, contains `timedOut`, `handleDismissTimeout`, `handleDismissSuccess`, "Avbryt og ga tilbake", "Betalingen er under behandling", `role="alert"`
- `src/components/checkout/CheckoutForm.tsx` — FOUND, contains `PAYMENT_TIMEOUT_MS`, `Promise.race`, `PAYMENT_TIMEOUT`, "Betalingen tok for lang tid"
- `src/app/(public)/checkout/page.tsx` — FOUND, contains `window.history.replaceState`, no `router.replace('/checkout')`
- Commits `91cce15` and `17670d4` — FOUND in git log
- `npx tsc --noEmit` — PASSED (no output)
