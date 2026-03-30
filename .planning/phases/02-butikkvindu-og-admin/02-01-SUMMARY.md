---
phase: 02-butikkvindu-og-admin
plan: 01
subsystem: ui
tags: [next.js, firestore, server-components, ssr, isr, seo, wcag, tailwind-v4]

requires:
  - phase: 01-fundament
    provides: "Root layout, Header/Footer, Button/Input components, Firebase Admin SDK, Tailwind v4 theme tokens, auth actions"
provides:
  - "Product, Experience, Article, SiteContent TypeScript types"
  - "Firestore data access layer with unstable_cache (products, experiences, articles, site-content)"
  - "Norwegian format utilities (formatPrice, formatDate, formatDateMedium)"
  - "14 UI components for public storefront (product, experience, blog, shared)"
  - "6 public pages with SEO metadata and ISR (/produkter, /opplevelser, /blogg + detail pages)"
  - "Dynamic sitemap.xml and robots.txt"
  - "Phase 2 CSS tokens (badge colors, admin sidebar, article prose styles)"
affects: [02-02-admin-cms, phase-03-checkout, phase-04-customer-dashboard]

tech-stack:
  added: []
  patterns:
    - "Server-only data access with unstable_cache for Firestore reads"
    - "Null guard on Firebase Admin SDK for build-time safety"
    - "Public route group (public) with pass-through layout"
    - "Full-width hero images via unconstrained root <main>"
    - "ISR with revalidate=3600 on all public pages"

key-files:
  created:
    - src/lib/data/products.ts
    - src/lib/data/experiences.ts
    - src/lib/data/articles.ts
    - src/lib/data/site-content.ts
    - src/lib/format.ts
    - src/components/products/ProductCard.tsx
    - src/components/products/ProductGrid.tsx
    - src/components/products/ProductGallery.tsx
    - src/components/products/CategoryTabs.tsx
    - src/components/experiences/ExperienceCard.tsx
    - src/components/experiences/ExperienceList.tsx
    - src/components/experiences/DifficultyBadge.tsx
    - src/components/experiences/SpotsRemaining.tsx
    - src/components/blog/BlogCard.tsx
    - src/components/blog/BlogGrid.tsx
    - src/components/blog/ArticleProse.tsx
    - src/components/shared/HeroImage.tsx
    - src/components/shared/PriceBadge.tsx
    - src/components/shared/EmptyState.tsx
    - src/app/(public)/layout.tsx
    - src/app/(public)/produkter/page.tsx
    - src/app/(public)/produkter/[slug]/page.tsx
    - src/app/(public)/opplevelser/page.tsx
    - src/app/(public)/opplevelser/[slug]/page.tsx
    - src/app/(public)/blogg/page.tsx
    - src/app/(public)/blogg/[slug]/page.tsx
    - src/app/sitemap.ts
    - src/app/robots.ts
  modified:
    - src/types/index.ts
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/lib/firebase/admin.ts
    - src/actions/auth.ts

key-decisions:
  - "Firebase Admin SDK returns null when credentials missing, enabling builds without env vars"
  - "Root layout <main> unconstrained; each page controls its own max-width for full-width hero support"
  - "Public route group uses pass-through layout (no duplicate Header/Footer)"

patterns-established:
  - "Data access pattern: server-only + unstable_cache + null guard on adminDb"
  - "Page container pattern: each page wraps content in mx-auto max-w-[1200px] px-4 md:px-8"
  - "Hero image pattern: full-width via unconstrained <main>, with gradient overlay and title"

requirements-completed: [PROD-01, PROD-02, BOOK-01, BOOK-02, BOOK-07, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, WCAG-04]

duration: 7min
completed: 2026-03-30
---

# Phase 02 Plan 01: Public Storefront Summary

**Product catalog, experience listing, blog pages with category filtering, Firestore data layer, and full SEO infrastructure (sitemap, robots.txt, metadata)**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-30T19:55:10Z
- **Completed:** 2026-03-30T20:02:10Z
- **Tasks:** 3
- **Files modified:** 34

## Accomplishments
- Complete Firestore data access layer with unstable_cache for products, experiences, articles, and site content
- 14 UI components implementing the 02-UI-SPEC design contract (product cards/grid/gallery, experience cards/list, blog cards/grid, shared components)
- 6 public SSR/ISR pages with SEO metadata, generateStaticParams, and revalidate=3600
- Dynamic sitemap.xml with all content slugs and robots.txt disallowing admin/API routes
- Phase 2 CSS tokens (difficulty badges, admin sidebar color, article prose styles)

## Task Commits

Each task was committed atomically:

1. **Task 1: TypeScript types, Firestore data layer, CSS tokens, and format utilities** - `4f62d8d` (feat)
2. **Task 2: Public storefront components and all public pages with SEO metadata** - `d518f8f` (feat)
3. **Task 3: Sitemap, robots.txt, and root layout adjustment** - `cf5d0ff` (feat)

## Files Created/Modified
- `src/types/index.ts` - Extended with Product, Experience, Article, SiteContent types
- `src/lib/data/products.ts` - Server-only Firestore access for products with cache
- `src/lib/data/experiences.ts` - Server-only Firestore access for experiences with cache
- `src/lib/data/articles.ts` - Server-only Firestore access for articles with cache
- `src/lib/data/site-content.ts` - Server-only Firestore access for site content with cache
- `src/lib/format.ts` - Norwegian formatPrice (NOK ore) and formatDate utilities
- `src/app/globals.css` - Phase 2 CSS tokens and article prose styles
- `src/components/products/*.tsx` - ProductCard, ProductGrid, ProductGallery, CategoryTabs
- `src/components/experiences/*.tsx` - ExperienceCard, ExperienceList, DifficultyBadge, SpotsRemaining
- `src/components/blog/*.tsx` - BlogCard, BlogGrid, ArticleProse
- `src/components/shared/*.tsx` - HeroImage, PriceBadge, EmptyState
- `src/app/(public)/**/*.tsx` - All public pages with route group layout
- `src/app/sitemap.ts` - Dynamic sitemap generation
- `src/app/robots.ts` - Robots.txt with admin/API disallow rules
- `src/app/layout.tsx` - Removed max-width from <main> for full-width hero support
- `src/app/page.tsx` - Added max-width container wrapper
- `src/lib/firebase/admin.ts` - Null guard for missing credentials
- `src/actions/auth.ts` - Handle nullable adminAuth/adminDb

## Decisions Made
- Firebase Admin SDK gracefully returns null when credentials are missing, allowing builds to succeed without env vars. Data functions return empty arrays/null in this case.
- Root layout `<main>` no longer constrains width -- each page controls its own container. This enables full-width hero images on detail pages while keeping catalog pages contained.
- Public route group `(public)` uses a pass-through layout since root layout already provides Header/Footer.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Firebase Admin SDK null guard for build-time safety**
- **Found during:** Task 2 (build verification)
- **Issue:** `npm run build` failed because Firebase Admin SDK threw when FIREBASE_PROJECT_ID env var was missing during static page generation
- **Fix:** Made admin.ts return null for adminDb/adminAuth when credentials are missing. Updated all data functions with `if (!adminDb) return []` guards. Updated auth actions with null checks.
- **Files modified:** src/lib/firebase/admin.ts, src/lib/data/products.ts, src/lib/data/experiences.ts, src/lib/data/articles.ts, src/lib/data/site-content.ts, src/actions/auth.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** d518f8f (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for builds to succeed without Firebase credentials. No scope creep.

## Issues Encountered
- Pre-existing build issue: Firebase client SDK (`src/lib/firebase/client.ts`) errors during `npm run build` on `/_not-found` page because `NEXT_PUBLIC_FIREBASE_*` env vars are not set. This is a Phase 1 issue not caused by this plan's changes. The client SDK initializes in the Header component which renders on all pages including the generated `_not-found` page. This should be addressed in a separate fix.

## User Setup Required

None - no external service configuration required beyond existing Firebase env vars.

## Next Phase Readiness
- All public storefront pages are ready for the admin CMS (Plan 02-02) to populate with data
- Data access layer is complete and ready for use in admin CRUD operations
- Sitemap dynamically generates URLs from data -- will automatically include new content
- The "Legg i handlekurv" and "Bestill opplevelse" buttons are rendered disabled with aria-disabled for Phase 3 (checkout)

## Self-Check: PASSED

All 29 files verified present. All 3 task commits verified (4f62d8d, d518f8f, cf5d0ff).

---
*Phase: 02-butikkvindu-og-admin*
*Completed: 2026-03-30*
