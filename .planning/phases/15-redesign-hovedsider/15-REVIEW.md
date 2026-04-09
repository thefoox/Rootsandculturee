---
phase: 15-redesign-hovedsider
reviewed: 2026-04-08T16:00:00Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - src/app/admin/innhold/[pageId]/page.tsx
  - src/app/page.tsx
  - src/app/(public)/kontakt/ContactForm.tsx
  - src/app/(public)/kontakt/page.tsx
  - src/app/(public)/om-oss/page.tsx
  - src/components/sections/ContactInfoSection.tsx
  - src/components/sections/ExperiencesGridSection.tsx
  - src/components/sections/FaqSection.tsx
  - src/components/sections/HeroSection.tsx
  - src/components/sections/LocationSection.tsx
  - src/components/sections/SectionRenderer.tsx
  - src/components/sections/TeamSection.tsx
  - src/components/sections/TextImageSection.tsx
  - src/components/sections/TrustBarSection.tsx
  - src/components/sections/ValuesSection.tsx
  - src/lib/data/mock-data.ts
  - src/types/index.ts
findings:
  critical: 1
  warning: 6
  info: 4
  total: 11
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-04-08T16:00:00Z
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

Phase 15 rebuilt 3 main pages (forside, kontakt, om-oss) as CMS-driven Next.js pages with 9 upgraded section components and 1 new LocationSection. The architecture is sound: CMS data flows through a centralized `SectionRenderer`, section components handle missing data gracefully with null checks, and `dangerouslySetInnerHTML` is properly sanitized via DOMPurify. The HTML prototype translations to React/Next.js are well-executed with proper use of `next/image`, `next/link`, responsive breakpoints, and `motion-safe:` prefixed animations.

Key concerns: (1) `ctaSecondaryText`/`ctaSecondaryLink` fields are not persisted through Firestore mapping, causing secondary hero CTAs to silently disappear when CMS data is loaded from Firestore instead of mock data; (2) `.sort()` mutates cached arrays in-place across all three page files; (3) several WCAG 2.1 AA issues in the newsletter form and section components.

## Critical Issues

### CR-01: Firestore mapper drops `ctaSecondaryText` and `ctaSecondaryLink` fields

**File:** `src/lib/data/page-content.ts:16-28`
**Issue:** The `mapPageContent` function maps most `PageSection` fields from Firestore documents but does not include `ctaSecondaryText` or `ctaSecondaryLink`. These fields are defined in `PageSection` (types/index.ts:142-143), used by `HeroSection` (line 19-20) for the secondary CTA button, and present in mock data (mock-data.ts:512). When CMS data is served from Firestore (production), the secondary hero CTA on the forside will silently vanish because these fields are not extracted from the Firestore document. The admin editor (`admin/innhold/[pageId]/page.tsx`) also does not expose these fields for editing, compounding the issue.
**Fix:**
Add the missing fields to the mapper in `src/lib/data/page-content.ts`:
```typescript
sections: (data.sections || []).map((s: Record<string, unknown>, i: number) => ({
  id: s.id || `section-${i}`,
  type: s.type || 'text',
  heading: s.heading || undefined,
  subheading: s.subheading || undefined,
  body: s.body || undefined,
  image: s.image || undefined,
  imagePosition: s.imagePosition || undefined,
  items: s.items || undefined,
  ctaText: s.ctaText || undefined,
  ctaLink: s.ctaLink || undefined,
  ctaSecondaryText: s.ctaSecondaryText || undefined,   // ADD
  ctaSecondaryLink: s.ctaSecondaryLink || undefined,   // ADD
  order: typeof s.order === 'number' ? s.order : i,
})) as PageSection[],
```
Also add secondary CTA fields to the admin editor for hero sections.

## Warnings

### WR-01: `.sort()` mutates cached `sections` array in-place

**File:** `src/app/page.tsx:64`, `src/app/(public)/kontakt/page.tsx:22`, `src/app/(public)/om-oss/page.tsx:22`
**Issue:** `Array.prototype.sort()` mutates the original array. The `pageContent` object is returned from `unstable_cache` in `getPageContent`, meaning the cached object's `sections` array is mutated on every render. This could cause unpredictable ordering bugs if the cache is shared across requests or if the array is iterated elsewhere.
**Fix:**
Use `toSorted()` (available in ES2023 / Node 20+) or spread before sorting:
```typescript
const sortedSections = [...pageContent.sections].sort((a, b) => a.order - b.order)
```

### WR-02: Newsletter form missing label association and submit handler

**File:** `src/app/page.tsx:165-173`
**Issue:** The newsletter email input has an `aria-label` (good), but the submit button has no form `action` or submit handler -- clicking it does nothing. The `<input>` and `<button>` are not inside a `<form>` element. This is a functionality bug: users cannot actually subscribe.
**Fix:**
Wrap in a `<form>` element with an action (Server Action or API route):
```tsx
<form action={subscribeToNewsletter}>
  <input type="email" ... />
  <button type="submit">Meld meg pa</button>
</form>
```
If the feature is not yet implemented, add `type="button"` and `disabled` to the button with a tooltip or visual indicator that it is not yet active.

### WR-03: `useEffect` dependency on entire `state` object causes potential stale closure

**File:** `src/app/(public)/kontakt/ContactForm.tsx:23-28`
**Issue:** The `useEffect` depends on `[state]` (reference equality). Because `useActionState` returns a new state object on each action invocation, this works for detecting state changes. However, the toast fires on every `state` reference change where `success` is true, including when the component re-renders with the same success state (e.g., if a parent re-renders). A more robust approach would track whether the success was already shown.
**Fix:**
Use a more precise dependency or add a sentinel:
```typescript
const prevSuccess = useRef(false)
useEffect(() => {
  if (state?.success && !prevSuccess.current) {
    toast.success('Melding sendt! Vi svarer deg sa snart vi kan.')
    formRef.current?.reset()
    prevSuccess.current = true
  }
  if (!state?.success) {
    prevSuccess.current = false
  }
}, [state])
```

### WR-04: `import * as icons from 'lucide-react'` imports the entire icon library

**File:** `src/components/sections/ContactInfoSection.tsx:1`, `src/components/sections/LocationSection.tsx:1`, `src/components/sections/TrustBarSection.tsx:1`, `src/components/sections/ValuesSection.tsx:1`
**Issue:** Four section components use `import * as icons from 'lucide-react'` to dynamically resolve icon names from CMS data. This namespace import pulls in the entire lucide-react library (~1000+ icons), which significantly increases the server-side bundle and can affect cold-start times on Vercel. The `TrustBarSection` even has a `void Leaf; void RotateCcw; ...` workaround to prevent tree-shaking -- acknowledging the issue.
**Fix:**
This is a known trade-off for CMS-driven dynamic icons. The current approach is functionally correct. For a future optimization, consider a curated icon map with only the ~20 icons the CMS actually uses:
```typescript
import { Shield, Heart, Leaf, Layers, MapPin, Mail, Phone, Clock, CheckCircle } from 'lucide-react'
const ICON_MAP: Record<string, LucideIcon> = { shield: Shield, heart: Heart, ... }
```

### WR-05: `Date.now()` used for section IDs risks collision

**File:** `src/app/admin/innhold/[pageId]/page.tsx:51`
**Issue:** `createDefaultSection` uses `section-${Date.now()}` as the section ID. If a user clicks "add section" twice quickly (within the same millisecond), two sections will get the same ID. This breaks the `SortableContext` (dnd-kit) which relies on unique IDs, and can cause React key collisions.
**Fix:**
Use `crypto.randomUUID()` (available in all modern browsers) or a counter:
```typescript
id: `section-${crypto.randomUUID()}`,
```

### WR-06: FaqSection uses `<h4>` skipping heading level

**File:** `src/components/sections/FaqSection.tsx:21`
**Issue:** The FAQ section renders `<h2>` for the section heading (line 9) and `<h4>` for each question (line 21), skipping `<h3>`. WCAG 2.1 AA requires a logical heading hierarchy with no skipped levels (1.3.1 Info and Relationships). Screen readers use heading levels for navigation, and skipped levels can confuse users.
**Fix:**
Change `<h4>` to `<h3>` for FAQ question titles:
```tsx
<h3 className="font-heading text-[0.9375rem] font-bold leading-[1.3] text-forest">
  {item.title}
</h3>
```

## Info

### IN-01: TeamSection uses `<h4>` skipping heading level (same pattern as FAQ)

**File:** `src/components/sections/TeamSection.tsx:35`
**Issue:** The team section uses `<h2>` for section heading and `<h4>` for team member names, skipping `<h3>`. Same heading hierarchy concern as WR-06.
**Fix:**
Change `<h4>` to `<h3>`:
```tsx
<h3 className="mt-4 font-heading text-[1.125rem] font-bold text-forest">
  {item.title}
</h3>
```

### IN-02: TrustBarSection `heading` field from CMS is not rendered

**File:** `src/components/sections/TrustBarSection.tsx:25-49`
**Issue:** The `TrustBarSection` component receives a `section` prop with a potential `heading` field, but never renders it. The trust-bar mock data in `mock-data.ts` does not include a heading, so this is not a bug. However, if an admin adds a heading via the CMS editor, it will be silently ignored.
**Fix:**
Either render the heading when present (even if visually hidden for screen readers), or document in the admin UI that the trust-bar does not support headings.

### IN-03: Newsletter section uses hardcoded content outside CMS

**File:** `src/app/page.tsx:156-178`
**Issue:** The newsletter section heading ("Hold deg oppdatert"), subtitle, and privacy notice are hardcoded strings, while the rest of the forside page uses CMS-driven content. This creates an inconsistency where the admin cannot edit the newsletter copy through the CMS.
**Fix:**
Consider adding a `newsletter` section type to the CMS, or document this as intentional since the newsletter is a structural element.

### IN-04: Unused import `Leaf, RotateCcw, Mountain, Shield` kept via `void` expression

**File:** `src/components/sections/TrustBarSection.tsx:2, 20-23`
**Issue:** Named imports (`Leaf`, `RotateCcw`, `Mountain`, `Shield`) are imported alongside the namespace import, then kept alive with `void Leaf`, etc. This is a workaround to prevent tree-shaking from removing fallback icons. While functional, it is unusual and could confuse future maintainers.
**Fix:**
Add a code comment explaining the pattern, or reference the icons directly in the `FALLBACK_ITEMS` array to make the dependency explicit:
```typescript
const FALLBACK_ITEMS = [
  { Icon: Shield, label: 'Trygg betaling' },
  { Icon: Leaf, label: 'Norsk kvalitet' },
  ...
]
```

---

_Reviewed: 2026-04-08T16:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
