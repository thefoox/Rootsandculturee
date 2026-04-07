---
phase: 10-gavekort-kundekonto-og-seo
plan: 01
subsystem: ui
tags: [next.js, metadata, seo, tailwind, firebase, auth]

# Dependency graph
requires:
  - phase: 09-design-system-og-polish
    provides: UI components and design tokens used by GavekortForm
provides:
  - Gavekort page with server-side metadata export for SEO
  - GavekortForm client component with all purchase logic
  - Konto layout with correct top padding to clear fixed header
  - Order detail page with email-fallback ownership security check
affects: [10-gavekort-kundekonto-og-seo, seo, konto]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server wrapper + client form pattern: extract 'use client' logic to a separate component so the page can export Next.js Metadata"

key-files:
  created:
    - src/components/gavekort/GavekortForm.tsx
  modified:
    - src/app/(public)/gavekort/page.tsx
    - src/app/konto/layout.tsx
    - src/app/konto/ordrer/[id]/page.tsx

key-decisions:
  - "Moved 'use client' form logic to GavekortForm.tsx so page.tsx can remain a server component and export Metadata — standard Next.js pattern for SEO on interactive pages"
  - "Order detail security check extended to email match: allows guest checkouts converted to logged-in sessions to access their orders"
  - "Konto layout top padding set to pt-28 pb-8 md:pt-32 to clear the fixed header plus tab bar height"

patterns-established:
  - "Server wrapper + client form: when a page needs both Next.js Metadata and client-side interactivity, create a <Name>Form.tsx client component and a thin server page.tsx that exports metadata and renders the form"

requirements-completed: [GAVE-01, GAVE-02, GAVE-03, GAVE-04, KONTO-01, KONTO-02, KONTO-03, KONTO-04]

# Metrics
duration: 15min
completed: 2026-04-07
---

# Phase 10 Plan 01: Gavekort SEO og kundekonto-fikser Summary

**Gavekort page converted to server+client pattern for Next.js Metadata export; konto layout header overlap and order detail email-fallback security fixed**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-07T22:35:00Z
- **Completed:** 2026-04-07T22:49:58Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- Gavekort page now exports Norwegian SEO metadata (title, description, OpenGraph) via server component — discoverable by search engines
- GavekortForm.tsx created as a dedicated client component with all original state/logic intact
- Konto layout container padding changed from py-8 to pt-28 pb-8 md:pt-32, clearing the fixed header on both mobile and desktop
- Order detail security check extended: users can now view orders matched by email (covers guest-checkout-to-logged-in edge case)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract GavekortForm client component and add server metadata wrapper** - `2cf4b59` (feat)
2. **Task 2: Fix konto layout header overlap and order detail security check** - `af5c832` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/components/gavekort/GavekortForm.tsx` - New client component with full gavekort purchase UI (amount selection, recipient form, cart add logic)
- `src/app/(public)/gavekort/page.tsx` - Rewritten as server component exporting Metadata, renders GavekortForm
- `src/app/konto/layout.tsx` - Container changed from py-8 to pt-28 pb-8 md:pt-32 to clear fixed header
- `src/app/konto/ordrer/[id]/page.tsx` - Security check extended with email fallback for guest-checkout orders

## Decisions Made
- Used the server wrapper + client form pattern (standard Next.js pattern) rather than alternatives like `generateMetadata` with forced client rendering — this is the cleanest approach for pages needing both SEO and client interactivity
- Email fallback in order detail security check is additive (OR logic): UID match still works, email match is an additional allowed path — no security regression

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- GAVE-01 through GAVE-04 and KONTO-01 through KONTO-04 requirements are satisfied
- Gift card system data layer (gift-cards.ts, actions/gift-cards.ts, admin page, checkout wiring, webhook handler) was already in place and verified unchanged
- Ready for plan 02 (remaining SEO and kundekonto tasks in this phase)

---
*Phase: 10-gavekort-kundekonto-og-seo*
*Completed: 2026-04-07*
