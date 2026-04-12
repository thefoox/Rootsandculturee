---
phase: 18-cms-revisjon
plan: "02"
title: "Page Content API Auth + Validation"
subsystem: cms-api
tags: [security, validation, zod, api]
dependency_graph:
  requires: []
  provides: [page-content-auth, page-content-validation]
  affects: [admin-cms-pages]
tech_stack:
  added: []
  patterns: [zod-safeParse-validation, verifySession-admin-guard]
key_files:
  created: []
  modified:
    - src/lib/validations.ts
    - src/app/api/page-content/route.ts
    - src/app/api/page-content/[pageId]/route.ts
decisions:
  - "Used Zod v4 message param instead of errorMap for z.enum error customization"
metrics:
  duration: "2min 20s"
  completed: "2026-04-12T19:25:12Z"
  tasks: 2
  files: 3
---

# Phase 18 Plan 02: Page Content API Auth + Validation Summary

Admin authentication added to page-content GET endpoints and Zod schemas added for POST/PUT validation, closing the two biggest CMS API security/integrity gaps.

## What Was Done

### Task 1: Add Zod schemas for page content (95803d2)

Added three new Zod schemas to `src/lib/validations.ts`:

- `pageSectionSchema` - validates section structure with type-safe enum for all 20 SectionType values, optional fields for heading, body, image, items, etc.
- `pageContentCreateSchema` - validates POST requests (title + slug with regex `/^[a-z0-9-/]+$/`)
- `pageContentUpdateSchema` - validates PUT requests (full page data: title, slug, isPublished, showInNavigation, navigationOrder, sections array)

### Task 2: Add auth to GET + Zod validation to POST/PUT (5774ddc)

**`src/app/api/page-content/route.ts`:**
- Added `verifySession()` admin check to GET handler (was completely unauthenticated)
- Replaced manual `if (!title || !slug)` check with `pageContentCreateSchema.safeParse(body)` in POST
- Removed `mockPageContent` import and fallback - errors now return proper HTTP 500

**`src/app/api/page-content/[pageId]/route.ts`:**
- Added `verifySession()` admin check to GET handler (was completely unauthenticated)
- Replaced raw body destructuring with `pageContentUpdateSchema.safeParse(body)` in PUT
- Removed `mockPageContent` import - missing docs return 404, errors return 500

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod v4 enum error parameter syntax**
- **Found during:** Task 1 (verified in Task 2 type check)
- **Issue:** Plan specified `{ errorMap: () => ({ message: '...' }) }` for `z.enum()`, but Zod v4 uses `{ message: '...' }` directly
- **Fix:** Changed to `z.enum(sectionTypeValues, { message: 'Ugyldig seksjonstype.' })`
- **Files modified:** src/lib/validations.ts
- **Commit:** 5774ddc

## Threat Mitigations Applied

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-18-06 | Mitigated | verifySession + admin role check added to both GET handlers |
| T-18-07 | Mitigated | pageContentUpdateSchema.safeParse before Firestore write in PUT |
| T-18-08 | Mitigated | pageContentCreateSchema.safeParse replaces manual check in POST |
| T-18-09 | Mitigated | Mock data fallbacks removed, proper HTTP error responses returned |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 95803d2 | Add Zod schemas for page content validation |
| 2 | 5774ddc | Add auth to GET handlers and Zod validation to POST/PUT |

## Self-Check: PASSED
