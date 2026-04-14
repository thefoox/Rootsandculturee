---
phase: 23-handlekurv-konto
plan: 02
subsystem: konto-error-boundary
tags: [error-boundary, konto, norwegian-ux, next-app-router]
dependency_graph:
  requires: []
  provides: [konto-error-boundary]
  affects: [konto, konto/ordrer, konto/bookinger, konto/profil]
tech_stack:
  added: []
  patterns: [next-error-tsx-convention, lucide-react-alert-triangle]
key_files:
  created:
    - src/app/konto/error.tsx
  modified: []
key_decisions:
  - Used min-h-[40vh] instead of min-h-screen because error.tsx renders inside konto layout (below h1 and KontoTabs)
  - Mirrored console.error(error) in useEffect pattern from global error.tsx for consistency
  - Hard navigation link to /konto (not router.back()) to guarantee error state is cleared
metrics:
  duration_minutes: 5
  completed_date: "2026-04-14"
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
  files_modified: 0
---

# Phase 23 Plan 02: Konto Error Boundary Summary

**One-liner:** Next.js error.tsx boundary at /konto/ level with Norwegian messaging ("Kunne ikke laste kontoinformasjon") and retry/back-link UX, rendering inside the existing konto layout.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create konto error boundary | f9c4c99 | src/app/konto/error.tsx (created) |

## What Was Built

Created `src/app/konto/error.tsx` — a Next.js App Router error boundary for all `/konto/*` sub-routes. When Firestore fetch failures occur in `getOrdersByUser`, `getBookingsByUser`, or `getUserProfile`, users see a contextual Norwegian error page instead of the generic global error page.

Key design:
- Renders **inside** the konto layout (below "Min konto" heading and `KontoTabs`) using `min-h-[40vh]` container
- `AlertTriangle` icon with `text-rust` color for visual warning signal
- "Prøv igjen" `Button` calling the `reset()` prop to retry the failed render
- "Tilbake til konto" `Link` href="/konto" for hard navigation to clear error state
- `console.error(error)` in `useEffect` for debugging — raw error never displayed to user (T-23-03 mitigation)
- Covers: `/konto`, `/konto/ordrer`, `/konto/bookinger`, `/konto/profil`, `/konto/ordrer/[id]`

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- [x] `npx tsc --noEmit` passes with no errors
- [x] File exists at src/app/konto/error.tsx
- [x] Norwegian copy correct: "Kunne ikke laste kontoinformasjon", "Prøv igjen", "Tilbake til konto"
- [x] `'use client'` directive present
- [x] Exports default function accepting `{ error, reset }` props
- [x] Uses `AlertTriangle` from lucide-react and `Button` from @/components/ui/Button

## Known Stubs

None.

## Threat Flags

None — error boundary is purely presentational. Raw error object is only sent to `console.error`, never rendered to the user (mitigates T-23-03 Information Disclosure).

## Self-Check: PASSED

- [x] FOUND: src/app/konto/error.tsx
- [x] FOUND commit: f9c4c99 (git log --oneline | grep f9c4c99)
