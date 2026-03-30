---
phase: 02-butikkvindu-og-admin
plan: 02
subsystem: ui
tags: [next.js, firestore, firebase-storage, tiptap, zod, admin-cms, crud, wcag, tailwind-v4]

requires:
  - phase: 01-fundament
    provides: "Root layout, Header/Footer, Button/Input/FormError components, Firebase Admin SDK, auth actions, DAL, middleware"
  - phase: 02-butikkvindu-og-admin
    plan: 01
    provides: "Product/Experience/Article/SiteContent types, Firestore data layer, format utilities, Phase 2 CSS tokens"
provides:
  - "Firebase Storage upload helper with progress tracking and file validation"
  - "Zod validation schemas for products, experiences, articles, and site content"
  - "10 admin UI components (AdminShell, AdminSidebar, DataTable, ImageUpload, TiptapEditor, PublishBar, DeleteConfirmDialog, StatusBadge, DateSlotsEditor, ContentBlockEditor)"
  - "Admin layout with sidebar navigation, auth guard, and mobile drawer"
  - "CRUD Server Actions for products, experiences, articles, and site content"
  - "11 admin pages: dashboard, product list/new/edit, experience list/new/edit, article list/new/edit, site content"
affects: [phase-03-checkout, phase-04-customer-dashboard]

tech-stack:
  added: ["@tiptap/react", "@tiptap/starter-kit", "@tiptap/extension-link", "@tiptap/extension-image", "@tiptap/extension-underline", "@tiptap/pm"]
  patterns:
    - "Admin layout overlays root layout via fixed positioning (z-200) to avoid Header/Footer"
    - "Server Actions validate with Zod, verify admin session, write via adminDb, revalidateTag('...', 'max')"
    - "Client-side image upload to Firebase Storage with progress tracking"
    - "Admin pages fetch data via server actions (not server-only data layer) for client component compatibility"

key-files:
  created:
    - src/lib/firebase/storage.ts
    - src/lib/validations.ts
    - src/components/admin/AdminShell.tsx
    - src/components/admin/AdminSidebar.tsx
    - src/components/admin/AdminTopBar.tsx
    - src/components/admin/AdminBreadcrumb.tsx
    - src/components/admin/DataTable.tsx
    - src/components/admin/ImageUpload.tsx
    - src/components/admin/TiptapEditor.tsx
    - src/components/admin/PublishBar.tsx
    - src/components/admin/DeleteConfirmDialog.tsx
    - src/components/admin/StatusBadge.tsx
    - src/components/admin/DateSlotsEditor.tsx
    - src/components/admin/ContentBlockEditor.tsx
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
    - src/app/admin/produkter/page.tsx
    - src/app/admin/produkter/ny/page.tsx
    - src/app/admin/produkter/[id]/page.tsx
    - src/app/admin/opplevelser/page.tsx
    - src/app/admin/opplevelser/ny/page.tsx
    - src/app/admin/opplevelser/[id]/page.tsx
    - src/app/admin/artikler/page.tsx
    - src/app/admin/artikler/ny/page.tsx
    - src/app/admin/artikler/[id]/page.tsx
    - src/app/admin/innhold/page.tsx
    - src/actions/products.ts
    - src/actions/experiences.ts
    - src/actions/articles.ts
    - src/actions/site-content.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Admin layout uses fixed positioning (z-200) to overlay root Header/Footer instead of restructuring route groups"
  - "revalidateTag requires second arg 'max' in Next.js 16 -- updated all calls accordingly"
  - "Admin pages use client components calling server actions for data fetching, not server-only data layer (which cannot be imported in client components)"
  - "Articles collection named 'articles' (consistent with Plan 01 data layer) not 'blog' as plan suggested"

patterns-established:
  - "Admin CRUD pattern: client page form -> FormData -> server action -> Zod validate -> adminDb write -> revalidateTag"
  - "Image upload pattern: client-side Firebase Storage upload with progress -> store URL+alt in form state -> submit as JSON in hidden field"
  - "Admin navigation: usePathname() for active state, aria-current='page' on active link"
  - "Delete pattern: DataTable onDelete -> DeleteConfirmDialog -> server action -> toast feedback"

requirements-completed: [ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-07, ADMN-08, WCAG-04]

duration: 11min
completed: 2026-03-30
---

# Phase 02 Plan 02: Admin CMS Summary

**Complete admin CMS with sidebar navigation, CRUD for products/experiences/articles, Tiptap rich text editor, Firebase Storage image upload with mandatory alt-text, and site content editing**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-30T20:05:25Z
- **Completed:** 2026-03-30T20:16:25Z
- **Tasks:** 2
- **Files modified:** 32

## Accomplishments
- Complete admin CMS at /admin/* with sidebar navigation, auth guard, and mobile drawer
- 10 reusable admin UI components including DataTable, ImageUpload with drag-and-drop, TiptapEditor with Norwegian aria-labels, PublishBar, DeleteConfirmDialog
- CRUD Server Actions for products (with ore price conversion), experiences (with date subcollections), articles (with auto-excerpt and publish/unpublish), and site content
- 11 admin pages covering dashboard, product list/new/edit, experience list/new/edit, article list/new/edit, and site content editing
- All image uploads enforce mandatory alt-text via Zod validation schema (WCAG-04)
- Zod validation schemas for all content types with Norwegian error messages

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin shell, shared components, Tiptap, validations, Firebase Storage** - `00d4a5f` (feat)
2. **Task 2: Admin CRUD Server Actions and all admin pages** - `9e89795` (feat)

## Files Created/Modified
- `src/lib/firebase/storage.ts` - Client-side Firebase Storage upload with progress tracking
- `src/lib/validations.ts` - Zod schemas for products, experiences, articles, site content with imageSchema enforcing alt-text
- `src/components/admin/AdminShell.tsx` - Two-panel admin layout with fixed overlay and mobile drawer
- `src/components/admin/AdminSidebar.tsx` - Dark sidebar with nav links, active state, logout
- `src/components/admin/AdminTopBar.tsx` - Mobile hamburger bar
- `src/components/admin/AdminBreadcrumb.tsx` - Breadcrumb with linked parents
- `src/components/admin/DataTable.tsx` - Generic CRUD table with edit/delete actions and empty state
- `src/components/admin/ImageUpload.tsx` - Drag-and-drop image upload with mandatory alt-text fields
- `src/components/admin/TiptapEditor.tsx` - Rich text editor with toolbar and Norwegian aria-labels
- `src/components/admin/PublishBar.tsx` - Sticky save draft / publish bar
- `src/components/admin/DeleteConfirmDialog.tsx` - Confirmation dialog with focus trap
- `src/components/admin/StatusBadge.tsx` - Published/Draft badge
- `src/components/admin/DateSlotsEditor.tsx` - Repeatable date+seats rows
- `src/components/admin/ContentBlockEditor.tsx` - Single/multiline content editor
- `src/app/admin/layout.tsx` - Admin layout with session verification
- `src/app/admin/page.tsx` - Dashboard with content counts
- `src/app/admin/produkter/*.tsx` - Product list, new, edit pages
- `src/app/admin/opplevelser/*.tsx` - Experience list, new, edit pages
- `src/app/admin/artikler/*.tsx` - Article list, new, edit pages
- `src/app/admin/innhold/page.tsx` - Site content editing page
- `src/actions/products.ts` - Product CRUD with Zod, ore conversion, revalidateTag
- `src/actions/experiences.ts` - Experience CRUD with date subcollections
- `src/actions/articles.ts` - Article CRUD with auto-excerpt, publish/unpublish
- `src/actions/site-content.ts` - Site content upsert with fetchSiteContent helper
- `package.json` - Added Tiptap dependencies

## Decisions Made
- Admin layout uses `position: fixed; inset: 0; z-index: 200` to overlay root layout's Header/Footer, avoiding route group restructuring. Admin is always full-screen so this is appropriate.
- Next.js 16 requires a second argument for `revalidateTag()` -- using `'max'` for full cache purge after admin writes.
- Admin pages are client components that call server actions for data fetching, since the server-only data layer (`src/lib/data/*`) cannot be imported in client components.
- Articles Firestore collection named `'articles'` (consistent with Plan 01 data layer), not `'blog'` as plan initially suggested.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] revalidateTag requires second argument in Next.js 16**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** `revalidateTag(tag)` with single argument causes TypeScript error in Next.js 16.2.1 -- the function now requires `revalidateTag(tag, profile)` where profile is `'max'` or a CacheLifeConfig
- **Fix:** Updated all revalidateTag calls across all 4 action files to pass `'max'` as second argument
- **Files modified:** src/actions/products.ts, src/actions/experiences.ts, src/actions/articles.ts, src/actions/site-content.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 9e89795 (Task 2 commit)

**2. [Rule 3 - Blocking] Site content page cannot import server-only module**
- **Found during:** Task 2 (site content page)
- **Issue:** `getSiteContent()` from `src/lib/data/site-content.ts` is `server-only` and cannot be imported in a `'use client'` component
- **Fix:** Added `fetchSiteContent()` server action to `src/actions/site-content.ts` and used it instead
- **Files modified:** src/actions/site-content.ts, src/app/admin/innhold/page.tsx
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 9e89795 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correct compilation. No scope creep.

## Issues Encountered
- Pre-existing build issue: Firebase client SDK (`src/lib/firebase/client.ts`) errors during `npm run build` on `/_not-found` page because `NEXT_PUBLIC_FIREBASE_*` env vars are not set. Same issue documented in Plan 01 summary. Not caused by this plan's changes. TypeScript compilation passes cleanly.

## User Setup Required

None - no external service configuration required beyond existing Firebase env vars.

## Known Stubs

None - all admin pages are fully wired to server actions and Firestore. No placeholder data or hardcoded values.

## Next Phase Readiness
- Admin CMS is fully functional for populating storefront content
- All CRUD operations create/update/delete Firestore documents and revalidate cache tags
- Public storefront pages (Plan 01) will automatically show updated content via ISR revalidation
- "Legg i handlekurv" and "Bestill opplevelse" buttons on public pages remain disabled, ready for Phase 3 (checkout)
- Order management admin pages will be added in Phase 3

## Self-Check: PASSED

All 30 files verified present. All 2 task commits verified (00d4a5f, 9e89795).

---
*Phase: 02-butikkvindu-og-admin*
*Completed: 2026-03-30*
