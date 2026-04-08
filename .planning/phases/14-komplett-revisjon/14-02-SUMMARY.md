---
phase: 14-komplett-revisjon
plan: 02
subsystem: ui
tags: [cms, section-renderer, next.js, server-components, firestore]

# Dependency graph
requires:
  - phase: 14-komplett-revisjon
    provides: SectionRenderer with 13 section types, mock data, page-content data layer
provides:
  - om-oss page fully CMS-driven via SectionRenderer
  - kontakt page fully CMS-driven via SectionRenderer (with standalone ContactForm)
  - forside (homepage) CMS-driven for hero, trust-bar, grids, text-image, cta sections
  - enriched mock data with location, trust-bar, FAQ, and contact-info defaults
affects: [admin-cms, page-content, mock-data]

# Tech tracking
tech-stack:
  added: []
  patterns: [CMS-driven page pattern using SectionRenderer for all public pages]

key-files:
  created: []
  modified:
    - src/app/(public)/om-oss/page.tsx
    - src/app/(public)/kontakt/page.tsx
    - src/app/page.tsx
    - src/lib/data/mock-data.ts

key-decisions:
  - "ContactForm kept as standalone client component on kontakt page since ContactInfoSection does not include form functionality"
  - "Categories, testimonials, and newsletter kept as page-level components on homepage since no CMS section types exist for these"
  - "Trust-bar section added to forside mock data to replace hardcoded trust badges"
  - "Homepage uses hybrid approach: CMS sections via SectionRenderer interleaved with page-level components"

patterns-established:
  - "CMS page pattern: fetch getPageContent, sort by order, map through SectionRenderer"
  - "Hybrid page pattern: CMS sections rendered via SectionRenderer alongside page-specific interactive components"

requirements-completed: [REV-01]

# Metrics
duration: 7min
completed: 2026-04-08
---

# Phase 14 Plan 02: CMS Page Conversion Summary

**Converted om-oss, kontakt, and forside from hardcoded bespoke layouts to CMS-driven pages using SectionRenderer, with mock data defaults for all migrated content**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-08T17:48:57Z
- **Completed:** 2026-04-08T17:56:04Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Om-oss page converted from 6 hardcoded sections to fully CMS-driven rendering (hero, text-image, team, values, gallery, contact-info, cta)
- Kontakt page converted to CMS-driven sections (hero, contact-info, faq) plus standalone ContactForm
- Homepage converted to CMS-driven hero, trust-bar, experience/product/article grids, text-image, and cta sections
- Mock data enriched with location details, trust badges, detailed FAQ items, and contact hrefs as fallback defaults

## Task Commits

Each task was committed atomically:

1. **Task 1: Convert om-oss page to fully CMS-driven** - `e624f51` (feat)
2. **Task 2: Convert kontakt page to fully CMS-driven** - `8bb9d90` (feat)
3. **Task 3: Convert forside to fully CMS-driven** - `e9d92c4` (feat)

## Files Created/Modified
- `src/app/(public)/om-oss/page.tsx` - Replaced 217 lines of hardcoded sections with 30-line CMS-driven page
- `src/app/(public)/kontakt/page.tsx` - Replaced hardcoded FAQ/contact/location with CMS sections + ContactForm
- `src/app/page.tsx` - Replaced direct data fetching and hardcoded rendering with SectionRenderer for CMS sections
- `src/lib/data/mock-data.ts` - Added contact-info section to om-oss, trust-bar to forside, enriched kontakt FAQ/contact items

## Decisions Made
- ContactForm remains as standalone client component on kontakt page because ContactInfoSection renders contact details only (no form). The form renders after all CMS sections.
- Homepage categories, testimonials, and newsletter are kept as page-level components because no CMS section types exist for these. Adding new section types would require changes to SectionRenderer, admin CMS, and type definitions (Rule 4 architectural scope). The plan explicitly allows this approach.
- Homepage uses a hybrid rendering approach: hero and trust-bar rendered first, then categories (page-level), then remaining CMS sections with testimonials and newsletter interleaved at correct positions.
- Trust-bar section added to forside mock data with shield/heart/layers icons to replace the hardcoded badges that were previously ignoring the fetched trustSection.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

- **Homepage categories** (`src/app/page.tsx`, line ~29-48): CATEGORIES array remains hardcoded on the page. No CMS section type exists. Intentional -- plan explicitly allows keeping these as page-level components.
- **Homepage testimonials** (`src/app/page.tsx`, line ~50-65): TESTIMONIALS array remains hardcoded on the page. No CMS section type exists. Intentional -- same rationale.
- **Homepage newsletter** (`src/app/page.tsx`, line ~161-180): Newsletter form is non-functional (no backend handler). Pre-existing state, not introduced by this plan.

## Threat Flags

None found. No new network endpoints, auth paths, or trust boundary changes introduced.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three main public pages now render CMS sections via SectionRenderer
- Admin CMS edits to section content are reflected on public pages
- Categories, testimonials, and newsletter remain as future candidates for CMS section types if needed

## Self-Check: PASSED

All files verified present. All commit hashes verified in git log.

---
*Phase: 14-komplett-revisjon*
*Completed: 2026-04-08*
