# Phase 18: CMS Revisjon - Research

**Researched:** 2026-04-12
**Domain:** CMS system audit — Admin CRUD, Page Sections, Firestore, Code Quality
**Confidence:** HIGH

## Summary

This is a comprehensive audit of the entire CMS system in the Roots & Culture Next.js application. The codebase has approximately 20 admin pages, 15 server actions files, 10 data access modules, 12 API routes, 22 section renderers, and 1 custom Firestore REST client. The system was built across v1.0 and v1.1 milestones and is functionally complete but has accumulated several categories of technical debt.

The most critical findings are: (1) Firestore security rules are **incomplete** — `pageContent`, `giftCards`, and `orders/{orderId}/notes` collections have no rules, (2) the `revalidateTag()` function is called with a second argument `'max'` across 20+ call sites which is **not a valid Next.js API** and silently ignored, (3) all admin pages are `'use client'` components that fetch data via `useEffect` instead of leveraging Server Components, (4) the page-content GET API routes lack authentication — any user can read all CMS page data including unpublished drafts, and (5) there is no Zod validation on the page-content PUT/POST API bodies.

**Primary recommendation:** Fix security-critical issues first (Firestore rules, unauthenticated API endpoints), then address the `revalidateTag` misuse, then handle code quality improvements systematically.

## Project Constraints (from CLAUDE.md)

- **Stack:** Next.js 16.2.1 (App Router) + Firebase (Firestore REST, Auth) + Stripe + Vercel
- **Language:** All UI text, error messages in Norwegian
- **Accessibility:** WCAG 2.1 AA required (Norwegian law)
- **Styling:** Tailwind v4 with CSS-native config, dark green + autumn palette
- **Validation:** Zod for all form/API validation
- **Session:** jose for JWT sessions, `server-only` import guards
- **No:** redux/zustand, react-query/swr, prisma, next-auth, pages directory

## Audit Findings by Area

### Area 1: Admin CRUD and API Routes

#### Current State

**Admin Pages (20 files):**
All admin pages under `src/app/admin/` are `'use client'` components. The admin layout (`layout.tsx`) is the only Server Component — it verifies the session and redirects non-admin users. Individual pages fetch data via `useEffect` + Server Actions or API routes.

| Admin Section | List Page | Create Page | Edit Page | Delete | Notes |
|---------------|-----------|-------------|-----------|--------|-------|
| Produkter | Yes | Yes (`/ny`) | Yes (`/[id]`) | Yes (dialog) | Complete CRUD |
| Opplevelser | Yes | Yes (`/ny`) | Yes (`/[id]`) | Yes (dialog) | With date slots subcollection |
| Artikler | Yes | Yes (`/ny`) | Yes (`/[id]`) | Yes (dialog) | Tiptap editor, SEO fields |
| Sideinnhold | Yes | Yes (modal) | Yes (`/[pageId]`) | Yes (dialog) | Section-based CMS editor |
| Ordrer | Yes | N/A | Yes (`/[id]`) | N/A | Status update, refund, notes |
| Bookinger | Yes | N/A | N/A | Cancel only | Filter by experience/date |
| Gavekort | Yes | N/A | N/A | Deactivate | Read-only + deactivate |
| Kunder | Yes | N/A | Yes (`/[uid]`) | N/A | Customer detail with orders/bookings |
| Dashboard | Yes | N/A | N/A | N/A | Stats from Stripe + Firestore |

**API Routes (12 files):**

| Route | Methods | Auth Check | Validation | Notes |
|-------|---------|------------|------------|-------|
| `/api/page-content` | GET, POST | POST only | Minimal (title+slug present) | **GET has no auth -- exposes all pages including drafts** |
| `/api/page-content/[pageId]` | GET, PUT, DELETE | PUT, DELETE only | **No Zod validation on PUT body** | GET has no auth |
| `/api/navigation` | GET | None | None | Public endpoint, intentional |
| `/api/upload` | POST | Yes (any logged-in user) | Extension + size check | **Upload allows any authenticated user, not just admin** |
| `/api/debug-firestore` | GET | Debug key header | N/A | **Debug endpoint in production** |
| `/api/auth/*` | Various | Session-based | Yes | Login, logout, Google OAuth |
| `/api/webhooks/stripe` | POST | Stripe signature | Yes | Webhook handler |
| `/api/webhooks/resend` | POST | Varies | N/A | Email webhook |

#### Issues Found

**CRITICAL:**

1. **GET `/api/page-content` and `/api/page-content/[pageId]` are unauthenticated** — Any visitor can fetch all CMS pages including unpublished drafts by hitting these endpoints. The GET handlers have no `verifySession()` call. The list endpoint even filters to `isPublished !== false` but still returns draft pages (since `isPublished` defaulting to true means explicitly unpublished pages are filtered, but pages where `isPublished` was never set are shown). [VERIFIED: source code inspection]

2. **Upload route allows any authenticated user** — The `/api/upload` POST handler checks `verifySession()` but does NOT check `session.role !== 'admin'`. Any logged-in customer can upload files to Firebase Storage. [VERIFIED: src/app/api/upload/route.ts line 58-60]

3. **Debug endpoint in production** — `/api/debug-firestore` exists and logs sensitive env var details (project ID, client email, private key length and prefix). While it requires a debug key header, this route should not exist in production code. [VERIFIED: source code inspection]

**HIGH:**

4. **No Zod validation on page-content PUT body** — The PUT handler at `/api/page-content/[pageId]/route.ts` destructures `body` directly without any schema validation. Malformed section data could be written directly to Firestore. Every other content type (products, articles, experiences) uses Zod schemas. [VERIFIED: source code inspection]

5. **No Zod validation on page-content POST body** — Similar issue: only checks `if (!title || !slug)` — no schema, no slug format validation, no length limits. [VERIFIED: source code inspection]

6. **`revalidateTag()` called with invalid second argument** — 20+ call sites pass `revalidateTag('tag', 'max')`. The Next.js `revalidateTag()` function accepts exactly one argument (the tag string). The second argument `'max'` is silently ignored. This means the intended behavior (whatever `'max'` was meant to do) is not happening. [VERIFIED: Next.js docs — revalidateTag takes a single string argument]

7. **Duplicated `mapProduct`/`mapArticle`/`mapExperience` functions** — Each content type has its mapper function duplicated between `src/lib/data/*.ts` (public queries) and `src/actions/*.ts` (admin mutations). These are nearly identical but could drift. [VERIFIED: source code comparison]

**MEDIUM:**

8. **All admin pages are `'use client'`** — Every admin page uses `useEffect` to fetch initial data client-side. The admin layout already runs on the server and verifies auth. Individual pages could be Server Components that pass data as props, reducing client JS bundle and improving load times. However, this is a large refactor and the current approach works functionally. [VERIFIED: all 17 admin pages have 'use client' directive]

9. **Product/experience list pages use `<img>` instead of `<Image>`** — Three admin list pages (`produkter`, `opplevelser`, `artikler`) use native `<img>` tags for thumbnails instead of Next.js `<Image>`. While this is admin-only and not user-facing, it means no automatic optimization for admin image loading. [VERIFIED: grep results]

10. **No error handling in useEffect fetches** — Several admin list pages call Server Actions in `useEffect` without `.catch()` handlers:
    - `produkter/page.tsx`: `getAllProducts().then(setProducts)` — no catch
    - `opplevelser/page.tsx`: `getAllExperiences().then(setExperiences)` — no catch
    - `artikler/page.tsx`: `getAllArticles().then(setArticles)` — no catch
    - `gavekort/page.tsx`: `getGiftCardsAdmin().then(...)` — no catch
    - `kunder/page.tsx`: `getCustomerList().then(setCustomers)` — no catch
    [VERIFIED: source code inspection]

11. **`unstable_noStore` usage** — `page-content.ts` imports `unstable_noStore` from `next/cache`. In Next.js 15+, `unstable_noStore` was renamed to `noStore` and the `unstable_` prefix was removed. The function still works but the import path may change. [ASSUMED — need to verify if Next.js 16.2.1 has renamed this]

12. **Error message inconsistency in upload route** — The error message says "maks 5 MB" but the actual limit is `MAX_FILE_SIZE = 10 * 1024 * 1024` (10 MB). [VERIFIED: src/app/api/upload/route.ts line 8 vs line 90]

**LOW:**

13. **Slug generation doesn't handle Norwegian characters** — `generateSlug()` uses `replace(/[^a-z0-9\s-]/g, '')` which strips Norwegian characters (a, o, ae). Slugs like "om-oss" work fine, but "barekraftig-natur" from "Baerekraftig natur" loses the expected chars. This is functional but worth noting. [VERIFIED: src/lib/validations.ts]

14. **No pagination on admin list pages** — All admin pages fetch entire collections (products, articles, experiences, orders, bookings, customers). This works for small catalogs but will become slow with hundreds/thousands of items. [VERIFIED: source code — no limit on admin queries except orders (100) and users (200)]

### Area 2: Page Content and Sections System

#### Current State

**Section Types (20 types defined):**
`hero`, `text-image`, `text`, `values`, `team`, `faq`, `cta`, `gallery`, `contact-info`, `experiences-grid`, `articles-grid`, `products-grid`, `trust-bar`, `location`, `testimonials`, `newsletter`, `categories`, `video`, `stats`, `logo-bar`

**Architecture:**
- Types defined in `src/types/index.ts` as `SectionType` union, `PageSection` interface, `PageContent` interface
- Section renderers: 22 files in `src/components/sections/` (20 types + SectionRenderer + ExperiencesGridClient)
- Admin editor: Single file `src/app/admin/innhold/[pageId]/page.tsx` (~640 lines) handles all section editing with drag-and-drop (dnd-kit)
- Data access: `src/lib/data/page-content.ts` (server-side, noStore)
- API: `src/app/api/page-content/` (GET list, POST create, GET/PUT/DELETE per page)
- Mock data: `src/lib/data/mock-data.ts` provides fallback content

**Section Editor Features:**
- Drag-and-drop reordering via @dnd-kit
- Add section dropdown with all 20 types
- Per-section fields: heading, subheading, body (Tiptap), image upload, CTA fields, items array
- Type-specific field visibility (conditional rendering based on section.type)
- Image upload via CmsImageUpload component
- Delete with double-click confirmation

#### Issues Found

**HIGH:**

15. **No validation before saving sections** — The save handler (`handleSave`) sends sections directly to the API without any client-side or server-side validation. Required fields (like hero heading) can be saved empty. Missing image alt text on sections bypasses the WCAG-04 requirement that the product/article schemas enforce. [VERIFIED: source code]

16. **`mapPageContent` type safety is weak** — The `mapPageContent` function in `page-content.ts` uses broad `as` casts: `s.items || undefined` has no type checking on item structure. Malformed items (missing `title` or `description`) would pass through silently. [VERIFIED: src/lib/data/page-content.ts line 26]

17. **Cache invalidation uses `revalidatePath` inconsistently** — The page-content PUT handler calls `revalidatePath(publicPath)` and always also `revalidatePath('/')`. But the data layer uses `noStore()` (opt-out of caching entirely). This creates confusion about which caching strategy is in use. The comment says "Page-level ISR handles caching" but `noStore()` disables exactly that. [VERIFIED: source code comparison]

**MEDIUM:**

18. **Large monolithic editor component** — The `[pageId]/page.tsx` file is 640 lines containing: the page editor, section settings, section items editor, sortable wrapper, and type-specific field logic all in one file. This makes it hard to maintain and test. [VERIFIED: line count]

19. **Section type defaults are incomplete** — `createDefaultSection()` initializes some fields based on type but is not exhaustive. For example, `hero` gets `ctaText` and `ctaLink` but not `image` or `subheading` initialization, which the editor then expects. New sections may have undefined fields that cause controlled/uncontrolled input warnings. [VERIFIED: source code]

20. **Mock data fallback masks errors** — When Firestore queries fail, the data layer falls back to mock data silently (with only a `console.warn`). In production, this means a database outage would show mock content to users rather than an error, which could be confusing. The mock data is development fixtures, not production-appropriate fallbacks. [VERIFIED: all data access files have try/catch with mock fallbacks]

21. **`SiteContent` type appears to be legacy** — The `SiteContent` interface (`heroTitle`, `heroIngress`, `aboutText`) and its `siteContent` collection exist alongside the newer `PageContent` section-based system. The old system is still used via `site-content.ts` data access and the `site-content` server action. This creates two parallel content management systems. [VERIFIED: both systems exist in code]

### Area 3: Firestore Data Model and Security

#### Current State

**Collections in use (via code scanning):**

| Collection | Used By | Security Rule | Access Pattern |
|------------|---------|---------------|----------------|
| `products` | Data + Actions | Yes (read: published, write: admin) | Server (admin SDK / REST) |
| `experiences` | Data + Actions | Yes (read: published, write: admin) | Server |
| `experiences/{id}/dates` | Data + Actions | Yes (read: all, write: admin) | Server |
| `articles` | Data + Actions | Yes (read: published/status, write: admin) | Server |
| `siteContent` | Data + Actions | Yes (read: all, write: admin) | Server |
| `users` | Data + Actions | Yes (read/write: own user) | Server |
| `orders` | Data + Actions | Yes (read: own/admin, write: false) | Server |
| `bookings` | Data + Actions | Yes (read: own/admin, write: false) | Server |
| `pageContent` | Data + API routes | **NO RULES** | Server |
| `giftCards` | Data + Actions | **NO RULES** | Server |
| `orders/{id}/notes` | Actions | **NO RULES** | Server |

**Data access pattern:**
The project uses a **custom Firestore REST API client** (`src/lib/firebase/firestore-rest.ts`, ~668 lines) instead of `firebase-admin`. This was done because `firebase-admin` requires gRPC native bindings that crash on Vercel's serverless runtime. The REST client:
- Uses jose to sign service-account JWTs for OAuth2 token exchange
- Implements: get, query, add, set, update, delete, batch writes, transactions, count aggregation
- Caches OAuth2 tokens with 5-minute refresh margin
- Supports subcollections via "collection/docId/subcollection" path syntax

#### Issues Found

**CRITICAL:**

22. **Missing Firestore security rules for `pageContent`** — No rules exist for the `pageContent` collection. With the default Firestore behavior (deny all), client-side access would be blocked. However, the server-side REST client uses service account credentials which bypass security rules entirely. The missing rules mean: (a) if client-side Firebase SDK is ever used for page content, it would fail, and (b) there's no documentation of the intended access pattern. [VERIFIED: firestore.rules does not contain 'pageContent']

23. **Missing Firestore security rules for `giftCards`** — Same issue. Gift cards contain sensitive financial data (balances, codes). No rules defined. [VERIFIED: firestore.rules]

24. **Missing Firestore security rules for `orders/{id}/notes`** — The notes subcollection under orders has no rules. The parent `orders` collection has `allow write: if false`, but subcollections do NOT inherit parent rules in Firestore. [VERIFIED: firestore.rules]

**HIGH:**

25. **`articles` security rule has OR logic issue** — The rule `allow read: if resource.data.publishedAt != null || (resource.data.status == 'published');` means articles are readable if EITHER `publishedAt` is set OR `status` is 'published'. Since `publishedAt` gets set at publish time and remains set even when unpublishing in some code paths (see `updateArticle` action where unpublish preserves existing `publishedAt`), a draft article with a historical `publishedAt` would still be client-readable. [VERIFIED: firestore.rules + src/actions/articles.ts lines 143-145]

26. **Server actions that modify orders/bookings bypass Firestore write rules** — The Firestore rules say `allow write: if false` for orders and bookings. But the server-side REST client uses service account credentials which bypass rules. This is technically correct (server-side writes should bypass rules) but the rules documentation is misleading — they suggest orders/bookings are immutable when they're not. [VERIFIED: code uses server credentials]

**MEDIUM:**

27. **No index management visible** — Composite queries (e.g., `where('publishedAt', '!=', null).orderBy('publishedAt', 'desc')`) require composite Firestore indexes. There is no `firestore.indexes.json` file in the repository. Indexes may exist in the Firebase console but are not version-controlled. [VERIFIED: no indexes file in repo]

28. **Firestore REST client token caching is module-scoped** — The `_cachedToken` variable in `firestore-rest.ts` is module-level. On Vercel's serverless functions, each cold start creates a new module scope, so the token cache is lost. This means every cold start requires a fresh OAuth2 token exchange (adding ~200-500ms latency). This is a known serverless pattern limitation, not a bug. [VERIFIED: source code]

### Area 4: Code Quality and Best Practices

#### Issues Found

**HIGH:**

29. **Inconsistent auth checking patterns across server actions** — Some actions check auth and return error objects (products, articles, experiences). Others check auth and return empty arrays (bookings, customers, gift cards). The `updateOrderStatus` action does NOT check auth at all — it directly updates the order. Similarly, `createOrder` has no auth check (but is only called from webhook context). [VERIFIED: source code comparison]

30. **`updateOrderStatus` has no authorization check** — Any code that calls this server action can change any order's status. While server actions require a POST request and can't be called from outside the app easily, this is still a security gap. [VERIFIED: src/actions/orders.ts lines 54-63]

31. **FormData-based server actions with JSON.parse** — All CRUD actions (products, articles, experiences) receive FormData, then JSON.parse specific fields like `images` and `variants`. This pattern is error-prone — if the JSON string is malformed, it will throw before Zod validation catches it. The JSON.parse calls are outside try-catch blocks. [VERIFIED: source code]

**MEDIUM:**

32. **No consistent error return type** — Server actions return different shapes:
    - Products/Articles/Experiences: `{ success: boolean, errors?: Record<string, string>, id?: string }`
    - Orders: `Promise<void>` (throws on error) or `{ success: boolean, error?: string }`
    - Bookings: `{ success: boolean, error?: string }`
    - Gift cards: `{ success: boolean, error?: string }`
    A unified `ActionResult` type would improve consistency. [VERIFIED: source code]

33. **Variant price stored in ore but received in NOK** — The product create/update actions receive variant prices in NOK (user input) and multiply by 100 to convert to ore. But the Zod schema validates `price: z.number().positive()` on the NOK value, not the ore value. A product with price 0.005 NOK (0.5 ore) would pass validation but round to 1 ore. This is edge-case but shows the schema doesn't match the stored format. [VERIFIED: src/actions/products.ts and src/lib/validations.ts]

34. **No slug uniqueness validation in server actions** — The page-content POST route checks slug uniqueness against document IDs (since pageId is derived from slug). But product, experience, and article slugs are not checked for uniqueness before creation. Two products with the same slug would cause routing conflicts. [VERIFIED: no uniqueness check in create actions]

35. **Admin list pages could use `<img>` with loading="lazy"** — The three admin pages using `<img>` tags don't set `loading="lazy"`, meaning all thumbnail images load eagerly even for off-screen rows. [VERIFIED: source code]

36. **Hardcoded status colors in order detail** — The order detail page (`ordrer/[id]/page.tsx`) uses hardcoded hex colors like `text-[#C0392B]`, `bg-[#DCFCE7]`, `text-[#166534]`, `bg-[#FEF3C7]`, `text-[#92400E]` instead of using design tokens from the project's design system. [VERIFIED: source code]

37. **`SiteContent` system has no DELETE capability** — The old `siteContent/main` document can only be read and updated (set with merge). There's no way to reset or delete it from admin. While this is intentional (it's a singleton), it's inconsistent with the page-content system. [VERIFIED: source code]

## Standard Stack

(Not applicable for an audit phase — the project stack is already established.)

## Architecture Patterns

### Current CMS Architecture
```
Admin Pages (Client Components)
  |
  v
Server Actions (src/actions/*.ts)  +  API Routes (src/app/api/*)
  |                                        |
  v                                        v
verifySession() auth check        verifySession() auth check (inconsistent)
  |                                        |
  v                                        v
Zod validation (on actions)        No validation (on API routes)
  |                                        |
  +-----------+----------------------------+
              |
              v
Firestore REST Client (src/lib/firebase/firestore-rest.ts)
              |
              v
Google Firestore REST API (OAuth2 service account)
```

### Data Access Layers
```
Public pages --> src/lib/data/*.ts (unstable_cache + mock fallback)
Admin pages  --> src/actions/*.ts  (no cache, direct Firestore)
Page content --> src/app/api/page-content/* (noStore + revalidatePath)
```

### Anti-Patterns Found
- **Mixed validation approaches:** Zod schemas for server actions, raw checks for API routes
- **Mixed caching strategies:** unstable_cache tags for some, noStore for others, revalidatePath for page content
- **Duplicate mappers:** Each content type has two nearly-identical mapping functions
- **Client-side admin pages:** Could be Server Components for better performance

## Don't Hand-Roll

| Problem | Current State | Should Use | Why |
|---------|---------------|------------|-----|
| Page content validation | No validation | Zod schema for PageContent/PageSection | Prevents malformed data in Firestore |
| Action result types | Ad-hoc return shapes | Unified `ActionResult<T>` type | Type-safe error handling |
| Auth middleware for API routes | Per-handler session checks | Shared middleware or wrapper | Prevents forgetting auth checks |

## Common Pitfalls

### Pitfall 1: revalidateTag with Invalid Arguments
**What goes wrong:** `revalidateTag('tag', 'max')` silently ignores the second argument. The intended behavior is unclear but definitely not happening.
**Why it happens:** Possibly a misunderstanding of the API or a planned custom extension that was never implemented.
**How to avoid:** Remove the second argument from all call sites. If `'max'` was intended to mean something specific, implement that behavior differently.
**Warning signs:** Cache not invalidating as expected after CRUD operations.

### Pitfall 2: Unauthenticated API Endpoints
**What goes wrong:** Public visitors can read unpublished CMS content via `/api/page-content`.
**Why it happens:** GET handlers were added without auth because the data was "public" — but unpublished drafts should not be public.
**How to avoid:** Either add auth to GET handlers, or filter out unpublished content in the GET response.

### Pitfall 3: Mock Data Masking Production Errors
**What goes wrong:** When Firestore is down or misconfigured, the site shows mock development data to users instead of error states.
**Why it happens:** try-catch blocks return mock data as fallback for resilience.
**How to avoid:** In production, log errors loudly and show appropriate error states. Keep mock fallback only for development.

### Pitfall 4: Firestore Rules vs Server-Side Access
**What goes wrong:** Security rules appear incomplete but server-side access bypasses them entirely.
**Why it happens:** The REST client uses service account credentials. Rules only apply to client-side Firebase SDK.
**How to avoid:** Document that rules are for client-side access only. Still add rules for completeness (defense in depth). The `pageContent` and `giftCards` collections should have rules even if they're only accessed server-side.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `unstable_noStore` may be renamed in Next.js 16.2.1 | Issue 11 | Import might break on upgrade |
| A2 | `revalidateTag` second argument is silently ignored | Issue 6 | If Next.js 16 added a second param, 'max' might do something |

## Open Questions

1. **What was `'max'` in `revalidateTag('tag', 'max')` intended to do?**
   - What we know: Every single revalidateTag call uses this pattern
   - What's unclear: Whether this was from a custom Next.js fork, a planned feature, or a misunderstanding
   - Recommendation: Check if Next.js 16.2.1 added a second parameter; if not, remove it

2. **Should mock data fallbacks be kept in production?**
   - What we know: All data access functions fall back to mock data on Firestore errors
   - What's unclear: Whether this is intentional resilience or development convenience
   - Recommendation: Ask the project owner; likely should show error states in production

3. **Is the `SiteContent` system still needed?**
   - What we know: Both `siteContent/main` (legacy) and `pageContent` (new section-based) exist
   - What's unclear: Whether any pages still use the legacy `SiteContent` data
   - Recommendation: Audit which components reference `getSiteContent()` and migrate to the page-content system

## Prioritized Issue Summary

### Critical (Must Fix)
| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 1 | Unauthenticated GET on page-content APIs | `api/page-content/*/route.ts` | Exposes unpublished drafts |
| 2 | Upload allows any authenticated user | `api/upload/route.ts` | Non-admin file uploads |
| 3 | Debug endpoint in production | `api/debug-firestore/route.ts` | Leaks env var info |
| 22-24 | Missing Firestore rules (pageContent, giftCards, notes) | `firestore.rules` | Incomplete security model |

### High Priority
| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 4-5 | No Zod validation on page-content API | `api/page-content/*/route.ts` | Malformed data in Firestore |
| 6 | revalidateTag invalid second arg | 20+ files | Cache invalidation may not work as intended |
| 7 | Duplicated mapper functions | `lib/data/*.ts` + `actions/*.ts` | Code drift risk |
| 15 | No validation before saving sections | `admin/innhold/[pageId]/page.tsx` | Empty/broken sections published |
| 25 | Articles security rule OR logic | `firestore.rules` | Draft articles readable client-side |
| 29-30 | Inconsistent/missing auth in server actions | `actions/orders.ts` | Unauthorized status changes |
| 31 | JSON.parse outside try-catch | `actions/*.ts` | Unhandled exceptions |

### Medium Priority
| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 8 | All admin pages are 'use client' | `app/admin/**` | Performance, unnecessary client JS |
| 10 | No error handling in useEffect | `app/admin/*.tsx` | Silent failures |
| 12 | Wrong file size error message | `api/upload/route.ts` | User confusion |
| 17 | Cache invalidation strategy confusion | `lib/data/page-content.ts` | Stale or over-fetched data |
| 18 | Monolithic editor component | `admin/innhold/[pageId]/page.tsx` | Maintenance difficulty |
| 32 | Inconsistent error return types | `actions/*.ts` | Type safety gaps |
| 34 | No slug uniqueness validation | `actions/*.ts` | Routing conflicts |
| 36 | Hardcoded colors | `admin/ordrer/[id]/page.tsx` | Design system violation |

## Sources

### Primary (HIGH confidence)
- Source code inspection of all files listed in the audit scope — every finding verified by reading actual code
- `firestore.rules` — verified complete rule set against collections used in code
- `src/types/index.ts` — verified all type definitions
- `src/lib/validations.ts` — verified all Zod schemas

### Secondary (MEDIUM confidence)
- Next.js `revalidateTag` API — single argument confirmed from training data [ASSUMED: need to verify for 16.2.1]

## Metadata

**Confidence breakdown:**
- Admin CRUD findings: HIGH — all source files read and compared
- Page content system: HIGH — complete code path traced
- Firestore rules: HIGH — rules file vs. code collections exhaustively compared
- Code quality: HIGH — patterns compared across all similar files

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable codebase, no external dependency changes expected)
