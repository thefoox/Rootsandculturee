---
phase: 15-redesign-hovedsider
fixed_at: 2026-04-08T16:30:00Z
review_path: .planning/phases/15-redesign-hovedsider/15-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 6
skipped: 1
status: partial
---

# Phase 15: Code Review Fix Report

**Fixed at:** 2026-04-08T16:30:00Z
**Source review:** .planning/phases/15-redesign-hovedsider/15-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (1 Critical, 6 Warning)
- Fixed: 6
- Skipped: 1

## Fixed Issues

### CR-01: Firestore mapper drops ctaSecondaryText and ctaSecondaryLink fields

**Files modified:** `src/lib/data/page-content.ts`
**Commit:** 4eddc38
**Applied fix:** Added `ctaSecondaryText` and `ctaSecondaryLink` fields to the `mapPageContent` Firestore document mapper, so secondary hero CTA buttons are preserved when CMS data is loaded from Firestore.

### WR-01: .sort() mutates cached sections array in-place

**Files modified:** `src/app/page.tsx`, `src/app/(public)/kontakt/page.tsx`, `src/app/(public)/om-oss/page.tsx`
**Commit:** dff137f
**Applied fix:** Changed `sections.sort()` to `[...sections].sort()` in all three page files to avoid mutating the cached array returned by `unstable_cache`.

### WR-02: Newsletter form missing form tag and submit handler

**Files modified:** `src/app/page.tsx`
**Commit:** 364152c
**Applied fix:** Wrapped newsletter email input and button in a `<form>` element. Added `required` attribute to email input, `type="submit"` to button, and disabled the button with a "Kommer snart" tooltip since the newsletter backend is not yet implemented. Styled disabled state with reduced opacity and not-allowed cursor.

### WR-03: useEffect dependency on entire state object causes potential stale closure

**Files modified:** `src/app/(public)/kontakt/ContactForm.tsx`
**Commit:** cc9497a
**Status:** fixed: requires human verification
**Applied fix:** Added a `useRef(false)` sentinel (`prevSuccess`) to track whether the success toast has already been shown. The effect now only fires the toast when `state.success` transitions from false to true, preventing duplicate toasts on parent re-renders.

### WR-05: Date.now() used for section IDs risks collision

**Files modified:** `src/app/admin/innhold/[pageId]/page.tsx`
**Commit:** 56ccd9b
**Applied fix:** Replaced `Date.now()` with `crypto.randomUUID()` in `createDefaultSection` to generate unique section IDs. This prevents ID collisions when a user clicks "add section" rapidly, which would break dnd-kit's SortableContext and React key uniqueness.

### WR-06: FaqSection uses h4 skipping heading level

**Files modified:** `src/components/sections/FaqSection.tsx`
**Commit:** 65b63eb
**Applied fix:** Changed `<h4>` to `<h3>` for FAQ question titles, fixing the WCAG 2.1 AA heading hierarchy violation (h2 section heading -> h3 question, no longer skipping a level).

## Skipped Issues

### WR-04: import * as icons from 'lucide-react' imports the entire icon library

**File:** `src/components/sections/ContactInfoSection.tsx:1`, `src/components/sections/LocationSection.tsx:1`, `src/components/sections/TrustBarSection.tsx:1`, `src/components/sections/ValuesSection.tsx:1`
**Reason:** Deliberate architecture trade-off. The namespace import is required because these components dynamically resolve icon names from CMS data at runtime. The review itself acknowledges "The current approach is functionally correct." Replacing with a curated icon map would require knowing all icons the CMS uses and would break if an admin adds new icon names. This is a future optimization, not a bug fix.
**Original issue:** Four section components use `import * as icons from 'lucide-react'` to dynamically resolve icon names from CMS data, pulling in the entire library (~1000+ icons) and increasing bundle size.

---

_Fixed: 2026-04-08T16:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
