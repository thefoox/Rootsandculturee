---
phase: 14-komplett-revisjon
plan: 01
subsystem: checkout, webhook, auth, cms
tags: [bugfix, payment, security, csp, session, cms]
dependency_graph:
  requires: []
  provides: [gift-card-pi-fix, variant-stock-fix, google-csp-fix, session-lazy-init, imageposition-fix]
  affects: [checkout-flow, webhook-fulfillment, google-auth, build-pipeline, cms-rendering]
tech_stack:
  added: []
  patterns: [lazy-initialization, direct-fulfillment-path]
key_files:
  created: []
  modified:
    - src/actions/checkout.ts
    - src/components/checkout/CheckoutForm.tsx
    - src/app/api/webhooks/stripe/route.ts
    - next.config.ts
    - src/lib/session.ts
    - src/lib/data/page-content.ts
decisions:
  - Gift card full-coverage orders cancel the PI and fulfill directly without Stripe payment
  - Lazy getEncodedKey() pattern for session module to avoid build-time throws
metrics:
  duration: 3min
  completed: 2026-04-08
  tasks: 5
  files: 6
---

# Phase 14 Plan 01: Critical Bug Fixes Summary

Server-side gift card deduction now reduces PI amount (not just metadata), variant stock is decremented at variant level, Google sign-in CSP fixed, session module defers SECRET check to runtime, and imagePosition preserved in CMS pipeline.

## What Was Done

### Task 1: Gift card discount applied to Stripe PaymentIntent amount (78ed4c5)
- Added `amount: total` to `stripe.paymentIntents.update()` call so gift card deduction reduces the actual charge
- Implemented `coveredByGiftCard` path: when gift card covers full amount, PI is canceled, gift card redeemed, and order/bookings created directly without Stripe payment
- Updated `CheckoutForm.tsx` to skip `stripe.confirmPayment()` when `coveredByGiftCard` response received
- Added `redeemGiftCard` import for direct fulfillment path
- Updated return type of `updatePaymentIntentMetadata` to include `coveredByGiftCard` union

### Task 2: Variant stock decremented in webhook (b40d4f8)
- Stock decrement loop now checks for `variantId` on each order item
- When `variantId` is present and `variants` array exists, the specific variant's `stockCount` is decremented
- Top-level `stockCount` decrement preserved for backward compatibility

### Task 3: Google login CSP fix (2bdd923)
- Added `https://apis.google.com` to `connect-src` (not covered by `*.googleapis.com` wildcard since it's a different domain)
- Added `https://*.google.com` to `frame-src` for robust Google account type support

### Task 4: Session module build-time crash fix (17a22c5)
- Replaced module-scope `if (!secretKey) throw` with lazy `getEncodedKey()` function
- Key is encoded on first use, not at import time
- Build succeeds without `SESSION_SECRET`; runtime calls still throw if missing

### Task 5: imagePosition preserved in CMS mapping (d1dfb42)
- Added `imagePosition: s.imagePosition || undefined` to section mapping in `mapPageContent`
- Field was silently dropped, breaking `TextImageSection` layout positioning

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. `npm run build` -- PASSED
2. `grep -n 'amount:' src/actions/checkout.ts` -- PI amount update confirmed at lines 186 and 489
3. `grep -n 'variantId' src/app/api/webhooks/stripe/route.ts` -- variant stock decrement at lines 183-186
4. `grep -n 'apis.google.com' next.config.ts` -- CSP fix confirmed at line 30
5. `grep -n 'imagePosition' src/lib/data/page-content.ts` -- field mapping confirmed at line 23

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 78ed4c5 | Gift card deduction reduces Stripe PI amount |
| 2 | b40d4f8 | Variant-level stock decrement in webhook |
| 3 | 2bdd923 | CSP apis.google.com for Google sign-in |
| 4 | 17a22c5 | Defer SESSION_SECRET validation to runtime |
| 5 | d1dfb42 | Preserve imagePosition in CMS mapping |

## Self-Check: PASSED

All 6 modified files exist. All 5 commit hashes verified.
