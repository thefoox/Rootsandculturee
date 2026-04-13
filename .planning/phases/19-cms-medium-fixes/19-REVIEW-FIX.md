---
phase: 19-cms-medium-fixes
fixed_at: 2026-04-12T14:45:00Z
review_path: .planning/phases/19-cms-medium-fixes/19-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 19: Code Review Fix Report

**Fixed at:** 2026-04-12T14:45:00Z
**Source review:** .planning/phases/19-cms-medium-fixes/19-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 6
- Skipped: 0

## Fixed Issues

### CR-01: pageSectionSchema strips ctaSecondaryText, ctaSecondaryLink, and SectionItem.href on save

**Files modified:** `src/lib/validations.ts`
**Commit:** 21745a7
**Applied fix:** Added three missing fields to the `pageSectionSchema` Zod schema: `ctaSecondaryText` (optional string), `ctaSecondaryLink` (optional string) at the section level, and `href` (optional string) in the items array object. This prevents Zod from silently stripping these CMS fields on save.

### WR-01: updateArticle / updateExperience / updateProduct Firestore writes not wrapped in try/catch

**Files modified:** `src/actions/articles.ts`, `src/actions/experiences.ts`, `src/actions/products.ts`
**Commit:** 0d102f5
**Applied fix:** Wrapped the Firestore `.update()` calls and subsequent `revalidateTag()` in try/catch blocks for all three update functions. On failure, they now return structured `{ success: false, errors: { _form: '...' } }` responses with Norwegian error messages, consistent with the existing `createArticle` pattern.

### WR-02: createExperience and createProduct Firestore writes not wrapped in try/catch

**Files modified:** `src/actions/experiences.ts`, `src/actions/products.ts`
**Commit:** 03a4da8
**Applied fix:** Wrapped the Firestore `.add()` calls (and batch operations for experience dates) in try/catch blocks for both create functions. On failure, they return structured `ActionResult` error responses with Norwegian messages, matching the `createArticle` pattern.

### WR-03: Inconsistent unpublish behavior between articles and experiences

**Files modified:** `src/actions/experiences.ts`, `src/actions/products.ts`
**Commit:** 7f2db38
**Status:** fixed: requires human verification
**Applied fix:** Changed both `updateExperience` and `updateProduct` to preserve the original `publishedAt` date on unpublish (matching the article pattern). Previously, unpublishing cleared `publishedAt` to `null`, losing the original publish date. Now all three entity types use the same logic: `(existing.publishedAt instanceof Date ? existing.publishedAt : null)` when `publish` is false.

### WR-04: getAllArticles / getAllExperiences / getAllProducts exposed as server actions without auth

**Files modified:** `src/actions/articles.ts`, `src/actions/experiences.ts`, `src/actions/products.ts`
**Commit:** 44db0e6
**Applied fix:** Added `verifySession()` admin auth checks to all three `getAll*` functions. Non-admin callers now receive an empty array `[]` instead of all items (including drafts). This prevents unauthenticated users from calling these server actions directly to access unpublished content.

### WR-05: getExperienceDatesAdmin exposed without auth check

**Files modified:** `src/actions/experiences.ts`
**Commit:** ff8a67e
**Applied fix:** Added `verifySession()` admin auth check to `getExperienceDatesAdmin`. Non-admin callers now receive an empty array instead of all experience dates with booking capacity data.

## Skipped Issues

None -- all in-scope findings were fixed.

---

_Fixed: 2026-04-12T14:45:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
