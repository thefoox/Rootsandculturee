---
phase: 17-checkout-redesign
plan: "02"
subsystem: checkout-ui
tags: [cart, checkout, gift-card, ui, redesign]
dependency_graph:
  requires: []
  provides: [order-summary-sidebar, gift-card-disclosure]
  affects: [checkout-page, handlekurv-page, cart-drawer]
tech_stack:
  added: []
  patterns: [children-slot, disclosure-pattern, tailwind-arbitrary-values]
key_files:
  created: []
  modified:
    - src/components/cart/OrderSummaryPanel.tsx
    - src/components/checkout/GiftCardInput.tsx
    - src/app/(public)/checkout/page.tsx
    - src/app/(public)/handlekurv/page.tsx
    - src/components/cart/CartDrawer.tsx
decisions:
  - GiftCardInput moved from left-column standalone card to sidebar children slot for prototype fidelity
  - Standalone item list in checkout sidebar removed — items now embedded in OrderSummaryPanel
  - Native input/button elements used in GiftCardInput to match prototype's tight styling without component abstraction overhead
metrics:
  duration: "~20 minutes"
  completed: "2026-04-10T21:00:14Z"
  tasks_completed: 2
  files_modified: 5
---

# Phase 17 Plan 02: Order Summary Sidebar and Gift Card Disclosure Summary

**One-liner:** White sidebar card with 64px product thumbnails, earlybird tags, legal text, and collapsible gift card disclosure matching checkout-v2.html prototype.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Redesign OrderSummaryPanel with white card, product images, and legal text | `6552553` | OrderSummaryPanel.tsx, checkout/page.tsx, handlekurv/page.tsx, CartDrawer.tsx |
| 2 | Redesign GiftCardInput as collapsible sidebar disclosure | `d1c5751` | GiftCardInput.tsx |

## What Was Built

### OrderSummaryPanel (Task 1)

Completely rewrote the component from a simple line-item list into a premium sidebar card:

- **Card shell:** `rounded-xl border border-[#e8e3da] bg-white p-7` — matches prototype's white card with subtle warm border
- **Title:** "Din bestilling" (was "Sammendrag") in Merriweather 18px bold
- **Product items:** 64px thumbnails (`h-16 w-16 rounded-lg object-cover`) with graceful placeholder div fallback when `item.image` is null
- **Meta line:** Experience items show Norwegian date + spots count; products show quantity x price + optional variant label
- **Earlybird badge:** `bg-rust/10 text-rust uppercase` rounded badge with 3px border-radius
- **Rows:** Delsum, Frakt (shows "Gratis" when 0), optional Gavekort deduction
- **Total:** `border-t-[1.5px] border-forest` separator, 16px label + 20px price both bold
- **Legal text:** 12px `text-body/50` with links to `/vilkar` and `/personvern`
- **Children slot:** Renders below legal text — used to embed GiftCardInput in sidebar

**New props interface:**
```typescript
interface OrderSummaryPanelProps {
  items: CartItem[]          // required — was not present before
  subtotal: number
  shippingCost: number
  giftCardDeduction?: number // optional, defaults to 0
  showCta?: boolean
  ctaText?: string
  ctaHref?: string
  children?: React.ReactNode // slot for GiftCardInput
}
```

**Caller updates:** All three callers (CartDrawer, checkout/page.tsx, handlekurv/page.tsx) updated to pass `items`. The checkout page's separate item list below the panel was removed since items are now embedded in the panel itself.

### GiftCardInput (Task 2)

Rewrote from a standalone boxed card to a collapsible sidebar disclosure:

- **Container:** `mt-5 pt-4 border-t border-[#e8e3da]` — sits naturally below legal text in sidebar
- **Trigger:** Full-width button with `Ticket` icon + "Har du et gavekort?" + `ChevronDown` (rotates 180deg when open), `aria-expanded` for WCAG compliance, `opacity-70 hover:opacity-100` interaction
- **Panel:** Native `<input>` with `bg-cream border-forest/20 rounded-md` + "Bruk" `<button>` with `bg-forest rounded-md` — no Input/Button component imports
- **Error:** `role="alert"` paragraph in `text-destructive`
- **Applied state:** Compact inline row — Check icon, "Gavekort brukt", code label, deduction amount, "Fjern" button
- **All logic preserved:** handleCheck, handleApply, handleRemove, validateGiftCardAction call, error handling

**Removed imports:** `Input` from `@/components/ui/Input`, `Button` from `@/components/ui/Button`
**Added imports:** `ChevronDown` from `lucide-react`, `cn` from `@/lib/utils`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Updated all callers to pass required `items` prop**
- **Found during:** Task 1
- **Issue:** Adding `items: CartItem[]` as required breaks CartDrawer, checkout/page.tsx, and handlekurv/page.tsx at compile time
- **Fix:** Added `items={items}` to all three call sites; also passed `giftCardDeduction` to checkout page panels
- **Files modified:** CartDrawer.tsx, checkout/page.tsx, handlekurv/page.tsx
- **Commit:** `6552553`

**2. [Rule 1 - Bug] Removed duplicate GiftCardInput from checkout left column**
- **Found during:** Task 1 (checkout page restructure)
- **Issue:** After moving GiftCardInput into the sidebar children slot, the original standalone `<GiftCardInput>` block in the left column would render the component twice — once in the sidebar (correct) and once above the payment form (incorrect duplicate)
- **Fix:** Removed the standalone GiftCardInput block from the left column; cleaned up unused `getItemKey` import
- **Files modified:** checkout/page.tsx
- **Commit:** `6552553`

**3. [Rule 1 - Bug] Removed separate item list panels from checkout sidebar**
- **Found during:** Task 1
- **Issue:** Checkout page had a separate item list `<div>` rendered below the OrderSummaryPanel. With items now embedded inside the panel, keeping both would duplicate item display
- **Fix:** Removed the separate item list `<div>` blocks (both mobile and desktop variants)
- **Files modified:** checkout/page.tsx
- **Commit:** `6552553`

## Known Stubs

None — all data flows are wired. Items come from `useCart()`, images from `CartItem.image`, gift card logic calls real server action.

## Threat Flags

None — no new network endpoints or auth paths introduced. Image URLs rendered from `CartItem.image.url` which originates from trusted Firestore/Firebase Storage data (T-17-03 accepted per plan threat model).

## Self-Check: PASSED

- `src/components/cart/OrderSummaryPanel.tsx` — exists, contains `item-image` class
- `src/components/checkout/GiftCardInput.tsx` — exists, contains `giftcard-trigger` pattern (disclosure trigger button)
- Commits `6552553` and `d1c5751` verified in git log
- `npx tsc --noEmit` passed with no errors after both tasks
