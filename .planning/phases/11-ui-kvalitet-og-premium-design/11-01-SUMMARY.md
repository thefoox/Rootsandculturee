---
phase: 11-ui-kvalitet-og-premium-design
plan: "01"
subsystem: css-foundations
tags: [css, animations, typography, fonts, motion-guard]
dependency_graph:
  requires: []
  provides: [hero-enter-keyframes, shimmer-keyframes, animate-shimmer-class, hero-texture-class, merriweather-300, article-prose-letter-spacing]
  affects: [src/app/globals.css, src/app/layout.tsx]
tech_stack:
  added: []
  patterns: [motion-guard-keyframes, css-pseudo-element-texture, next-font-multi-weight]
key_files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
decisions:
  - "Keyframes for hero-enter and shimmer placed inside @media (prefers-reduced-motion: no-preference) to satisfy WCAG motion guard — not via motion-safe: modifier since these are @keyframes declarations not Tailwind classes"
  - ".hero-texture::after placed outside the motion guard — grain texture is a static visual, not a motion animation"
  - "letter-spacing applied directly to .article-prose h2/h3 selectors rather than adding Tailwind classes to markup — keeps prose styling self-contained in globals.css"
metrics:
  duration: "8 minutes"
  completed: "2026-04-08T04:12:23Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 11 Plan 01: CSS Foundations Summary

Passive CSS foundations added to globals.css and layout.tsx — hero-enter load animation keyframes, shimmer skeleton animation, grain texture class, and Merriweather 300 weight loading. No visual changes until referenced by components in subsequent Wave 2+ plans.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add hero-enter, shimmer, hero-texture to globals.css | `6b5f9d7` | src/app/globals.css |
| 2 | Load Merriweather weight 300 in layout.tsx | `b1261a4` | src/app/layout.tsx |

## What Was Built

### globals.css additions

**1. `@keyframes hero-enter`** (inside `@media (prefers-reduced-motion: no-preference)`):
Fades and slides content up from `translateY(24px)` with `opacity: 0 → 1`. Used by HeroSection heading/subheading/CTA in plan 11-08.

**2. `@keyframes shimmer` + `.animate-shimmer`** (inside motion guard):
Horizontal gradient sweep across skeleton placeholder divs. `background-size: 400% 100%` enables the position-based animation without JavaScript.

**3. `.hero-texture` + `.hero-texture::after`** (outside motion guard):
Pseudo-element grain overlay using an inline SVG `feTurbulence` filter at 4% opacity. `pointer-events: none` ensures it never blocks clicks. `z-index: 1` sits above background images but below content (content must use `position: relative; z-index: 2` or higher).

**4. `.article-prose h2/h3 letter-spacing`**:
`-0.02em` on h2, `-0.015em` on h3. Merriweather at display sizes benefits from tighter tracking — matches the typography contract in 11-UI-SPEC.md.

### layout.tsx change

Merriweather `weight` array extended from `['700']` to `['300', '700']`. Google Fonts will now load the 300 weight file, making `font-heading font-light` usable in hero subheadings and CTA sections (plan 11-08).

## Verification

- `@keyframes hero-enter` present at line 103, inside `@media (prefers-reduced-motion: no-preference)` (opens line 94)
- `@keyframes shimmer` present at line 115, inside same block
- `.animate-shimmer` class defined at line 120
- `.hero-texture::after` at line 223 with `opacity: 0.04`
- `.article-prose h2` has `letter-spacing: -0.02em` (line 151)
- `.article-prose h3` has `letter-spacing: -0.015em` (line 160)
- `weight: ['300', '700']` in layout.tsx (line 19)
- TypeScript compile: no errors (`npx tsc --noEmit` exits clean)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan adds passive CSS only. No data flows or UI rendering paths affected.

## Threat Flags

None — all additions are static CSS values. The SVG data URL is a static turbulence filter with no user input and no script execution surface (CSS `content` properties cannot execute JavaScript).

## Self-Check: PASSED

- `src/app/globals.css` — file exists and contains all required additions
- `src/app/layout.tsx` — file exists with `weight: ['300', '700']`
- Commit `6b5f9d7` — exists (Task 1)
- Commit `b1261a4` — exists (Task 2)
