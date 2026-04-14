---
status: investigating
trigger: "CMS page content changes save successfully to Firestore but do NOT appear on the deployed Vercel site. Works fine locally."
created: 2026-04-12T00:00:00Z
updated: 2026-04-12T00:00:00Z
---

## Current Focus

hypothesis: revalidateTag('page-content', 'max') uses stale-while-revalidate semantics (marks stale, NOT expired), meaning stale content is served to the first visitor while revalidation happens in background. Combined with page-level ISR (export const revalidate = 3600) creating a TWO-LAYER cache, the public site never shows fresh content promptly.
test: Traced the full code path through Next.js 16.2.1 internals
expecting: revalidateTag with 'max' profile does NOT immediately expire cached data
next_action: Document root cause -- three interacting issues found

## Symptoms

expected: After admin saves page content via the CMS editor, the public-facing pages on Vercel should show the updated content within seconds.
actual: Changes save to Firestore (confirmed), but the deployed Vercel pages keep showing old content. Works correctly in local dev.
errors: No errors visible -- the PUT returns 200, Firestore has the new data, but the public site doesn't update.
reproduction: 1. Go to /admin/innhold/forside 2. Edit any section 3. Click Save 4. Visit the public homepage -- still shows old content
started: Known issue -- cache invalidation strategy iterated multiple times during Phases 18-19 without resolution

## Eliminated

(none yet -- first investigation pass)

## Evidence

- timestamp: 2026-04-12T00:01:00Z
  checked: revalidateTag signature in Next.js 16.2.1 (node_modules/next/dist/server/web/spec-extension/revalidate.d.ts)
  found: revalidateTag(tag: string, profile: string | CacheLifeConfig) -- the second arg 'max' is a cacheLife profile, not a purge modifier
  implication: 'max' profile = stale-while-revalidate with 365-day expiry, NOT immediate invalidation

- timestamp: 2026-04-12T00:02:00Z
  checked: FileSystemCache.revalidateTag implementation (file-system-cache.js lines 43-76)
  found: With durations (profile provided) -> sets stale=now, expired=now+expire*1000. Without durations -> sets expired=now (immediate). 'max' profile has expire=31536000 (365 days).
  implication: revalidateTag('page-content', 'max') marks entries as STALE but sets expiry 365 days in the future. First visitor still gets stale (old) content while background revalidation runs.

- timestamp: 2026-04-12T00:03:00Z
  checked: revalidatePath implementation in revalidate.js
  found: revalidatePath calls revalidate(tags, expression) WITHOUT a profile argument, so durations=undefined, causing expired=now (immediate). This correctly expires the page-level cache.
  implication: revalidatePath('/') works correctly for page-level ISR cache, BUT the data inside unstable_cache is a SEPARATE cache layer that revalidatePath does not touch.

- timestamp: 2026-04-12T00:04:00Z
  checked: Two-layer caching architecture
  found: Layer 1 = unstable_cache data cache (tags: ['page-content'], revalidate: 60). Layer 2 = page-level ISR cache (export const revalidate = 3600). revalidatePath purges Layer 2 but NOT Layer 1. revalidateTag('page-content', 'max') soft-stales Layer 1 but does NOT expire it.
  implication: Even if revalidatePath purges the page HTML, when the page re-renders it calls getPageContent() which hits the STALE unstable_cache entry and returns old data (stale-while-revalidate). New data only appears after a SECOND request.

- timestamp: 2026-04-12T00:05:00Z
  checked: Next.js 16 docs and GitHub discussions on revalidateTag + 'max' profile
  found: 'max' profile is explicitly a stale-while-revalidate approach. For immediate expiration, docs recommend { expire: 0 } as the second argument. For Route Handlers (not Server Actions), revalidateTag does NOT trigger client UI updates.
  implication: The code should use revalidateTag('page-content', { expire: 0 }) for immediate data cache invalidation from a Route Handler.

- timestamp: 2026-04-12T00:06:00Z
  checked: pathWasRevalidated flag in revalidate.js (lines 207-211)
  found: With profile='max' and cacheLife.expire=31536000, the condition (!profile || cacheLife?.expire === 0) is FALSE, so pathWasRevalidated is NOT set. This flag controls read-your-own-writes in Server Actions.
  implication: Secondary concern -- even after fixing expire behavior, Route Handlers don't benefit from read-your-own-writes anyway. But the primary issue is the 'max' profile preventing immediate data invalidation.

## Resolution

root_cause: THREE interacting issues cause stale content on Vercel after CMS save:

1. **revalidateTag('page-content', 'max') does NOT immediately expire data cache.** The 'max' cacheLife profile sets stale=now but expired=now+365days. This means the first visitor after a CMS edit still gets the old cached data from unstable_cache, while fresh data is fetched in the background. Only the SECOND visitor sees updated content.

2. **Two-layer cache architecture creates compounding staleness.** Layer 1: unstable_cache (data, tags: ['page-content'], revalidate: 60). Layer 2: page ISR (export const revalidate = 3600, HTML). revalidatePath('/') correctly purges Layer 2, but when the page re-renders it fetches from Layer 1 which is still stale (not expired). The page re-renders with OLD data and gets cached again in Layer 2 for up to 3600s.

3. **Works locally because dev mode skips caching.** Next.js dev server does not use the incremental cache or ISR, so data is always fetched fresh from Firestore. This masks the Vercel-specific caching behavior.

fix: (not applied -- find_root_cause_only mode)
verification: 
files_changed: []
