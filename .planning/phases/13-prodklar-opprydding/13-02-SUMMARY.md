---
phase: 13-prodklar-opprydding
plan: "02"
subsystem: checkout-actions-data-integrity
tags: [bugfix, data-integrity, cart, checkout, stripe, firestore, gift-cards, bookings]
dependency_graph:
  requires: []
  provides: [correct-gift-card-metadata, preserved-booking-seats, cached-orders-admin]
  affects: [src/types/index.ts, src/actions/checkout.ts, src/actions/experiences.ts, src/actions/orders.ts]
tech_stack:
  added: []
  patterns: [CartItem-dedicated-fields, merge-strategy-firestore-subcollection, cached-data-layer-delegation]
key_files:
  created: []
  modified:
    - src/types/index.ts
    - src/actions/checkout.ts
    - src/app/(public)/checkout/page.tsx
    - src/components/gavekort/GavekortForm.tsx
    - src/components/products/AddToCartButton.tsx
    - src/components/products/VariantSelector.tsx
    - src/components/experiences/BookingInfoPanel.tsx
    - src/actions/experiences.ts
    - src/actions/orders.ts
decisions:
  - "revalidateTag 'max' second arg retained — Next.js 16.2.1 types require profile: string | CacheLifeConfig as a mandatory second argument; removing it causes TypeScript errors"
  - "GavekortForm updated in same task as CartItem type change — the form was the only place constructing giftcard CartItems with incorrect field mapping, fixing it atomically ensures correctness"
metrics:
  duration: "18 minutes"
  completed: "2026-04-07"
  tasks_completed: 3
  files_modified: 9
---

# Phase 13 Plan 02: Data Integrity Bug Fixes Summary

Fixed three classes of silent data corruption bugs: gift card metadata field mapping, booking seat counter reset on experience edit, and duplicate uncached getOrders in the admin actions layer.

## Tasks Completed

### Task 1: Fix gift card metadata fields, isEarlybird drop, and isInit flag
**Commit:** `a1bc8a8`

- Added `giftCardRecipientName`, `giftCardRecipientEmail`, `giftCardMessage` fields to `CartItem` interface in `src/types/index.ts`
- Fixed `createPaymentIntent` to read from the new dedicated gift card fields instead of `experienceName`, `experienceDate`, `experienceDateId`
- Fixed `updatePaymentIntentMetadata` with the same gift card field correction
- Added `isEarlybird: i.isEarlybird ?? false` to `updatePaymentIntentMetadata` booking items map (was missing, causing earlybird status to be cleared when gift cards were applied)
- Replaced sentinel email detection (`formData.email === 'placeholder@init.no'`) with explicit `formData.isInit === true` flag in `CheckoutFormData` interface and `createPaymentIntent`
- Updated `checkout/page.tsx` to pass `{ email: '', isInit: true }` for initial PaymentIntent creation
- Updated `GavekortForm.tsx` to populate the new dedicated fields (previously stuffed recipient data into `experienceName`/`experienceDate`/`experienceDateId`)
- Added `giftCardRecipientName: null`, `giftCardRecipientEmail: null`, `giftCardMessage: null` to all other CartItem construction sites (`AddToCartButton`, `VariantSelector`, `BookingInfoPanel`)

### Task 2: Fix updateExperience to preserve bookedSeats
**Commit:** `49f6360`

Replaced the delete-all-and-recreate strategy in `updateExperience` with a merge strategy:

1. Fetches existing date documents into a Map keyed by ISO timestamp
2. For each incoming date slot, looks up by ISO timestamp to find existing doc
3. If found: preserves `bookedSeats`, recalculates `availableSeats = maxSeats - bookedSeats`, reuses existing doc ID
4. If new: creates with `bookedSeats: 0`, `availableSeats: maxSeats`
5. Deletes dates not in the incoming form data

This prevents overbooking when admins edit experience details.

### Task 3: Fix duplicate getOrders and revalidateTag cleanup
**Commit:** `f83d5e2`

- Replaced the uncached `getOrders` implementation in `src/actions/orders.ts` (which hit Firestore on every render) with a delegation to `_getCachedOrders` from `src/lib/data/orders` (the `unstable_cache` version with `tags: ['orders']`)
- Removed now-unused `unstable_cache` import from `orders.ts`
- Preserves all `revalidateTag('orders', ...)` calls so cache invalidation continues to work when orders change

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] GavekortForm.tsx was stuffing recipient data into wrong CartItem fields**
- **Found during:** Task 1 — searching for `type: 'giftcard'` CartItem construction sites
- **Issue:** `GavekortForm.tsx` was storing `recipientName` in `experienceName`, `recipientEmail` in `experienceDate`, and `message` in `experienceDateId`. The plan's "Step A" added the correct fields to the type, but without fixing the form, the new fields would always be null.
- **Fix:** Updated `GavekortForm.tsx` to use `giftCardRecipientName`, `giftCardRecipientEmail`, `giftCardMessage`; set the experience fields back to `null`
- **Files modified:** `src/components/gavekort/GavekortForm.tsx`
- **Commit:** `a1bc8a8`

**2. [Rule 2 - Missing fields] Three other CartItem construction sites needed null gift card fields**
- **Found during:** Task 1 — TypeScript would have caught missing required fields
- **Issue:** `AddToCartButton`, `VariantSelector`, `BookingInfoPanel` all construct CartItem objects. With the new required-ish fields added to the interface, all construction sites needed the new fields (as `null`)
- **Fix:** Added `giftCardRecipientName: null`, `giftCardRecipientEmail: null`, `giftCardMessage: null` to all three components
- **Files modified:** `src/components/products/AddToCartButton.tsx`, `src/components/products/VariantSelector.tsx`, `src/components/experiences/BookingInfoPanel.tsx`
- **Commit:** `a1bc8a8`

### Partial Execution

**revalidateTag 'max' second argument — NOT removed**

The plan called for removing the `'max'` second argument from all `revalidateTag` calls across `src/actions/`. After removing them, `npx tsc --noEmit` produced 19 errors: `TS2554: Expected 2 arguments, but got 1`.

Investigation of `node_modules/next/dist/server/web/spec-extension/revalidate.d.ts` confirmed:

```typescript
export declare function revalidateTag(tag: string, profile: string | CacheLifeConfig): undefined;
```

In Next.js 16.2.1, `profile` is a **required** second argument (type `string | CacheLifeConfig`). This is not an undocumented internal — it is the typed `use cache` profile API. The `'max'` string is a valid profile name. The concern in CONCERNS.md was based on analysis of an older Next.js internal, but this version formalizes it.

**Decision:** Retained `'max'` as the second argument throughout. This is the correct behavior for Next.js 16.2.1. The revalidateTag concern in CONCERNS.md should be updated to reflect that the second argument is now a typed, required API.

## Known Stubs

None — all changes wire real data through correct field paths.

## Threat Flags

None — changes fix existing trust boundary bugs (T-13-10, T-13-11, T-13-12), no new surface introduced.

## Self-Check: PASSED

| Item | Result |
|------|--------|
| src/types/index.ts | FOUND |
| src/actions/checkout.ts | FOUND |
| src/actions/experiences.ts | FOUND |
| src/actions/orders.ts | FOUND |
| commit a1bc8a8 | FOUND |
| commit 49f6360 | FOUND |
| commit f83d5e2 | FOUND |
