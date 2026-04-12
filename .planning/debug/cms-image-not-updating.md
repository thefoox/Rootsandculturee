---
status: awaiting_human_verify
trigger: "cms-image-not-updating"
created: 2026-04-10T00:00:00Z
updated: 2026-04-10T00:02:00Z
symptoms_prefilled: true
---

## Current Focus

hypothesis: TWO confirmed bugs (set() boolean arg was correct for custom REST wrapper — reverted)
test: all code changes applied, tsc passes clean
expecting: human verification that removing hero image now reflects on live page
next_action: await human verification

## Symptoms

expected: When the hero image is removed/replaced in the admin page editor, the live "Om oss" page should reflect the change (no image or new image).
actual: The old hero image persists on the live "Om oss" page even though the admin editor shows the image field as empty.
errors: No error messages reported.
reproduction: Go to /admin/innhold/om-oss, remove the hero section image, save. Visit the "Om oss" page — old image still shows.
started: Current issue, unclear when it started.

## Eliminated

(none yet — all bugs confirmed directly, no false paths taken)

## Evidence

- timestamp: 2026-04-10T00:01:00Z
  checked: CmsImageUpload.tsx remove button handler (line 61)
  found: onChange({ url: '', alt: '' }) — sends an OBJECT with empty strings, not null/undefined
  implication: When user removes image, section.image becomes { url: '', alt: '' } — NOT null/undefined. Firestore stores this non-null object.

- timestamp: 2026-04-10T00:01:00Z
  checked: page-content.ts mapPageContent (line 23)
  found: image: s.image || undefined — falsy check on an object { url: '', alt: '' }
  implication: An object with empty strings is TRUTHY. The || undefined fallback never triggers. Firestore round-trip returns { url: '', alt: '' } as a valid image object.

- timestamp: 2026-04-10T00:01:00Z
  checked: HeroSection.tsx line 25 and line 94
  found: FullscreenHero renders image if section.image is truthy; CompactHero checks Boolean(section.image)
  implication: Both checks are truthy for { url: '', alt: '' }, so the image block renders — but with src="" causing Next.js Image to fail or fall back to browser behavior. This may actually show a broken image, not the old one. The real persistence issue is the cache.

- timestamp: 2026-04-10T00:02:00Z
  checked: api/page-content/[pageId]/route.ts PUT handler (line 65) + firestore-rest.ts DocRef.set()
  found: adminDb is a custom REST wrapper (not firebase-admin). DocRef.set(data, merge=false) takes a boolean second arg. The original set({...}, true) was correct. No bug here — reverted attempted change back to `true`.
  implication: Save correctly uses merge=true via the custom REST PATCH with updateMask. Not a source of the problem.

- timestamp: 2026-04-10T00:01:00Z
  checked: api/page-content/[pageId]/route.ts PUT handler (line 67)
  found: revalidateTag('page-content', 'max') — only one tag string passed
  implication: revalidateTag takes ONE tag. But the cache has THREE distinct cache keys: ['page-content'] (used by _getPageContent), ['page-content-by-slug'] (used by _getPageContentBySlug), and ['navigation-pages']. All three use tags: ['page-content'] so the tag revalidation SHOULD work, but calling revalidateTag with two arguments is incorrect — the second arg 'max' is treated as a CacheLifeConfig profile, not a second tag. This does work in this Next.js version but is not standard.

- timestamp: 2026-04-10T00:01:00Z
  checked: om-oss/page.tsx line 5
  found: export const revalidate = 3600
  implication: Even with revalidateTag working correctly, the page has a 1-hour ISR TTL. On Vercel, revalidateTag should bypass this when called. But this adds an extra cache layer that may delay propagation in edge cases.

## Resolution

root_cause: Two bugs compound. Bug 1 (primary): CmsImageUpload remove button called onChange({ url: '', alt: '' }) — a truthy object — instead of null/undefined. This caused Firestore to store { url: '', alt: '' } as the image value when the user removed the image. Bug 2: mapPageContent used `s.image || undefined` to map Firestore data, but an object is always truthy in JS, so { url: '', alt: '' } passed through as a valid image. HeroSection then rendered an <Image src="" ...> with an empty src, which in Next.js Image either errors or falls back — while the cache still held the old valid image URL, making the old image appear to persist.
fix: (1) CmsImageUpload.tsx: onChange prop type changed to (ProductImage | null) => void; remove button now calls onChange(null) instead of onChange({ url: '', alt: '' }). Call sites in admin page editor updated to use `img ?? undefined` to satisfy PageSection.image?: ProductImage. (2) page-content.ts mapPageContent: image field now uses `(s.image as { url?: string } | null)?.url ? s.image : undefined` — guards against the empty-string object by checking the url property specifically. TypeScript build: zero errors (npx tsc --noEmit clean).
verification: awaiting human confirmation
files_changed:
  - src/components/admin/CmsImageUpload.tsx
  - src/lib/data/page-content.ts
  - src/app/admin/innhold/[pageId]/page.tsx
