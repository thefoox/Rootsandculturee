---
phase: 01-fundament
plan: 03
subsystem: ui
tags: [nextjs, tailwind-v4, lucide-react, sonner, wcag, responsive, navigation]

# Dependency graph
requires:
  - phase: 01-fundament/01
    provides: "Tailwind v4 design tokens, globals.css with brand palette and focus rings"
  - phase: 01-fundament/02
    provides: "Font setup (Inter/Merriweather via next/font), root layout with lang=nb"
provides:
  - "Layout shell: SkipLink, Header, MegaMenuNav, MobileNav, Footer wired into root layout"
  - "Centralized Norwegian navigation data (mainNavItems, footerColumns)"
  - "Cart icon placeholder in header (ShoppingBag, /handlekurv link)"
  - "Sonner Toaster wired in root layout"
  - "main#main-content element as skip-link target"
affects: [01-fundament/04, 01-fundament/05, 02-produkt, 03-betaling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Navigation data centralized in src/lib/navigation.ts as single source of truth"
    - "Layout shell pattern: SkipLink -> Header -> main#main-content -> Footer -> Toaster"
    - "dark-surface CSS class for inverted focus rings on forest-background sections"
    - "Icon string-to-component mapping via iconMap for lucide-react icons"
    - "Focus trap pattern for modal/overlay components using Tab key interception"

key-files:
  created:
    - src/lib/navigation.ts
    - src/components/layout/SkipLink.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/MegaMenuNav.tsx
    - src/components/layout/MobileNav.tsx
    - src/components/layout/Footer.tsx
  modified:
    - src/app/layout.tsx
    - src/app/page.tsx

key-decisions:
  - "Sonner Toaster configured without role prop (not supported in current API) -- role is set per-toast instead"
  - "MegaMenuNav uses grid-cols-2 (not 4) for dropdown since each category has 3 items -- 2 columns more appropriate"

patterns-established:
  - "Layout shell: all pages inherit SkipLink -> Header -> main -> Footer structure"
  - "Navigation data: add/modify nav items in src/lib/navigation.ts only"
  - "Icon mapping: extend iconMap in MegaMenuNav.tsx for new category icons"
  - "Focus trap: useEffect with Tab key interception for modal/overlay components"
  - "Body scroll lock: useEffect toggling document.body.style.overflow"

requirements-completed: [FOUND-06, FOUND-07, WCAG-03, WCAG-06]

# Metrics
duration: 3min
completed: 2026-03-30
---

# Phase 01 Plan 03: Layout Shell Summary

**Sticky header with mega-menu navigation (hover + arrow keys), cart icon placeholder, mobile hamburger overlay with focus trap, 4-column footer with social media, and skip-link -- all Norwegian, WCAG-compliant, responsive from 375px**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-30T16:55:56Z
- **Completed:** 2026-03-30T16:58:59Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Complete layout shell wired into root layout: SkipLink -> Header -> main#main-content -> Footer -> Toaster
- Mega-menu with multi-column dropdown, 48px icon areas, full keyboard support (hover, Enter/Space, ArrowDown/ArrowUp, Escape)
- Mobile navigation: full-screen forest overlay with focus trap, body scroll lock, 44px touch targets
- Footer with 4-column grid including social media (Instagram, Facebook) per D-17
- Cart icon placeholder (ShoppingBag) in header for both desktop and mobile per D-14

## Task Commits

Each task was committed atomically:

1. **Task 1: Create navigation data, SkipLink, Header, Footer** - `11276cb` (feat)
2. **Task 2: Build MegaMenuNav and MobileNav** - `3c8f0c4` (feat)

## Files Created/Modified
- `src/lib/navigation.ts` - Centralized Norwegian navigation data (mainNavItems, footerColumns)
- `src/components/layout/SkipLink.tsx` - Skip-to-content link for WCAG-06
- `src/components/layout/Header.tsx` - Sticky header with logo, nav, cart icon, auth trigger, hamburger
- `src/components/layout/MegaMenuNav.tsx` - Desktop mega-menu with icon areas and arrow key navigation
- `src/components/layout/MobileNav.tsx` - Full-screen mobile overlay with focus trap
- `src/components/layout/Footer.tsx` - 4-column footer with social media links
- `src/app/layout.tsx` - Wired SkipLink, Header, Footer, main#main-content, Toaster
- `src/app/page.tsx` - Removed redundant main wrapper (now in layout)

## Decisions Made
- Sonner Toaster configured without role prop (not supported in current API version) -- accessibility role is set per individual toast call instead
- MegaMenuNav dropdown uses grid-cols-2 (not 4) since each category has 3 items -- 2 columns is more appropriate for the content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed invalid role prop from Sonner Toaster**
- **Found during:** Task 1 (layout.tsx wiring)
- **Issue:** Plan specified `toastOptions={{ role: 'status' }}` but Sonner's ToastOptions type does not include a `role` property
- **Fix:** Removed the toastOptions prop; role can be set per-toast when calling toast()
- **Files modified:** src/app/layout.tsx
- **Verification:** TypeScript compilation passes
- **Committed in:** 11276cb (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type fix. No scope creep. Accessibility role will be set per-toast in future phases when toast notifications are used.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Layout shell complete and ready for all pages to inherit Header/Footer/SkipLink
- Auth components (Plan 04/05) can wire into the Header auth trigger and MobileNav login button
- Product/experience pages will automatically render within the layout shell
- Cart icon in header links to /handlekurv (route to be created in checkout phase)

---
*Phase: 01-fundament*
*Completed: 2026-03-30*
