---
phase: 11
plan: 04
subsystem: card-components
tags: [ui-polish, elevation, typography, cards]
completed: 2026-04-08T04:15:55Z
duration_minutes: 10
tasks_completed: 2
tasks_total: 2
files_modified: 3
key_decisions:
  - "Standardised all card hover to tier-2 shadow-md (not shadow-lg or shadow-xl)"
  - "Accent strip gradient from-forest to-bark adds warm premium feel without breaking brand"
  - "ExperienceCard image width 280px → 320px improves desktop visual weight"
  - "ExperiencesGridSection rounded-2xl → rounded-xl unifies card radius vocabulary"
requires:
  - 11-01-PLAN.md
provides:
  - Consistent tier-2 hover elevation across all three card types
  - Gradient accent strip on ProductCard
  - Unified card radius vocabulary (all rounded-xl)
affects:
  - Homepage experiences grid section
  - Product catalog pages
  - Experiences catalog page
tech_stack_added: []
tech_stack_patterns:
  - "hover:shadow-md motion-safe:duration-200 hover:-translate-y-1 (tier-2 elevation)"
  - "bg-gradient-to-r from-forest to-bark (warm accent gradient)"
key_files_created: []
key_files_modified:
  - src/components/products/ProductCard.tsx
  - src/components/experiences/ExperienceCard.tsx
  - src/components/sections/ExperiencesGridSection.tsx
---

# Phase 11 Plan 04: Card Elevation and Visual Polish Summary

One-liner: Standardised three-tier shadow system across all card types — ProductCard gets gradient accent strip and h4 typography; ExperienceCard gets wider image and warm meta colour; ExperiencesGridSection gets unified radius, deeper gradient, and h4 price.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ProductCard — hover shadow, accent gradient, padding, typography | 486cd78 | src/components/products/ProductCard.tsx |
| 2 | ExperienceCard and ExperiencesGridSection card polish | 23d73d8 | src/components/experiences/ExperienceCard.tsx, src/components/sections/ExperiencesGridSection.tsx |

## Changes Made

### Task 1: ProductCard (`src/components/products/ProductCard.tsx`)

- **Hover shadow tier:** `hover:shadow-xl` → `hover:shadow-md` (corrected from tier-4 to tier-2)
- **Transition duration:** `motion-safe:duration-150` → `motion-safe:duration-200` (standard card duration)
- **Accent strip:** `bg-forest` → `bg-gradient-to-r from-forest to-bark` (premium warm gradient)
- **Content padding:** `p-4` → `p-4 md:p-5` (breathing room at desktop)
- **Product name:** `text-lg mt-1` → `text-h4 mt-2` (h4 token + tighter gap correction)
- **Price:** `text-body mt-1` → `text-h4 mt-2 font-bold` (clear typography hierarchy: label → h4 name → h4 price)

### Task 2: ExperienceCard (`src/components/experiences/ExperienceCard.tsx`)

- **Hover shadow tier:** `hover:shadow-lg` → `hover:shadow-md` (corrected from tier-3 to tier-2)
- **Transition duration:** `motion-safe:duration-150` → `motion-safe:duration-200`
- **Image width:** `md:w-[280px]` → `md:w-[320px]` (more commanding desktop presence)
- **Date/location meta:** `text-body` → `text-bark` (warm contrast, reads as premium)

### Task 2: ExperiencesGridSection (`src/components/sections/ExperiencesGridSection.tsx`)

- **Card radius:** `rounded-2xl` → `rounded-xl` (unified with all other cards)
- **Gradient overlay:** `from-black/60` → `from-black/70` (better text legibility on bright images)
- **Price typography:** `text-lg` → `text-h4` (consistent with ProductCard price hierarchy)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all changes are visual class updates with no data dependencies.

## Threat Flags

None — all changes are display-only CSS class updates. No new network endpoints, auth paths, or data access patterns introduced.

## Self-Check: PASSED

- `src/components/products/ProductCard.tsx` — exists, contains `hover:shadow-md`, `from-forest to-bark`, `md:p-5`, `text-h4`
- `src/components/experiences/ExperienceCard.tsx` — exists, contains `hover:shadow-md`, `md:w-[320px]`, `text-bark`
- `src/components/sections/ExperiencesGridSection.tsx` — exists, contains `rounded-xl`, `from-black/70`, `text-h4`
- Commit 486cd78 — ProductCard task
- Commit 23d73d8 — ExperienceCard + ExperiencesGridSection task
- TypeScript: clean (no errors)
