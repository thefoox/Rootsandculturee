---
phase: 19-cms-medium-fixes
reviewed: 2026-04-12T14:32:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - firestore.indexes.json
  - src/actions/articles.ts
  - src/actions/experiences.ts
  - src/actions/products.ts
  - src/app/admin/artikler/page.tsx
  - src/app/admin/bookinger/page.tsx
  - src/app/admin/gavekort/page.tsx
  - src/app/admin/innhold/[pageId]/page.tsx
  - src/app/admin/innhold/page.tsx
  - src/app/admin/kunder/page.tsx
  - src/app/admin/kunder/[uid]/page.tsx
  - src/app/admin/opplevelser/page.tsx
  - src/app/admin/ordrer/[id]/page.tsx
  - src/app/admin/ordrer/page.tsx
  - src/app/admin/produkter/page.tsx
  - src/app/globals.css
  - src/lib/data/articles.ts
  - src/lib/data/experiences.ts
  - src/lib/data/page-content.ts
  - src/lib/data/products.ts
  - src/lib/mappers/articles.ts
  - src/lib/mappers/experiences.ts
  - src/lib/mappers/page-content.ts
  - src/lib/mappers/products.ts
  - src/lib/validations.ts
  - src/types/index.ts
findings:
  critical: 1
  warning: 5
  info: 3
  total: 9
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-04-12T14:32:00Z
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

Reviewed the CMS medium-fixes phase covering page-content CMS system, admin CRUD actions (articles, experiences, products), admin list/detail pages, mappers, validations, and type definitions. The codebase is generally well-structured with consistent auth guards, Zod validation, and proper error patterns. However, there is one critical data-loss bug where the Zod validation schema strips CMS fields on save, plus several warnings around missing error handling and inconsistent behavior.

## Critical Issues

### CR-01: pageSectionSchema strips ctaSecondaryText, ctaSecondaryLink, and SectionItem.href on save

**File:** `src/lib/validations.ts:92-108`
**Issue:** The `pageSectionSchema` Zod schema is missing three fields that the CMS editor UI sets and the mapper reads:
1. `ctaSecondaryText` -- set by the hero section editor (line 81 of `[pageId]/page.tsx`)
2. `ctaSecondaryLink` -- set by the hero section editor (line 82 of `[pageId]/page.tsx`)
3. `SectionItem.href` -- set by `categories` and `contact-info` sections (lines 327, 348 of `[pageId]/page.tsx`)

When the PUT endpoint at `src/app/api/page-content/[pageId]/route.ts` validates with `pageContentUpdateSchema.safeParse(body)`, Zod strips unknown keys. This means every time an admin saves a page with a hero secondary CTA or category links, that data is silently discarded. The mapper in `mapPageContent` reads these fields from Firestore, so existing data works until the next save.

**Fix:**
```typescript
// In src/lib/validations.ts, update pageSectionSchema:
export const pageSectionSchema = z.object({
  id: z.string().min(1, 'Seksjons-ID er pakrevd.'),
  type: z.enum(sectionTypeValues, { message: 'Ugyldig seksjonstype.' }),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  image: imageSchema.optional(),
  imagePosition: z.enum(['left', 'right']).optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  ctaSecondaryText: z.string().optional(),   // ADD
  ctaSecondaryLink: z.string().optional(),   // ADD
  items: z.array(z.object({
    title: z.string().default(''),
    description: z.string().default(''),
    icon: z.string().optional(),
    image: imageSchema.optional(),
    href: z.string().optional(),             // ADD
  })).optional(),
})
```

## Warnings

### WR-01: updateArticle Firestore write not wrapped in try/catch

**File:** `src/actions/articles.ts:152-159`
**Issue:** The `adminDb.collection('articles').doc(id).update(...)` call (and the `revalidateTag` after it) are not inside a try/catch block. If the Firestore write fails, the server action will throw an unhandled error to the client. Compare to `createArticle` (line 77-95), which has a try/catch. Same pattern applies to `updateExperience` and `updateProduct`.
**Fix:**
```typescript
try {
  await adminDb.collection('articles').doc(id).update({
    ...data,
    excerpt,
    status: publish ? 'published' : 'draft',
    publishedAt: publish
      ? (existing.publishedAt instanceof Date ? existing.publishedAt : now)
      : (existing.publishedAt instanceof Date ? existing.publishedAt : null),
    updatedAt: now,
  })

  revalidateTag('articles')
  return { success: true }
} catch (err) {
  console.error('[updateArticle] Firestore write failed:', err)
  return { success: false, errors: { _form: 'Kunne ikke oppdatere artikkelen. Prov igjen.' } }
}
```

Apply the same pattern to `updateExperience` (line 199-209) and `updateProduct` (line 175-183).

### WR-02: createExperience and createProduct Firestore writes not wrapped in try/catch

**File:** `src/actions/experiences.ts:94-128`
**File:** `src/actions/products.ts:89-100`
**Issue:** Unlike `createArticle`, neither `createExperience` nor `createProduct` wrap their Firestore `.add()` calls in try/catch. An error during the write will propagate as an unhandled server action error instead of returning a structured `ActionResult`.
**Fix:** Wrap the Firestore `.add()` and batch operations in try/catch blocks, returning `{ success: false, errors: { _form: '...' } }` on failure, consistent with the `createArticle` pattern.

### WR-03: Inconsistent unpublish behavior between articles and experiences

**File:** `src/actions/articles.ts:156-158`
**File:** `src/actions/experiences.ts:205-206`
**Issue:** When an admin unpublishes (sets `publish: false`):
- **Articles** preserve the old `publishedAt` date (line 158: keeps it if it existed)
- **Experiences** clear `publishedAt` to `null` (line 206: `publishedAt: null`)

This means an unpublished article retains its publish date, while an unpublished experience loses it. The public-facing queries filter by `publishedAt != null`, so unpublished experiences correctly disappear from listings, but unpublished articles also disappear because they have a separate `status: 'draft'` filter. The inconsistency is not a data-loss bug but could confuse admin users who re-publish and see different dates.
**Fix:** Choose one behavior and apply it consistently. If the intent is "unpublishing preserves the original publish date," apply the article pattern to experiences. If the intent is "unpublishing clears the date," apply the experience pattern to articles.

### WR-04: getAllArticles / getAllExperiences / getAllProducts exposed as server actions without auth

**File:** `src/actions/articles.ts:14-20`
**File:** `src/actions/experiences.ts:10-16`
**File:** `src/actions/products.ts:10-16`
**Issue:** The `getAllArticles`, `getAllExperiences`, and `getAllProducts` functions are exported from `'use server'` modules without auth checks. Server actions are callable by any client. These return all items (including drafts) since they don't filter by status or `publishedAt`. The public data layer (`src/lib/data/`) correctly filters published-only, but these admin-intended functions could leak unpublished content to unauthenticated users who call them directly.
**Fix:** Add auth verification to these functions:
```typescript
export async function getAllArticles(): Promise<Article[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []

  const snapshot = await adminDb
    .collection('articles')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapArticle)
}
```

### WR-05: getExperienceDatesAdmin exposed without auth check

**File:** `src/actions/experiences.ts:24-30`
**Issue:** `getExperienceDatesAdmin` is a server action that returns all experience dates (including inactive ones) without verifying the caller is an admin. Similar to WR-04 but specifically for the dates subcollection which contains booking capacity data.
**Fix:** Add `verifySession()` check at the top, same as the pattern in WR-04.

## Info

### IN-01: Unused import in ordrer/page.tsx

**File:** `src/app/admin/ordrer/page.tsx:5`
**Issue:** `ShoppingBag` from `lucide-react` is imported but only used in the `EmptyState` component prop. While it's technically used, the `EmptyState` also has a fallback -- this is not a bug, just noting.
**Fix:** No action needed -- the import is used.

### IN-02: pageSectionSchema.order field missing

**File:** `src/lib/validations.ts:92-108`
**Issue:** The `pageSectionSchema` does not include the `order` field, which is part of `PageSection` type. The `order` value is managed by the editor UI and included in the JSON body sent to the PUT endpoint. Since Zod strips unknown keys by default, the `order` field is stripped during validation. However, the PUT handler at line 62-73 of the route passes `sections` directly from `result.data`, meaning the order values are lost and sections may be persisted without order information.
**Fix:**
```typescript
export const pageSectionSchema = z.object({
  // ... existing fields ...
  order: z.number().int().min(0),
})
```

### IN-03: handleCreate in innhold/page.tsx lacks error handling for non-409 failures

**File:** `src/app/admin/innhold/page.tsx:36-51`
**Issue:** The `handleCreate` function checks for `res.status === 409` but does not handle other error statuses (e.g., 400, 500). If the server returns a 500 error, `res.json()` is called anyway, and if the response has `data.success` or `data.id` as truthy, it will attempt navigation. More likely, neither condition is met and the function silently fails with no user feedback.
**Fix:**
```typescript
async function handleCreate() {
  if (!newTitle.trim() || !newSlug.trim()) return
  setCreating(true)
  try {
    const res = await fetch('/api/page-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, slug: newSlug }),
    })
    if (res.status === 409) {
      toast.error('En side med denne slug-en finnes allerede. Velg en annen slug.')
      setCreating(false)
      return
    }
    if (!res.ok) {
      toast.error('Kunne ikke opprette siden. Prov igjen.')
      setCreating(false)
      return
    }
    const data = await res.json()
    if (data.id) {
      window.location.href = `/admin/innhold/${data.id}`
    }
  } catch {
    toast.error('Noe gikk galt.')
  }
  setCreating(false)
}
```

---

_Reviewed: 2026-04-12T14:32:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
