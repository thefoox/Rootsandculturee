---
phase: 14-komplett-revisjon
fixed_at: 2026-04-08T22:45:00Z
review_path: .planning/phases/14-komplett-revisjon/14-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 14: Code Review Fix Report

**Fixed at:** 2026-04-08T22:45:00Z
**Source review:** .planning/phases/14-komplett-revisjon/14-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: Missing stock decrement when gift card covers full order amount

**Files modified:** `src/actions/checkout.ts`
**Commit:** 6fa371a
**Applied fix:** Added stock decrement transaction loop after order creation in the gift-card-covered path (after line 423). The loop mirrors the existing webhook stock decrement logic: for each product item, it runs a Firestore transaction to atomically decrement `stockCount`, update `inStock` flag, and decrement variant-level `stockCount` when a `variantId` is present. Also added `import crypto from 'crypto'` at top of file (needed for WR-03).

### CR-02: Partial refund incorrectly treated as full cancellation

**Files modified:** `src/app/api/webhooks/stripe/route.ts`, `src/types/index.ts`
**Commit:** 6fa371a
**Applied fix:** Added `isFullRefund` check comparing `charge.amount_refunded` against `charge.amount`. Order status now set to `'cancelled'` only on full refund, `'partially_refunded'` on partial refund. Booking seat restoration and booking cancellation only execute on full refund. Added `isFullRefund` field to refund log subcollection. Added `'partially_refunded'` to the `OrderStatus` type union in `src/types/index.ts`. This is a logic fix: requires human verification.

### WR-01: Unprotected JSON.parse for shippingAddress can abort webhook processing

**Files modified:** `src/app/api/webhooks/stripe/route.ts`
**Commit:** 6fa371a
**Applied fix:** Wrapped `JSON.parse(metadata.shippingAddress)` in its own try/catch block, matching the pattern already used for `orderItems`, `bookingItems`, and `giftCardItems` parsing. On parse failure, logs error and continues with `shippingAddress = null` instead of aborting the entire webhook handler.

### WR-02: CSP includes unsafe-eval in script-src

**Files modified:** `next.config.ts`
**Commit:** 6fa371a
**Applied fix:** Made `'unsafe-eval'` conditional on `process.env.NODE_ENV === 'development'`. Added `const isDev` check before config object. CSP string converted from static string literal to template literal. In production, `'unsafe-eval'` is no longer included in `script-src`.

### WR-03: Insecure confirmation code generation in gift-card-covered path

**Files modified:** `src/actions/checkout.ts`
**Commit:** 6fa371a
**Applied fix:** Replaced `Math.random().toString(36).substring(2, 10).toUpperCase()` with `crypto.randomBytes(4).toString('hex').toUpperCase()`, matching the pattern already used in the webhook handler. Added `import crypto from 'crypto'` at top of file.

### WR-04: No validation of client-supplied PaymentIntent ID

**Files modified:** `src/actions/checkout.ts`
**Commit:** 6fa371a
**Applied fix:** Added format validation at the top of `updatePaymentIntentMetadata` that checks `paymentIntentId` is truthy and starts with `'pi_'`. Returns Norwegian error message `'Ugyldig betalings-ID.'` on invalid input, before any Stripe API calls are made.

### WR-05: Stripe metadata values may exceed 500-character limit

**Files modified:** `src/actions/checkout.ts`, `src/app/api/webhooks/stripe/route.ts`
**Commit:** 6fa371a
**Applied fix:** Removed `image` and `slug` fields from `orderItems` metadata serialization in both `createPaymentIntent` and `updatePaymentIntentMetadata`. Removed `slug` from `bookingItems` metadata. Updated webhook `ProductMetaItem` interface to remove `image` field. Updated webhook order creation to fetch product images from Firestore using `productId` (via `Promise.all` with individual product lookups). Updated email template calls to use `firestoreItems` (which contain fetched images) instead of raw `orderItems` from metadata. Hoisted `firestoreItems` variable declaration to outer scope for email template accessibility.

---

_Fixed: 2026-04-08T22:45:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
