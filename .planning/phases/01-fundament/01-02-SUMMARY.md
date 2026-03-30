---
phase: 01-fundament
plan: 02
subsystem: ui
tags: [tailwind-v4, css-custom-properties, design-tokens, wcag, next-font, button, input, form-error]

# Dependency graph
requires:
  - phase: 01-fundament-01
    provides: Next.js project scaffold, Tailwind v4 + PostCSS configuration, tsconfig path aliases
provides:
  - Tailwind v4 @theme brand palette (7 colors) as CSS custom properties
  - Google Fonts (Inter, Merriweather) loaded via next/font with CSS variables
  - Global focus ring (2px solid forest green, 2px offset) for WCAG compliance
  - Dark surface inverted focus ring (cream on forest)
  - Motion guard (opt-in prefers-reduced-motion: no-preference)
  - cn() utility for conditional Tailwind class merging
  - Button component (primary/secondary/ghost variants, loading/disabled states)
  - Input component (label, error state, aria-describedby, aria-invalid)
  - FormError component (role="alert", AlertCircle icon, id for aria linking)
affects: [01-fundament-03, 01-fundament-04, 01-fundament-05, 02-auth]

# Tech tracking
tech-stack:
  added: [clsx, tailwind-merge, lucide-react]
  patterns: [tailwind-v4-theme-tokens, cn-utility, forwardRef-components, aria-describedby-error-linking, opt-in-motion-guard]

key-files:
  created:
    - src/lib/utils.ts
    - src/components/ui/Button.tsx
    - src/components/ui/Input.tsx
    - src/components/ui/FormError.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx

key-decisions:
  - "Font variables use var(--font-inter) and var(--font-merriweather) to bridge next/font CSS vars to Tailwind @theme"
  - "Motion guard uses opt-in pattern (prefers-reduced-motion: no-preference) per UI-SPEC -- transitions OFF by default"
  - "Input component includes inline error display with role=alert, eliminating need for separate FormError in most form cases"

patterns-established:
  - "cn() utility: all components use cn() from @/lib/utils for conditional class merging"
  - "forwardRef pattern: Button and Input use forwardRef for ref forwarding"
  - "WCAG touch target: all interactive elements use min-h-[44px]"
  - "aria-describedby error linking: Input auto-generates error ID from input ID"

requirements-completed: [FOUND-05, WCAG-01, WCAG-02]

# Metrics
duration: 2min
completed: 2026-03-30
---

# Phase 1 Plan 2: Design System Tokens & UI Primitives Summary

**Tailwind v4 @theme brand palette with 7 WCAG-verified colors, Google Fonts via next/font, and three UI primitives (Button, Input, FormError) with full accessibility states**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-30T16:52:01Z
- **Completed:** 2026-03-30T16:53:50Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Brand palette (forest, cream, card, rust, ember, bark, destructive) defined as Tailwind v4 CSS custom properties with all color pairs verified WCAG AA (4.5:1+)
- Google Fonts loaded via next/font with swap display, bridged to Tailwind @theme via CSS variables
- Three UI primitives built: Button (3 variants + loading/disabled), Input (label + error + aria), FormError (alert role + icon)
- Global focus ring and dark surface variant ensure keyboard navigation visibility across all surfaces
- Motion guard uses strict opt-in pattern -- transitions disabled by default, only enabled when user has no reduced-motion preference

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure Tailwind v4 @theme tokens, Google Fonts, and cn() utility** - `9af72fc` (feat)
2. **Task 2: Build Button, Input, and FormError UI primitives** - `6a850fe` (feat)

## Files Created/Modified
- `src/app/globals.css` - Tailwind v4 @theme with brand palette, font families, focus ring, motion guard
- `src/app/layout.tsx` - Google Fonts (Inter, Merriweather) via next/font, font CSS variables on html element
- `src/lib/utils.ts` - cn() utility combining clsx + tailwind-merge
- `src/components/ui/Button.tsx` - Button primitive with primary/secondary/ghost variants, loading state
- `src/components/ui/Input.tsx` - Text input with label, error state, aria-describedby linking
- `src/components/ui/FormError.tsx` - Standalone error message block with role="alert" and AlertCircle icon

## Decisions Made
- Font variables use `var(--font-inter)` and `var(--font-merriweather)` in @theme to bridge next/font CSS variables to Tailwind tokens -- this allows both next/font optimization and Tailwind class usage
- Motion guard uses opt-in pattern (`prefers-reduced-motion: no-preference`) per UI-SPEC Accessibility Contract -- the stricter WCAG-compliant approach where transitions are OFF by default
- Input component includes inline error display (`<p role="alert">`) directly, reducing boilerplate for most form use cases while FormError serves as standalone error block for non-input contexts

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All brand tokens available as Tailwind v4 utility classes (bg-forest, text-cream, bg-ember, etc.)
- cn() utility ready for all future component composition
- Button, Input, FormError primitives ready for use in auth forms (Plan 03-04) and layout components (Plan 03)
- Focus ring and motion guard applied globally -- no per-component setup needed

## Self-Check: PASSED

All 6 files verified on disk. Both commit hashes (9af72fc, 6a850fe) found in git log.

---
*Phase: 01-fundament*
*Completed: 2026-03-30*
