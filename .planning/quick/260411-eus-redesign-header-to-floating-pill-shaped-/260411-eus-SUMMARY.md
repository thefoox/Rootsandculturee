---
phase: quick
plan: 260411-eus
subsystem: layout/header
tags: [header, scroll, ui, design]
key-files:
  modified:
    - src/components/layout/Header.tsx
decisions:
  - "showDarkHeader = isTransparent && !isScrolled consolidates all color-state logic into one boolean"
metrics:
  duration: "~2 min"
  completed: "2026-04-11"
  tasks: 1
  files: 1
---

# Quick Task 260411-eus: Redesign Header to Floating Pill (Scroll Unification) Summary

**One-liner:** Replaced bare `isTransparent` color checks with `showDarkHeader = isTransparent && !isScrolled` so all page types use a cream/white floating pill header when scrolled.

## What Was Done

Introduced a derived boolean `showDarkHeader` in Header.tsx that is `true` only when the page is a hero page AND the user has not scrolled past 80px. Previously, hero pages used `bg-forest text-cream` when scrolled, creating visual inconsistency versus non-hero pages which used cream. Now:

- **Scrolled (any page):** `bg-cream/95 backdrop-blur-md` floating pill — always cream
- **Not scrolled, hero page:** `bg-transparent` with dark/inverted elements (cream text)
- **Not scrolled, non-hero page:** `bg-cream/95 backdrop-blur-md` (unchanged)

### Changes Made to Header.tsx

1. Added `const showDarkHeader = isTransparent && !isScrolled` after the `isScrolled` declaration
2. Rewrote header background className block — scrolled state is always cream, no `bg-forest` branch
3. Logo filter: `showDarkHeader` instead of `isTransparent`
4. MegaMenuNav: `transparent={showDarkHeader}` instead of `transparent={isTransparent}`
5. Desktop cart icon color: `showDarkHeader`
6. Login button style: `showDarkHeader`
7. Mobile cart icon color: `showDarkHeader`
8. Mobile hamburger color: `showDarkHeader`

## Verification

Build passed: `npx next build` completed with no errors, all routes compiled successfully.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced.

## Self-Check

- [x] `src/components/layout/Header.tsx` modified and contains `showDarkHeader`
- [x] Commit `bd20f9d` exists: `feat(quick-01): unify header scroll styling to cream floating pill`
- [x] Build succeeded with no TypeScript or compilation errors

## Self-Check: PASSED
