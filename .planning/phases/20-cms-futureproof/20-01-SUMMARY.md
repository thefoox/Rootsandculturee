---
phase: 20-cms-futureproof
plan: "01"
subsystem: admin-cms
tags: [cms, editor, ux-safety, dirty-tracking, validation, publish-bar]
dependency_graph:
  requires: []
  provides: [cms-safety-features, publish-bar-page-type]
  affects: [src/app/admin/innhold/[pageId]/page.tsx, src/components/admin/PublishBar.tsx]
tech_stack:
  added: []
  patterns: [beforeunload-guard, json-snapshot-dirty-tracking, delete-confirm-dialog-reuse, multi-open-set-accordion]
key_files:
  created: []
  modified:
    - src/components/admin/PublishBar.tsx
    - src/app/admin/innhold/[pageId]/page.tsx
decisions:
  - "Use JSON snapshot comparison (savedStateRef + useRef) for isDirty instead of per-field flags — single source of truth, no missed fields"
  - "Reuse DeleteConfirmDialog for both section delete and unsaved-changes navigation intercept — avoids introducing a new dialog component"
  - "validateBeforeSave warns but does not block save — CMS editors need draft saves with incomplete content"
  - "Remove isPublished checkbox from page settings card — PublishBar is now the sole owner of publish state"
  - "Use setTimeout(0) after initial data load to capture savedStateRef — prevents false dirty state from React hydration ordering"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-10"
  tasks_completed: 2
  files_modified: 2
---

# Phase 20 Plan 01: CMS Safety Features, Validation, and PublishBar Summary

CMS page editor refactored with unsaved-changes protection (beforeunload + navigation intercept dialog), isDirty JSON-snapshot tracking, DeleteConfirmDialog for section delete, multi-open sections with collapse/expand all, required field asterisks, save validation warnings via toast, and PublishBar with 'page' contentType replacing the old bottom button row.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend PublishBar with 'page' contentType | a8f31fc | src/components/admin/PublishBar.tsx |
| 2 | Add safety features, validation, and PublishBar to CMS editor | 958bd3a | src/app/admin/innhold/[pageId]/page.tsx |

## What Was Built

### Task 1 — PublishBar 'page' contentType (a8f31fc)

Extended `PublishBarProps.contentType` union from `'product' | 'experience' | 'article'` to include `'page'`. Replaced the simple ternary label logic with a `labels` Record keyed by contentType, mapping `'page'` to `'Publiser side'` / `'Avpubliser side'`.

### Task 2 — CMS Editor Refactor (958bd3a)

**isDirty tracking:** `savedStateRef` captures a JSON snapshot of all editable state after initial data load (via `setTimeout(0)` to avoid hydration false-positive). A `useEffect` on all state fields compares current JSON against the snapshot and sets `isDirty`.

**beforeunload guard:** A `useEffect` guarded by `isDirty` attaches `window.addEventListener('beforeunload', handler)` with `e.preventDefault()` + `e.returnValue = ''` (required for Chrome 119+). Cleaned up on unmount or when `isDirty` becomes false.

**Navigation intercept:** `handleBack()` checks `isDirty` before `router.push`. If dirty, sets `showUnsavedDialog` state which renders a `DeleteConfirmDialog` with heading "Forkast endringer?", body text, and "Ja, forkast" / "Nei, bli her" labels.

**Section delete dialog:** Replaced `deleteConfirm: string | null` state and the inline red banner with `sectionToDelete: string | null` state driving a `DeleteConfirmDialog` with heading "Slett seksjon?". The `onDelete` prop now calls `setSectionToDelete(section.id)` instead of the old two-click inline confirm.

**Multi-open sections:** Replaced `openSection: string | null` with `openSections: Set<string>`. Added `toggleSection(id)`, `collapseAll()`, and `expandAll()`. Two buttons "Vis alle" / "Skjul alle" appear in the sections header row when `sections.length > 0`. `addSection` opens the new section by adding to the Set.

**Required field asterisks:** "Tittel *" and "Slug (URL-path) *" labels on the page settings inputs.

**Save validation:** `validateBeforeSave()` returns `string[]` of warnings for empty title, empty slug, and sections missing a heading (excluding auto-content types). Called before all three save handlers; each warning shown via `toast.warning()`. Save proceeds regardless (non-blocking).

**PublishBar integration:** Old `Button` row with "Lagre endringer" / "Tilbake" removed. New layout: inline navigation row (Tilbake button + "Vis side" link) above `PublishBar` with `contentType="page"`. Split into three handlers: `handleSaveDraft` (saves current publish state), `handlePublish` (forces `isPublished: true`), `handleUnpublish` (forces `isPublished: false`). Each handler resets `savedStateRef.current` and calls `setIsDirty(false)` on success.

**isPublished checkbox removed** from the page settings card — PublishBar is now the sole owner of publish state.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Minor Cleanup (not a deviation)

Removed `pageData` state variable and `setPageData` call that existed in the original code but was never used in the JSX. `PageContent` import retained for the `.then((data: PageContent | null))` fetch callback type annotation.

## Known Stubs

None — all functionality is fully wired. `isDirty` tracking, `beforeunload`, navigation intercept dialog, section delete dialog, collapse/expand, validation warnings, and PublishBar are all connected to real state and real save/fetch calls.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced. All saves continue through the existing `PUT /api/page-content/[pageId]` route with admin session verification.

## Self-Check: PASSED

- `src/components/admin/PublishBar.tsx` — modified, exists, commit a8f31fc verified
- `src/app/admin/innhold/[pageId]/page.tsx` — modified, exists, commit 958bd3a verified
- TypeScript: `npx tsc --noEmit` — 0 errors
- `window.addEventListener('beforeunload', handler)` present in useEffect guarded by isDirty
- `showUnsavedDialog` state drives DeleteConfirmDialog with heading "Forkast endringer?"
- `sectionToDelete` state drives DeleteConfirmDialog with heading "Slett seksjon?"
- `openSections` is `Set<string>` — old `openSection: string | null` removed
- "Vis alle" / "Skjul alle" buttons render when `sections.length > 0`
- `validateBeforeSave` function present, called before all save handlers
- `PublishBar` rendered with `contentType="page"`
- `handleSaveDraft`, `handlePublish`, `handleUnpublish` functions all present
- `savedStateRef.current` updated and `setIsDirty(false)` called in each save success branch
- Old `Button` "Lagre endringer" row removed
- `isPublished` checkbox removed from page settings card
