---
phase: 10-gavekort-kundekonto-og-seo
plan: 02
subsystem: ui
tags: [seo, metadata, json-ld, schema.org, open-graph, next.js]

# Dependency graph
requires: []
provides:
  - Home page metadata export with Norwegian title, description, and openGraph
  - opplevelser listing openGraph block for social sharing
  - articleJsonLd function (schema.org Article) in json-ld.ts
  - JSON-LD script tag on article detail pages (blogg/[slug])
affects: [seo, blogg, opplevelser, forside]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js metadata export pattern for page-level SEO overrides"
    - "schema.org JSON-LD script tag via dangerouslySetInnerHTML in Server Components"

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/app/(public)/opplevelser/page.tsx
    - src/lib/json-ld.ts
    - src/app/(public)/blogg/[slug]/page.tsx

key-decisions:
  - "Home page gets its own metadata export rather than relying on layout.tsx defaults"
  - "articleJsonLd uses metaTitle/metaDescription with title/excerpt as fallbacks"

patterns-established:
  - "JSON-LD pattern: import helper from json-ld.ts, render <script type=application/ld+json> as first child of fragment"

requirements-completed: [SEO-01, SEO-02, SEO-03, SEO-04]

# Metrics
duration: 8min
completed: 2026-04-07
---

# Phase 10 Plan 02: SEO Metadata and JSON-LD Summary

**Norwegian metadata on all public pages plus schema.org Article JSON-LD for blog posts, completing structured data coverage across all three content types (Product, Event, Article)**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-07T00:00:00Z
- **Completed:** 2026-04-07T00:08:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Home page now exports rich Norwegian metadata with openGraph instead of inheriting bare layout defaults
- opplevelser listing page has openGraph block for social media link previews
- `articleJsonLd` added to `json-ld.ts` — all three content types (Product, Event, Article) now have structured data helpers
- Blog article detail pages render `application/ld+json` script tag with full schema.org Article markup (headline, description, author, publisher, dates, url)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add home page metadata and opplevelser Open Graph** - `8c7cd28` (feat)
2. **Task 2: Add articleJsonLd and JSON-LD script to article detail page** - `50f00c0` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/page.tsx` - Added Metadata export with Norwegian title, description, and openGraph
- `src/app/(public)/opplevelser/page.tsx` - Added openGraph block to existing metadata object
- `src/lib/json-ld.ts` - Added articleJsonLd(article: Article) function with schema.org Article type; updated import to include Article
- `src/app/(public)/blogg/[slug]/page.tsx` - Imported articleJsonLd; added application/ld+json script tag as first child of return fragment

## Decisions Made
- Home page gets its own `export const metadata` rather than relying on the layout.tsx default ("Roots & Culture" with no description) — gives search engines a proper page-specific title and description
- `articleJsonLd` uses `metaTitle || title` and `metaDescription || excerpt` as fallbacks so articles missing explicit SEO fields still produce valid structured data

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SEO coverage is now complete across all public pages and all content types
- sitemap.ts and robots.ts were already correct and not modified
- Ready for remaining phase 10 plans (gavekort, kundekonto)

---
*Phase: 10-gavekort-kundekonto-og-seo*
*Completed: 2026-04-07*
