---
phase: 20-cms-futureproof
plan: 02
subsystem: ui
tags: [react, cms, dnd-kit, lucide-react, autosave, modal, accessibility]

requires:
  - phase: 20-cms-futureproof/20-01
    provides: isDirty tracking, savedStateRef, PublishBar, DeleteConfirmDialog, openSections Set, handleSaveDraft/handlePublish functions

provides:
  - SectionTypePicker modal component with 5 groups and all 20 section types
  - duplicateSection function (deep clone with new UUID, inserts after original)
  - Autosave with 30s debounce when isDirty, lastSaved indicator (nb-NO time format)
  - Item reorder via up/down arrow buttons per item with disabled states
  - Character counts on heading and subheading fields

affects: [20-cms-futureproof, admin-cms]

tech-stack:
  added: []
  patterns:
    - "SectionTypePicker modal: fixed overlay z-[300], role=dialog, aria-modal, Escape key handler, focus on open"
    - "Autosave: useRef timer + useEffect with 30s debounce, silent fail, clears on unmount"
    - "Item reorder: up/down button pattern (accessible alternative to nested DnD)"

key-files:
  created:
    - src/components/admin/SectionTypePicker.tsx
  modified:
    - src/app/admin/innhold/[pageId]/page.tsx

key-decisions:
  - "Used up/down buttons for item reorder instead of nested DnD — @dnd-kit nested DndContext has known event propagation issues; buttons are simpler and more accessible"
  - "SectionTypePicker calls onClose() itself after onSelect — keeps picker self-contained; parent addSection no longer manages picker state"
  - "Removed ALL_SECTION_TYPES constant — no longer needed after replacing flat dropdown with modal"
  - "Autosave silently fails on network error — user can still manually save; avoids surprising error toasts during background operation"

requirements-completed:
  - CMS-FP-08
  - CMS-FP-09
  - CMS-FP-10
  - CMS-FP-11
  - CMS-FP-12

duration: 25min
completed: 2026-04-10
---

# Phase 20 Plan 02: CMS UX Productivity Features Summary

**Grouped section type picker modal, section duplication, 30s autosave with indicator, item up/down reorder buttons, and live character counts on heading/subheading fields**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-10T00:00:00Z
- **Completed:** 2026-04-10T00:25:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `SectionTypePicker` modal component with 5 grouped categories, lucide icons, descriptions, WCAG-compliant dialog role, Escape key handler, and backdrop-click dismiss
- Added duplicate section button (Copy icon) in each section header — deep-clones section with new UUID and inserts immediately after original
- Autosave fires 30 seconds after last change when form is dirty, clears on unmount (T-20-03 mitigation), shows "Sist lagret: HH:MM" timestamp on success
- Item reorder via triangle up/down buttons per item with correct disabled states at boundaries
- Character count ("N tegn") displays below heading Input and subheading textarea for all sections

## Task Commits

1. **Task 1: Create SectionTypePicker modal component** - `5b35b6e` (feat)
2. **Task 2: Add duplicate, type picker, autosave, item reorder, char counts to editor** - `081aff6` (feat)

## Files Created/Modified

- `src/components/admin/SectionTypePicker.tsx` — New modal component: 5 section type groups, 20 types total, lucide icons, WCAG dialog pattern
- `src/app/admin/innhold/[pageId]/page.tsx` — Added SectionTypePicker import, Copy icon, duplicate/moveItemUp/moveItemDown functions, autosave useEffect, lastSaved state, char count displays, replaced flat dropdown with modal trigger

## Decisions Made

- Used up/down arrow buttons for item reorder instead of nested @dnd-kit DnD — `@dnd-kit` nested `DndContext` has documented event propagation issues (inner drag events bubble to outer); button-based reorder is simpler, more accessible, and covers the use case cleanly.
- `SectionTypePicker` calls both `onSelect(type)` and `onClose()` on selection — keeps the component self-contained. The parent `addSection` no longer needs to manage picker visibility.
- Autosave silently fails on network error (no error toast) — avoids surprising the editor during background save; manual save is always available.
- Removed the now-unused `ALL_SECTION_TYPES` constant after replacing the flat dropdown with the modal.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all features are fully wired.

## Threat Flags

None - autosave uses the same PUT `/api/page-content/${pageId}` endpoint with existing admin auth check (T-20-03 mitigated via 30s debounce + `isDirty` guard + timer cleanup on unmount).

## Next Phase Readiness

- Wave 2 productivity features complete
- CMS editor now has: unsaved-changes guard (20-01), delete confirmation (20-01), validation (20-01), PublishBar (20-01), collapse/expand all (20-01), duplicate sections (20-02), grouped type picker (20-02), autosave (20-02), item reorder (20-02), character counts (20-02)
- Plan 20-03 (Tiptap link/image modals, version history) can proceed independently if desired

---
*Phase: 20-cms-futureproof*
*Completed: 2026-04-10*

## Self-Check: PASSED

- FOUND: src/components/admin/SectionTypePicker.tsx
- FOUND: src/app/admin/innhold/[pageId]/page.tsx
- FOUND: .planning/phases/20-cms-futureproof/20-02-SUMMARY.md
- FOUND: commit 5b35b6e (Task 1)
- FOUND: commit 081aff6 (Task 2)
