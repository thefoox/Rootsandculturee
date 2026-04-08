---
phase: 13-prodklar-opprydding
plan: "01"
subsystem: security
tags: [security, cms, api, headers, xss, auth]
dependency_graph:
  requires: []
  provides: [cms-auth-guard, security-headers, html-sanitization]
  affects: [src/app/api/page-content, src/components/sections, src/app/(public)/om-oss, next.config.ts]
tech_stack:
  added: []
  patterns: [verifySession-guard, sanitizeHtml-wrapper, next-security-headers]
key_files:
  created: []
  modified:
    - src/app/api/page-content/[pageId]/route.ts
    - src/app/api/page-content/route.ts
    - next.config.ts
    - src/components/sections/TextSection.tsx
    - src/components/sections/TextImageSection.tsx
    - src/app/(public)/om-oss/page.tsx
key_decisions:
  - "Restored revalidateTag second arg ('max') — this Next.js 16.2.x version type-requires two arguments; removing it causes TS errors"
  - "GET /api/page-content filters isPublished !== false for unauthenticated callers; admin CMS uses authenticated [pageId] route directly"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-08T09:13:05Z"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 6
---

# Phase 13 Plan 01: Security Critical Fixes Summary

Auth-gated CMS write endpoints (PUT/POST), added HTTP security headers to all responses, and wrapped all CMS `dangerouslySetInnerHTML` calls with `sanitizeHtml()` to prevent XSS.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Delete credentials file and lock down CMS write endpoints | 692eedd | `[pageId]/route.ts`, `route.ts` |
| 2 | Add HTTP security headers to next.config.ts | 8c3395f | `next.config.ts`, `[pageId]/route.ts` |
| 3 | Sanitize dangerouslySetInnerHTML in CMS section components | 0fb94ab | `TextSection.tsx`, `TextImageSection.tsx`, `om-oss/page.tsx` |

## What Was Done

**Task 1 — CMS endpoint auth + credential cleanup:**
- Deleted `roots-and-culture-firebase-adminsdk-fbsvc-ecf479a4eb.json` from project root (was gitignored, never committed, but existed on disk)
- Added `verifySession()` + admin role check at the top of PUT `/api/page-content/[pageId]` — matches the existing pattern used by DELETE on the same route
- Added `verifySession()` + admin role check to POST `/api/page-content`
- Added `isPublished !== false` filter to GET `/api/page-content` for unauthenticated callers — draft pages no longer leak via the public API

**Task 2 — HTTP security headers:**
- Added `async headers()` to `next.config.ts` with source `/(.*)`
- Headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-DNS-Prefetch-Control: on`, and a permissive initial Content-Security-Policy covering Firebase + Stripe origins

**Task 3 — HTML sanitization:**
- `TextSection.tsx`: imports `sanitizeHtml` from `@/lib/sanitize`, wraps `section.body`
- `TextImageSection.tsx`: imports `sanitizeHtml`, wraps `section.body`
- `om-oss/page.tsx`: imports `sanitizeHtml`, wraps `storySection.body`
- `ArticleProse` was already sanitized — not touched

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Restored `revalidateTag` second argument**
- **Found during:** Task 2 (TypeScript check after removing `'max'` second arg)
- **Issue:** Plan specified removing `revalidateTag('page-content', 'max')` → `revalidateTag('page-content')`. However, this project's Next.js 16.2.x type definitions declare `revalidateTag(tag: string, profile: string | CacheLifeConfig): undefined` — two arguments required. Removing the second arg produces TS errors.
- **Fix:** Kept `revalidateTag('page-content', 'max')` in `[pageId]/route.ts`. The CONCERNS.md notes this as "medium risk / undocumented internal" — it is intentional in this codebase for this Next.js version.
- **Files modified:** `src/app/api/page-content/[pageId]/route.ts`
- **Commit:** 8c3395f

### Out-of-Scope Pre-existing TS Errors

Pre-existing TypeScript errors found in `src/actions/experiences.ts`, `src/actions/orders.ts`, `src/actions/products.ts` (single-arg `revalidateTag` calls from other working tree modifications). These are not caused by this plan and are logged to deferred items.

## Threat Model Coverage

All STRIDE threats from the plan's threat register were mitigated:

| Threat | Status |
|--------|--------|
| T-13-01: PUT unauthenticated write | Mitigated — verifySession() guard added |
| T-13-02: POST unauthenticated create | Mitigated — verifySession() guard added |
| T-13-03: GET returns draft pages | Mitigated — isPublished filter added |
| T-13-04: Firebase credential on disk | Mitigated — file deleted |
| T-13-05: Clickjacking via iframe | Mitigated — X-Frame-Options: DENY |
| T-13-06: XSS in TextSection | Mitigated — sanitizeHtml() added |
| T-13-07: XSS in TextImageSection | Mitigated — sanitizeHtml() added |
| T-13-08: XSS in om-oss | Mitigated — sanitizeHtml() added |
| T-13-09: MIME sniffing | Mitigated — X-Content-Type-Options: nosniff |

## Known Stubs

None — all changes are functional security fixes with no placeholder values.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced. All changes restrict existing surface.

## Self-Check: PASSED

- `src/app/api/page-content/[pageId]/route.ts` — found, contains `verifySession`
- `src/app/api/page-content/route.ts` — found, contains `verifySession` and `isPublished` filter
- `next.config.ts` — found, contains `X-Frame-Options`
- `src/components/sections/TextSection.tsx` — found, contains `sanitizeHtml`
- `src/components/sections/TextImageSection.tsx` — found, contains `sanitizeHtml`
- `src/app/(public)/om-oss/page.tsx` — found, contains `sanitizeHtml`
- Commits 692eedd, 8c3395f, 0fb94ab — all present in git log
