---
phase: 21-admin-robusthet
plan: 01
subsystem: admin-forms
tags: [forms, ux, error-handling, beforeunload, data-loss-prevention]
dependency_graph:
  requires: []
  provides: [unsaved-changes-guard, safe-delete-actions]
  affects: [admin-produkter, admin-opplevelser, admin-artikler]
tech_stack:
  added: []
  patterns: [beforeunload-guard, mounted-ref-pattern, loaded-ref-pattern, try-catch-server-action]
key_files:
  created: []
  modified:
    - src/app/admin/produkter/ny/page.tsx
    - src/app/admin/produkter/[id]/page.tsx
    - src/app/admin/opplevelser/ny/page.tsx
    - src/app/admin/opplevelser/[id]/page.tsx
    - src/app/admin/artikler/ny/page.tsx
    - src/app/admin/artikler/[id]/page.tsx
    - src/actions/products.ts
    - src/actions/experiences.ts
    - src/actions/articles.ts
decisions:
  - "Used mounted ref (create pages) vs loaded ref (edit pages) to distinguish first-render skip from data-hydration skip"
  - "setIsDirty(false) called at top of submitForm to prevent browser dialog on successful save navigation"
  - "handleUnpublish in artikler/[id] also gets setIsDirty(false) since it mutates state and may navigate"
metrics:
  duration: ~10min
  completed: 2026-04-14T11:29:11Z
  tasks_completed: 2
  files_modified: 9
---

# Phase 21 Plan 01: Admin Form Safety Summary

Browser-native beforeunload guards on all 6 admin create/edit forms and try/catch error handling on all 3 delete server actions, preventing data loss and unhandled Firestore crashes.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add beforeunload guard to all 6 create/edit pages | 231e07c |
| 2 | Wrap all delete actions in try/catch | b65f0f6 |

## What Was Built

**Task 1 — beforeunload guard (6 files):**

All 6 admin CRUD pages now track form dirtiness and warn before unload:

- **Create pages** (`produkter/ny`, `opplevelser/ny`, `artikler/ny`): use `mounted` ref to skip first render, then set `isDirty=true` on any state change via a dependency-array useEffect.
- **Edit pages** (`produkter/[id]`, `opplevelser/[id]`, `artikler/[id]`): use `loaded` ref set to `true` after data-loading `.then()` completes, so the dirty-tracker ignores initial hydration.
- All 6 pages share the same `beforeunload` useEffect pattern that registers/deregisters the handler based on `isDirty`.
- `setIsDirty(false)` is called at the top of `submitForm` (and `handleUnpublish` in artikler/[id]) so successful saves don't trigger the dialog on navigation.
- `artikler/[id]` now shows `toast.error('Artikkelen ble ikke funnet.')` before redirecting when article is not found.

**Task 2 — try/catch on delete actions (3 files):**

- `deleteProduct`: wrapped Firestore delete in try/catch, returns `{ success: false, error: 'Kunne ikke slette produktet. Prov igjen.' }` on failure.
- `deleteExperience`: wrapped entire subcollection+doc delete in try/catch, returns Norwegian error on failure.
- `deleteArticle`: wrapped Firestore delete in try/catch, returns Norwegian error on failure.
- All 3 include `console.error` with descriptive prefix for server-side logging.

## Verification Results

```
beforeunload matches: 12 (2 per page × 6 pages)
products.ts try blocks: 7 (create, update, delete + others)
experiences.ts try blocks: 7
articles.ts try blocks: 5
artikler/[id] error toast: present
TypeScript: clean (0 errors)
```

## Deviations from Plan

**1. [Rule 2 - Missing critical functionality] Added setIsDirty(false) to handleUnpublish**
- **Found during:** Task 1, artikler/[id]
- **Issue:** The `handleUnpublish` function sets state and then the user stays on the page — if they later navigate, the browser dialog would fire even after a successful unpublish action. Adding `setIsDirty(false)` at the top prevents a spurious confirmation after a save operation.
- **Fix:** Added `setIsDirty(false)` at the top of `handleUnpublish`.
- **Files modified:** `src/app/admin/artikler/[id]/page.tsx`
- **Commit:** 231e07c

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

Files exist:
- `src/app/admin/produkter/ny/page.tsx` — FOUND
- `src/app/admin/produkter/[id]/page.tsx` — FOUND
- `src/app/admin/opplevelser/ny/page.tsx` — FOUND
- `src/app/admin/opplevelser/[id]/page.tsx` — FOUND
- `src/app/admin/artikler/ny/page.tsx` — FOUND
- `src/app/admin/artikler/[id]/page.tsx` — FOUND
- `src/actions/products.ts` — FOUND
- `src/actions/experiences.ts` — FOUND
- `src/actions/articles.ts` — FOUND

Commits exist:
- 231e07c — FOUND (feat(21-01): add beforeunload guard)
- b65f0f6 — FOUND (fix(21-01): wrap all 3 delete server actions)
