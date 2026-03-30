# Phase 2: Butikkvindu og Admin - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Bygg offentlig produktkatalog, opplevelseslister, bloggartikler og fullt admin CMS. Kunder kan bla gjennom alt innhold. Admin kan opprette, redigere og slette produkter, opplevelser og artikler, samt endre innhold pa nettsiden. Ingen handlekurv, checkout eller booking — kun visning og admin.

</domain>

<decisions>
## Implementation Decisions

### Produktkatalog
- **D-01:** Produktkatalogen vises som kort-rutenett (3-4 kolonner) med bilde, navn og pris
- **D-02:** Kategorier presenteres som faner/tabs overst: Drikke | Kaffe/Te | Naturprodukter
- **D-03:** Produktdetaljside har hovedbilde med miniatyrbildegalleri under som kan klikkes
- **D-04:** Rutestruktur: /produkter (katalog) og /produkter/[slug] (detalj)

### Opplevelsessider
- **D-05:** Opplevelser listes som store kort med bilde, tittel, dato, pris — UTEN vanskelighetsgrad pa listesiden
- **D-06:** Vanskelighetsgrad (BOOK-07) vises kun pa detaljsiden, ikke pa listeoversikten
- **D-07:** Tilgjengelige plasser vises som synlig teller: "3 av 10 plasser igjen"
- **D-08:** Rutestruktur: /opplevelser (liste) og /opplevelser/[slug] (detalj)

### Blogg
- **D-09:** Bloggartikler vises som kortrutenett med bilde, tittel og utdrag
- **D-10:** Tiptap brukes som rik tekst-editor i admin for a skrive artikler
- **D-11:** Hver artikkel MA ha et obligatorisk fremhevet bilde (hero)
- **D-12:** Rutestruktur: /blogg (oversikt) og /blogg/[slug] (artikkel)
- **D-13:** Artikler rendres med SSG/ISR for optimal ytelse og SEO

### Admin CMS
- **D-14:** Admin-dashboard har fast venstre sidebar med menylenker + innholdsomrade til hoyre
- **D-15:** CRUD-grensesnitt: tabell med liste over elementer, klikk for a apne redigeringsskjema
- **D-16:** Bildeopplasting via drag-and-drop til Firebase Storage
- **D-17:** Admin-ruter under /admin, beskyttet av middleware med admin Custom Claims
- **D-18:** Content Management System: admin kan redigere sideinnhold (hero-tekst, om oss, etc.) via /admin/innhold
- **D-19:** Alt-tekst er obligatorisk felt pa alle bildeopplastinger — publisering blokkeres uten det (WCAG-04)

### Claude's Discretion
- Opplevelsesdetaljside-layout (hero-bilde vs info forst — bruker sa "du velger")
- Tabell-komponent design for admin CRUD-lister
- Admin sidebar navigasjonsstruktur (hvilke menylinker)
- Firestore collection-struktur for produkter, opplevelser, artikler og sideinnhold
- SEO metadata-implementering (Next.js metadata API)
- Sitemap og robots.txt generering
- Tiptap editor-konfigurasjon og extensions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prosjektdokumenter
- `.planning/PROJECT.md` — Prosjektbeskrivelse, core value og constraints
- `.planning/REQUIREMENTS.md` — PROD-01, PROD-02, CONT-01–05, ADMN-01–04, ADMN-07–08, BOOK-01, BOOK-02, BOOK-07, WCAG-04

### Phase 1 fundament
- `.planning/phases/01-fundament/01-CONTEXT.md` — Fargepalett, typografi, layout-beslutninger
- `.planning/phases/01-fundament/01-UI-SPEC.md` — Design system tokens, spacing, UI primitiver
- `src/components/ui/Button.tsx` — Eksisterende Button-komponent med varianter
- `src/components/ui/Input.tsx` — Eksisterende Input-komponent med error-stotte
- `src/components/ui/FormError.tsx` — Eksisterende FormError-komponent
- `src/components/layout/Header.tsx` — Header med mega-meny integrering
- `src/lib/navigation.ts` — Navigasjonsdata (kategorier, lenker)
- `src/middleware.ts` — Admin-rutebeskyttelse
- `src/lib/firebase/client.ts` — Firebase client SDK singleton
- `src/lib/firebase/admin.ts` — Firebase Admin SDK singleton

### Research
- `.planning/research/STACK.md` — Firebase Storage, Tiptap, ISR-monstre
- `.planning/research/ARCHITECTURE.md` — Firestore collection-design, rutestruktur
- `.planning/research/FEATURES.md` — Table stakes for e-commerce og booking

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` (3 varianter: primary/secondary/ghost) — bruk for admin handlinger og CTA-er
- `Input` (med label, error, aria-describedby) — bruk i admin skjemaer
- `FormError` (role="alert") — bruk for feilmeldinger i admin
- `cn()` utility for Tailwind class merging
- Firebase client/admin singletons — klar til bruk
- Middleware med admin-sjekk — /admin ruter allerede beskyttet

### Established Patterns
- Tailwind v4 med @theme CSS custom properties
- Merriweather overskrifter + Inter brodtekst
- 8-point spacing scale (4, 8, 16, 24, 32, 48, 64px)
- Modal-monster fra AuthModal (fokus-felle, ARIA)
- Server Actions for mutasjoner (fra auth)

### Integration Points
- Header mega-meny — kategorier fra navigation.ts, ma oppdateres med dynamiske kategorier
- /admin ruter — middleware tillater kun brukere med admin Custom Claims
- Firebase Storage — bildeopplasting fra admin
- Firestore — produkter, opplevelser, artikler, sideinnhold collections

</code_context>

<specifics>
## Specific Ideas

- Brukeren understreket at admin ma kunne endre sideinnhold (hero, om oss) — ikke bare produkter/artikler
- Vanskelighetsgrad fjernes fra opplevelseslisten (kun pa detaljside) — renere design
- Tiptap er spesifikt valgt for rik tekst — ikke markdown eller enkel textarea
- Obligatorisk hero-bilde pa artikler — visuell konsistens er viktig

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-butikkvindu-og-admin*
*Context gathered: 2026-03-30*
