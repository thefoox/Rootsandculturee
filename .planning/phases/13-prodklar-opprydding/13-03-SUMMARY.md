---
phase: 13-prodklar-opprydding
plan: "03"
subsystem: error-boundaries, env-validation, data-layer, stripe
tags: [error-boundary, loading-skeleton, stripe, env, firestore, mock-data, wcag]
dependency_graph:
  requires: []
  provides:
    - checkout/error.tsx error boundary
    - checkout/loading.tsx skeleton
    - konto/bookinger/loading.tsx skeleton
    - konto/ordrer/loading.tsx skeleton
    - Stripe apiVersion pinned
    - RESEND_API_KEY required in production
    - Firestore stats query capped at 500
    - Production mock data guard in experiences.ts and products.ts
    - Safe email fallback in ConfirmationModal
  affects:
    - src/lib/stripe/server.ts
    - src/lib/env.ts
    - src/actions/orders.ts
    - src/lib/data/experiences.ts
    - src/lib/data/products.ts
    - src/components/checkout/ConfirmationModal.tsx
    - src/app/(public)/checkout/page.tsx
tech_stack:
  added: []
  patterns:
    - Next.js error boundary (use client + Error + reset props)
    - Next.js loading.tsx skeleton with motion-safe:animate-spin
    - Production NODE_ENV guard before mock data fallback
key_files:
  created:
    - src/app/(public)/checkout/error.tsx
    - src/app/(public)/checkout/loading.tsx
    - src/app/konto/bookinger/loading.tsx
    - src/app/konto/ordrer/loading.tsx
  modified:
    - src/lib/stripe/server.ts
    - src/lib/env.ts
    - src/actions/orders.ts
    - src/lib/data/experiences.ts
    - src/lib/data/products.ts
    - src/components/checkout/ConfirmationModal.tsx
    - src/app/(public)/checkout/page.tsx
decisions:
  - "Use Stripe SDK's installed LatestApiVersion '2026-03-25.dahlia' rather than the plan's '2024-12-18.acacia' — the installed stripe@21.0.1 only accepts its own LatestApiVersion type"
  - "om-oss team section placeholder fix is a no-op — page was already migrated to DynamicPage (CMS-driven), no TEAM array exists in source"
  - "Production guard applied to getProductsByCategory in addition to the plan's specified getProducts and getProductBySlug — all three functions return mock catalogue data"
metrics:
  duration: "~12 minutes"
  completed: "2026-04-07"
  tasks_completed: 3
  tasks_total: 3
  files_created: 4
  files_modified: 7
---

# Phase 13 Plan 03: Polish and Operational Safety Fixes Summary

Polish and operational safety: error/loading boundaries, Stripe version pinning, env startup validation, Firestore query cap, production mock data guard, and safe email fallback in confirmation modal.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add error.tsx and loading.tsx for checkout and konto sub-routes | e6923c8 | checkout/error.tsx, checkout/loading.tsx, bookinger/loading.tsx, ordrer/loading.tsx |
| 2 | Pin Stripe API version, fix env validation, cap stats query | aca3f2f | stripe/server.ts, env.ts, actions/orders.ts |
| 3 | Fix email fallback and mock data production guard | 1a36b24 | checkout/page.tsx, ConfirmationModal.tsx, experiences.ts, products.ts |

## What Was Built

**Task 1 — Error/loading boundaries**

Four Next.js route files created following existing project patterns:

- `src/app/(public)/checkout/error.tsx` — checkout-specific error boundary with `'use client'`, Norwegian payment error message ("Noe gikk galt i kassen"), and retry button. Preserves the page rather than redirecting away, so the cart/client secret are not lost.
- `src/app/(public)/checkout/loading.tsx` — spinner skeleton for checkout suspense phase.
- `src/app/konto/bookinger/loading.tsx` — spinner skeleton matching the existing `konto/loading.tsx` pattern.
- `src/app/konto/ordrer/loading.tsx` — same spinner skeleton.

All spinners use `motion-safe:animate-spin` per the project's WCAG motion convention.

**Task 2 — Stripe pinning, env validation, stats cap**

- `src/lib/stripe/server.ts`: Added `apiVersion: '2026-03-25.dahlia'` to the Stripe constructor. The installed `stripe@21.0.1` uses `'2026-03-25.dahlia'` as its `LatestApiVersion` (the plan specified `'2024-12-18.acacia'` which is from an older SDK — see Deviations).
- `src/lib/env.ts`: Moved `RESEND_API_KEY` from the optional-warn list to the production-required list. Added `RESEND_FROM_EMAIL` to the optional warnings list. Removed `RESEND_API_KEY` from optional (was previously only warning).
- `src/actions/orders.ts`: Added `.orderBy('createdAt', 'desc').limit(500)` to `getFirestoreOrderStats` to prevent unbounded full-collection scan. Added comment noting Stripe list cap in `getStripeOrderStats`.

**Task 3 — Email fallback and mock data guard**

- `src/app/(public)/checkout/page.tsx`: Changed `customerEmail || 'kunde@example.com'` to `customerEmail || ''`.
- `src/components/checkout/ConfirmationModal.tsx`: Updated email notice to show `"Vi har sendt en bekreftelse til din e-postadresse."` when `customerEmail` is empty, instead of displaying a blank or placeholder address.
- `src/lib/data/experiences.ts`: Added `NODE_ENV === 'production'` throw guard to `getExperiences`, `getExperienceBySlug`, `getExperienceDates`.
- `src/lib/data/products.ts`: Added same guard to `getProducts`, `getProductsByCategory`, `getProductBySlug`.

The om-oss team section (CONCERNS.md LOW concern) was already resolved — the page was migrated to `DynamicPage` (CMS-driven) in a prior phase. No `TEAM` array or `'Navn Navnesen'` strings exist anywhere in the codebase.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written with one noted adaptation.

### Adaptations

**1. Stripe apiVersion adjusted to match installed SDK**
- **Found during:** Task 2
- **Issue:** Plan specified `apiVersion: '2024-12-18.acacia'` but the installed `stripe@21.0.1` defines `LatestApiVersion = '2026-03-25.dahlia'`. Using the plan's version would cause a TypeScript type error since the SDK's `apiVersion` option is typed as `LatestApiVersion` only.
- **Fix:** Used `'2026-03-25.dahlia'` — the actual version from the installed package.
- **Files modified:** `src/lib/stripe/server.ts`
- **Commit:** aca3f2f

**2. om-oss team section — already resolved**
- **Found during:** Task 3
- **Issue:** Plan called for hiding a TEAM array with placeholder names, but the page was already migrated to `DynamicPage` (CMS-driven content) in a prior phase. No TEAM array or placeholder names exist in source.
- **Fix:** No action needed. Confirmed with `grep -rn "Navn Navnesen" src/` returning nothing.

## Known Stubs

None — all changes wire real behavior. The mock data fallback is preserved for local dev (NODE_ENV !== 'production') and intentionally so.

## Threat Surface Scan

All mitigations from the plan's threat register were applied:

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-13-14 | Production throw guard in experiences.ts and products.ts |
| T-13-15 | .limit(500) + .orderBy() added to getFirestoreOrderStats |
| T-13-16 | No-op — team section already removed from om-oss (CMS migration) |
| T-13-17 | Empty string fallback + generic message in ConfirmationModal |
| T-13-18 | apiVersion pinned in Stripe constructor |
| T-13-19 | RESEND_API_KEY required in production validateEnv |

No new threat surface introduced by this plan.

## Deferred Issues

Pre-existing TypeScript errors (not caused by this plan):
- `src/app/(public)/opplevelser/[slug]/page.tsx` lines 274, 283: `TS2551 Property 'locationLat'/'locationLng' does not exist on type 'Experience'` — present before this plan, unrelated to files modified here.

## Self-Check: PASSED
