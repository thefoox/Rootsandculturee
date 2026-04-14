---
phase: 22-ecommerce-robusthet
plan: "02"
subsystem: checkout
tags: [webhook, idempotency, stock, gift-card, firestore-transaction]
dependency_graph:
  requires: []
  provides: [webhook-idempotency, stock-race-guard, gift-card-idempotency]
  affects: [src/app/api/webhooks/stripe/route.ts, src/actions/checkout.ts]
tech_stack:
  added: []
  patterns: [firestore-transaction-guard, idempotency-doc, processing-status-guard]
key_files:
  modified:
    - src/app/api/webhooks/stripe/route.ts
    - src/actions/checkout.ts
decisions:
  - Return HTTP 200 for 'processing' webhook events to prevent Stripe retries during in-flight processing
  - Throw STOCK_INSUFFICIENT inside Firestore transaction (not before) to guarantee atomicity
  - Write giftCardFulfillments doc BEFORE cancel PI so double-submit is caught even if cancel throws
metrics:
  duration: "~10 minutes"
  completed: "2026-04-14T11:52:40Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 22 Plan 02: Webhook Idempotency + Gift Card Guard Summary

**One-liner:** Webhook now guards both 'processing' and 'completed' status; product stock race condition fixed with transactional STOCK_INSUFFICIENT guard; gift card zero-amount path protected by giftCardFulfillments/{paymentIntentId} idempotency doc written before redemption.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Webhook idempotency guard + stock race condition | da6894a | src/app/api/webhooks/stripe/route.ts |
| 2 | Gift card zero-amount idempotency guard | 28a382f | src/actions/checkout.ts |

## What Was Built

### Task 1: Webhook Idempotency + Stock Guard (da6894a)

**Change 1 — Idempotency guard expanded:**
The idempotency check at the top of the webhook handler previously only skipped events with `status === 'completed'`. A Stripe retry arriving while a first attempt was still in-flight (status = 'processing') would pass through and run fulfillment a second time — producing duplicate orders, duplicate emails, and double gift card redemption.

Fix: check for both 'completed' and 'processing' and return HTTP 200 for either. Returning 200 stops Stripe from retrying. The in-flight event will either complete (marking 'completed') or fail (leaving 'processing', which blocks further retries — admin can investigate).

**Change 2 — Stock race condition fixed:**
The product stock decrement transaction previously used `Math.max(0, currentStock - item.quantity)` without checking whether stock was sufficient. Two concurrent webhooks for the same product could both read `currentStock = 1`, both pass, both decrement — one to 0, one to -1 (clamped to 0), causing an oversell with no error.

Fix: Added `if (currentStock < item.quantity) throw new Error('STOCK_INSUFFICIENT:...')` inside the Firestore transaction before the decrement. Since Firestore transactions are serialized at the database level, the second concurrent transaction will see the already-decremented stock (0) and throw — returning HTTP 500, which Stripe retries. Admin sees a structured log message and issues a manual refund. The variant stock path received the same guard.

`Math.max(0, ...)` removed since the guard guarantees the result is never negative.

### Task 2: Gift Card Zero-Amount Idempotency (28a382f)

The `updatePaymentIntentMetadata` gift card zero-amount path (triggered when gift card covers 100% of order) had no idempotency protection. A form double-submit would cancel the PI twice (silently) and redeem the gift card twice, creating two orders.

Fix: At the start of the `if (total <= 0 && giftCardCode)` block:
1. Read `giftCardFulfillments/{paymentIntentId}` — if exists, return success immediately (idempotent).
2. Write doc with `status: 'processing'` **before** calling `stripe.paymentIntents.cancel()` — ensures double-submit is caught even if the cancel call hangs.
3. After all fulfillment completes (PI cancel, gift card redemption, order/booking creation), update doc to `status: 'completed'`.

If the server crashes between steps 2 and 3, the 'processing' doc prevents re-entry — an admin can investigate and manually complete or refund.

## Decisions Made

1. **HTTP 200 for 'processing' webhook events** — Returning 200 stops Stripe retrying while an event is in-flight. The alternative (return 500) would cause Stripe to queue another retry that would also be blocked, creating unnecessary noise. 200 is the correct signal: "received, being processed."

2. **Throw STOCK_INSUFFICIENT inside transaction** — Moving the stock check outside the transaction (as a pre-check) would re-introduce the race condition. The check must be inside `runTransaction` to benefit from Firestore's serialization guarantee.

3. **giftCardFulfillments doc written before PI cancel** — The PI cancel can throw (e.g., already cancelled). By writing the processing doc first, a double-submit during a cancel failure is still caught. The alternative (write after cancel) leaves a window where double-submit slips through if cancel is slow.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both changes are fully wired with no placeholder logic.

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes introduced beyond those already in the plan's threat model.

| Threat ID | Mitigated By |
|-----------|-------------|
| T-22-04 | Webhook idempotency guard now checks both 'processing' and 'completed' |
| T-22-05 | STOCK_INSUFFICIENT guard inside Firestore transaction |
| T-22-06 | giftCardFulfillments doc written before redemption, checked on entry |

## Self-Check: PASSED

Files exist:
- src/app/api/webhooks/stripe/route.ts — FOUND
- src/actions/checkout.ts — FOUND

Commits exist:
- da6894a (Task 1) — FOUND
- 28a382f (Task 2) — FOUND
