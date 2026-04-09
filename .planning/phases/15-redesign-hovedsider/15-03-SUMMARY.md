---
phase: 15-redesign-hovedsider
plan: 03
subsystem: kontakt-og-om-oss-sider
tags: [kontakt, om-oss, layout, redesign, contact-form, mock-data]

dependency_graph:
  requires: [15-01]
  provides: [kontakt-page-redesign, om-oss-page-redesign]
  affects: [kontakt, om-oss, mock-data]

tech_stack:
  added: []
  patterns: [section-split-rendering, page-level-form-insertion]

key_files:
  created: []
  modified:
    - src/app/(public)/kontakt/page.tsx
    - src/app/(public)/kontakt/ContactForm.tsx
    - src/app/(public)/om-oss/page.tsx
    - src/lib/data/mock-data.ts

decisions:
  - "Kontakt page splits CMS sections around page-level form: hero + contact-info before, faq + location after"
  - "ContactForm uses native HTML inputs instead of Input UI component for precise prototype styling match"
  - "Om-oss gallery section removed (not in om-oss.html prototype)"
  - "Om-oss location changed from contact-info type to location type with dark variant"

metrics:
  duration: 6m
  completed: 2026-04-09T13:20:40Z
  tasks_completed: 4
  tasks_total: 4
  files_modified: 4
---

# Phase 15 Plan 03: Kontakt & Om-oss Page Redesign Summary

Rebuilt kontakt and om-oss pages to match their HTML prototypes, with upgraded ContactForm styling and updated CMS mock data for both pages.

## Task Results

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Rebuild kontakt page layout | `5248357` | Split section rendering around page-level form section |
| 2 | Upgrade ContactForm styling | `b8d5bf4` | 2-column inputs, select dropdown, prototype styling |
| 3 | Rebuild om-oss page layout | `5215f1c` | Updated metadata, SectionRenderer-based layout |
| 4 | Update mock data | `6d51818` | Both pages with correct sections matching prototypes |

## Kontakt Page Layout (matches kontakt-v2.html)

1. **Hero** (compact, forest bg, no image) -- "Ta kontakt"
2. **Contact cards** (contact-info, 3 cards overlapping hero) -- E-post, Telefon, Besok oss
3. **Form section** (page-level) -- 2-column grid: intro + ContactForm
4. **FAQ** (faq, 2-column cards) -- 6 FAQ items
5. **Location** (location, light variant) -- Holtan Gard details + map placeholder

## Om-oss Page Layout (matches om-oss.html)

1. **Hero** (compact, centered, 70vh, bg image) -- "Om Roots & Culture"
2. **Story** (text-image, overlapping) -- "Var historie" + signature line
3. **Values** (values, 3 cards) -- Autentisitet, Baerekraft, Fellesskap
4. **Team** (team, photo-strip) -- 3 members
5. **Location** (location, dark) -- "Hvor du finner oss"
6. **CTA** (cta, no image) -- "Klar for en opplevelse?"

## ContactForm Changes

- 2-column row for name + email inputs
- Subject select dropdown (Velg emne, Opplevelser, Produkter, Bedrift, Samarbeid, Annet)
- Cream bg inputs with forest/12 border and rounded-[10px]
- Focus state: forest border + shadow ring (0 0 0 3px rgba(27,67,50,0.08))
- Full-width submit button with forest bg and arrow
- Used native HTML inputs for precise prototype styling (replaced Input UI component)

## Mock Data Changes

**Kontakt:**
- Hero: changed from "Kontakt oss" to "Ta kontakt", removed image (compact left-aligned)
- Contact-info: reduced from 4 items to 3 (E-post, Telefon, Besok oss) with subtitle descriptions
- Added location section (light variant) with Holtan Gard details
- FAQ: unchanged (already matched prototype)

**Om-oss:**
- Hero: updated subheading, changed bg image to retreat-21
- Story: added signature line via subheading field, updated paragraphs
- Values: changed heading to "Hva vi star for", updated icons (layers/shield/heart), reordered to position 2
- Team: expanded from 1 to 3 members, reordered to position 3
- Removed gallery section (not in prototype)
- Location: changed from contact-info to location type with dark variant, position 4
- CTA: moved to position 5

**Forside sections preserved:** No changes to forside mock data (from Plan 15-02).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] ContactForm uses native inputs instead of Input component**
- **Found during:** Task 2
- **Issue:** The Input UI component had opinionated styling (bg-card, border-forest/20) that didn't match prototype (bg-cream, border-forest/12, rounded-[10px])
- **Fix:** Used native HTML inputs with exact prototype styling classes
- **Files modified:** src/app/(public)/kontakt/ContactForm.tsx

## Verification

- `npm run build` passes
- Kontakt page section order matches kontakt-v2.html prototype
- Om-oss page section order matches om-oss.html prototype
- ContactForm has prototype styling (2-col inputs, select, cream bg, forest button)
- Mock data for both pages has correct content from prototypes
- Forside mock data preserved unchanged

## Self-Check: PASSED

All 4 modified files exist. All 4 task commits verified.
