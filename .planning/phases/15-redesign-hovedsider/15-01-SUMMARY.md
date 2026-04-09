---
phase: 15-redesign-hovedsider
plan: 01
subsystem: section-components
tags: [ui, components, sections, design-system]
dependency_graph:
  requires: []
  provides: [HeroSection-variants, TrustBarSection-dark, ExperiencesGridSection-cards, FaqSection-cards, ContactInfoSection-overlap, TeamSection-photostrip, TextImageSection-overlap, LocationSection, ValuesSection-spacious]
  affects: [forside, kontakt, om-oss, admin-innhold]
tech_stack:
  added: []
  patterns: [variant-selection-by-props, overlapping-layouts, css-clamp-typography]
key_files:
  created:
    - src/components/sections/LocationSection.tsx
  modified:
    - src/components/sections/HeroSection.tsx
    - src/components/sections/TrustBarSection.tsx
    - src/components/sections/ExperiencesGridSection.tsx
    - src/components/sections/FaqSection.tsx
    - src/components/sections/ContactInfoSection.tsx
    - src/components/sections/TeamSection.tsx
    - src/components/sections/TextImageSection.tsx
    - src/components/sections/ValuesSection.tsx
    - src/components/sections/SectionRenderer.tsx
    - src/types/index.ts
    - src/app/admin/innhold/[pageId]/page.tsx
decisions:
  - "HeroSection variant auto-selected by ctaText presence (fullscreen if CTA exists, compact otherwise)"
  - "Secondary CTA sourced from items[0] for ghost button in fullscreen hero"
  - "LocationSection variant detected via section.body === 'dark' field"
  - "TrustBarSection always dark (removed variant prop)"
metrics:
  duration: "5m"
  completed: "2026-04-09"
  tasks_completed: 9
  tasks_total: 9
---

# Phase 15 Plan 01: Upgrade Section Components Summary

Upgraded all 8 existing section components and created 1 new component (LocationSection) to match the premium HTML prototype designs from forside-v4, kontakt-v2, and om-oss.

## One-liner

Section components upgraded with overlapping layouts, detailed experience cards with category badges, photo-strip team, 2-column FAQ cards, and new LocationSection with dark/light variants.

## Changes Made

### Task 1: HeroSection (fullscreen + compact variants)
- **Fullscreen**: 100vh, bottom-aligned content, gradient overlay, dual CTA (primary forest + ghost blur), scroll indicator with bounce
- **Compact**: forest bg, centered text, optional bg image at 30% opacity, Merriweather italic subheading
- Variant auto-selected: ctaText present = fullscreen, absent = compact
- **Commit:** `0178846`

### Task 2: TrustBarSection (dark inline style)
- Always dark forest bg, flex row centered, gap-10
- Icons 16px stroke-width 1.5, text 0.8125rem cream/65
- Removed variant prop entirely
- **Commit:** `f94d58a`

### Task 3: ExperiencesGridSection (detailed cards)
- Cards with separate image (16/11 aspect) and body sections
- Category badges: retreat=green, kurs=yellow, matopplevelse=red
- Date with calendar icon, location, 2-line description clamp
- Footer with price + "Les mer" link, border-top separator
- Hover: translateY(-6px) + shadow, image zoom 1.06
- **Commit:** `e2ac185`

### Task 4: FaqSection (2-column card grid)
- Replaced accordion with flat 2-column card grid (max-width 960px)
- Cards: cream bg, rounded-[14px], border forest/4, padding 24px
- Question and answer always visible (no expand/collapse)
- **Commit:** `57b27d6`

### Task 5: ContactInfoSection (overlapping cards)
- 3-column card grid floating above hero with -mt-12 + z-[2]
- Cards: white bg, rounded-2xl, centered, shadow
- Icon in 56x56 rounded-[14px] container with forest/6 bg
- Hover: translateY(-4px) + bigger shadow
- **Commit:** `276ede8`

### Task 6: TeamSection (photo-strip)
- 3-column grid, photos with 3/4 aspect ratio, rounded-2xl
- Name h4 below photo, role in bark color
- **Commit:** `521cae4`

### Task 7: TextImageSection (overlapping story)
- Grid 1.2fr/1fr with overlapping image and text box
- Image: rounded-r-3xl, aspect 4/5, negative margin, shadow
- Text box: card bg, p-16, rounded-3xl, z-2 overlaps image
- Optional signature line from subheading
- Mobile: stacked vertically
- **Commit:** `d25773b`

### Task 8: LocationSection (new component)
- Dark variant (om-oss): forest bg, cream text, 1fr 1fr grid
- Light variant (kontakt): cream bg, 1fr 1.5fr grid
- Map placeholder, location details with icons
- Added 'location' to SectionType union
- Registered in SectionRenderer
- **Commit:** `594cb45`

### Task 9: ValuesSection (spacious cards)
- Section bg: card, Cards: cream bg, rounded-2xl, px-8 py-12
- Icons: 48x48, stroke-width 1.5, no circle background
- Section header with subheading support
- Hover: translateY(-4px)
- **Commit:** `8973364`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added 'location' to admin SECTION_TYPE_LABELS**
- **Found during:** Build verification after Task 9
- **Issue:** Adding 'location' to SectionType union caused type error in admin page SECTION_TYPE_LABELS Record
- **Fix:** Added `location: 'Lokasjon'` to the admin labels record
- **Files modified:** `src/app/admin/innhold/[pageId]/page.tsx`
- **Commit:** `b12f3d8`

## Verification

- `npm run build` passes successfully
- All 14 section types render without errors (13 existing + 1 new location)
- LocationSection registered in SectionRenderer
- No TypeScript errors

## Self-Check: PASSED

All 11 files verified present. All 10 commits verified in git log.
