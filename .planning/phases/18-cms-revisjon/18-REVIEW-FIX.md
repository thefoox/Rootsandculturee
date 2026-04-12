---
phase: 18-cms-revisjon
fixed_at: 2026-04-12T19:48:30Z
review_path: .planning/phases/18-cms-revisjon/18-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 11
skipped: 0
status: all_fixed
---

# Phase 18: Code Review Fix Report

**Fixed at:** 2026-04-12T19:48:30Z
**Source review:** .planning/phases/18-cms-revisjon/18-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 11
- Fixed: 11
- Skipped: 0

## Fixed Issues

### CR-01: Missing Firestore rules for stripeEvents and order refunds subcollection

**Files modified:** `firestore.rules`
**Commit:** b1ad0c0
**Applied fix:** Added explicit Firestore security rules for `stripeEvents` (deny all client access) and `orders/{orderId}/refunds` (admin-only read, no client writes) after the existing notes rule block.

### CR-02: getBookingsByPaymentIntentAction exposed without auth check

**Files modified:** `src/actions/bookings.ts`
**Commit:** a0383cd
**Applied fix:** Added `verifySession()` auth check to `getBookingsByPaymentIntentAction`. Returns empty array if no valid session, preventing unauthenticated access to booking data via payment intent ID.

### CR-03: Stripe webhook returns 200 on processing errors, masking failures

**Files modified:** `src/app/api/webhooks/stripe/route.ts`
**Commit:** 29ee013
**Applied fix:** Changed the outer catch block to return HTTP 500 with error message instead of 200, enabling Stripe to retry failed webhook events. The 200 return now only executes after successful processing.

### WR-01: Null-unsafe .data() calls after fetching documents without existence check

**Files modified:** `src/actions/articles.ts`, `src/actions/experiences.ts`, `src/actions/products.ts`
**Commit:** 300fe73
**Applied fix:** Added `existingDoc.exists` checks before calling `.data()` in `updateArticle`, `updateExperience`, and `updateProduct`. Each returns a localized error message if the document is not found (e.g., "Artikkelen ble ikke funnet.", "Opplevelsen ble ikke funnet.", "Produktet ble ikke funnet.").

### WR-02: Idempotency key in refund uses Date.now(), not truly idempotent

**Files modified:** `src/actions/refunds.ts`
**Commit:** ee09a49
**Applied fix:** Changed idempotency key from `refund-${orderId}-${Date.now()}` to `refund-${orderId}-${amount || 'full'}-${reason || 'none'}`, making it deterministic based on refund parameters and preventing accidental double-refunds from rapid clicks.

### WR-03: Upload route does not validate MIME type, only file extension

**Files modified:** `src/app/api/upload/route.ts`
**Commit:** e63512d
**Applied fix:** Added MIME type validation (`ALLOWED_MIME_TYPES` array) after the existing extension check. Validates `file.type` against allowed image MIME types (jpeg, png, webp, gif, svg+xml) and returns 400 with Norwegian error message on mismatch.

### WR-04: pageContentUpdateSchema does not validate slug format

**Files modified:** `src/lib/validations.ts`
**Commit:** bf55780
**Applied fix:** Added `.regex(/^[a-z0-9-/]+$/, ...)` validation to the `slug` field in `pageContentUpdateSchema`, matching the same constraint already present in `pageContentCreateSchema`. Prevents updates from introducing invalid slug characters.

### WR-05: GET /api/page-content filters out unpublished pages from admin listing

**Files modified:** `src/app/api/page-content/route.ts`
**Commit:** f7553db
**Applied fix:** Removed the `.filter((page) => page.isPublished !== false)` from the admin-only GET handler. Admins can now see all pages including unpublished drafts in the CMS page listing.

### WR-06: Webhook idempotency marker written before processing begins

**Files modified:** `src/app/api/webhooks/stripe/route.ts`
**Commit:** e7ebee3
**Applied fix:** Implemented two-phase idempotency: (1) initial write sets `status: 'processing'` with `startedAt` timestamp, (2) after successful processing, updates to `status: 'completed'` with `processedAt` timestamp, (3) idempotency check only skips events with `status === 'completed'`. Failed events can now be retried by Stripe since they remain in 'processing' state.

### WR-07: Empty catch blocks silently swallow errors in webhook JSON parsing

**Files modified:** `src/app/api/webhooks/stripe/route.ts`
**Commit:** 9e2a41e
**Applied fix:** Added `console.error` logging to all three JSON.parse catch blocks for orderItems, bookingItems, and giftCardItems metadata. Added a guard that logs when all three arrays are empty after parsing, flagging potential metadata corruption.

### WR-08: createOrder server action has no auth check

**Files modified:** `src/actions/orders.ts`
**Commit:** 087e11c
**Applied fix:** Added `verifySession()` admin auth check to `createOrder`. Throws "Ikke autorisert." if caller is not an authenticated admin. The function is currently unused in the codebase (webhook creates orders directly via adminDb), but this prevents the exposed server action from being exploited.

---

_Fixed: 2026-04-12T19:48:30Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
