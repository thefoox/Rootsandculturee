# Phase 23: Handlekurv & Konto Robusthet — Research

**Researched:** 2026-04-10
**Domain:** Cart persistence, account pages (orders/bookings), error handling, UX edge cases
**Confidence:** HIGH — all findings based on direct codebase inspection

---

## Summary

Phase 23 hardens the cart and account experience against real-world edge cases. The audit identified
11 potential issues. After reading every relevant file, 4 issues are confirmed real gaps, 4 are
already partially handled, and 3 are either non-issues or covered by checkout validation.

The cart's primary structural gap is that localStorage items are never validated against the
database on page load — stale/deleted products persist silently until checkout fails. The
account pages (/konto/*) already have loading states, empty states, and auth guards in place;
the remaining gaps are error boundaries for Firestore fetch failures and max-quantity enforcement
in the CartItem quantity stepper.

**Primary recommendation:** Add a lightweight server action `validateCartItems` that runs on
the handlekurv page mount (once), plus a max quantity cap in CartItem's increment handler, plus
error.tsx boundaries for konto routes. Everything else is already covered.

---

## Confirmed Issues (by codebase inspection)

### Issue 1 [CONFIRMED]: No localStorage cart validation against database

**File:** `src/lib/cart.ts` + `src/components/cart/CartProvider.tsx`

`loadCart()` does a raw `JSON.parse` of localStorage with no schema check and no live product
validation:

```typescript
// src/lib/cart.ts — lines 5-15
export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_KEY)
    if (!stored) return []
    return JSON.parse(stored) as CartItem[]  // No validation — stale items pass through
  } catch {
    return []
  }
}
```

CartProvider loads this on mount with no side effects:

```typescript
useEffect(() => {
  setItems(loadCart())   // Items are trusted as-is
  setMounted(true)
}, [])
```

**Stale item scenarios that silently persist:**
- Product deleted from Firestore (still shows in cart)
- Product unpublished (`publishedAt = null`)
- Experience date deactivated (`isActive = false`)
- Experience date fully booked (`availableSeats = 0`)
- Variant removed from product

**When it fails:** The first moment of truth is `createPaymentIntent` in checkout.ts, which
correctly validates against Firestore. But users see no feedback until they attempt checkout
— a confusing UX for items that may have been in cart for days.

**Fix approach:** A new Server Action `validateCartItems(items: CartItem[])` called on the
`/handlekurv` page load. Returns `{ valid: CartItem[], removed: { name, reason }[] }`. The
handlekurv page (currently `'use client'`) calls this via `useEffect` on mount, removes
invalid items from context, and toasts the user with Norwegian-language messages.

**[VERIFIED: codebase]**

---

### Issue 2 [CONFIRMED]: No max quantity per cart item

**File:** `src/components/cart/CartItem.tsx` lines 100-107

The increment button has no upper bound:

```typescript
<button
  type="button"
  onClick={() => updateQuantity(getItemKey(item), item.quantity + 1)}
  // No disabled condition, no max check
  className="..."
  aria-label="Ok antall"
>
```

`updateQuantity` in CartProvider also has no ceiling:

```typescript
const updateQuantity = useCallback((key: string, quantity: number) => {
  if (quantity < 1) return   // Only floor, no ceiling
  setItems(...)
}, [])
```

Checkout validation (`checkout.ts` lines 98-99) DOES enforce stock:
```
if (verifiedStock < item.quantity) {
  return { error: `Ikke nok "${item.name}" på lager. Tilgjengelig: ${verifiedStock}.` }
}
```

But without knowing the actual stock count in the cart UI, users can increment arbitrarily
and only get feedback at checkout. The `CartItem` type includes no `stockCount` field — the
stock count is not currently passed to the cart on add.

**Fix options:**
- Option A (simple): Cap at a reasonable constant, e.g. 99, with `disabled={item.quantity >= 99}`.
- Option B (stock-aware): Store `stockCount` in CartItem and disable increment when quantity
  reaches it. Requires CartItem type change and update to all `addItem` call sites on product
  pages.

Option A is correct for this phase — stock-aware enforcement already exists at checkout (the
right place for authoritative stock checks). Option B adds complexity and a type change with
no meaningful UX improvement given checkout validation already catches it.

**[VERIFIED: codebase]**

---

### Issue 3 [CONFIRMED]: No error boundaries on /konto/* routes

**Finding:** There are no `error.tsx` files under `src/app/konto/`. A global
`src/app/error.tsx` exists but it only covers the root layout.

```
src/app/error.tsx              ✓ exists (global)
src/app/konto/error.tsx        ✗ MISSING
src/app/konto/ordrer/error.tsx ✗ MISSING
src/app/konto/bookinger/error.tsx ✗ MISSING
```

If Firestore throws during `getOrdersByUser` or `getBookingsByUser` (network error, quota,
misconfigured index), the konto pages crash with a generic Next.js error page with no "prøv
igjen" affordance. The global error.tsx does cover this case generically, but a konto-specific
error boundary can provide:
- A "Tilbake til konto" link
- Norwegian context-specific messaging

The `getOrdersByUser` and `getBookingsByUser` functions do NOT have try/catch wrappers
(unlike `getProducts` which does). If adminDb throws, the error propagates uncaught to the
page and then Next.js's error boundary.

**[VERIFIED: codebase]**

---

### Issue 4 [CONFIRMED]: Increment button has wrong aria-label

**File:** `src/components/cart/CartItem.tsx` line 102

```typescript
aria-label="Ok antall"   // Should be "Øk antall"
```

"Ok antall" ("OK quantity") is meaningless. Should be "Øk antall" ("Increase quantity").
Small accessibility fix but WCAG 2.1 AA requires informative button labels.

**[VERIFIED: codebase]**

---

## Issues Already Handled (no action needed)

### Issue 5 [NOT AN ISSUE]: Duplicate variant handling

`getItemKey` correctly generates distinct keys for different variants:

```typescript
// CartProvider.tsx lines 28-33
export function getItemKey(item: ...): string {
  if (item.experienceDateId) return `${item.id}:${item.experienceDateId}`
  if (item.variantId) return `${item.id}:${item.variantId}`
  return item.id
}
```

Adding the same product with different variants creates separate line items. Adding the same
variant again increments quantity. Experiences are guarded to always be quantity 1.

**[VERIFIED: codebase]**

---

### Issue 6 [NOT AN ISSUE]: Cart total overflow

Prices stored as integers in ore (1 NOK = 100 ore). JavaScript `Number.MAX_SAFE_INTEGER` is
9,007,199,254,740,991. To overflow, a user would need items totaling ~90 billion NOK. Not a
real-world risk. Stripe itself enforces a maximum charge amount.

**[VERIFIED: reasoning]**

---

### Issue 7 [ALREADY HANDLED]: Loading states on konto pages

All three loading files exist and work via Next.js's streaming/Suspense pattern:

```
src/app/konto/loading.tsx          ✓ spinner
src/app/konto/ordrer/loading.tsx   ✓ spinner
src/app/konto/bookinger/loading.tsx ✓ spinner
```

**[VERIFIED: codebase]**

---

### Issue 8 [ALREADY HANDLED]: Empty states

`EmptyState` component is used throughout — confirmed in:
- `konto/page.tsx` — "Ingen ordrer enda" + "Ingen bookinger enda"
- `konto/ordrer/page.tsx` — "Ingen ordrer enda"
- `konto/bookinger/page.tsx` — "Ingen kommende bookinger" + "Ingen tidligere bookinger"

**[VERIFIED: codebase]**

---

### Issue 9 [ALREADY HANDLED]: Auth guard if user navigates to /konto while logged out

The KontoLayout (`src/app/konto/layout.tsx`) calls `verifySession()` and `redirect('/')` if
not authenticated. This runs before any page renders. Additionally, each child page also calls
`verifySession()` independently (redundant but safe). No middleware needed.

**[VERIFIED: codebase]**

---

### Issue 10 [ALREADY HANDLED]: Pagination

Both `getOrdersByUser` and `getBookingsByUser` have `.limit(50)` hard caps. For an e-commerce
store at launch, 50 orders/bookings per user is adequate. Pagination infrastructure (cursor-based
Firestore pagination) would be needed at scale but is out of scope for this robustness phase.

**[VERIFIED: codebase]**

---

### Issue 11 [PARTIALLY HANDLED]: Mobile cart drawer scroll with many items

The drawer body uses `flex-1 overflow-y-auto` which enables scrolling when items overflow.
The header and footer are outside this scrollable area. This is the correct implementation.

However, the drawer currently shows the item list inline with no virtual scrolling — for large
carts (10+ items) this could feel slow. Virtual scrolling is overkill for this phase. The
current implementation is acceptable.

**[VERIFIED: codebase]**

---

## Cart Validation Server Action — Architecture Pattern

The core new piece in this phase is a `validateCartItems` Server Action. Here is the
recommended pattern based on how `createPaymentIntent` already validates items:

### Action signature

```typescript
// src/actions/cart.ts
'use server'

import { adminDb } from '@/lib/firebase/admin'
import type { CartItem } from '@/types'

export interface CartValidationResult {
  valid: CartItem[]
  removed: Array<{ name: string; reason: string }>
}

export async function validateCartItems(
  items: CartItem[]
): Promise<CartValidationResult>
```

### Validation rules (per item type)

**Products:**
1. Document exists in `products` collection
2. `publishedAt` is not null (not archived/unpublished)
3. If `variantId` set: variant still exists in `variants` array
4. (No stock check — stock is checked at checkout, not in cart validation)

**Experiences:**
1. Document exists in `experiences` collection
2. `experienceDateId` set and date document exists in `experiences/{id}/dates`
3. Date `isActive === true`
4. `availableSeats > 0`

**Gift cards:** No server-side validation needed in cart (validated at checkout).

### Norwegian error reasons

```
"Produktet er ikke lenger tilgjengelig."
"Opplevelsesdatoen er utsolgt."
"Opplevelsesdatoen er ikke lenger aktiv."
"Opplevelsen finnes ikke lenger."
```

### Calling pattern (handlekurv page)

The handlekurv page is currently `'use client'`. It must remain client since it reads from
`useCart()`. The validation call belongs in `useEffect` on mount:

```typescript
useEffect(() => {
  if (!mounted || items.length === 0) return

  validateCartItems(items).then((result) => {
    result.removed.forEach((r) => {
      removeItem(r.id, r.experienceDateId, r.variantId)
      toast.error(`${r.name}: ${r.reason}`)
    })
  })
}, [mounted])  // Run once after cart loads from localStorage
```

**Important:** The dependency array should only include `mounted` (not `items`) to prevent
infinite loops. Items are read from the closure at call time.

---

## Standard Stack

No new libraries needed. All work uses existing stack:

| Library | Purpose | Already Installed |
|---------|---------|------------------|
| `sonner` | Toast notifications for removed items | Yes |
| `firebase-admin` | Server-side Firestore reads in validation action | Yes |
| `zod` | Not needed here — validation logic is custom | Yes (unused) |

---

## Architecture Patterns

### Error Boundary Pattern (Next.js App Router)

```typescript
// src/app/konto/error.tsx
'use client'

export default function KontoError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <p className="font-heading text-h4 font-bold text-forest">
        Kunne ikke laste kontoinformasjon
      </p>
      <p className="mt-2 text-body">Prøv å laste siden på nytt.</p>
      <button onClick={reset} className="mt-6 ...">
        Prøv igjen
      </button>
      <a href="/konto" className="mt-3 text-body text-forest hover:underline">
        Tilbake til konto
      </a>
    </div>
  )
}
```

The same file is placed at:
- `src/app/konto/error.tsx` — covers konto overview + sub-routes
- Optionally also at `src/app/konto/ordrer/error.tsx` and `src/app/konto/bookinger/error.tsx`
  for route-specific copy

**[ASSUMED]** In Next.js App Router, an `error.tsx` at `/konto/` will catch errors from the
`/konto/` page and all child segments unless they have their own `error.tsx`. A single file
at `/konto/error.tsx` is sufficient unless route-specific error copy is desired.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Error UI for failed Firestore fetch | Custom error page from scratch | `error.tsx` Next.js error boundary |
| Toast for removed items | Custom toast system | `sonner` (already used throughout) |
| Server-side cart validation | Inline in page component | Server Action in `src/actions/cart.ts` |

---

## Common Pitfalls

### Pitfall 1: Infinite revalidation loop in cart validation

**What goes wrong:** Calling `validateCartItems` with `items` in the `useEffect` dependency
array triggers re-runs whenever items change, which triggers item removal, which changes items,
which triggers another validation.

**How to avoid:** Depend only on `mounted`. Use a `hasValidated` ref to ensure it only runs once
per page load:

```typescript
const hasValidated = useRef(false)
useEffect(() => {
  if (!mounted || hasValidated.current || items.length === 0) return
  hasValidated.current = true
  validateCartItems(items).then(...)
}, [mounted])
```

**[VERIFIED: reasoning from CartProvider.tsx pattern]**

---

### Pitfall 2: Server Action called before cart is loaded from localStorage

**What goes wrong:** `mounted` is `false` until after the first `useEffect` in CartProvider runs.
If validation fires before `mounted = true`, `items` is `[]` (the initial state), and the
validation incorrectly passes an empty cart.

**How to avoid:** The `mounted` guard in CartProvider is already propagated via context. The
handlekurv page's useEffect condition `if (!mounted || items.length === 0) return` handles both.

**[VERIFIED: CartProvider.tsx lines 39-43]**

---

### Pitfall 3: Error boundary doesn't catch errors in client components

**What goes wrong:** Next.js `error.tsx` only catches errors thrown during Server Component
rendering (or during async data fetching in Server Actions). Client-side runtime errors in
`'use client'` components are also caught by error boundaries, but the boundary must be in
the tree above the throwing component.

**Impact for this phase:** The konto pages are Server Components. Firestore errors during
`getOrdersByUser` or `getBookingsByUser` will be caught by `error.tsx`. No special action
needed.

**[ASSUMED]** — consistent with Next.js App Router error boundary behavior per training data.

---

### Pitfall 4: max-quantity constant out of sync with real stock

**What goes wrong:** If we set `MAX_QUANTITY = 99` in CartItem, a user could add 99 of a
product that only has 5 in stock. The checkout will correctly reject this, but the cart shows
an impossible state.

**How to avoid:** This is acceptable for Phase 23. The cart is a "staging area" and stock is
always validated at checkout. Displaying a stock-accurate max would require either (a) passing
stockCount into CartItem type (type change + all addItem call sites) or (b) a server round-trip
per item on cart page load. Neither is warranted for this robustness phase.

**Decision:** Use `MAX_PRODUCT_QUANTITY = 99` as a practical sanity cap.

---

## Code Examples

### Pattern: Validated item removal with toast

```typescript
// In handlekurv page, after validateCartItems() returns:
result.removed.forEach((r) => {
  removeItem(r.id, r.experienceDateId ?? undefined, r.variantId ?? undefined)
  toast.error(r.reason, { description: r.name })
})
```

Sonner supports `description` as a subtitle line. This matches the pattern used in CartItem's
`handleRemove` which uses `toast('Fjernet fra handlekurven.')`.

---

### Pattern: Increment button with max cap

```typescript
// CartItem.tsx — increment button with max guard
<button
  type="button"
  onClick={() => updateQuantity(getItemKey(item), item.quantity + 1)}
  disabled={item.quantity >= MAX_PRODUCT_QUANTITY}
  className="..."
  aria-label="Øk antall"   // Fix typo from "Ok antall"
  aria-disabled={item.quantity >= MAX_PRODUCT_QUANTITY}
>
```

Define `const MAX_PRODUCT_QUANTITY = 99` at the top of CartItem.tsx or in a shared constants file.

---

## Implementation Scope Summary

| Task | Files Touched | Scope |
|------|--------------|-------|
| Add `validateCartItems` Server Action | `src/actions/cart.ts` (new) | New file, ~50 lines |
| Call validation from handlekurv page | `src/app/(public)/handlekurv/page.tsx` | ~15 lines added |
| Add max quantity cap + fix aria-label | `src/components/cart/CartItem.tsx` | 3 lines changed |
| Add konto error boundary | `src/app/konto/error.tsx` (new) | New file, ~30 lines |
| Optional: route-specific error.tsx | `src/app/konto/ordrer/error.tsx`, `bookinger/error.tsx` | 2 new files (low priority) |

Total scope: small and focused. No type changes required. No new dependencies.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A single `error.tsx` at `/konto/` catches errors from all child routes unless they have their own | Error Boundary Pattern | Low — could add route-specific files as fallback |
| A2 | Next.js `error.tsx` catches Server Component async fetch errors | Pitfall 3 | Low — behavior consistent with App Router docs |

---

## Environment Availability

Step 2.6: SKIPPED — no external dependencies. All work is code/config changes within the
existing Next.js + Firebase stack.

---

## Sources

### PRIMARY (HIGH confidence — direct codebase inspection)

- `src/lib/cart.ts` — loadCart/saveCart, no validation
- `src/components/cart/CartProvider.tsx` — addItem/updateQuantity logic, no quantity ceiling
- `src/components/cart/CartItem.tsx` — increment button, aria-label bug
- `src/components/cart/CartDrawer.tsx` — overflow-y-auto confirmed
- `src/app/(public)/handlekurv/page.tsx` — client component structure
- `src/actions/checkout.ts` — validation pattern to mirror in cart action
- `src/app/konto/page.tsx` — EmptyState usage confirmed
- `src/app/konto/ordrer/page.tsx` — no try/catch, no error.tsx
- `src/app/konto/bookinger/page.tsx` — no try/catch, no error.tsx
- `src/app/konto/layout.tsx` — auth redirect confirmed
- `src/app/konto/loading.tsx` + ordrer + bookinger — all present
- `src/lib/data/orders.ts` — no try/catch in getOrdersByUser
- `src/lib/data/bookings.ts` — no try/catch in getBookingsByUser
- `src/app/error.tsx` — global boundary exists
- `src/types/index.ts` — CartItem type, no stockCount field

### SECONDARY (ASSUMED — training knowledge)

- Next.js error boundary propagation behavior (consistent with App Router model)

---

## Metadata

**Confidence breakdown:**
- Issue identification: HIGH — all based on direct code reading
- Fix approach: HIGH — mirrors existing patterns (checkout.ts validation, sonner toasts)
- Architecture: HIGH — all within established project patterns
- Assumptions: LOW risk — Next.js error boundary behavior is stable

**Research date:** 2026-04-10
**Valid until:** 60 days (stable codebase, no fast-moving dependencies)
