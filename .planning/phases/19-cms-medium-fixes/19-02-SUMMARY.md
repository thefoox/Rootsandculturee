---
phase: 19-cms-medium-fixes
plan: 02
subsystem: admin
tags: [error-handling, design-tokens, admin-pages, next-image]
dependency_graph:
  requires: []
  provides:
    - "Admin error handling with Norwegian toasts on all useEffect fetches"
    - "Design tokens for refund/danger colors"
    - "Next.js Image usage in admin list pages"
  affects:
    - "src/app/globals.css"
    - "src/app/admin/ordrer/[id]/page.tsx"
    - "src/app/admin/bookinger/page.tsx"
    - "src/app/admin/produkter/page.tsx"
    - "src/app/admin/opplevelser/page.tsx"
    - "src/app/admin/artikler/page.tsx"
    - "src/app/admin/gavekort/page.tsx"
    - "src/app/admin/kunder/page.tsx"
    - "src/app/admin/ordrer/page.tsx"
    - "src/app/admin/innhold/page.tsx"
    - "src/app/admin/innhold/[pageId]/page.tsx"
    - "src/app/admin/kunder/[uid]/page.tsx"
tech_stack:
  added: []
  patterns:
    - ".catch(() => toast.error()) on all useEffect fetch chains"
    - "CSS custom properties as Tailwind color utilities (--color-refund -> text-refund)"
key_files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/admin/ordrer/[id]/page.tsx
    - src/app/admin/bookinger/page.tsx
    - src/app/admin/produkter/page.tsx
    - src/app/admin/opplevelser/page.tsx
    - src/app/admin/artikler/page.tsx
    - src/app/admin/gavekort/page.tsx
    - src/app/admin/kunder/page.tsx
    - src/app/admin/ordrer/page.tsx
    - src/app/admin/innhold/page.tsx
    - src/app/admin/innhold/[pageId]/page.tsx
    - src/app/admin/kunder/[uid]/page.tsx
decisions: []
metrics:
  duration: "4min"
  completed: "2026-04-12T20:08:34Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 12
requirements:
  - CMS-MED-ERRORHANDLING
  - CMS-MED-COLORS
---

# Phase 19 Plan 02: Admin Error Handling & Design Token Cleanup Summary

Norwegian error toasts added to all 11 admin page useEffect fetches, hardcoded hex colors replaced with CSS custom properties, and native img tags replaced with Next.js Image in three list pages.

## Completed Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add design tokens and fix hardcoded hex colors | bab5ccc | globals.css, ordrer/[id]/page.tsx, bookinger/page.tsx |
| 2 | Add .catch() error handling + replace img with Image | d31f9e8 | produkter, opplevelser, artikler, gavekort, kunder, ordrer, bookinger, innhold, innhold/[pageId], kunder/[uid] |

## Changes Made

### Task 1: Design Tokens & Hex Color Cleanup
- Added `--color-refund: #C0392B` and `--color-refund-bg: #FDECEA` tokens to globals.css
- Replaced all `text-[#C0392B]`, `border-[#C0392B]`, `hover:bg-[#C0392B]/5` with `text-refund`, `border-refund`, `hover:bg-refund/5` in order detail page
- Replaced `bg-[#DCFCE7] text-[#166534]` with `bg-success-bg text-success` for succeeded refund badges
- Replaced `bg-[#FEF3C7] text-[#92400E]` with `bg-badge-warning-bg text-badge-warning` for pending refund badges
- Replaced `hover:text-[#C0392B]` with `hover:text-refund` in bookings page

### Task 2: Error Handling & Image Optimization
- Added `.catch(() => toast.error('...'))` with Norwegian messages to all admin useEffect fetch chains
- Pages updated: produkter, opplevelser, artikler, gavekort, kunder, ordrer/[id], bookinger, innhold, innhold/[pageId], kunder/[uid]
- ordrer/page.tsx already had error handling -- no changes needed
- Silent `.catch(() => {})` added to refresh-after-action calls (note refresh, refund refresh in order detail)
- Replaced native `<img>` with Next.js `<Image>` (width={48} height={48}) in produkter, opplevelser, artikler list pages
- Added `import Image from 'next/image'` to opplevelser and artikler pages (produkter already had it)
- Added `import { toast } from 'sonner'` to kunder/page.tsx and kunder/[uid]/page.tsx

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- All admin list pages have at least 1 `.catch()` call
- ordrer/[id]/page.tsx has 6 `.catch()` calls (3 initial + 1 note refresh + 2 refund refresh)
- Zero hardcoded hex colors remain in admin order detail and bookings pages
- No native `<img>` tags in produkter, opplevelser, artikler list pages

## Self-Check: PASSED

All 12 modified files found on disk. Both commits (bab5ccc, d31f9e8) verified in git log. SUMMARY.md exists.
