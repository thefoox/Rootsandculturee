---
phase: 06-admin-qa-og-feilsider
plan: "01"
subsystem: upload-api, error-boundaries
tags: [firebase-storage, admin-sdk, error-boundary, upload-fix]
dependency_graph:
  requires: []
  provides: [firebase-storage-upload, global-error-boundary]
  affects: [src/app/api/upload/route.ts, src/lib/firebase/admin.ts, src/app/global-error.tsx]
tech_stack:
  added: [firebase-admin/storage]
  patterns: [firebase-admin-storage-bucket, null-guarded-admin-sdk, next-global-error-boundary]
key_files:
  created:
    - src/app/global-error.tsx
  modified:
    - src/lib/firebase/admin.ts
    - src/app/api/upload/route.ts
decisions:
  - "Upload route uses firebase-admin/storage with explicit bucket name via NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (initializeApp does not set storageBucket, so bucket() with no args would throw)"
  - "adminApp exported as const from admin.ts, reusing existing singleton — no new initializeApp call"
  - "global-error.tsx uses inline styles intentionally — Tailwind classes unavailable when root layout is broken"
  - "Kept verifySession import from @/lib/dal (consistent with existing codebase), not @/lib/session as suggested in plan interfaces"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-04-07"
  tasks_completed: 2
  files_changed: 3
---

# Phase 06 Plan 01: Upload Bug Fix and Global Error Boundary Summary

**One-liner:** Firebase Storage upload via admin SDK with explicit bucket name, replacing broken filesystem writes on Vercel, plus root-level Norwegian error boundary.

## Tasks Completed

### Task 1: Export adminApp and rewrite /api/upload to use Firebase Storage

- Added `export const adminApp = app` to `src/lib/firebase/admin.ts` — reuses existing singleton, does not call initializeApp again
- Rewrote `src/app/api/upload/route.ts` from scratch:
  - Removed all `fs/promises` imports (`writeFile`, `mkdir`)
  - Added `firebase-admin/storage` with `getStorage(adminApp).bucket(bucketName)`
  - Bucket name passed explicitly via `process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (mandatory — admin.ts initializeApp does not set storageBucket)
  - Files uploaded via `fileRef.save()`, made public via `fileRef.makePublic()`, URL returned via `fileRef.publicUrl()`
  - `adminApp` null-guard returns 500 if credentials missing
  - All error messages in Norwegian
  - Extension allowlist and 5MB size cap enforced (STRIDE T-06-02 mitigation)
  - Auth check via `verifySession()` at route entry (STRIDE T-06-01 mitigation)
- **Commit:** f71f599

### Task 2: Add global-error.tsx root error boundary

- Created `src/app/global-error.tsx` as Next.js App Router root error boundary
- `'use client'` directive as required
- Renders own `<html lang="nb">` and `<body>` tags (root layout may be broken)
- Norwegian error text: "Noe gikk alvorlig galt"
- Retry button calls `reset()` prop
- Inline styles with brand colors (forest `#1C3A2E`, cream `#F5F0E8`) — intentional since Tailwind unavailable when root layout is broken
- `console.error(error)` in `useEffect` for observability
- **Commit:** 95720f9

## Deviations from Plan

### Minor Deviation: verifySession import source

- **Found during:** Task 1
- **Issue:** Plan interfaces specified `import { verifySession } from '@/lib/session'` but the existing upload route (and all other server actions in the codebase) use `import { verifySession } from '@/lib/dal'`
- **Fix:** Kept `@/lib/dal` import to remain consistent with established codebase pattern. The `dal.ts` module re-exports `verifySession` with React cache() wrapping.
- **Files modified:** src/app/api/upload/route.ts
- **Commit:** f71f599 (included in task commit)

## Known Stubs

None — both deliverables are fully wired: the upload route connects to Firebase Storage and the global error boundary is a complete Next.js boundary component.

## Threat Flags

None — all trust boundaries identified in the plan's threat model were addressed:
- T-06-01 (Spoofing): verifySession() at route entry
- T-06-02 (Tampering): Extension allowlist + 5MB cap before upload

## Pre-existing Issues (Out of Scope)

TypeScript errors in `src/app/(public)/opplevelser/[slug]/page.tsx` (lines 274, 283): `locationLat`/`locationLng` properties do not exist on `Experience` type. These are pre-existing and unrelated to this plan's changes. Logged for deferred resolution.

## Self-Check: PASSED

- [x] `src/lib/firebase/admin.ts` contains `export const adminApp`
- [x] `src/app/api/upload/route.ts` has no `fs/promises` import
- [x] `src/app/api/upload/route.ts` imports `getStorage` from `firebase-admin/storage`
- [x] `src/app/api/upload/route.ts` imports `adminApp` from `@/lib/firebase/admin`
- [x] `src/app/api/upload/route.ts` calls `.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)`
- [x] `src/app/api/upload/route.ts` calls `makePublic()` and `publicUrl()`
- [x] `src/app/global-error.tsx` exists
- [x] `src/app/global-error.tsx` contains `'use client'`
- [x] `src/app/global-error.tsx` contains `html lang="nb"`
- [x] `src/app/global-error.tsx` contains reset button
- [x] `src/app/global-error.tsx` contains Norwegian error text
- [x] No TypeScript errors in modified/created files
- [x] Commits f71f599 and 95720f9 exist
