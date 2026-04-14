---
phase: 22-ecommerce-robusthet
plan: "03"
subsystem: products-experiences-checkout
tags:
  - sale-price
  - tilbudspris
  - admin-forms
  - product-card
  - experience-card
  - checkout-verification
  - zod
dependency_graph:
  requires:
    - "22-02"
  provides:
    - salePrice-end-to-end
    - tilbudspris-admin-ui
    - sale-price-checkout-verification
  affects:
    - src/types/index.ts
    - src/lib/validations.ts
    - src/lib/mappers/products.ts
    - src/lib/mappers/experiences.ts
    - src/actions/products.ts
    - src/actions/experiences.ts
    - src/actions/checkout.ts
    - src/app/admin/produkter/ny/page.tsx
    - src/app/admin/produkter/[id]/page.tsx
    - src/app/admin/opplevelser/ny/page.tsx
    - src/app/admin/opplevelser/[id]/page.tsx
    - src/components/products/ProductCard.tsx
    - src/components/experiences/ExperienceCard.tsx
tech_stack:
  added: []
  patterns:
    - Zod .refine() for cross-field validation (salePrice < price)
    - NOK-to-ore conversion at action boundary (Math.round * 100)
    - Server-side salePrice read from Firestore (never from CartItem snapshot)
    - Earlybird > priceOverride > salePrice > basePrice priority chain
key_files:
  created: []
  modified:
    - src/types/index.ts
    - src/lib/validations.ts
    - src/lib/mappers/products.ts
    - src/lib/mappers/experiences.ts
    - src/actions/products.ts
    - src/actions/experiences.ts
    - src/actions/checkout.ts
    - src/app/admin/produkter/ny/page.tsx
    - src/app/admin/produkter/[id]/page.tsx
    - src/app/admin/opplevelser/ny/page.tsx
    - src/app/admin/opplevelser/[id]/page.tsx
    - src/components/products/ProductCard.tsx
    - src/components/experiences/ExperienceCard.tsx
decisions:
  - salePrice applies only to base product price, not to variants (Decision 3 from research)
  - Experience price priority: earlybird > priceOverride > salePrice > basePrice
  - salePrice stored as ore integer; admin inputs NOK (converted at action boundary)
  - Zod .refine() rejects salePrice >= price server-side; display also guards with salePrice < price
  - productSalePrice check applied before variant branch so variants are never affected
metrics:
  duration: "~15 minutes"
  completed: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 13
---

# Phase 22 Plan 03: Tilbudspris (Sale Price) Feature Summary

**One-liner:** salePrice field added end-to-end across Product and Experience — types, Zod schemas with cross-field refinement, Firestore mappers, server actions with NOK-to-ore conversion, checkout price verification (Firestore-sourced, variant-safe), admin forms with Tilbudspris input, and card displays with strikethrough + tilbud badge.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | salePrice to types, schemas, mappers, actions, checkout | 425f271 | src/types/index.ts, src/lib/validations.ts, src/lib/mappers/products.ts, src/lib/mappers/experiences.ts, src/actions/products.ts, src/actions/experiences.ts, src/actions/checkout.ts |
| 2 | Admin forms and card display components | 987f0d5 | src/app/admin/produkter/ny/page.tsx, src/app/admin/produkter/[id]/page.tsx, src/app/admin/opplevelser/ny/page.tsx, src/app/admin/opplevelser/[id]/page.tsx, src/components/products/ProductCard.tsx, src/components/experiences/ExperienceCard.tsx |

## What Was Built

### Task 1: Backend / Data Layer (commit `425f271`)

**Types (src/types/index.ts):**
- Added `salePrice: number | null` to `Product` interface (after `price`)
- Added `salePrice: number | null` to `Experience` interface (after `basePrice`)

**Validation (src/lib/validations.ts):**
- Added `salePrice: z.number().int().positive().nullable().optional()` to `productSchema`
- Added `.refine((data) => !data.salePrice || data.salePrice < data.price, ...)` after productSchema — rejects salePrice >= price with Norwegian error message
- Same field + refinement added to `experienceSchema` comparing against `basePrice`

**Mappers:**
- `mapProduct`: added `salePrice: (data.salePrice as number) ?? null`
- `mapExperience`: added `salePrice: (data.salePrice as number) ?? null`

**Actions — products.ts:**
- `createProduct`: reads `salePriceNOK` from formData, converts `Math.round(salePriceNOK * 100)`, passes to Zod parse as `salePrice`
- `updateProduct`: same pattern

**Actions — experiences.ts:**
- `createExperience`: reads `salePriceNOK`, converts to ore, passes to Zod parse
- `updateExperience`: same pattern

**Checkout (src/actions/checkout.ts) — both `createPaymentIntent` and `updatePaymentIntentMetadata`:**

Product price verification:
```typescript
let verifiedPrice = product.price as number
// Prefer salePrice when present and lower (only for base product, not variants)
const productSalePrice = product.salePrice as number | null
if (!item.variantId && productSalePrice && productSalePrice > 0 && productSalePrice < verifiedPrice) {
  verifiedPrice = productSalePrice
}
// then variant branch follows (overrides verifiedPrice for variant items)
```

Experience price verification — priority chain:
```typescript
const expSalePrice = (expData.salePrice as number | null)
let verifiedPrice = (dateData.priceOverride as number | null)
  ?? expSalePrice
  ?? (expData.basePrice as number)
  ?? item.price
// earlybird override applied after (highest priority)
```

### Task 2: Admin UI + Card Display (commit `987f0d5`)

**Admin product create (`src/app/admin/produkter/ny/page.tsx`):**
- Added `const [salePrice, setSalePrice] = useState('')`
- Changed "Pris og lager" grid from `grid-cols-3` to `grid-cols-2 sm:grid-cols-4`
- Added `<Input label="Tilbudspris (NOK)" ...>` after Pris input
- In `submitForm`: `if (salePrice && Number(salePrice) > 0) { formData.set('salePrice', salePrice) }`

**Admin product edit (`src/app/admin/produkter/[id]/page.tsx`):**
- Added `salePrice` state
- `useEffect` loads: `setSalePrice(product.salePrice ? String(product.salePrice / 100) : '')`
- Same Tilbudspris input + formData pattern

**Admin experience create (`src/app/admin/opplevelser/ny/page.tsx`):**
- Added `salePrice` state
- "Pris" section changed to `grid-cols-1 sm:grid-cols-2` with Tilbudspris input next to Pris
- formData set pattern

**Admin experience edit (`src/app/admin/opplevelser/[id]/page.tsx`):**
- Added `salePrice` state
- `useEffect` loads: `setSalePrice(experience.salePrice ? String(experience.salePrice / 100) : '')`
- Same Tilbudspris input + formData pattern

**ProductCard (`src/components/products/ProductCard.tsx`):**
- `aria-label` uses effective price: `formatPrice(product.salePrice && product.salePrice < product.price ? product.salePrice : product.price)`
- Price display replaced with conditional:
  - When `product.salePrice && product.salePrice < product.price`: shows sale price + `line-through` original + `tilbud` badge in rust color
  - Otherwise: original single price span

**ExperienceCard (`src/components/experiences/ExperienceCard.tsx`):**
- Added `const hasSalePrice = experience.salePrice != null && experience.salePrice < experience.basePrice`
- Price display now three-way conditional: earlybird (highest) → hasSalePrice (middle) → basePrice (default)
- salePrice branch shows sale price + `line-through` basePrice + `tilbud` badge in rust color

## Deviations from Plan

None — plan executed exactly as written.

## Decisions Made

1. **salePrice not applied to variants:** The `productSalePrice` check is gated by `!item.variantId`. If a variant is selected, the variant's own price takes effect (overrides verifiedPrice in the branch below). This matches Research Decision 3 — variant sale pricing is out of scope.

2. **Guard in card display matches server guard:** Both `ProductCard` (`product.salePrice && product.salePrice < product.price`) and the checkout server action (`productSalePrice > 0 && productSalePrice < verifiedPrice`) use the same condition, so what the customer sees matches what they pay.

3. **formData.set only when salePrice > 0:** Empty string or zero salePrice does not set the formData key, so the action receives `null` from `formData.get('salePrice') ? Number(...) : null` — correctly clearing any previous sale price.

## Known Stubs

None — salePrice is fully wired from admin input through Firestore to card display and checkout verification.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| T-22-08 mitigated | src/actions/checkout.ts | salePrice read from Firestore doc (server-side), never from CartItem price snapshot |
| T-22-09 mitigated | src/lib/validations.ts | Zod .refine() ensures salePrice < price before any Firestore write |

## Self-Check: PASSED

Files exist:
- src/types/index.ts — FOUND, contains `salePrice: number | null` in both Product and Experience
- src/lib/validations.ts — FOUND, contains `salePrice` field + `.refine(` in both schemas
- src/lib/mappers/products.ts — FOUND, contains `salePrice: (data.salePrice as number) ?? null`
- src/lib/mappers/experiences.ts — FOUND, contains `salePrice: (data.salePrice as number) ?? null`
- src/actions/products.ts — FOUND, contains `salePriceNOK` in createProduct and updateProduct
- src/actions/experiences.ts — FOUND, contains `salePriceNOK` in createExperience and updateExperience
- src/actions/checkout.ts — FOUND, contains `productSalePrice` and `expSalePrice` in both functions
- src/app/admin/produkter/ny/page.tsx — FOUND, contains `Tilbudspris (NOK)`, `salePrice` state
- src/app/admin/produkter/[id]/page.tsx — FOUND, contains `Tilbudspris (NOK)`, `product.salePrice / 100`
- src/app/admin/opplevelser/ny/page.tsx — FOUND, contains `Tilbudspris (NOK)`, `salePrice` state
- src/app/admin/opplevelser/[id]/page.tsx — FOUND, contains `Tilbudspris (NOK)`, `experience.salePrice / 100`
- src/components/products/ProductCard.tsx — FOUND, contains `tilbud`, `line-through`, `product.salePrice < product.price`
- src/components/experiences/ExperienceCard.tsx — FOUND, contains `hasSalePrice`, `tilbud` badge

Commits exist:
- 425f271 (Task 1) — FOUND
- 987f0d5 (Task 2) — FOUND

TypeScript: `npx tsc --noEmit` — PASSED (no output)
