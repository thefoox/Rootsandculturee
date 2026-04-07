---
phase: 06-admin-qa-og-feilsider
plan: 02
subsystem: admin-forms
tags: [scroll-to-error, toast, ux, admin, forms]
dependency_graph:
  requires: []
  provides:
    - scroll-to-first-error in all three admin create-forms
    - toast.error for _form errors in all three admin create-forms
  affects:
    - src/app/admin/produkter/ny/page.tsx
    - src/app/admin/opplevelser/ny/page.tsx
    - src/app/admin/artikler/ny/page.tsx
tech_stack:
  added: []
  patterns:
    - requestAnimationFrame for post-render DOM scroll
    - querySelector('[role="alert"]') for first-error detection
    - toast.error for _form server errors surfacing
key_files:
  created: []
  modified:
    - src/app/admin/produkter/ny/page.tsx
    - src/app/admin/opplevelser/ny/page.tsx
    - src/app/admin/artikler/ny/page.tsx
decisions:
  - Used requestAnimationFrame (not setTimeout) to fire scroll after React re-renders
  - Used querySelector('[role="alert"]') selector — FormError already renders with role="alert"
  - Task 2 required no additional changes — Task 1 unified branch replacement covered toast.error for all three files
metrics:
  duration: 5min
  completed_date: "2026-04-07T21:22:49Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase 6 Plan 2: Scroll-to-Error and Toast Notifications for Admin Create-Forms Summary

**One-liner:** Added requestAnimationFrame-based scroll-to-first-error and toast.error(_form) to all three admin create-forms (produkt, opplevelse, artikkel) using existing FormError role="alert" selector.

## What Was Built

All three admin create-form pages (`/admin/produkter/ny`, `/admin/opplevelser/ny`, `/admin/artikler/ny`) now:

1. **Scroll to first error** after a failed validation: uses `requestAnimationFrame` to wait for React to re-render the error elements, then calls `document.querySelector('[role="alert"]')` to find the topmost error and `scrollIntoView({ behavior: 'smooth', block: 'center' })` to bring it into view.

2. **Show a toast notification for _form errors**: auth failures ("Ikke autorisert.") and server config failures ("Server er ikke konfigurert.") are surfaced via `toast.error()` so the admin sees a notification even when scrolled away from the form.

Previously, submitting a form with missing fields would set errors and re-render silently — the admin, positioned at the submit button at the bottom, would see nothing happen. This UX gap is now closed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add scroll-to-first-error to all three admin create-forms | 154e8d4 | produkter/ny/page.tsx, opplevelser/ny/page.tsx, artikler/ny/page.tsx |
| 2 | Add toast.error for _form errors in opplevelse and artikkel forms | (no diff — covered by Task 1) | — |

## Decisions Made

- **requestAnimationFrame over setTimeout**: fires exactly after the next render cycle, not a fixed delay — avoids brittle timing hacks.
- **`[role="alert"]` selector**: `FormError` already renders `role="alert"` (confirmed by reading `src/components/ui/FormError.tsx`), so no need to add `data-error` attributes or modify the component.
- **Unified branch replacement in Task 1**: The plan's Task 2 was pre-emptively resolved by Task 1's unified `else if (result.errors)` branch — both opplevelser/ny and artikler/ny received `toast.error` in the same commit, making Task 2 a no-op.
- **Focus on focusable elements only**: `firstError.focus()` is guarded by `tabIndex >= 0` — FormError divs are not focusable by default so the scroll fires but focus is not forced on non-interactive elements.

## Deviations from Plan

None — plan executed exactly as written. Task 2 required no changes because Task 1's unified implementation already satisfied all Task 2 acceptance criteria.

## Known Stubs

None — all three forms are fully wired to their respective server actions. The scroll-to-error and toast logic operates on actual server action responses.

## Threat Flags

None — scroll-to-error is purely client-side UI logic with no new network surface. Toast messages use existing Norwegian error strings ("Ikke autorisert.", "Server er ikke konfigurert.") — no stack traces or internal details are exposed.

## Self-Check: PASSED

- src/app/admin/produkter/ny/page.tsx — FOUND
- src/app/admin/opplevelser/ny/page.tsx — FOUND
- src/app/admin/artikler/ny/page.tsx — FOUND
- Commit 154e8d4 — FOUND
