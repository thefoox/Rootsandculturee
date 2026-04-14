---
phase: 21-admin-robusthet
plan: "02"
subsystem: admin-components
tags: [validation, ux, security, tiptap, forms]
dependency_graph:
  requires: []
  provides: [alt-text-validation, future-date-constraints, character-count, deactivation-confirmation]
  affects: [ImageUpload, DateSlotsEditor, TiptapEditor, admin-gavekort]
tech_stack:
  added: ["@tiptap/extension-character-count@3.22.3"]
  patterns: [confirmation-dialog, html-sanitization, html-min-max-constraints]
key_files:
  created: []
  modified:
    - src/components/admin/ImageUpload.tsx
    - src/components/admin/DateSlotsEditor.tsx
    - src/components/admin/TiptapEditor.tsx
    - src/app/admin/gavekort/page.tsx
decisions:
  - "Used DeleteConfirmDialog (existing component) for deactivation UX rather than a new modal"
  - "CharacterCount limit set to 50000 chars as default; configurable via maxLength prop"
  - "transformPastedHTML strips style, event handlers, and script tags to mitigate T-21-03"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 21 Plan 02: Admin Validation Bug Fixes Summary

**One-liner:** Fixed four silent validation failures in shared admin components — alt-text error display, future-date constraints on date slots, TipTap character count with paste sanitization, and gift card deactivation confirmation dialog.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ImageUpload alt-text + DateSlotsEditor date constraints | 0d906f7 | ImageUpload.tsx, DateSlotsEditor.tsx |
| 2 | TipTap character count + gift card deactivation confirmation | a464a7d | TiptapEditor.tsx, gavekort/page.tsx, package.json |

## What Was Built

### Task 1: ImageUpload + DateSlotsEditor

**ImageUpload alt-text validation** (`src/components/admin/ImageUpload.tsx`):
- The `error` prop on the alt-text Input always returned `undefined` (both branches of a ternary returned `undefined`).
- Fixed: `!img.alt ? 'Alt-tekst er pakrevd.' : undefined` — now shows the error when alt is empty or undefined.

**DateSlotsEditor future-date constraints** (`src/components/admin/DateSlotsEditor.tsx`):
- Added `const today = new Date().toISOString().split('T')[0]` inside the component.
- Event date input: added `min={today}` to prevent past date selection.
- Earlybird deadline input: added `min={today}` and `max={slot.date || undefined}` so the deadline is always in the future and before the event date.
- Earlybird price input: changed from `type="text"` with `inputMode="numeric"` to `type="number"` with `min={0}` for proper HTML validation.

### Task 2: TiptapEditor + Gavekort Deactivation

**TipTap character count** (`src/components/admin/TiptapEditor.tsx`):
- Installed `@tiptap/extension-character-count@3.22.3`.
- Added `CharacterCount` extension with configurable `limit` (via `maxLength` prop, default 50000).
- Character count display shown below editor: "X / 50 000 tegn", turns red when above 90% of limit.
- Added `transformPastedHTML` to `editorProps` to strip `style` attributes, event handlers (`on*`), and `<script>` tags from pasted HTML (mitigates T-21-03).
- `maxLength` is an optional prop with default 50000; interface updated accordingly.

**Gift card deactivation confirmation** (`src/app/admin/gavekort/page.tsx`):
- Added `deactivateTarget: GiftCard | null` and `isDeactivating: boolean` state.
- `handleDeactivate` now takes no parameters; reads from `deactivateTarget` state.
- Deaktiver button now calls `setDeactivateTarget(gc)` to open the dialog.
- `DeleteConfirmDialog` rendered at JSX end with Norwegian labels: heading "Deaktiver gavekort?", confirmLabel "Ja, deaktiver", cancelLabel "Nei, behold".

## Deviations from Plan

None — plan executed exactly as written.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|-----------|
| T-21-03 | `transformPastedHTML` strips `style` attrs, `on*` event handlers, `<script>` tags |
| T-21-05 | `DeleteConfirmDialog` prevents accidental gift card deactivation |

## Known Stubs

None — all implementations are fully wired.

## Self-Check: PASSED

- `src/components/admin/ImageUpload.tsx` — contains "Alt-tekst er pakrevd." ✓
- `src/components/admin/DateSlotsEditor.tsx` — contains `min={today}` (2 occurrences) ✓
- `src/components/admin/TiptapEditor.tsx` — contains `CharacterCount` import and usage ✓
- `src/app/admin/gavekort/page.tsx` — contains `DeleteConfirmDialog` import and render ✓
- Commits `0d906f7` and `a464a7d` exist in git log ✓
- `npx tsc --noEmit` passes with no errors ✓
