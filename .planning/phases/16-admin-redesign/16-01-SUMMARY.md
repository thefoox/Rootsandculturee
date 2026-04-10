---
phase: 16-admin-redesign
plan: "01"
subsystem: admin-ui
tags: [admin, sidebar, topbar, lucide-react, retheme, white-bg]
dependency_graph:
  requires: []
  provides: [white-admin-sidebar, lucide-nav-icons, white-admin-topbar]
  affects: [src/components/admin/AdminSidebar.tsx, src/components/admin/AdminTopBar.tsx]
tech_stack:
  added: [lucide-react (icons)]
  patterns: [named lucide-react icon imports, LucideIcon type for nav item arrays]
key_files:
  modified:
    - src/components/admin/AdminSidebar.tsx
    - src/components/admin/AdminTopBar.tsx
decisions:
  - Used LucideIcon type from lucide-react for nav item icon field — avoids any/React.ComponentType verbosity
  - Added gap-3 to footer actions (Tilbake + Logg ut) for consistent icon-label spacing
  - hover:text-destructive added to Logg ut button for danger affordance
metrics:
  duration_minutes: 1
  completed_date: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 16 Plan 01: Admin Sidebar & TopBar White Retheme Summary

## One-liner

White admin sidebar with lucide-react icons on all 8 nav items and 2 footer actions, replacing dark-green admin-sidebar color scheme.

## What Was Built

Rethemed both admin navigation components from the dark `bg-admin-sidebar` (#1A2E23) scheme to a white panel with forest-green text:

**AdminSidebar.tsx:**
- Background changed from `dark-surface bg-admin-sidebar` to `bg-white border-r border-forest/12`
- Added 11 lucide-react icon imports: Package, TreePine, FileText, LayoutTemplate, ShoppingBag, CalendarDays, Gift, Users, ArrowLeft, LogOut, X
- Nav item arrays typed with `LucideIcon` field and populated with appropriate icons per section
- All nav link classes updated: `text-cream` → `text-forest`, rgba hover → `hover:bg-card/60`, active state → `bg-card border-l-[3px] border-forest`
- Mobile close button: text `✕` → lucide `<X>` icon, `text-cream` → `text-forest`
- Footer "Tilbake" link: text `←` → lucide `<ArrowLeft>`, forest text, card hover
- Footer "Logg ut" button: lucide `<LogOut>` added, forest text, card hover + destructive text on hover
- Gap-3 added to all icon-bearing elements for consistent spacing
- Footer border updated from `border-cream/10` to `border-forest/12`

**AdminTopBar.tsx:**
- Background changed from `dark-surface bg-admin-sidebar` to `bg-white border-b border-forest/12`
- Hamburger `☰` text replaced with lucide `<Menu className="h-6 w-6">`
- Button and center label updated from `text-cream` to `text-forest`

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Retheme AdminSidebar to white with lucide icons | e4ed705 | src/components/admin/AdminSidebar.tsx |
| 2 | Retheme AdminTopBar to white with lucide Menu icon | 0851490 | src/components/admin/AdminTopBar.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both components fully implemented with real icons and correct color tokens.

## Threat Flags

None — pure visual/styling change with no new network endpoints, auth paths, or data access patterns introduced. Auth and signOut logic unchanged.

## Self-Check: PASSED

- [x] `src/components/admin/AdminSidebar.tsx` exists and contains lucide imports, bg-white, no dark-surface
- [x] `src/components/admin/AdminTopBar.tsx` exists and contains Menu icon, bg-white, no dark-surface
- [x] Commit e4ed705 exists: `feat(16-01): retheme AdminSidebar to white bg with lucide icons`
- [x] Commit 0851490 exists: `feat(16-01): retheme AdminTopBar to white bg with lucide Menu icon`
- [x] TypeScript compiles cleanly (npx tsc --noEmit with no output)
