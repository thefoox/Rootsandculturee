---
status: diagnosed
trigger: "opplevelser-cms-editability — check if /opplevelser and subcategory pages are CMS-driven or static"
created: 2026-04-14T00:00:00Z
updated: 2026-04-14T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED — /opplevelser main page is entirely static/hardcoded; subcategory pages (retreat, kurs, matopplevelse) are CMS-driven
test: Read all four page.tsx files + getPageContent data layer + API routes
expecting: N/A — confirmed
next_action: Return root cause diagnosis

## Symptoms

expected: All opplevelser pages (/opplevelser and subcategory pages) should be editable via the CMS admin panel - ability to add/edit/remove sections
actual: /opplevelser page appears to be static - cannot add new sections via CMS. Unknown status for subcategory pages.
errors: No error messages - the page simply doesn't appear to be CMS-driven
reproduction: Go to admin CMS panel, try to edit /opplevelser page content or add new sections
started: Unknown - may have always been static

## Eliminated

- hypothesis: All four pages are static
  evidence: /opplevelser/retreat, /opplevelser/kurs, /opplevelser/matopplevelse all call getPageContent() and render SectionRenderer — confirmed CMS-driven
  timestamp: 2026-04-14

- hypothesis: The CMS admin panel has a fixed registry of allowed page IDs
  evidence: The admin innhold panel at /admin/innhold fetches ALL documents from the pageContent Firestore collection dynamically — no hardcoded registry. Any document created via POST /api/page-content becomes editable.
  timestamp: 2026-04-14

## Evidence

- timestamp: 2026-04-14
  checked: src/app/(public)/opplevelser/page.tsx
  found: Zero calls to getPageContent(). All content is hardcoded JSX: hero image, intro text, categories array (hardcoded), faqItems array (hardcoded), experiences list (from getExperiences()), articles (from getArticles()). Does NOT use SectionRenderer.
  implication: This page is 100% static/hardcoded. It does not read from or connect to the Firestore pageContent collection. It cannot be edited via the CMS admin panel.

- timestamp: 2026-04-14
  checked: src/app/(public)/opplevelser/retreat/page.tsx
  found: Calls getPageContent('retreat') and renders sortedSections via <SectionRenderer>. Identical CMS pattern to forside (homepage).
  implication: retreat is CMS-driven. Editable at /admin/innhold/retreat provided the Firestore document exists.

- timestamp: 2026-04-14
  checked: src/app/(public)/opplevelser/kurs/page.tsx
  found: Calls getPageContent('kurs') and renders sortedSections via <SectionRenderer>. Same pattern.
  implication: kurs is CMS-driven. Editable at /admin/innhold/kurs.

- timestamp: 2026-04-14
  checked: src/app/(public)/opplevelser/matopplevelse/page.tsx
  found: Calls getPageContent('matopplevelse') and renders sortedSections via <SectionRenderer>. Same pattern.
  implication: matopplevelse is CMS-driven. Editable at /admin/innhold/matopplevelse.

- timestamp: 2026-04-14
  checked: src/lib/data/page-content.ts
  found: getPageContent(pageId) fetches from adminDb.collection('pageContent').doc(pageId). The document ID IS the pageId string. Returns null if document does not exist — pages gracefully render with empty sections.
  implication: For subcategory pages to show CMS sections, their corresponding Firestore documents ('retreat', 'kurs', 'matopplevelse') must exist. They may not yet exist in Firestore.

- timestamp: 2026-04-14
  checked: src/app/api/page-content/route.ts (POST handler)
  found: Creates new pageContent doc with slug derived from user input. ID is set to slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'). No hardcoded whitelist.
  implication: To make /opplevelser CMS-driven, admin must create a new page with slug 'opplevelser' in the admin panel, then the page.tsx must be refactored to call getPageContent('opplevelser').

- timestamp: 2026-04-14
  checked: CMS pattern comparison (src/app/page.tsx)
  found: Homepage (forside) is 100% CMS-driven — ONLY calls getPageContent('forside') + SectionRenderer, no hardcoded content. /opplevelser page was never converted to this pattern.
  implication: /opplevelser was built with hardcoded content and never migrated to the CMS-driven approach used by forside, om-oss, kontakt, and all three subcategory pages.

## Resolution

root_cause: src/app/(public)/opplevelser/page.tsx was built with entirely hardcoded JSX content and never integrated with the CMS system. It does not call getPageContent() or render SectionRenderer. All sections (hero, intro, categories, FAQ) are hardcoded TypeScript arrays and JSX. In contrast, all three subcategory pages (retreat, kurs, matopplevelse) DO follow the CMS pattern and call getPageContent() with their respective page IDs.

fix: (not applied — diagnose-only mode) Refactor src/app/(public)/opplevelser/page.tsx to call getPageContent('opplevelser') and render sections via SectionRenderer, matching the pattern used in retreat/kurs/matopplevelse pages. The existing hardcoded content (hero, intro, categories, FAQ) would need to be migrated to Firestore via the admin CMS panel as initial content, or the page can be built as a hybrid (CMS sections above a static experiences grid section, matching the subcategory page pattern).

verification:
files_changed: []
