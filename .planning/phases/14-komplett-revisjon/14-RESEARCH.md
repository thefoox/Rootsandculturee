# Phase 14: Komplett Revisjon — Research

**Date:** 2026-04-08
**Method:** Three parallel code explorer agents auditing CMS, Auth, and E-Commerce

## Findings Summary

### CMS Dynamic Sections (REV-01)

**Architecture:** Two rendering paths exist:
- **Path A — `[slug]/page.tsx`:** Fully CMS-driven via `SectionRenderer`. Works correctly.
- **Path B — Bespoke pages (`om-oss`, `kontakt`, `page.tsx`):** Hand-crafted JSX that fetches CMS data but ignores most of it.

**13 section types** supported by admin CMS and SectionRenderer:
`hero`, `text-image`, `text`, `values`, `team`, `faq`, `cta`, `gallery`, `contact-info`, `experiences-grid`, `articles-grid`, `products-grid`, `trust-bar`

**Mismatches by page:**

| Page | CMS sections fetched but NOT rendered | Hardcoded sections (not in CMS) |
|------|--------------------------------------|--------------------------------|
| om-oss | values, team, gallery, cta (ctaSection fetched, never used) | VALUES constant, TEAM constant, Lokasjon section, bottom CTA |
| kontakt | contact-info (contactSection fetched, never used), faq | Contact cards, form, FAQ constant, Location/map |
| forside | trust-bar (trustSection fetched, never used), cta, experiences-grid, products-grid, articles-grid | CATEGORIES constant, TESTIMONIALS constant, Newsletter, Hero CTA buttons |

**Bug:** `imagePosition` field dropped by `mapPageContent` in `src/lib/data/page-content.ts` (lines 16-27).

### Google Login (REV-03)

**Root cause:** CSP `connect-src` missing `https://apis.google.com`. The wildcard `https://*.googleapis.com` does NOT cover `apis.google.com` (different domain).

**Secondary:** `frame-src` should include `https://*.google.com` for different Google account types.

**Files:** `next.config.ts` line 30 (CSP header), `src/lib/firebase/auth.ts` (signInWithPopup), `src/components/auth/LoginForm.tsx` (handleGoogleLogin).

### E-Commerce Critical Bugs (REV-02)

**1. Gift card discount not applied to Stripe PI amount (CRITICAL)**
- `updatePaymentIntentMetadata` calculates `giftCardDeduction` and stores in metadata
- But the `stripe.paymentIntents.update()` call only updates `metadata`, NOT `amount`
- Customer charged full price AND gift card balance deducted = double-charging
- Files: `src/actions/checkout.ts` lines 253-436, `src/app/(public)/checkout/page.tsx` lines 50-72

**2. Variant stock not decremented in webhook (CRITICAL)**
- Webhook stock decrement (lines 170-183) only updates `product.stockCount`
- Ignores `variantId` from metadata — variant-level `stockCount` never updated
- File: `src/app/api/webhooks/stripe/route.ts` lines 170-183

**3. Refund webhook doesn't restore booking seats (HIGH)**
- `charge.refunded` handler marks order cancelled but doesn't touch bookings
- Booking seats remain decremented after refund
- File: `src/app/api/webhooks/stripe/route.ts` lines 401-433

**4. Session module build-time crash (HIGH)**
- `throw new Error()` at module scope in `session.ts` — crashes build if SESSION_SECRET missing
- File: `src/lib/session.ts` lines 6-9

### Data Integrity (REV-04)

- `coveredByGiftCard` return path is dead code (unreachable from checkout flow)
- `/api/create-payment-intent` route is orphaned (checkout uses server action directly)
- `difficulty` field in experience actions is dead code
- Stripe API version `2026-03-25.dahlia` uses pre-release suffix
- Timestamp conversion uses `_seconds` private property instead of `.toDate()`

## Recommendations

1. **Plan 01 (Wave 1):** Fix critical financial bugs + Google login + session safety + imagePosition
2. **Plan 02 (Wave 1):** Convert all three pages to fully CMS-driven via SectionRenderer
3. **Plan 03 (Wave 2):** Refund seat restore + dead code cleanup + Stripe version pin
