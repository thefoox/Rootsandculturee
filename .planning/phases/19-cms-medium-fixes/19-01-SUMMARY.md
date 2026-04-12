---
phase: 19-cms-medium-fixes
plan: "01"
subsystem: cms-mappers
tags: [refactoring, types, mappers, deduplication]
dependency_graph:
  requires: []
  provides: [shared-mappers, action-result-type]
  affects: [products-crud, articles-crud, experiences-crud, page-content-data]
tech_stack:
  added: []
  patterns: [shared-mapper-modules, generic-action-result-type]
key_files:
  created:
    - src/lib/mappers/products.ts
    - src/lib/mappers/articles.ts
    - src/lib/mappers/experiences.ts
    - src/lib/mappers/page-content.ts
  modified:
    - src/types/index.ts
    - src/actions/products.ts
    - src/actions/articles.ts
    - src/actions/experiences.ts
    - src/lib/data/products.ts
    - src/lib/data/articles.ts
    - src/lib/data/experiences.ts
    - src/lib/data/page-content.ts
decisions:
  - "Mapper functions use data layer versions (with `as Date` casts) as canonical source"
  - "ActionResult<T> uses intersection types for success variant to support both void and data returns"
  - "Mapper modules are pure (no 'use server' or 'server-only') for universal import"
metrics:
  duration: 5min
  completed: 2026-04-12
  tasks: 2
  files: 12
---

# Phase 19 Plan 01: Deduplicate Mappers and Standardize ActionResult Summary

Shared mapper modules in src/lib/mappers/ eliminate 8 duplicate Firestore-to-type mapping functions, and ActionResult<T> generic type standardizes CRUD action return shapes across products, articles, and experiences.

## What Was Done

### Task 1: Create shared mapper modules and ActionResult type (9494c9d)
- Added `ActionResult<T>` generic type to `src/types/index.ts` supporting both void and data-bearing success variants, plus optional `error`/`errors` for failure
- Created 4 mapper modules in `src/lib/mappers/`:
  - `products.ts` -- exports `mapProduct(doc) -> Product`
  - `articles.ts` -- exports `mapArticle(doc) -> Article`
  - `experiences.ts` -- exports `mapExperience(doc) -> Experience` and `mapExperienceDate(doc) -> ExperienceDate`
  - `page-content.ts` -- exports `mapPageContent(doc) -> PageContent`
- All mapper modules are pure data transformation (no server directives)

### Task 2: Rewire consumers and remove duplicates (aa0b8a7)
- Removed local `mapProduct` from `src/actions/products.ts` and `src/lib/data/products.ts`
- Removed local `mapArticle` from `src/actions/articles.ts` and `src/lib/data/articles.ts`
- Removed local `mapExperience` + `mapExperienceDate` from `src/actions/experiences.ts` and `src/lib/data/experiences.ts`
- Removed local `mapPageContent` from `src/lib/data/page-content.ts`
- All 7 consumer files now import from `src/lib/mappers/`
- Added `ActionResult` return type annotations to 9 CRUD functions (create/update/delete for products, articles, experiences)
- Changed create actions to return `{ success: true, data: { id } }` instead of `{ success: true, id }`

**Net result:** -218 lines removed, +22 lines added across consumer files. 8 duplicate functions eliminated.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing type imports after mapper extraction**
- **Found during:** Task 2
- **Issue:** When replacing the import blocks that contained both `import type { Product }` and `import type { FirestoreDoc }`, the Product/Article/Experience/ExperienceDate type imports were lost since actions files still reference them in function signatures
- **Fix:** Added type imports back alongside ActionResult: `import type { ActionResult, Product } from '@/types'`
- **Files modified:** src/actions/products.ts, src/actions/articles.ts, src/actions/experiences.ts
- **Commit:** aa0b8a7

## Verification

- No duplicate mapper definitions outside `src/lib/mappers/` (grep verified)
- All 7 consumer files import from shared mappers (grep verified)
- ActionResult type used in all 3 action files (grep verified)
- TypeScript compilation: no new errors introduced (24 pre-existing revalidateTag TS2554 errors remain -- these are unrelated Next.js 16 two-argument requirement)

## Self-Check: PASSED

All 12 files verified present. Both commits (9494c9d, aa0b8a7) verified in git history.
