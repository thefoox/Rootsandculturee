---
phase: 09-typografi-og-ui-polish
plan: 01
subsystem: ui
tags: [tailwind, css-tokens, design-system, badges]

# Dependency graph
requires:
  - phase: 01-fundament
    provides: globals.css @theme tokens (--color-forest, --text-* scale)
  - phase: 02-butikkvindu-og-admin
    provides: badge-easy/moderate/hard tokens, OrderStatusBadge, BookingStatusBadge
provides:
  - Badge status tokens (warning, error) in globals.css @theme
  - Focus ring uses CSS vars instead of hardcoded hex
  - article-prose heading sizes driven by type-scale tokens
  - All status badge components use design-system Tailwind classes
affects: [09-02, 09-03, 09-04, admin, experiences, products, checkout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Badge token pattern: --color-badge-{name} / --color-badge-{name}-bg in @theme, consumed as bg-badge-{name}-bg / text-badge-{name}"
    - "Focus ring: var(--color-forest) / var(--color-cream) — no inline hex in global CSS"

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/components/admin/OrderStatusBadge.tsx
    - src/components/admin/BookingStatusBadge.tsx
    - src/app/admin/page.tsx
    - src/components/products/VariantSelector.tsx
    - src/types/index.ts

key-decisions:
  - "Reuse existing --color-badge-easy/easy-bg tokens for confirmed/paid statuses (matches existing Phase 2 convention)"
  - "Add --color-badge-warning and --color-badge-error as new tokens for pending/cancelled — not reuse bark/destructive to keep semantic clarity"
  - "locationLat/locationLng added as optional fields on Experience type to fix pre-existing TS error from Google Maps feature"

patterns-established:
  - "Badge token naming: bg-badge-{semantic}-bg / text-badge-{semantic} — applies to future status indicators"

requirements-completed: [TYPO-01, TYPO-02, TYPO-03, TYPO-04, TYPO-05]

# Metrics
duration: 12min
completed: 2026-04-07
---

# Phase 09 Plan 01: Typografi og UI Polish Summary

**CSS design-token cleanup: badge status tokens added, all inline hex replaced with Tailwind token classes in badges, focus ring, and article-prose typography**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-07T00:00:00Z
- **Completed:** 2026-04-07T00:12:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added `--color-badge-warning`, `--color-badge-warning-bg`, `--color-badge-error`, `--color-badge-error-bg` tokens to globals.css @theme
- Replaced all `bg-[#...]` / `text-[#...]` in OrderStatusBadge, BookingStatusBadge, and admin/page.tsx with semantic Tailwind token classes
- Focus ring in globals.css now uses `var(--color-forest)` and `var(--color-cream)` — zero hardcoded hex in global CSS rules
- article-prose h2/h3 font sizes now driven by `var(--text-h3)` / `var(--text-h4)` from the type scale
- VariantSelector non-selected variant buttons changed from `bg-white` to `bg-cream` (design system alignment)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fiks hardkodede tekststorrelser i komponenter** - `6fd76f2` (feat)
2. **Task 2: Legg til badge-tokens i globals.css og erstatt hardkodede hex i status-badges** - `0f63849` (feat)

## Files Created/Modified

- `src/app/globals.css` - Added badge-warning/error tokens; focus ring uses CSS vars; article-prose uses var(--text-h3)/var(--text-h4)
- `src/components/admin/OrderStatusBadge.tsx` - All hex replaced with bg-badge-*/text-badge-* token classes
- `src/components/admin/BookingStatusBadge.tsx` - Same token migration
- `src/app/admin/page.tsx` - Inline Betalt badge uses bg-badge-easy-bg/text-badge-easy
- `src/components/products/VariantSelector.tsx` - Non-selected variant bg-white → bg-cream
- `src/types/index.ts` - Added optional locationLat/locationLng to Experience (Rule 1 auto-fix)

## Decisions Made

- Reused existing `--color-badge-easy` / `--color-badge-easy-bg` tokens (from Phase 2) for confirmed/paid statuses — avoids duplicating the same green values
- New `--color-badge-warning` and `--color-badge-error` tokens introduced with semantic names (not reusing bark/destructive which have different connotations)
- article-prose base `font-size: 15px` kept as-is (matches body) — only h2/h3 were migrated to type-scale vars

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing locationLat/locationLng on Experience type**
- **Found during:** Task 2 (build verification)
- **Issue:** TypeScript build error — `src/app/(public)/opplevelser/[slug]/page.tsx` referenced `experience.locationLat` and `experience.locationLng` which did not exist on the `Experience` interface. Pre-existing error from recent Google Maps feature commit.
- **Fix:** Added `locationLat?: number` and `locationLng?: number` as optional fields to the `Experience` interface in `src/types/index.ts`
- **Files modified:** src/types/index.ts
- **Verification:** `npm run build` — TypeScript check passes with "Finished TypeScript in 15.9s"
- **Committed in:** 0f63849 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - pre-existing TypeScript bug)
**Impact on plan:** Auto-fix was necessary to unblock TypeScript build check (success criteria). No scope creep.

**Note on plan's read_first line references:** Several file modifications listed in the plan (text-[12px] in ExperienceCard, text-[11px] in CartItem, text-sm in CheckoutForm step-indicator) were not present in the current codebase — they had been addressed in prior work. Only the violations that were actually present were fixed.

## Issues Encountered

- Build environment lacks `SESSION_SECRET` env var, causing runtime error during static page data collection. This is pre-existing infrastructure configuration — unrelated to this plan's changes. TypeScript compilation itself passes cleanly.

## Known Stubs

None — no stub values introduced in this plan.

## Threat Flags

None — CSS-only changes, no new network endpoints or auth paths.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Design token system is now consistent: all status badge colors, focus rings, and article typography driven by CSS vars
- Ready for 09-02: UI component polish (responsivitet, WCAG, states)
- Remaining inline hex in non-plan-scope files (DateCard.tsx `text-[#C0392B]`, RefundDialog.tsx) deferred to appropriate future plans

---
*Phase: 09-typografi-og-ui-polish*
*Completed: 2026-04-07*
