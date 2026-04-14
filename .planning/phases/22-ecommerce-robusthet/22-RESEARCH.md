# Phase 22: E-commerce Robusthet + Tilbudspris - Research

**Researched:** 2026-04-10
**Domain:** Stripe checkout robustness, Firestore race conditions, sale price data modeling
**Confidence:** HIGH (all findings based on direct codebase inspection + established patterns)

---

## Summary

This phase addresses two separate but related concerns: hardening the existing checkout flow against
real-world failure modes (mobile freezes, webhook delays, race conditions), and adding a sale price
(tilbudspris) feature to both products and experiences.

**Goal 1 — Robustness:** The current `ConfirmationModal` polls for up to 60 seconds with no escape
hatch, no timeout message, and no retry button. On mobile, `stripe.confirmPayment()` can hang
indefinitely because there is no `AbortController` timeout. The webhook idempotency guard skips
duplicate handling only for `completed` events — a webhook retry during `processing` will run
fulfillment twice. Stock is checked server-side in `updatePaymentIntentMetadata` before payment
confirmation, but a race condition exists: two concurrent checkouts checking stock at the same
moment both pass, then both webhooks decrement stock. The gift card zero-amount path cancels the
PaymentIntent (can fail silently) then fulfills directly in the Server Action — this path has no
idempotency guard and if the PI cancel call throws, the gift card is redeemed with no fulfillment.

**Goal 2 — Sale price:** Neither `Product` nor `Experience` TypeScript types have a `salePrice`
field. The Zod schemas, admin forms, product mapper, experience mapper, data layer queries, checkout
price verification, and card components all need coordinated updates. The earlybird pattern on
`ExperienceDate` is date-gated; sale price on the base `Experience` and `Product` documents is
simpler — no deadline, just an optional øre integer that supersedes `price`/`basePrice`.

**Primary recommendation:** Implement robustness fixes first (they are correctness bugs), then
sale price (new feature). Keep both goals as separate plans within the phase to limit blast radius.

---

## User Constraints

No CONTEXT.md exists for this phase. All decisions are at Claude's discretion unless specified
in the task description above.

---

## Standard Stack

All libraries are already installed in the project. No new dependencies are needed.

| Library | Purpose in This Phase |
|---------|----------------------|
| `@stripe/react-stripe-js` | `stripe.confirmPayment()` — needs `AbortController` timeout wrapper |
| `firebase-admin` | Firestore transactions — already used for stock decrement, needs `processing` guard |
| `zod` | `productSchema` + `experienceSchema` — add `salePrice` optional field |
| `next/navigation` | `router.replace` for 3DS redirect error recovery — already in use |
| `react` | `useEffect`, `useRef` — timeout logic in `ConfirmationModal` |
| `sonner` | Toast for timeout/error feedback — already imported in admin pages |

**No new installs required.** [VERIFIED: codebase inspection]

---

## Architecture Patterns

### Pattern 1: Stripe confirmPayment with AbortController timeout

The current `handleSubmit` in `CheckoutForm.tsx` calls `stripe.confirmPayment()` with no timeout.
On slow mobile networks this can hang indefinitely. The fix wraps the call with a
`Promise.race()` against a timeout promise.

```typescript
// Source: MDN AbortController + Stripe docs pattern [ASSUMED — standard JS pattern]
const PAYMENT_TIMEOUT_MS = 30_000

async function confirmWithTimeout(stripe, elements, returnUrl) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PAYMENT_TIMEOUT_MS)

  try {
    const result = await Promise.race([
      stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required',
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PAYMENT_TIMEOUT')), PAYMENT_TIMEOUT_MS)
      ),
    ])
    clearTimeout(timeoutId)
    return result
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.message === 'PAYMENT_TIMEOUT') {
      return { error: { message: 'TIMEOUT' } }
    }
    throw err
  }
}
```

Note: `stripe.confirmPayment` does not natively accept an AbortController, so `Promise.race`
with a separate timeout promise is the correct approach. [ASSUMED — Stripe JS SDK does not
expose AbortController; Promise.race is the standard workaround]

### Pattern 2: ConfirmationModal — timeout state + escape button

Current ConfirmationModal has `maxAttempts = 30` (60 seconds) with no visible timeout message
and no dismiss button during loading. The fix adds:

1. A `timedOut` boolean state that becomes `true` when polling exhausts all attempts.
2. An escape/dismiss button shown immediately (or after N seconds) so the user is never trapped.
3. A Norwegian error message when `timedOut && !order && !bookings`.
4. The `clearCart()` call should only happen after confirmed success, not after timeout.

```tsx
// Pattern: timeout state derived from existing poll logic
// When poll exhausts maxAttempts without results:
setLoading(false)
setTimedOut(true)  // new state flag

// In render:
{loading && (
  <div>
    <Loader2 />
    <p>Bekrefter betaling...</p>
    <button onClick={handleDismissWithoutClear}>
      Avbryt og gå tilbake
    </button>
  </div>
)}
{!loading && timedOut && !hasOrder && !hasBookings && (
  <div role="alert" aria-live="assertive">
    <p>Betalingen er under behandling. Sjekk e-posten din for bekreftelse,
       eller kontakt oss hvis du ikke mottar noe innen 24 timer.</p>
    <Button onClick={() => router.push('/')}>Tilbake til nettbutikken</Button>
  </div>
)}
```

### Pattern 3: Webhook idempotency — guard against 'processing' state

Current idempotency check (line 85 of route.ts):
```typescript
if (eventDoc.exists && eventDoc.data()?.status === 'completed') {
  return NextResponse.json({ received: true }, { status: 200 })
}
```

A Stripe retry during `processing` passes this check and runs fulfillment twice. The fix:
```typescript
if (eventDoc.exists) {
  const status = eventDoc.data()?.status
  if (status === 'completed') {
    return NextResponse.json({ received: true }, { status: 200 })
  }
  if (status === 'processing') {
    // Event is already in flight — return 200 to stop Stripe retrying,
    // or return 409 to let Stripe retry later. 200 is safer here.
    return NextResponse.json({ received: true }, { status: 200 })
  }
}
```

### Pattern 4: Stock race condition — move stock check into webhook transaction

**Current flow (has race condition):**
1. Server Action `updatePaymentIntentMetadata`: checks stock → passes
2. Concurrent checkout: same check → also passes  
3. Both webhooks: both decrement stock → oversell

**Correct fix:** Remove the stock check from the Server Action (it's pre-payment). Keep the
Firestore transaction in the webhook, but add a stock guard INSIDE the transaction:

```typescript
// In webhook, inside stock decrement transaction:
await adminDb.runTransaction(async (tx) => {
  const productDoc = await tx.get(productDocRef)
  const data = productDoc.data()
  const currentStock = (data.stockCount as number) ?? 0

  // Guard inside transaction — this is the authoritative check
  if (currentStock < item.quantity) {
    throw new Error(`STOCK_INSUFFICIENT:${item.productId}`)
  }

  const newStock = Math.max(0, currentStock - item.quantity)
  tx.update(productDocRef, {
    stockCount: newStock,
    inStock: newStock > 0,
  })
})
```

If the transaction throws `STOCK_INSUFFICIENT`, the webhook returns 500, Stripe retries.
The second retry also fails (stock is already 0). Admin should then manually refund.
This is correct e-commerce behavior. [ASSUMED — standard Firestore transaction pattern]

For the booking seat check, the same guard already exists inside the transaction (lines 237–240
of route.ts) — seats already throw correctly. The product path does not.

### Pattern 5: Gift card zero-amount idempotency

Current path in `updatePaymentIntentMetadata` when gift card covers full amount:
1. Cancel PaymentIntent (can throw)
2. `redeemGiftCard()` — deducts balance
3. Create order document
4. Create booking documents

If step 1 throws, the function returns an error but gift card is not redeemed. However if
step 2 throws, the PI is cancelled but fulfillment never happens. Additionally, there is no
Firestore idempotency doc written for this path — a double-submit would create two orders.

Fix: write a `giftCardFulfillments/{paymentIntentId}` doc before redemption, and check for
it at the start of the gift card path.

```typescript
// At start of gift card zero-amount path:
const fulfillmentRef = adminDb.collection('giftCardFulfillments').doc(paymentIntentId)
const existing = await fulfillmentRef.get()
if (existing.exists) {
  return { coveredByGiftCard: true, giftCardCode, totalDeducted: giftCardDeduction }
}
await fulfillmentRef.set({ status: 'processing', startedAt: new Date() })

// ... cancel PI, redeem, create docs ...

await fulfillmentRef.update({ status: 'completed', completedAt: new Date() })
```

### Pattern 6: 3DS redirect error — router.replace timing

Current code (checkout/page.tsx line 122):
```typescript
setInitError('Betalingen mislyktes. Prøv igjen...')
router.replace('/checkout')
```

The `router.replace` clears search params before the error state is shown, causing a
re-render where `initError` may briefly appear then disappear as the component re-initialises.

Fix: don't call `router.replace` immediately. Instead use `window.history.replaceState` to
clean the URL without triggering a full re-render cycle:
```typescript
if (redirectStatus !== 'succeeded') {
  setInitError('Betalingen mislyktes. Prøv igjen eller bruk en annen betalingsmetode.')
  window.history.replaceState({}, '', '/checkout')
}
```

### Pattern 7: Sale price data model

**Products:** Add optional `salePrice?: number | null` to `Product` type and Firestore schema.
Prices are stored as øre integers (existing convention). A product is "on sale" when
`salePrice !== null && salePrice < price`. No deadline — admin removes sale manually.

**Experiences:** Add optional `salePrice?: number | null` to `Experience` type. This is the
base experience sale price, distinct from earlybird which is date-specific on `ExperienceDate`.
Priority order for experience checkout price: earlybird (if active) > salePrice > basePrice.

**Checkout price verification** in `updatePaymentIntentMetadata`:
```typescript
// For products:
let verifiedPrice = product.salePrice ?? product.price

// For experiences (priority: earlybird > salePrice > basePrice):
let verifiedPrice = (dateData.priceOverride as number | null)
  ?? (expDoc.data().salePrice as number | null)
  ?? (expDoc.data().basePrice as number)
  ?? item.price
// Then apply earlybird check (already exists)
```

**CartItem:** Add `originalPrice?: number | null` — already exists in the type for earlybird.
Reuse it for sale price: set `originalPrice = product.price` when `salePrice` is active so
the cart can show struck-through price.

### Recommended Project Structure (no new directories needed)

Edits span existing files:
```
src/
├── types/index.ts                              -- Add salePrice to Product, Experience
├── lib/
│   ├── validations.ts                          -- Add salePrice to productSchema, experienceSchema
│   └── mappers/
│       ├── products.ts                         -- Map salePrice from Firestore
│       └── experiences.ts                      -- Map salePrice from Firestore
├── actions/
│   ├── products.ts                             -- Pass salePrice through create/update
│   └── checkout.ts                             -- Use salePrice in price verification
├── app/
│   ├── api/webhooks/stripe/route.ts            -- Fix idempotency guard + stock transaction
│   └── admin/
│       ├── produkter/ny/page.tsx               -- Add salePrice input
│       └── produkter/[id]/page.tsx             -- Add salePrice input + load
├── components/
│   ├── checkout/
│   │   ├── CheckoutForm.tsx                    -- timeout wrapper for confirmPayment
│   │   └── ConfirmationModal.tsx               -- escape button + timeout message
│   └── products/
│       └── ProductCard.tsx                     -- Show sale price UI
```

Experience admin pages (opplevelser/ny and opplevelser/[id]) will also need salePrice fields.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment timeout | Custom WebSocket polling | `Promise.race()` with timeout | Stripe SDK handles all state; no need for WebSocket |
| Stock atomicity | Application-level locking | Firestore transaction | Transactions are atomic at DB level; app locks fail under concurrency |
| Idempotency | Time-based deduplication | Firestore document with status | Time windows miss fast retries; document state is exact |
| Sale price active state | Scheduled Cloud Function | Nullable field checked at read time | No cron needed: `salePrice !== null` = active |

---

## Common Pitfalls

### Pitfall 1: clearCart() on timeout

**What goes wrong:** If `clearCart()` is called when polling times out (webhook never arrived),
the user loses their cart and sees no confirmation — worst possible UX.

**Why it happens:** Current `handleDismiss` always calls `clearCart()`.

**How to avoid:** Only call `clearCart()` in `handleDismiss` when `hasOrder || hasBookings`
is true. On timeout, navigate without clearing the cart.

**Warning signs:** User reports empty cart after failed checkout.

### Pitfall 2: Webhook processes same event twice during retry

**What goes wrong:** Stripe retries a webhook if the endpoint returns 5xx. If the first
attempt wrote `status: 'processing'` and then failed mid-way, the retry will pass the
current idempotency check and re-run all fulfillment logic.

**Why it happens:** The idempotency guard only skips `completed` events.

**How to avoid:** Skip both `completed` AND `processing` events in the guard. Add a
`failedAt` status that Stripe can retry on (return 500) while avoiding duplicate fulfillment
on fast retries (return 200 for `processing`).

**Warning signs:** Duplicate orders in Firestore for same `stripePaymentIntentId`.

### Pitfall 3: salePrice in øre vs NOK in admin forms

**What goes wrong:** Admin enters price in NOK (e.g., 99), form sends raw number, action
receives 99 and stores it — but all other prices are in øre (9900).

**Why it happens:** The conversion `Math.round(priceNOK * 100)` is done for `price` in
`createProduct`, but must also be applied to `salePrice`.

**How to avoid:** Follow the exact same pattern as `price`: admin inputs NOK, action
multiplies by 100 before Zod validation, stores øre in Firestore.

**Warning signs:** Sale price shows as 1/100th of intended value (e.g., "0,99 kr" instead
of "99 kr").

### Pitfall 4: salePrice shown when higher than regular price

**What goes wrong:** Admin accidentally sets `salePrice` higher than `price`. Product shows
struck-through original lower price — looks like a price increase, not a discount.

**Why it happens:** No validation that `salePrice < price`.

**How to avoid:** Add Zod refinement: `.refine(data => !data.salePrice || data.salePrice < data.price, 'Tilbudspris må være lavere enn ordinær pris.')`.

**Warning signs:** ProductCard shows higher sale price than original.

### Pitfall 5: 3DS redirect race condition with error state

**What goes wrong:** After a failed 3DS redirect, `router.replace('/checkout')` triggers a
full re-render. The new render picks up items from cart, runs `initPayment()` again, and
overwrites `initError` with the new loading state.

**Why it happens:** `router.replace` in Next.js App Router causes state resets on
Client Components when search params change.

**How to avoid:** Use `window.history.replaceState` instead of `router.replace` to clean
the URL without triggering a navigation event.

**Warning signs:** Error message flashes briefly then disappears.

### Pitfall 6: Experience salePrice vs earlybird priority

**What goes wrong:** Both `earlyBirdPrice` and `salePrice` are active simultaneously. The
checkout uses the wrong one.

**Why it happens:** Ambiguous priority not defined in code.

**How to avoid:** Establish explicit priority in checkout verification:
earlybird > salePrice > basePrice. Document this order in code comments.
ExperienceCard already shows earlybird with strikethrough, and salePrice should do the same.

---

## Code Examples

### Existing earlybird strikethrough pattern (ExperienceCard.tsx)

The earlybird display pattern is already established and should be replicated for sale price:

```tsx
// Source: src/components/experiences/ExperienceCard.tsx (verified by inspection)
{hasEarlybird ? (
  <p className="mt-2 font-body text-body font-bold text-forest">
    {formatPrice(nextDate!.earlyBirdPrice!)}{' '}
    <span className="font-normal text-body/50 line-through">{formatPrice(experience.basePrice)}</span>{' '}
    <span className="text-rust text-[12px] font-medium">earlybird</span>
  </p>
) : (
  <PriceBadge priceInOre={experience.basePrice} className="mt-2 block" />
)}
```

For sale price on ProductCard, use the same pattern:
```tsx
// Apply to src/components/products/ProductCard.tsx
{product.salePrice ? (
  <p className="mt-2 font-body text-body font-bold text-forest">
    {formatPrice(product.salePrice)}{' '}
    <span className="font-normal text-body/50 line-through">{formatPrice(product.price)}</span>{' '}
    <span className="text-rust text-[12px] font-medium">tilbud</span>
  </p>
) : (
  <span className="mt-2 block font-body text-h4 font-bold text-forest">
    {formatPrice(product.price)}
  </span>
)}
```

### Existing Firestore transaction pattern (webhook route.ts)

```typescript
// Source: src/app/api/webhooks/stripe/route.ts (verified by inspection)
await adminDb.runTransaction(async (tx) => {
  const productDoc = await tx.get(productDocRef)
  if (!productDoc.exists) return
  const data = productDoc.data()
  const currentStock = (data.stockCount as number) ?? 0
  const newStock = Math.max(0, currentStock - item.quantity)
  // Missing: stock guard before decrement — add here
  tx.update(productDocRef, { stockCount: newStock, inStock: newStock > 0 })
})
```

### Existing price verification pattern (actions/checkout.ts)

```typescript
// Source: src/actions/checkout.ts line 82-96 (verified by inspection)
// Current product price verification — add salePrice check:
let verifiedPrice = product.price as number
// ADD: prefer salePrice when present and valid
if (product.salePrice && (product.salePrice as number) > 0 && (product.salePrice as number) < verifiedPrice) {
  verifiedPrice = product.salePrice as number
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Spinner-only loading state | Spinner + escape button + timeout message | User never trapped |
| Stock check before payment only | Stock guard inside webhook transaction | Prevents oversell |
| `router.replace` for URL cleanup | `window.history.replaceState` | No re-render triggered |

---

## Key Technical Decisions Required

### Decision 1: What to show on timeout in ConfirmationModal?

**Option A (recommended):** Show a "betaling under behandling" message with a link to check
email, and a "Tilbake til nettbutikken" button. Do NOT clear cart. Cart will empty naturally
if webhook later succeeds and user revisits (no auto-clear). Simple and safe.

**Option B:** Show the same and automatically poll less aggressively (every 10s for 5 mins).
More complex, marginal benefit.

**Recommendation:** Option A. Most mobile users who hit this path have a successful payment
that the webhook will eventually deliver.

### Decision 2: How to handle stock guard failures in webhook?

When `STOCK_INSUFFICIENT` is thrown in the webhook transaction, the webhook returns 500.
Stripe will retry up to 72 hours. If retries never succeed (stock legitimately exhausted),
Stripe will stop retrying and the customer has a successful payment but no fulfillment.

The admin must issue a refund manually. This is the correct behavior for physical goods:
the payment went through, but fulfillment fails — business process issue, not a code bug.

**Recommendation:** Log a structured error with `paymentIntentId` and product name so admin
can find it quickly. No automated refund in this phase.

### Decision 3: salePrice on ProductVariants?

ProductVariants have their own `price` field. Should variants also support `salePrice`?

**Recommendation:** No, out of scope for this phase. Variant sale pricing adds significant
complexity to the admin UI (N variant sale price inputs) with unclear business need. Add
`salePrice` to the base `Product` only. Variants use their own `price` as-is.

### Decision 4: Sale price on Experience — does it affect ExperienceDate.priceOverride?

`ExperienceDate.priceOverride` already allows per-date overrides. `salePrice` on the
base experience is a global discount. Priority for checkout:

earlybird (if deadline not past) > priceOverride > salePrice > basePrice

Current code handles earlybird and priceOverride. Adding salePrice to this chain is a
one-line change in the else branch.

---

## Files to Touch — Complete Map

### Goal 1: Robustness

| File | Change |
|------|--------|
| `src/components/checkout/CheckoutForm.tsx` | Wrap `stripe.confirmPayment` in `Promise.race` with 30s timeout; surface timeout as Norwegian error message |
| `src/components/checkout/ConfirmationModal.tsx` | Add `timedOut` state; show escape button during loading; show timeout message when polling exhausts; only call `clearCart()` on confirmed success |
| `src/app/(public)/checkout/page.tsx` | Replace `router.replace('/checkout')` with `window.history.replaceState` for 3DS redirect error |
| `src/app/api/webhooks/stripe/route.ts` | (1) Guard `processing` status in idempotency check; (2) Add stock guard inside product decrement transaction; (3) Add idempotency doc for gift card zero-amount path |
| `src/actions/checkout.ts` | Add idempotency write at start of gift card zero-amount fulfillment path |

### Goal 2: Sale Price (Tilbudspris)

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `salePrice?: number \| null` to `Product` and `Experience` |
| `src/lib/validations.ts` | Add `salePrice: z.number().int().positive().optional().nullable()` to `productSchema` and `experienceSchema`; add refinement for salePrice < price |
| `src/lib/mappers/products.ts` | Map `data.salePrice` in `mapProduct()` |
| `src/lib/mappers/experiences.ts` | Map `data.salePrice` in `mapExperience()` |
| `src/actions/products.ts` | Pass `salePrice` through `createProduct` and `updateProduct` (NOK to øre conversion) |
| `src/actions/checkout.ts` | Use `salePrice` (when present and lower) as verified price for products and experiences |
| `src/app/admin/produkter/ny/page.tsx` | Add "Tilbudspris (NOK)" input in "Pris og lager" section |
| `src/app/admin/produkter/[id]/page.tsx` | Add "Tilbudspris (NOK)" input; load existing `salePrice` from product |
| `src/app/admin/opplevelser/ny/page.tsx` | Add "Tilbudspris (NOK)" input |
| `src/app/admin/opplevelser/[id]/page.tsx` | Add "Tilbudspris (NOK)" input; load existing `salePrice` |
| `src/components/products/ProductCard.tsx` | Show struck-through original price + sale price badge when `salePrice` is set |
| `src/components/experiences/ExperienceCard.tsx` | Show sale price strikethrough (when no earlybird active) |
| `src/components/shared/PriceBadge.tsx` | Consider extending to accept optional `originalPrice` for reuse |

---

## Environment Availability

Step 2.6: SKIPPED (no new external dependencies — all changes are code-only to existing stack).

---

## Validation Architecture

`workflow.nyquist_validation` is `false` in config.json — section skipped.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V4 Access Control | Yes | Admin-only routes for sale price mutation; `verifySession()` already enforced in `createProduct`/`updateProduct` |
| V5 Input Validation | Yes | Zod schema validates `salePrice` is positive integer øre; refinement ensures salePrice < price |
| V6 Cryptography | No | No new crypto surface |
| V2 Authentication | No | No auth changes |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Price manipulation via stale cart | Tampering | Server-side price verification in `updatePaymentIntentMetadata` already re-fetches from Firestore; must also fetch `salePrice` from Firestore, not trust client |
| Duplicate webhook fulfillment | Tampering | Idempotency guard fix (this phase) |
| Race condition stock oversell | Tampering | Transaction guard inside webhook (this phase) |
| Admin input salePrice > price | Tampering | Zod refinement blocks invalid data before write |

**Critical:** The `salePrice` used in checkout MUST be fetched from Firestore in `updatePaymentIntentMetadata`, not taken from the CartItem's `price` snapshot. The CartItem already stores a price snapshot at add-time; if admin removes a sale during checkout, the server must use the current Firestore value. [VERIFIED: existing pattern — `verifiedPrice` is already read from `productDoc.data()`, not `item.price`]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `stripe.confirmPayment` does not accept AbortController; Promise.race is the correct timeout approach | Pattern 1 | If Stripe SDK added native abort support, the workaround still works but is redundant |
| A2 | `window.history.replaceState` does not trigger Next.js App Router navigation events | Pattern 6 | If it does, the fix creates the same re-render bug it was meant to solve; fallback: use `useRef` to track that error came from redirect |
| A3 | Returning HTTP 200 for `processing` webhook events prevents Stripe retries | Pattern 3 | If Stripe retries 200 responses, the guard is insufficient; Stripe docs state 200 = success, do not retry [ASSUMED] |

---

## Open Questions

1. **Should ConfirmationModal poll forever (with escape) or stop at 60s?**
   - What we know: current 60s cap, no escape
   - Recommendation: Keep 60s cap. Add escape button from second 0. Show timeout message at 60s.
   - Not a blocking question; default to escape-from-second-0.

2. **Should experience salePrice be shown in ExperienceDate card when priceOverride is set?**
   - What we know: priceOverride is per-date; salePrice is base-level
   - Recommendation: salePrice is the fallback; if priceOverride is set, show priceOverride (not salePrice). No strikethrough needed if priceOverride is active.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `src/components/checkout/ConfirmationModal.tsx` — polling logic, no escape button, 60s timeout
- `src/components/checkout/CheckoutForm.tsx` — `stripe.confirmPayment` with no timeout
- `src/app/api/webhooks/stripe/route.ts` — idempotency guard, stock decrement transaction
- `src/actions/checkout.ts` — gift card path, price verification logic
- `src/types/index.ts` — missing `salePrice` on Product, Experience
- `src/lib/validations.ts` — missing `salePrice` in productSchema, experienceSchema
- `src/lib/mappers/products.ts` — mapProduct does not map salePrice
- `src/lib/mappers/experiences.ts` — mapExperience does not map salePrice
- `src/components/products/ProductCard.tsx` — no sale price display
- `src/components/experiences/ExperienceCard.tsx` — earlybird pattern exists (reuse for sale price)
- `src/app/admin/produkter/ny/page.tsx` — no salePrice input
- `src/app/admin/produkter/[id]/page.tsx` — no salePrice input
- `.planning/config.json` — `nyquist_validation: false`, `commit_docs: true`

### Secondary (MEDIUM confidence)
- Stripe JS SDK behavior: `stripe.confirmPayment` is async but does not support AbortController
- Next.js App Router: `router.replace` triggers component re-render; `window.history.replaceState` does not

---

## Metadata

**Confidence breakdown:**
- Robustness bug analysis: HIGH — all bugs confirmed by direct code reading
- Sale price data model: HIGH — existing earlybird pattern is identical, just simpler
- Fix patterns: MEDIUM — patterns are standard but not tested against this specific codebase
- Stripe timeout approach: MEDIUM — standard Promise.race, but Stripe behavior on abort is [ASSUMED]

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable stack, no fast-moving dependencies)
