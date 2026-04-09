---
phase: 15-redesign-hovedsider
plan: "02"
subsystem: homepage
tags: [homepage, layout, mock-data, forside, CMS]
dependency_graph:
  requires: [15-01]
  provides: [homepage-v4-layout]
  affects: [page.tsx, mock-data.ts, types/index.ts, HeroSection.tsx]
tech_stack:
  added: []
  patterns: [explicit-section-extraction, dual-CTA-fields]
key_files:
  created: []
  modified:
    - src/app/page.tsx
    - src/lib/data/mock-data.ts
    - src/types/index.ts
    - src/components/sections/HeroSection.tsx
decisions:
  - Used explicit section extraction by type instead of iterating with conditional inserts for clearer layout control
  - Added ctaSecondaryText/ctaSecondaryLink to PageSection type with HeroSection fallback to items array
  - Removed text-image 'om-oss' section from forside mock data (not in prototype)
metrics:
  duration: "2m 56s"
  completed: "2026-04-09T13:11:15Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 15 Plan 02: Rebuild Homepage Layout Summary

Homepage rebuilt to match forside-v4.html prototype with explicit 9-section layout: fullscreen hero with dual CTA, dark trust bar with 4 items, category cards, experience grid with filter, product grid, testimonials, blog, newsletter, and CTA banner.

## Completed Tasks

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 2 | Update forside mock data | 166d14d | Added ctaSecondaryText/ctaSecondaryLink to PageSection type, updated hero with dual CTA and prototype image, trust bar to 4 items, updated headings to match prototype, removed om-oss text-image section |
| 1 | Rebuild homepage layout | a5b937f | Rewrote page.tsx with explicit section extraction by type, correct interleaving: hero -> trust -> categories -> experiences -> products -> testimonials -> blog -> newsletter -> CTA |

## Changes Made

### Task 2: Update forside mock data to match prototype content

**PageSection type** (`src/types/index.ts`):
- Added `ctaSecondaryText?: string` and `ctaSecondaryLink?: string` fields

**HeroSection** (`src/components/sections/HeroSection.tsx`):
- Updated FullscreenHero to prefer `ctaSecondaryText`/`ctaSecondaryLink` fields, with fallback to `items[0]` for backward compatibility

**Mock data** (`src/lib/data/mock-data.ts`):
- Hero: added `ctaSecondaryText: 'Besok butikk'`, `ctaSecondaryLink: '/produkter'`, updated image to match prototype
- Trust bar: added 4th item "Gratis kansellering" with check-circle icon
- Experiences grid: heading changed to "Kurs og Retreater", subheading to "Book din neste naturopplevelse"
- Products grid: heading changed to "Produkter fra norsk natur", removed subheading
- Articles grid: removed subheading (matches prototype simplicity)
- Removed "om-oss" text-image section (not in prototype layout)
- CTA banner: reordered to order 5 (was 6)

### Task 1: Rebuild homepage layout to match forside-v4.html

**page.tsx** (`src/app/page.tsx`):
- Replaced generic section iteration with explicit extraction by section type
- Section order now matches prototype exactly:
  1. Hero (CMS) -- fullscreen, dual CTA
  2. Trust bar (CMS) -- dark, 4 items
  3. Categories (page-level) -- 3 cards, 3/4 aspect ratio
  4. Experiences (CMS) -- filter tabs + detailed cards
  5. Products (CMS) -- 4-column grid
  6. Testimonials (page-level) -- 3 cards with stars
  7. Blog (CMS) -- 3-column grid, first featured
  8. Newsletter (page-level) -- dark forest background
  9. CTA banner (CMS) -- background image
- Testimonials moved from after blog to after products (matching prototype)
- Newsletter moved from after CTA to after blog (matching prototype)

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npm run build` passes successfully
- All 9 sections rendered in correct prototype order
- CMS sections render via SectionRenderer
- Page-level components (categories, testimonials, newsletter) positioned correctly between CMS sections

## Self-Check: PASSED

- All 4 modified files exist on disk
- Both task commits verified (166d14d, a5b937f)
