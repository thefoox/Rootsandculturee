---
phase: 07-cms-fikser-og-admin-crud
plan: 01
subsystem: api
tags: [nextjs, firebase, revalidateTag, cache, cms, typescript]

requires:
  - phase: 02-butikkvindu-og-admin
    provides: "CMS page-content API foundation (GET/PUT route)"

provides:
  - "PUT /api/page-content/[pageId] with revalidateTag cache invalidation"
  - "DELETE /api/page-content/[pageId] with admin auth and cache invalidation"
  - "PageSection.imagePosition field for text-image CMS sections"
  - "TrustBarSection reading from section.items with hardcoded fallback"

affects:
  - 07-02
  - 07-03
  - 07-04
  - 07-05

tech-stack:
  added: []
  patterns:
    - "revalidateTag('page-content', 'max') called after all Firestore writes in page-content API"
    - "Dynamic icon resolution from string name via lucide-react namespace import"
    - "CMS section components use section.items with FALLBACK_ITEMS for backward compatibility"

key-files:
  created: []
  modified:
    - src/app/api/page-content/[pageId]/route.ts
    - src/types/index.ts
    - src/components/sections/TrustBarSection.tsx

key-decisions:
  - "Added verifySession() admin check to DELETE handler (T-07-01 threat mitigation — not in original plan)"
  - "revalidateTag called in both real and mock branches of PUT to ensure consistent cache behavior"
  - "TrustBarSection uses void Leaf/RotateCcw/Mountain to prevent tree-shaking of fallback icons"

patterns-established:
  - "CMS section components: check section.items?.length > 0, fall back to FALLBACK_ITEMS const"
  - "Icon resolution: getIcon(name) helper using lucide-react namespace wildcard import"

requirements-completed: [CMS-01, CMS-02, CMS-03, CMS-05]

duration: 12min
completed: 2026-04-07
---

# Phase 07 Plan 01: CMS API og type-grunnlag Summary

**revalidateTag cache-invalidering i PUT, nytt autentisert DELETE-endepunkt, dynamisk TrustBarSection med Firestore-data, og imagePosition-felt pa PageSection**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-07T00:00:00Z
- **Completed:** 2026-04-07T00:12:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- PUT-endepunktet kaller naa revalidateTag('page-content', 'max') etter vellykket Firestore-skriving — admin ser endringer umiddelbart uten hard refresh
- Nytt DELETE-endepunkt med verifySession()-sjekk og cache-invalidering — admin kan slette sider fra CMS
- TrustBarSection leser fra section.items med fallback til hardkodede norske verdier — CMS-data vises for sider som har det konfigurert
- PageSection-interfacet har naa imagePosition?: 'left' | 'right' for text-image-seksjoner (CMS-05)

## Task Commits

1. **Task 1: CMS API — revalidateTag i PUT og DELETE-endepunkt** - `4698bf3` (feat)
2. **Task 2: Type-utvidelse og TrustBarSection dynamisk** - `7568bfc` (feat)

## Files Created/Modified

- `src/app/api/page-content/[pageId]/route.ts` - Lagt til revalidateTag i PUT, nytt DELETE med auth
- `src/types/index.ts` - Lagt til imagePosition?: 'left' | 'right' pa PageSection
- `src/components/sections/TrustBarSection.tsx` - Omskrevet til dynamisk rendering fra section.items

## Decisions Made

- **verifySession() i DELETE:** Threat register (T-07-01) krevde admin-auth pa DELETE — lagt til som Rule 2 (manglende kritisk sikkerhet), ikke i original plan
- **revalidateTag i mock-grenen:** Kalt i begge kodestier (ekte og mock) for konsistent oppforsel i utvikling og produksjon
- **void Leaf/RotateCcw/Mountain:** Forhindrer tree-shaking av fallback-ikoner som ikke brukes i den dynamiske grenen

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Lagt til verifySession() admin-sjekk i DELETE-handler**
- **Found during:** Task 1 (CMS API — DELETE-endepunkt)
- **Issue:** Threat register T-07-01 markerte DELETE som `mitigate` — uten auth kan hvem som helst slette CMS-sider
- **Fix:** Import av verifySession fra @/lib/dal, sjekk for session.role === 'admin', 401 ved manglende auth
- **Files modified:** src/app/api/page-content/[pageId]/route.ts
- **Verification:** verifySession-import og 401-retur bekreftet via grep
- **Committed in:** 4698bf3 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical — security)
**Impact on plan:** Auto-fix nodvendig for sikkerhet. Ingen scope-kryp.

## Issues Encountered

Ingen — alle filer kompilerte uten TypeScript-feil etter endringene.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Cache-invalidering og DELETE-endepunkt klart for bruk i admin CMS-editor (07-02)
- imagePosition-felt tilgjengelig for text-image-seksjon i admin-skjema (07-03)
- TrustBarSection klar til testing med ekte CMS-data fra Firestore

---
*Phase: 07-cms-fikser-og-admin-crud*
*Completed: 2026-04-07*
