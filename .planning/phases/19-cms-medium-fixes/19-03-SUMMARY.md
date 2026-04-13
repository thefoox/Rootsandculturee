---
phase: 19-cms-medium-fixes
plan: "03"
subsystem: cms-data-quality
tags: [slug-validation, cache-cleanup, legacy-removal, section-defaults, firestore-indexes]
dependency_graph:
  requires: [19-01]
  provides: [slug-uniqueness, clean-cache-strategy, complete-section-defaults]
  affects: [src/actions/products.ts, src/actions/articles.ts, src/actions/experiences.ts, src/lib/data/page-content.ts, src/lib/data/products.ts, src/lib/data/articles.ts, src/lib/data/experiences.ts, src/types/index.ts, src/lib/validations.ts, src/app/admin/innhold/[pageId]/page.tsx, firestore.indexes.json]
tech_stack:
  added: []
  patterns: [slug-uniqueness-check-before-write, error-return-over-mock-fallback]
key_files:
  created: []
  modified:
    - src/actions/products.ts
    - src/actions/articles.ts
    - src/actions/experiences.ts
    - src/lib/data/page-content.ts
    - src/lib/data/products.ts
    - src/lib/data/articles.ts
    - src/lib/data/experiences.ts
    - src/types/index.ts
    - src/lib/validations.ts
    - src/app/admin/innhold/[pageId]/page.tsx
    - firestore.indexes.json
  deleted:
    - src/lib/data/site-content.ts
    - src/actions/site-content.ts
    - src/lib/data/mock-data.ts
decisions:
  - "Slug uniqueness uses best-effort Firestore query (TOCTOU acceptable for single-admin CMS)"
  - "Mock data removed entirely rather than kept as optional fallback -- production errors should surface, not be masked"
  - "siteContentSchema removed from validations since only consumer was deleted actions/site-content.ts"
metrics:
  duration: 4min
  completed: 2026-04-13
  tasks_completed: 2
  tasks_total: 2
  files_modified: 11
  files_deleted: 3
---

# Phase 19 Plan 03: Slug Uniqueness, Cache Cleanup, Section Defaults, Legacy Removal

Slug uniqueness validation on all 6 create/update actions, mock data fallbacks replaced with proper error returns, SiteContent legacy system fully removed, section defaults completed for all 20 types, Firestore composite index added for pageContent navigation query.

## What Was Done

### Task 1: Slug Uniqueness Validation + Variant Price Minimum
**Commit:** 36a3227

- Added Firestore slug uniqueness query before write in `createProduct`, `updateProduct`, `createArticle`, `updateArticle`, `createExperience`, `updateExperience`
- Update actions exclude current document ID from uniqueness check to allow saving without slug change
- Norwegian error message: "Denne URL-adressen er allerede i bruk. Velg en annen."
- Added `.min(0.01, 'Prisen ma vaere minst 0,01 kr.')` to variant price schema to catch sub-ore values

### Task 2: Cache Cleanup, SiteContent Removal, Section Defaults, Indexes
**Commit:** bae93ac

**Cache strategy cleanup:**
- Removed all mock data fallbacks from page-content.ts, products.ts, articles.ts, experiences.ts
- Catch blocks now return `null` or `[]` with `console.error` logging instead of mock data
- Removed `getMockNavigationPages` helper function
- Cache strategy remains correct: `unstable_cache` with `{ revalidate: 60/3600, tags: [...] }`

**SiteContent legacy removal:**
- Deleted `src/lib/data/site-content.ts` (data layer)
- Deleted `src/actions/site-content.ts` (server actions)
- Deleted `src/lib/data/mock-data.ts` (zero remaining consumers)
- Removed `SiteContent` interface from `src/types/index.ts` (replaced with comment)
- Removed `siteContentSchema` from `src/lib/validations.ts` (replaced with comment)

**Complete section defaults:**
- Rewrote `createDefaultSection` in page editor with organized field groups
- Added: hero `body`, `ctaSecondaryText`, `ctaSecondaryLink`, `image`
- Added: text-image `imagePosition: 'right'` default
- Added: `cta` and `video` `body` field
- Removed duplicate body assignment and redundant newsletter CTA block

**Firestore indexes:**
- Added composite index for `pageContent` collection: `showInNavigation` + `navigationOrder` (used by navigation query)

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **Mock data file deleted entirely** -- After removing all mock imports from data layer files, mock-data.ts had zero consumers. Deleted rather than keeping dead code.
2. **siteContentSchema removed** -- Only consumer was the deleted actions/site-content.ts. Removed to avoid dead exports.
3. **Slug uniqueness is best-effort** -- Firestore has no native unique constraint. The check-then-write pattern has a TOCTOU window, but this is acceptable for a single-admin CMS (per threat model T-19-03).

## Verification Results

- All 6 create/update actions contain slug uniqueness checks (2 matches per file)
- Zero mock data imports in data layer files
- site-content.ts, actions/site-content.ts, mock-data.ts all deleted
- SiteContent in types/index.ts is only a comment
- Section defaults include ctaSecondaryText and imagePosition: 'right'
- firestore.indexes.json contains pageContent composite index
- TypeScript: 23 pre-existing errors (all revalidateTag arity -- Next.js 16 issue), zero new errors

## Self-Check: PASSED

All 11 modified files exist, all 3 deleted files confirmed removed, both commit hashes (36a3227, bae93ac) found in git log.
