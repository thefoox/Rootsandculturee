---
phase: 03-betaling-og-booking
plan: 01
subsystem: payments
tags: [stripe, stripe-elements, resend, localstorage, cart, checkout, webhook, firestore-transactions]

# Dependency graph
requires:
  - phase: 01-fundament
    provides: UI components (Button, Input, FormError, EmptyState), layout (Header, Footer), auth (session, DAL), CSS tokens
  - phase: 02-butikkvindu-og-admin
    provides: Product/Experience types, Firestore data layer, admin CMS, product detail pages
provides:
  - Cart system with localStorage persistence and CartProvider context
  - Stripe Elements inline checkout with PaymentIntent flow
  - Stripe webhook handler with idempotency, signature verification, atomic fulfillment
  - Order and Booking Firestore document creation
  - Resend email confirmations (order, booking, mixed)
  - Confirmation modal with webhook polling
  - AddToCartButton for product pages
  - OrderSummaryPanel reusable component
affects: [03-02-booking-admin, customer-dashboard, admin-orders]

# Tech tracking
tech-stack:
  added: [stripe, "@stripe/stripe-js", "@stripe/react-stripe-js", resend]
  patterns: [PaymentIntent-based checkout, webhook-driven fulfillment, localStorage cart persistence, Firestore transactions for atomic stock/seat updates]

key-files:
  created:
    - src/lib/stripe/client.ts
    - src/lib/stripe/server.ts
    - src/lib/email/resend.ts
    - src/lib/email/templates.ts
    - src/lib/cart.ts
    - src/components/cart/CartProvider.tsx
    - src/components/cart/CartDrawer.tsx
    - src/components/cart/CartItem.tsx
    - src/components/cart/CartBadge.tsx
    - src/components/cart/OrderSummaryPanel.tsx
    - src/components/checkout/CheckoutForm.tsx
    - src/components/checkout/StripeElementsWrapper.tsx
    - src/components/checkout/PaymentSection.tsx
    - src/components/checkout/ConfirmationModal.tsx
    - src/components/checkout/BookingChecklist.tsx
    - src/components/products/AddToCartButton.tsx
    - src/app/(public)/handlekurv/page.tsx
    - src/app/(public)/checkout/page.tsx
    - src/app/api/webhooks/stripe/route.ts
    - src/app/api/create-payment-intent/route.ts
    - src/actions/checkout.ts
    - src/actions/orders.ts
  modified:
    - src/types/index.ts
    - src/components/layout/Header.tsx
    - src/app/layout.tsx
    - src/app/globals.css
    - .env.local.example

key-decisions:
  - "Stripe server SDK initialized conditionally (null when STRIPE_SECRET_KEY missing) for build-time safety"
  - "Resend client initialized conditionally (null when RESEND_API_KEY missing) for build-time safety"
  - "Cart state managed via React Context + localStorage, not Zustand, to minimize dependencies"
  - "Webhook uses PaymentIntent metadata for fulfillment data (no pending order doc required)"
  - "revalidateTag uses second arg 'max' per Next.js 16 convention"
  - "Sonner toast called without role prop (not supported in current sonner version)"

patterns-established:
  - "Stripe SDK null-guard pattern: initialize only when env var present, check null before use"
  - "Cart uniqueness: products keyed by id, experiences keyed by id:experienceDateId"
  - "Webhook idempotency via stripeEvents/{eventId} collection"
  - "PaymentIntent metadata carries all fulfillment data as JSON strings"
  - "Flat rate shipping constant (9900 ore / 99 NOK) used in cart drawer, cart page, and checkout"

requirements-completed: [PROD-03, PROD-04, PROD-05, PROD-06, PROD-07]

# Metrics
duration: 11min
completed: 2026-03-30
---

# Phase 03 Plan 01: Handlekurv og Checkout Summary

**localStorage-persisted cart with drawer/page views, Stripe Elements inline checkout, webhook-driven order fulfillment with Firestore transactions, and Resend email confirmations**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-30T21:06:19Z
- **Completed:** 2026-03-30T21:17:34Z
- **Tasks:** 2
- **Files modified:** 29

## Accomplishments
- Complete cart system: localStorage persistence, CartProvider context, drawer with focus trap, full page at /handlekurv, badge with aria-live, quantity controls
- Stripe Elements inline checkout: PaymentIntent creation with server-side Firestore price verification, Norwegian Zod validation, branded Stripe appearance
- Webhook handler: raw body parsing (Pitfall 4), signature verification, idempotency via stripeEvents collection (Pitfall 3), Firestore transactions for stock decrement and seat reservation (Pitfall 2)
- Email confirmations via Resend: plain text templates for order, booking, and mixed confirmation emails
- Confirmation modal: polls webhook for order creation, displays order/booking details, focus trap, no click-outside dismiss

## Task Commits

Each task was committed atomically:

1. **Task 1: Types, Stripe/Resend SDK setup, cart state engine, and cart UI components** - `da232f1` (feat)
2. **Task 2: Checkout page with Stripe Elements, webhook handler, order fulfillment, email, and confirmation modal** - `a030fd8` (feat)

## Files Created/Modified
- `src/types/index.ts` - Added CartItem, Order, Booking, ShippingAddress, ShippingConfig types
- `src/app/globals.css` - Added Phase 3 CSS tokens and cart drawer animation
- `src/lib/stripe/client.ts` - Stripe.js loader with brand appearance config
- `src/lib/stripe/server.ts` - Server-side Stripe SDK with null-guard
- `src/lib/email/resend.ts` - Resend client with null-guard
- `src/lib/email/templates.ts` - Plain text email templates (order, booking, mixed)
- `src/lib/cart.ts` - Cart localStorage persistence (loadCart, saveCart, generateCartId)
- `src/components/cart/CartProvider.tsx` - React Context with addItem, removeItem, updateQuantity, clearCart
- `src/components/cart/CartDrawer.tsx` - Side drawer with focus trap, ARIA dialog, slide animation
- `src/components/cart/CartItem.tsx` - Cart item row with quantity controls, remove button
- `src/components/cart/CartBadge.tsx` - Red badge with aria-live region
- `src/components/cart/OrderSummaryPanel.tsx` - Reusable subtotal/shipping/total panel
- `src/components/products/AddToCartButton.tsx` - "Legg i handlekurv" button
- `src/components/layout/Header.tsx` - Updated with CartBadge, CartDrawer, dynamic aria-label
- `src/app/layout.tsx` - Wrapped with CartProvider
- `src/app/(public)/handlekurv/page.tsx` - Full cart page with two-column layout
- `src/app/(public)/checkout/page.tsx` - Checkout page with Stripe Elements
- `src/components/checkout/CheckoutForm.tsx` - Form with contact, shipping, payment sections
- `src/components/checkout/StripeElementsWrapper.tsx` - Stripe Elements provider wrapper
- `src/components/checkout/PaymentSection.tsx` - Stripe PaymentElement with brand styling
- `src/components/checkout/ConfirmationModal.tsx` - Post-payment confirmation with polling
- `src/components/checkout/BookingChecklist.tsx` - "Hva du ma ta med" checklist display
- `src/actions/checkout.ts` - Server action for PaymentIntent creation with Firestore validation
- `src/actions/orders.ts` - Order CRUD server actions with unstable_cache
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler with all critical safeguards
- `src/app/api/create-payment-intent/route.ts` - API route fallback for PaymentIntent

## Decisions Made
- Stripe and Resend SDKs use null-guard pattern (return null when env vars missing) -- consistent with Firebase Admin pattern from Phase 1
- Cart state via React Context + localStorage, not Zustand -- avoids new dependency
- Webhook processes PaymentIntent metadata directly -- no pending order doc pattern needed
- Sonner toast called without `role` prop since it's not supported in current sonner version type definitions
- revalidateTag calls use second argument 'max' per Next.js 16 convention established in Phase 2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod validation error property access**
- **Found during:** Task 2 (CheckoutForm and checkout action)
- **Issue:** Plan used `validation.error.errors` but Zod uses `validation.error.issues`
- **Fix:** Changed to `.issues` in both checkout.ts and CheckoutForm.tsx
- **Files modified:** src/actions/checkout.ts, src/components/checkout/CheckoutForm.tsx
- **Committed in:** a030fd8

**2. [Rule 1 - Bug] Fixed revalidateTag missing second argument**
- **Found during:** Task 2 (orders.ts)
- **Issue:** revalidateTag requires second arg 'max' in Next.js 16
- **Fix:** Added 'max' as second argument to all revalidateTag calls
- **Files modified:** src/actions/orders.ts
- **Committed in:** a030fd8

**3. [Rule 1 - Bug] Removed unsupported sonner toast role prop**
- **Found during:** Task 1 (CartItem and AddToCartButton)
- **Issue:** sonner's ExternalToast type doesn't include 'role' property, causing build failure
- **Fix:** Removed role prop from toast calls (sonner handles aria-live internally)
- **Files modified:** src/components/cart/CartItem.tsx, src/components/products/AddToCartButton.tsx
- **Committed in:** da232f1

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** All auto-fixes necessary for TypeScript compilation. No scope creep.

## Issues Encountered
- Pre-existing Firebase client SDK build error (auth/invalid-api-key during prerendering) -- not caused by this plan, exists in baseline. TypeScript compilation passes clean.

## User Setup Required

External services require manual configuration. The plan's `user_setup` section specifies:

**Stripe:**
- Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` in .env.local
- Create webhook endpoint in Stripe Dashboard pointing to `{domain}/api/webhooks/stripe`
- Enable `payment_intent.succeeded` event on webhook

**Resend:**
- Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL` in .env.local
- Verify sending domain in Resend Dashboard

## Known Stubs
None -- all components are wired to real data sources. Cart reads from localStorage, checkout validates against Firestore, webhook writes to Firestore, emails send via Resend. Stripe/Resend clients return null when env vars missing (graceful degradation, not stubs).

## Next Phase Readiness
- Cart and checkout pipeline complete -- Plan 02 (booking admin + customer dashboard) can build on order/booking Firestore documents
- AddToCartButton ready for integration on product detail pages (currently available as standalone component)
- Booking date picker and experience checkout flow uses same cart + checkout pipeline
- Admin order management can use getOrders() and updateOrderStatus() from actions/orders.ts

## Self-Check: PASSED

All 22 created files verified on disk. Both task commits (da232f1, a030fd8) verified in git log.

---
*Phase: 03-betaling-og-booking*
*Completed: 2026-03-30*
