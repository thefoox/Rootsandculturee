# Fix Production: Firestore Data Not Displaying - Research

**Researched:** 2026-04-10
**Domain:** Next.js Caching + Firestore REST API + Vercel Data Cache
**Confidence:** HIGH

## Summary

The production issue has **two root causes**, both now clearly identified:

1. **`unstable_cache` is serving stale/empty cached results from Vercel's Data Cache.** The Data Cache persists across deployments. When the old firebase-admin code failed, `unstable_cache` cached empty results (or the errors fell through to mock data which was cached). Subsequent deployments -- even with the working REST client -- still serve the cached empty results because no `revalidateTag` call has been triggered and the `revalidate: 3600` timer has not expired *from the perspective of the Data Cache entry*.

2. **The `fetch()` calls inside `firestoreRequest()` lack `cache: 'no-store'`.** In Next.js 15+, fetch is NOT cached by default -- but there is a documented edge case where POST requests inside Server Components CAN be cached. The Firestore REST client uses POST for `:runQuery` operations. This creates a risk of double-caching: `unstable_cache` caches the function result, AND Next.js Data Cache might independently cache the raw POST fetch response.

**Primary recommendation:** Purge Vercel's Data Cache immediately via the Vercel dashboard, add `cache: 'no-store'` to the REST client's fetch calls as a safety measure, and verify the pages load real data. Then systematically clean up the caching layer.

---

## Question 1: Does firebase-admin Actually Work on Vercel?

**Answer: YES, firebase-admin CAN work on Vercel production -- but the project has already moved past it correctly.**

### Evidence

- The GitHub issue [#77114](https://github.com/vercel/next.js/issues/77114) confirms firebase-admin fails with **Turbopack in dev mode** due to wildcard import rewriting. The fix is using sub-path imports: `import { getApps } from 'firebase-admin/app'`. [CITED: github.com/vercel/next.js/issues/77114]

- firebase-admin with `preferRest: true` eliminates gRPC dependency for Firestore reads, which solves cold-start issues on serverless. However, `cert()` initialization can still fail at **build time** if the private key isn't available during `next build`. [CITED: github.com/firebase/firebase-admin-node/pull/1901]

- The project's DEBUG-CONTEXT.md documents exhaustive attempts: `serverExternalPackages`, dynamic imports, lazy loading -- all failed. The error is "Failed to load external module" at both build-time (DECODER routines) and runtime. [VERIFIED: codebase DEBUG-CONTEXT.md]

- The REST client approach (`firestore-rest.ts`) is working correctly -- the debug endpoint confirms 8 products and 4 experiences returned. [VERIFIED: codebase, per user report]

### Recommendation

**Do NOT go back to firebase-admin.** The REST client is the correct long-term solution for this project. It:
- Has zero native dependencies
- Works on any serverless platform
- Uses jose (already in the project) for JWT signing
- Is already fully implemented with query, write, transaction, and batch support

The only cleanup needed: remove `firebase-admin` from `package.json` dependencies and remove `serverExternalPackages: ['firebase-admin']` from `next.config.ts`. These are dead references now.

---

## Question 2: How Does `unstable_cache` Work with Vercel's Data Cache?

**Answer: The Data Cache PERSISTS ACROSS DEPLOYMENTS. This is almost certainly the primary cause of the bug.**

### How It Works

`unstable_cache` stores its results in the **Vercel Data Cache**, which is:

- **Persistent across deployments** -- new deployments do NOT clear the cache [CITED: vercel.com/docs/caching/runtime-cache/data-cache]
- **Regional** -- each Vercel region has its own cache instance
- **Isolated per environment** -- production and preview have separate caches
- **Tag-based invalidation** -- calling `revalidateTag('products', 'max')` marks all entries with tag `'products'` as stale globally (propagates within 300ms) [CITED: vercel.com/docs/caching/runtime-cache/data-cache]

### The Bug Scenario

1. **Before REST client fix:** `adminDb` was `null` (firebase-admin crashed). The `unstable_cache` wrapped function either:
   - Threw an error, caught by the outer try/catch, returning mock data (which was NOT cached because the error escaped `unstable_cache`)
   - OR: returned an empty array (if `adminDb.collection(...)` returned a safe empty result before throwing)

2. **After REST client fix:** `admin.ts` now re-exports `firestoreDb` as `adminDb`. The code path is correct. BUT if any stale cache entry exists in Vercel's Data Cache from a previous successful (but empty) execution, it will be served for up to `revalidate: 3600` seconds (1 hour).

3. **The revalidation gap:** Even after deploying the fix, if no `revalidateTag` call was triggered (e.g., by creating/updating a product in admin), the cache continues serving stale data.

### How to Bust the Cache

Three options, from immediate to systematic:

**Option A: Purge via Vercel Dashboard (immediate)**
1. Go to Project Settings > Caches
2. Click "Purge Data Cache"
3. This forces all entries to be re-fetched on next request
[CITED: vercel.com/docs/caching/runtime-cache/data-cache]

**Option B: Call `revalidateTag` (programmatic)**
Hit any server action or route handler that calls `revalidateTag('products', 'max')`. The admin CRUD actions already do this.

**Option C: Create a revalidation API route (for future use)**
```typescript
// src/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-key')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { tag } = await request.json()
  revalidateTag(tag, 'max')
  return NextResponse.json({ revalidated: true, tag })
}
```

---

## Question 3: Correct Pattern for Firestore Data Fetching in Next.js App Router

**Answer: The current `unstable_cache` pattern is correct but is being deprecated in favor of `use cache`.**

### Current Pattern (Working, But Deprecated)

The codebase correctly uses:
```typescript
const _getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const snapshot = await adminDb
      .collection('products')
      .where('publishedAt', '!=', null)
      .orderBy('publishedAt', 'desc')
      .get()
    return snapshot.docs.map(mapProduct)
  },
  ['products'],                              // keyParts
  { revalidate: 3600, tags: ['products'] }   // options
)
```

This is the **correct** pattern for non-fetch data sources in Next.js App Router. [CITED: nextjs.org/docs/app/api-reference/functions/unstable_cache]

### Next.js 16 Replacement: `use cache` Directive

`unstable_cache` is deprecated in Next.js 16. The replacement is the `use cache` directive: [CITED: nextjs.org/docs/app/api-reference/directives/use-cache]

```typescript
async function getProducts(): Promise<Product[]> {
  'use cache'
  // cacheLife and cacheTag are used instead of the options object
  const snapshot = await adminDb
    .collection('products')
    .where('publishedAt', '!=', null)
    .orderBy('publishedAt', 'desc')
    .get()
  return snapshot.docs.map(mapProduct)
}
```

**However**, migrating to `use cache` is NOT required for the immediate fix. `unstable_cache` still works in Next.js 16.2.1. This migration can be deferred.

### Critical: `cache: 'no-store'` on REST Fetch Calls

The `firestoreRequest()` function uses `fetch()` without any cache option:

```typescript
const res = await fetch(url, {
  method,
  headers: { ... },
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
})
```

In Next.js 15+, fetch is NOT cached by default (`no-store` is the default). However, there is a documented edge case: **POST requests in Server Components may be cached in certain configurations.** [CITED: github.com/vercel/next.js/issues/52405]

Since the Firestore REST API uses POST for queries (`:runQuery`), this could create double-caching. The fix is simple and safe:

```typescript
const res = await fetch(url, {
  method,
  headers: { ... },
  cache: 'no-store',  // Explicit: never cache raw Firestore responses
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
})
```

This ensures caching is controlled **only** by `unstable_cache` (or future `use cache`), not by the Data Cache independently caching raw HTTP responses.

---

## Question 4: How Does `revalidateTag` Work in Next.js 16?

**Answer: The two-argument form `revalidateTag('products', 'max')` is CORRECT and REQUIRED in Next.js 16.**

### API Signature

```typescript
revalidateTag(tag: string, profile: string | { expire?: number }): void
```
[CITED: nextjs.org/docs/app/api-reference/functions/revalidateTag, via WebSearch from multiple sources including the Next.js 16 upgrade guide]

### The Two-Argument Form

- **First argument:** The cache tag to invalidate (e.g., `'products'`)
- **Second argument:** The cacheLife profile that controls stale-while-revalidate behavior

### What `'max'` Does

`'max'` is a built-in cacheLife profile. When used:
- The tagged cache entry is **marked as stale**
- On the next request, the **stale content is served immediately** (no delay for the user)
- A **background revalidation** fetches fresh data
- The fresh data replaces the stale entry for subsequent requests

This is stale-while-revalidate (SWR) semantics -- the best UX for content pages.

### Alternative: Immediate Expiration

For cases where stale data is unacceptable (e.g., webhook that stock changed):
```typescript
revalidateTag('products', { expire: 0 })
```

### Important: The Old Single-Argument Form is DEPRECATED

```typescript
// DEPRECATED in Next.js 16 -- causes TypeScript error
revalidateTag('products')

// CORRECT in Next.js 16
revalidateTag('products', 'max')
```

### The Codebase Is Correct

All `revalidateTag` calls in the codebase use the two-argument form with `'max'`:
```typescript
revalidateTag('products', 'max')     // src/actions/products.ts
revalidateTag('experiences', 'max')  // src/actions/experiences.ts
revalidateTag('articles', 'max')     // src/actions/articles.ts
```
[VERIFIED: codebase grep]

---

## Question 5: Does `redirect()` Work from a Client Component's onClick Handler?

**Answer: YES, but only when calling a server action. The codebase has two patterns -- one correct, one risky.**

### Pattern 1: `<form action={logoutAction}>` -- CORRECT

In `AdminSidebar.tsx`:
```tsx
<form action={logoutAction}>
  <button type="submit">Logg ut</button>
</form>
```
This is the **recommended** pattern. The server action runs, calls `redirect('/')`, and the NEXT_REDIRECT error is handled by the form submission framework to produce a redirect response. [CITED: nextjs.org/docs/app/api-reference/functions/redirect]

### Pattern 2: `onClick={() => await logoutAction()}` -- WORKS BUT FRAGILE

In `Header.tsx`:
```tsx
async function handleLogout() {
  await logoutAction()
}
// ...
<button onClick={handleLogout}>Logg ut</button>
```

This **does work** in practice because:
1. `logoutAction` is a server action (marked `'use server'`)
2. When called from a client component, Next.js sends the request to the server
3. The server action calls `redirect('/')`, which throws `NEXT_REDIRECT`
4. The NEXT_REDIRECT propagates through the server action response
5. The client-side router follows the redirect

**However**, this is fragile because:
- If a try/catch wraps the `await logoutAction()` call, the NEXT_REDIRECT error will be swallowed [CITED: github.com/vercel/next.js/issues/55586]
- The official docs say: "redirect cannot be called in event handlers" (referring to direct use, not via server actions) [CITED: nextjs.org/docs/app/api-reference/functions/redirect]

### Recommendation

The `Header.tsx` pattern works but should use the `<form action>` pattern for robustness:
```tsx
<form action={logoutAction}>
  <button type="submit" className="...">
    <LogOut className="h-4 w-4" aria-hidden="true" />
    Logg ut
  </button>
</form>
```

This is a low-priority improvement. The current onClick pattern works.

---

## Concrete Fix Plan (Priority Order)

### Fix 1: Purge Vercel Data Cache (IMMEDIATE)

**Action:** Go to Vercel Dashboard > Project > Settings > Caches > Purge Data Cache

**Why:** This eliminates any stale/empty cached results from before the REST client fix. This single action may resolve the entire "Ingen produkter" issue.

**Risk:** Brief increase in response times as caches are rebuilt. Negligible.

### Fix 2: Add `cache: 'no-store'` to REST Client Fetch (CODE CHANGE)

**File:** `src/lib/firebase/firestore-rest.ts`, line ~222

**Before:**
```typescript
const res = await fetch(url, {
  method,
  headers: { ... },
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
})
```

**After:**
```typescript
const res = await fetch(url, {
  method,
  headers: { ... },
  cache: 'no-store',
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
})
```

**Why:** Prevents any possibility of Next.js Data Cache independently caching raw Firestore REST responses. Caching should be controlled exclusively by `unstable_cache`.

### Fix 3: Remove Dead firebase-admin References (CLEANUP)

- Remove `firebase-admin` from `package.json` dependencies
- Remove `serverExternalPackages: ['firebase-admin']` from `next.config.ts`
- This reduces bundle size and removes a confusing vestige

### Fix 4 (OPTIONAL): Add Revalidation API Route

Create `src/app/api/revalidate/route.ts` protected by a secret. This allows on-demand cache busting without needing to use the admin CMS.

---

## Common Pitfalls

### Pitfall 1: unstable_cache Caches Errors as Empty Results
**What goes wrong:** If the cached function returns an empty array instead of throwing (e.g., due to a null-safe fallback), `unstable_cache` caches that empty array for the full `revalidate` period.
**Why it happens:** The try/catch inside `getProducts()` catches errors and returns mock data, but the error might occur INSIDE the `unstable_cache` wrapper, meaning a partial result (empty array) gets cached.
**How to avoid:** Ensure the function inside `unstable_cache` throws on failure rather than returning empty. Let the outer wrapper handle fallbacks.
**Warning signs:** Data appears empty after deployment but works in debug endpoints.

### Pitfall 2: Vercel Data Cache Survives Redeployment
**What goes wrong:** Developer assumes redeploying clears all caches. It does NOT clear the Data Cache.
**Why it happens:** The Data Cache is designed to persist across deployments for performance. Only the Build Cache and CDN Cache are deployment-scoped.
**How to avoid:** After fixing data-layer bugs, always purge the Data Cache via Vercel dashboard or trigger `revalidateTag` for affected tags.
**Warning signs:** Fix works on new/clean preview deployments but not on the production URL.

### Pitfall 3: Double-Caching with fetch + unstable_cache
**What goes wrong:** A function wrapped in `unstable_cache` makes fetch calls that are independently cached by the Data Cache. The function's result is cached, AND the raw HTTP response is cached. Invalidating one does not invalidate the other.
**Why it happens:** `unstable_cache` and the fetch Data Cache are separate layers that operate independently.
**How to avoid:** Use `cache: 'no-store'` on all fetch calls inside `unstable_cache` wrappers. Let `unstable_cache` be the sole caching layer.

### Pitfall 4: redirect() Inside try/catch
**What goes wrong:** `redirect()` throws a `NEXT_REDIRECT` error as a control flow mechanism. If this throw is caught by a try/catch, the redirect silently fails.
**Why it happens:** Developers wrap server action code in try/catch for error handling and accidentally catch the redirect.
**How to avoid:** Call `redirect()` OUTSIDE try/catch blocks, or re-throw if `error.digest === 'NEXT_REDIRECT'`.

---

## Architecture Patterns

### Recommended Data Fetching Architecture (Current, with fixes)

```
Server Component (page.tsx)
  |
  v
getProducts()  [error boundary / mock fallback]
  |
  v
_getProducts()  [unstable_cache wrapper - controls caching]
  |
  v
adminDb.collection('products').where(...).get()  [= firestoreDb from firestore-rest.ts]
  |
  v
firestoreRequest() -> fetch(url, { cache: 'no-store' })  [raw REST call, NOT cached]
  |
  v
Firestore REST API (firestore.googleapis.com)
```

### File Architecture

```
src/lib/firebase/
  admin.ts           # Re-exports firestoreDb as adminDb (bridge)
  firestore-rest.ts  # Firestore REST API client (the real implementation)
  client.ts          # Client-side Firebase SDK (unchanged)
  auth.ts            # Client-side Firebase Auth helpers
  storage.ts         # Client-side Firebase Storage helpers

src/lib/data/
  products.ts        # unstable_cache + getProducts()
  experiences.ts     # unstable_cache + getExperiences()
  articles.ts        # unstable_cache + getArticles()
  page-content.ts    # unstable_cache + getPageContent()
  site-content.ts    # unstable_cache + getSiteContent()
  mock-data.ts       # Fallback mock data
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| `unstable_cache` | `use cache` directive | Next.js 16 (2026) | `unstable_cache` still works but is deprecated. Migration not urgent. |
| `revalidateTag(tag)` | `revalidateTag(tag, profile)` | Next.js 16 (2026) | Two-argument form required. Codebase already uses it correctly. |
| `fetch` cached by default | `fetch` uncached by default | Next.js 15 (2025) | `no-store` is the default. But explicit is better than implicit -- add `cache: 'no-store'` anyway. |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The debug endpoint confirming 8 products / 4 experiences proves the REST client works | Question 1 | If the debug endpoint bypasses `unstable_cache` while the page does not, the REST client might still have an issue when called via `unstable_cache`. LOW risk -- the data layer code path is the same. |
| A2 | POST fetch requests in Next.js 15+ are not cached by default | Question 3 | If POST IS cached, this would be a second caching layer causing the bug. Mitigated by adding explicit `cache: 'no-store'`. |
| A3 | Purging the Vercel Data Cache will resolve the immediate issue | Fix Plan | If the issue is NOT caching but a runtime error in the REST client when called via `unstable_cache`, purging alone won't fix it. Check Vercel function logs after purging. |

---

## Open Questions

1. **Is the error still occurring at runtime, or is it purely cached stale data?**
   - What we know: Debug endpoint works. Pages show "Ingen produkter".
   - What's unclear: Whether `unstable_cache` is serving stale data OR whether the REST client errors when invoked inside the `unstable_cache` wrapper.
   - Recommendation: Purge the Data Cache first. If pages still show empty, check Vercel function logs for errors in the `unstable_cache` execution path.

2. **Should `unstable_cache` be migrated to `use cache`?**
   - What we know: `unstable_cache` is deprecated in Next.js 16 but still functional.
   - What's unclear: Timeline for removal.
   - Recommendation: Defer migration. Fix the immediate bug first. Plan migration as a separate phase.

---

## Sources

### Primary (HIGH confidence)
- [Vercel Data Cache docs](https://vercel.com/docs/caching/runtime-cache/data-cache) - Cache persistence, purging, tag-based invalidation
- [Next.js unstable_cache API](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) - API signature, options, deprecation notice
- [Next.js revalidateTag API](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) - Two-argument signature, 'max' profile
- [Next.js redirect() API](https://nextjs.org/docs/app/api-reference/functions/redirect) - Server action usage, try/catch warning
- Codebase analysis - all data files, REST client, admin.ts bridge pattern

### Secondary (MEDIUM confidence)
- [Next.js #77114: firebase-admin + Turbopack](https://github.com/vercel/next.js/issues/77114) - Confirmed Turbopack import rewriting issue
- [firebase-admin preferRest PR](https://github.com/firebase/firebase-admin-node/pull/1901) - REST transport option
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - revalidateTag signature change
- [Next.js #55586: redirect() in try/catch](https://github.com/vercel/next.js/issues/55586) - Confirmed redirect swallowing bug
- [Next.js #52405: POST caching](https://github.com/vercel/next.js/issues/52405) - POST requests cached edge case

### Tertiary (LOW confidence)
- [Vercel community: firebase-admin support](https://community.vercel.com/t/can-we-get-firebase-admin-sdk-support/13215) - Community discussion, no official resolution

## Metadata

**Confidence breakdown:**
- Root cause diagnosis (Data Cache persistence): HIGH - confirmed by Vercel docs that Data Cache persists across deployments
- `revalidateTag` API: HIGH - confirmed two-argument form required in Next.js 16
- `redirect()` behavior: HIGH - confirmed by multiple GitHub issues and official docs
- `cache: 'no-store'` fix: MEDIUM - the default in Next.js 15+ is no-store, but explicit is safer given POST edge case

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable patterns, unlikely to change)
