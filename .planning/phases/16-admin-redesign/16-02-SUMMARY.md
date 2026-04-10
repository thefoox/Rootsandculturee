---
phase: 16-admin-redesign
plan: "02"
subsystem: admin-ui
tags: [admin, sidebar, collapse, lucide-react, accessibility, motion-safe, wcag]
dependency_graph:
  requires: [white-admin-sidebar, lucide-nav-icons]
  provides: [collapsible-admin-sidebar, sidebar-collapse-toggle, collapsed-icon-tooltips]
  affects: [src/components/admin/AdminShell.tsx, src/components/admin/AdminSidebar.tsx]
tech_stack:
  added: [ChevronLeft (lucide-react), ChevronRight (lucide-react)]
  patterns:
    - collapsed boolean state in AdminShell passed as prop to AdminSidebar
    - isCollapsed = !mobile && collapsed derivation pattern for mobile guard
    - motion-safe:transition-[width] motion-safe:duration-200 for prefers-reduced-motion guard
    - title attribute as accessible tooltip for collapsed icon-only nav links
    - aria-expanded on toggle button reflecting sidebar expansion state
key_files:
  modified:
    - src/components/admin/AdminShell.tsx
    - src/components/admin/AdminSidebar.tsx
decisions:
  - State owned by AdminShell (parent), passed as prop to AdminSidebar — avoids lifting state higher or using context for a single boolean
  - Mobile always expanded — isCollapsed derived as !mobile && collapsed so mobile prop short-circuits collapse
  - title attribute used for collapsed tooltips (sufficient for admin-only interface, per UI-SPEC direction)
  - overflow-hidden on desktop sidebar wrapper clips content during width transition, preventing icon overflow bleed
  - Visual separator (w-6 border-t) between nav groups when collapsed replaces hidden section headers
  - aside width set on the aside itself (not just wrapper) to handle both contexts (wrapper handles desktop transition, aside handles mobile fixed position)
metrics:
  duration_minutes: 15
  completed_date: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 16 Plan 02: Collapsible Admin Sidebar Summary

## One-liner

Desktop admin sidebar toggles between 240px (icon + label) and 64px (icon-only with Norwegian title tooltips) via ChevronLeft/ChevronRight toggle button with motion-safe width transition and full WCAG 2.1 AA compliance.

## What Was Built

**AdminShell.tsx:**
- Added `collapsed` boolean `useState` alongside existing `sidebarOpen` state
- Desktop sidebar wrapper updated with `motion-safe:transition-[width] motion-safe:duration-200` and `overflow-hidden`
- Conditional width classes: `w-[64px]` (collapsed) vs `w-[240px]` (expanded)
- `collapsed` and `onToggleCollapse` props passed to desktop `AdminSidebar` only — mobile invocation unchanged
- Added `cn` import from `@/lib/utils`

**AdminSidebar.tsx:**
- Added `ChevronLeft` and `ChevronRight` to lucide-react imports
- Extended `AdminSidebarProps` with `collapsed?: boolean` and `onToggleCollapse?: () => void`
- Derived `isCollapsed = !mobile && collapsed` — mobile sidebar always stays expanded
- `<aside>` gets `aria-label="Admin-navigasjon"` and conditional width (`w-[64px]` vs `w-[240px]`, mobile forces `w-[240px]`)
- Brand header area: label hidden when collapsed, toggle button shows ChevronLeft (expanded) or ChevronRight (collapsed)
- Toggle button: `aria-label="Skjul navigasjon"` (expanded) / `"Vis navigasjon"` (collapsed), `aria-expanded={!isCollapsed}`
- Toggle button: 44x44px touch target, centered when collapsed
- Section headers ("Innhold", "Ordre & Kunder") hidden when `isCollapsed`
- Visual separator `<div className="mx-auto my-2 w-6 border-t border-forest/12" />` between nav groups when collapsed
- Nav links: `justify-center px-0` (collapsed) vs `gap-3 px-4` (expanded); labels hidden when collapsed
- Collapsed nav links: `aria-label={item.label}` and `title={item.label}` for keyboard and hover tooltip accessibility
- Footer "Tilbake" link and "Logg ut" button: icon-only with `aria-label` and `title` when collapsed

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add collapsed state to AdminShell with width transition | ead97ee | src/components/admin/AdminShell.tsx |
| 2 | Implement collapsed sidebar rendering with toggle, tooltips, and accessibility | 7fc0dff | src/components/admin/AdminSidebar.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — collapse functionality fully implemented with real state, real toggle, and real accessibility attributes. No hardcoded empty values or placeholder text introduced.

## Threat Flags

None — pure client-side UI state change. No new network endpoints, auth paths, file access patterns, or Firestore schema changes introduced. Admin auth middleware unchanged.

## Self-Check: PASSED

- [x] `src/components/admin/AdminShell.tsx` exists and contains `collapsed`, `w-[64px]`, `w-[240px]`, `motion-safe:transition-[width]`, `overflow-hidden`
- [x] `src/components/admin/AdminSidebar.tsx` exists and contains `ChevronLeft`, `ChevronRight`, `isCollapsed`, `aria-expanded`, `Skjul navigasjon`, `Vis navigasjon`, `aria-label="Admin-navigasjon"`, `title=`
- [x] Commit ead97ee exists: `feat(16-02): add collapsed state + width transition to AdminShell`
- [x] Commit 7fc0dff exists: `feat(16-02): implement collapsed sidebar with toggle, tooltips, and a11y`
- [x] TypeScript compiles cleanly (npx tsc --noEmit — no output)
- [x] npm run build succeeds
