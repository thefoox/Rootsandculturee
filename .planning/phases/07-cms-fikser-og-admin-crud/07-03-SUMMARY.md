---
phase: 07-cms-fikser-og-admin-crud
plan: "03"
subsystem: admin-produkter
tags: [admin, produkter, varianter, crud, zod, formdata]
dependency_graph:
  requires: []
  provides: [variant-crud-admin]
  affects: [src/lib/validations.ts, src/actions/products.ts, src/app/admin/produkter/ny/page.tsx, "src/app/admin/produkter/[id]/page.tsx"]
tech_stack:
  added: []
  patterns: [inline-variant-editor, nok-to-ore-conversion, formdata-json-serialization]
key_files:
  modified:
    - src/lib/validations.ts
    - src/actions/products.ts
    - src/app/admin/produkter/ny/page.tsx
    - "src/app/admin/produkter/[id]/page.tsx"
decisions:
  - "NOK price input in UI, server action converts to ore with Math.round(v.price * 100) — consistent with mainPrice pattern"
  - "Variants rendered inline in form pages (not a separate component) to match plan spec and keep page files self-contained"
  - "Zod schema uses z.number().positive() (not .int()) for variant price to accept decimal NOK values from the form before server-side conversion"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-07T22:00:06Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 07 Plan 03: Produktvarianter i admin CRUD — Summary

Admin kan nå opprette og redigere produkter med varianter (størrelser/volum) med egne priser og lagertall, fullstendig integrert i eksisterende produktskjemaer.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Variants-støtte i productSchema og server actions | 54edda4 | src/lib/validations.ts, src/actions/products.ts |
| 2 | Inline VariantsEditor i opprett- og redigeringsskjema | 0ff995b | src/app/admin/produkter/ny/page.tsx, src/app/admin/produkter/[id]/page.tsx |

## What Was Built

### Task 1: Server-side variants support
- `productSchema` in `validations.ts` now has a `variants` array field with Zod validation: `label` (min 1 char), `price` (positive number in NOK), `inStock` (optional boolean, defaults true), `stockCount` (int min 0)
- Threat mitigations T-07-06 and T-07-07 implemented: Zod rejects invalid variant data and negative prices
- `createProduct` reads `formData.get('variants')`, JSON-parses it, passes through Zod, then maps NOK → ore before writing to Firestore
- `updateProduct` does the same for updates

### Task 2: Inline VariantsEditor UI
- Both `ny/page.tsx` and `[id]/page.tsx` have `variants` useState with shape `{ id, label, price: string, stockCount: string }`
- `[id]/page.tsx` initialises variants from `product.variants` in useEffect with ore → NOK conversion (`v.price / 100`)
- Both `submitForm` functions serialize variants as JSON into `formData.set('variants', JSON.stringify(...))`
- Variants section JSX: add/remove variant rows, each row has label (text), price (number, NOK), stockCount (number) inputs
- All inputs have associated `<label>` elements via `htmlFor`/`id` pairs (WCAG 2.1 AA)
- "Legg til variant" button with `+` icon, "Fjern" button per row with `aria-label`

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Pre-existing Issues (Out of Scope)

**`src/app/(public)/opplevelser/[slug]/page.tsx`** has 4 pre-existing TypeScript errors referencing `locationLat`/`locationLng` properties that do not exist on the `Experience` type. These are unrelated to product variants and were present before this plan. Deferred for separate fix.

## Known Stubs

None — variants are fully wired from UI through Zod validation to Firestore write/update.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced.

## Self-Check: PASSED

- FOUND: src/lib/validations.ts
- FOUND: src/actions/products.ts
- FOUND: src/app/admin/produkter/ny/page.tsx
- FOUND: src/app/admin/produkter/[id]/page.tsx
- FOUND commit: 54edda4 (Task 1)
- FOUND commit: 0ff995b (Task 2)
