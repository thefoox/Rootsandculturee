---
phase: 12-fullstendig-qa
plan: 01
subsystem: ui
tags: [tailwind, css-tokens, sticky-positioning, globals-css]

# Dependency graph
requires:
  - phase: 11-premium-ui
    provides: fixed header (h-20), CategoryTabs component, experience detail page layout
provides:
  - --color-rust CSS token (#A0440B) in @theme block resolving 16 text-rust/bg-rust usages
  - CategoryTabs sticky offset corrected to top-20 (80px = header height)
  - Experience detail booking sidebar sticky offset corrected to lg:top-24 (96px)
affects: [any phase touching pricing labels, earlybird UI, admin links, /produkter, /opplevelser detail]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sticky element offset = header height (top-20 = 80px for h-20 fixed header)"
    - "Sticky sidebar with breathing room = top-24 (96px = 80px header + 16px gap)"

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/components/products/CategoryTabs.tsx
    - src/app/(public)/opplevelser/[slug]/page.tsx

key-decisions:
  - "--color-rust value set to #A0440B (warm reddish-brown), distinct from --color-cart-badge (#B84D00 brighter orange)"
  - "Experience sidebar top-24 (96px) rather than exact 80px to give 16px visual breathing room below header"

patterns-established:
  - "All sticky child elements below the fixed h-20 header must use top-20 or greater"

requirements-completed: [QA-01, QA-02, QA-03]

# Metrics
duration: 8min
completed: 2026-04-08
---

# Phase 12 Plan 01: Fullstendig QA — Color Token and Sticky Offset Fixes Summary

**CSS --color-rust token (#A0440B) added to globals.css @theme, CategoryTabs sticky offset fixed to top-20, and experience sidebar fixed to lg:top-24 — resolving all three positioning/color rendering bugs from Phase 11**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-08T08:20:00Z
- **Completed:** 2026-04-08T08:28:20Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `--color-rust: #A0440B` to `@theme` block in globals.css — 16 usages of `text-rust`/`bg-rust` across earlybird labels, prices, admin links, and DateCard now resolve to the correct warm reddish-brown
- Fixed CategoryTabs `sticky top-0` to `sticky top-20` on /produkter — tabs no longer collide with the 80px fixed header
- Fixed experience detail booking sidebar from `lg:top-8` to `lg:top-24` — widget clears the fixed header with 16px breathing room

## Task Commits

Each task was committed atomically:

1. **Task 1: Add --color-rust to globals.css** - `758e48d` (fix)
2. **Task 2: Fix CategoryTabs sticky position + experience detail sidebar offset** - `127fef5` (fix)

## Files Created/Modified
- `src/app/globals.css` - Added `--color-rust: #A0440B` to @theme brand palette section
- `src/components/products/CategoryTabs.tsx` - Changed sticky offset from `top-0` to `top-20`
- `src/app/(public)/opplevelser/[slug]/page.tsx` - Changed sidebar sticky from `lg:top-8` to `lg:top-24`

## Decisions Made
- `--color-rust` value chosen as `#A0440B` (warm reddish-brown) rather than reusing `#B84D00` (the existing `--color-cart-badge`) to keep the two semantically distinct — rust for text highlights, cart-badge for UI badges
- Experience sidebar uses `top-24` (96px) rather than exact `top-20` (80px) to provide 16px visual breathing room between header bottom and sidebar top

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three visual bugs from Phase 11 resolved
- `text-rust` and `bg-rust` utilities now render correctly sitewide — no further changes needed in consuming files
- /produkter CategoryTabs and /opplevelser/[slug] sidebar both clear the fixed header correctly
- Ready for Phase 12 Plan 02 (HeroImage overlap fix)

---
*Phase: 12-fullstendig-qa*
*Completed: 2026-04-08*
