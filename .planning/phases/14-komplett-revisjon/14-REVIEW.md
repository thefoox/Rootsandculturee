---
phase: 14-komplett-revisjon
reviewed: 2026-04-08T22:15:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - next.config.ts
  - src/actions/checkout.ts
  - src/actions/experiences.ts
  - src/app/api/webhooks/stripe/route.ts
  - src/app/page.tsx
  - src/app/(public)/kontakt/page.tsx
  - src/app/(public)/om-oss/page.tsx
  - src/components/checkout/CheckoutForm.tsx
  - src/lib/data/mock-data.ts
  - src/lib/data/page-content.ts
  - src/lib/session.ts
findings:
  critical: 2
  warning: 5
  info: 2
  total: 9
status: issues_found
---

# Phase 14: Code Review Report

**Reviewed:** 2026-04-08T22:15:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed 11 files covering the checkout/payment flow, Stripe webhook handler, CMS-driven page rendering, session management, experiences CRUD, and mock data. The CMS conversion (forside, om-oss, kontakt pages to SectionRenderer) is correctly implemented with proper section ordering and fallback to mock data. The session module is well-structured with lazy key initialization for build safety.

Two critical data integrity issues were found in the payment flow: (1) product stock is never decremented when a gift card covers the full order amount, and (2) the refund webhook handler treats all refunds as full cancellations, incorrectly cancelling orders and restoring all booking seats even on partial refunds. Five warnings cover security and robustness concerns in the webhook and checkout flows.

## Critical Issues

### CR-01: Missing stock decrement when gift card covers full order amount

**File:** `src/actions/checkout.ts:396-423`
**Issue:** When a gift card covers the entire order total (the `coveredByGiftCard` path), product orders are created in Firestore (lines 396-423) but product stock (`stockCount`, variant `stockCount`, and `inStock` flag) is never decremented. The stock decrement logic only exists in the Stripe webhook handler (`src/app/api/webhooks/stripe/route.ts:170-196`), which never fires when there is no Stripe payment. This means a customer paying entirely with a gift card will purchase products without reducing inventory, leading to overselling.
**Fix:** Add stock decrement transactions in the gift-card-covered path, mirroring the webhook logic:
```typescript
// After creating the order (line 423), add:
for (const item of productItems) {
  const productRef = adminDb.collection('products').doc(item.id)
  await adminDb.runTransaction(async (transaction) => {
    const productDoc = await transaction.get(productRef)
    if (!productDoc.exists) return
    const data = productDoc.data()!
    const currentStock = data.stockCount ?? 0
    const newStock = Math.max(0, currentStock - item.quantity)
    const updates: Record<string, unknown> = {
      stockCount: newStock,
      inStock: newStock > 0,
    }
    if (item.variantId && Array.isArray(data.variants)) {
      const variants = data.variants.map((v: { id: string; stockCount?: number }) => {
        if (v.id === item.variantId) {
          return { ...v, stockCount: Math.max(0, (v.stockCount ?? 0) - item.quantity) }
        }
        return v
      })
      updates.variants = variants
    }
    transaction.update(productRef, updates)
  })
}
```

### CR-02: Partial refund incorrectly treated as full cancellation

**File:** `src/app/api/webhooks/stripe/route.ts:414-481`
**Issue:** The `charge.refunded` handler always sets the order status to `'cancelled'` (line 434) and restores ALL booking seats (lines 453-479), regardless of whether the refund is partial or full. Stripe fires `charge.refunded` for both partial and full refunds. A partial refund (e.g., refunding one item from a multi-item order) would incorrectly cancel the entire order and restore all booking seats, breaking data integrity.
**Fix:** Compare `charge.amount_refunded` against `charge.amount` to determine if the refund is full or partial. Only cancel the order and restore seats on full refunds:
```typescript
const charge = event.data.object
const isFullRefund = charge.amount_refunded >= charge.amount

// For orders
if (!ordersSnapshot.empty) {
  const orderDoc = ordersSnapshot.docs[0]
  await orderDoc.ref.update({
    status: isFullRefund ? 'cancelled' : 'partially_refunded',
  })
  // ... log refund details ...
}

// Only restore booking seats on full refund
if (isFullRefund) {
  // ... existing seat restoration logic ...
}
```
Note: The `OrderStatus` type in `src/types/index.ts` may need a `'partially_refunded'` variant added.

## Warnings

### WR-01: Unprotected JSON.parse for shippingAddress can abort webhook processing

**File:** `src/app/api/webhooks/stripe/route.ts:125-127`
**Issue:** `JSON.parse(metadata.shippingAddress)` is not wrapped in its own try/catch, unlike the `orderItems`, `bookingItems`, and `giftCardItems` parses (lines 112-120). If the shipping address metadata is corrupted or truncated (see WR-05), this parse throws, and the outer catch block (line 483) catches it but returns 200 without creating the order or bookings. The customer is charged but receives no order.
**Fix:**
```typescript
let shippingAddress: ShippingAddress | null = null
if (metadata.shippingAddress) {
  try {
    shippingAddress = JSON.parse(metadata.shippingAddress)
  } catch {
    console.error('Failed to parse shippingAddress metadata:', metadata.shippingAddress)
  }
}
```

### WR-02: CSP includes unsafe-eval in script-src

**File:** `next.config.ts:30`
**Issue:** The Content-Security-Policy includes `'unsafe-eval'` in `script-src`, which significantly weakens XSS protection by allowing `eval()`, `Function()`, and similar dynamic code execution. This is often added for Next.js development mode but should not be present in production headers.
**Fix:** Remove `'unsafe-eval'` from the production CSP. If it is required for development only, conditionally include it:
```typescript
const isDev = process.env.NODE_ENV === 'development'
// In the CSP value:
`script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://js.stripe.com ...`
```

### WR-03: Insecure confirmation code generation in gift-card-covered path

**File:** `src/actions/checkout.ts:427`
**Issue:** The gift-card-covered booking path uses `Math.random().toString(36).substring(2, 10).toUpperCase()` to generate confirmation codes, while the webhook handler (route.ts:201-203) correctly uses `crypto.randomBytes(4).toString('hex').toUpperCase()`. `Math.random()` is not cryptographically secure and has a higher collision probability. Confirmation codes should be unique and unpredictable.
**Fix:**
```typescript
import crypto from 'crypto'
// Replace Math.random() usage:
const confirmationCode = crypto.randomBytes(4).toString('hex').toUpperCase()
```

### WR-04: No validation of client-supplied PaymentIntent ID

**File:** `src/actions/checkout.ts:253-254`
**Issue:** The `paymentIntentId` parameter in `updatePaymentIntentMetadata` comes from the client and is passed directly to `stripe.paymentIntents.update()` (line 488) and `stripe.paymentIntents.cancel()` (line 374) without format validation. While Stripe's secret key scopes access to the account's own PIs, a malicious client could update or cancel any PaymentIntent belonging to this Stripe account, not just their own.
**Fix:** Validate the PI ID format and verify ownership:
```typescript
if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
  return { error: 'Ugyldig betalings-ID.' }
}
```
For stronger protection, store the PI ID in the server session or a server-side mapping when it is created, and verify it matches before allowing updates.

### WR-05: Stripe metadata values may exceed 500-character limit

**File:** `src/actions/checkout.ts:190-232`
**Issue:** Stripe metadata values have a maximum length of 500 characters per value. The `orderItems`, `bookingItems`, and `shippingAddress` metadata values are JSON-stringified arrays that can easily exceed this limit with multiple items, long product names, or Firestore Storage image URLs. When exceeded, Stripe silently truncates the value, producing invalid JSON that fails to parse in the webhook handler. The try/catch blocks in the webhook handle the parse failure gracefully (empty array), but the order/bookings will be created with missing items.
**Fix:** Consider one or more of: (1) Exclude image URLs from metadata (they can be re-fetched from Firestore in the webhook), (2) Store the full order data in Firestore before payment and only pass a reference ID in metadata, (3) Truncate or limit metadata payload size explicitly before sending to Stripe.

## Info

### IN-01: Non-functional newsletter signup form

**File:** `src/app/page.tsx:165-188`
**Issue:** The newsletter signup section on the home page renders an email input and "Meld meg pa" button, but there is no form element, no action attribute, no onSubmit handler, and no onClick handler. The button does nothing when clicked. This is misleading to users who attempt to sign up.
**Fix:** Either implement the newsletter subscription (e.g., via a Server Action that calls Resend contacts API), or remove/hide the section until it is functional. If the form is intentionally a placeholder, add a comment indicating this.

### IN-02: Redundant variable declarations in gift-card-covered path

**File:** `src/actions/checkout.ts:383-385`
**Issue:** `customerEmail` and `customerId` are re-declared inside the gift-card-covered block (lines 383-385), shadowing the identical declarations in the outer scope (lines 287-288). The `verifySession()` call is also executed a second time unnecessarily. This does not cause a bug due to block scoping, but adds confusion and a redundant async call.
**Fix:** Remove the inner declarations and reuse the outer `customerEmail` and `customerId` variables which are already in scope.

---

_Reviewed: 2026-04-08T22:15:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
