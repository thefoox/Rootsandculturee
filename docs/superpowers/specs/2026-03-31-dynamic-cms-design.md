# Dynamic CMS Design Spec

## Context

Roots & Culture har en nettside med hardkodede sider der seksjonene er skrevet direkte i React-komponentene. Det finnes en enkel admin-editor som lar deg redigere eksisterende seksjoner, men den mangler: opprettelse/sletting av seksjoner, drag-and-drop rekkefølge, opprettelse av nye sider, og dynamisk rendering. All sideinnhold skal styres fra CMS slik at admin kan bygge og redigere sider uten kodeendringer.

## Bruker

Kun en admin-bruker (Jacob). CMS-et kan prioritere kraft over enkelhet.

## Seksjonstyper (12 totalt)

### Statiske seksjoner

| Type | Felter |
|------|--------|
| `hero` | heading, subheading, image+alt, ctaText, ctaLink |
| `text` | heading, subheading |
| `text-image` | heading, body (Tiptap WYSIWYG), image+alt, ctaText, ctaLink |
| `cta` | heading, subheading, image+alt, ctaText, ctaLink |
| `faq` | heading, items[title, description] |
| `values` | heading, items[title, description, icon] |
| `team` | heading, items[title, description, image] |
| `gallery` | heading, items[image+alt] |
| `contact-info` | heading, items[title, description, icon] |

### Data-seksjoner (henter innhold automatisk)

| Type | Felter | Data |
|------|--------|------|
| `experiences-grid` | heading, subheading | Henter siste opplevelser via `getExperiences()` |
| `articles-grid` | heading, subheading | Henter siste artikler via `getArticles()` |
| `products-grid` | heading, subheading | Henter siste produkter via `getProducts()` |

## Sidemodell

### Firestore: `pageContent/{pageId}`

```typescript
interface PageContent {
  id: string
  title: string
  slug: string                // URL-path, manuelt satt av admin
  isPublished: boolean        // Skjul/vis side
  showInNavigation: boolean   // Vis i header-navigasjon
  navigationOrder: number     // Sorteringsrekkefølge i nav
  sections: PageSection[]
  updatedAt: Date
}
```

Nye felt: `slug`, `isPublished`, `showInNavigation`, `navigationOrder`.

### SectionType (utvidet)

```typescript
type SectionType =
  | 'hero' | 'text-image' | 'text' | 'values' | 'team'
  | 'faq' | 'cta' | 'gallery' | 'contact-info'
  | 'experiences-grid' | 'articles-grid' | 'products-grid'
```

## Ruting

| URL | Kilde |
|-----|-------|
| `/` | `app/page.tsx` rendrer `pageContent/forside` |
| `/opplevelser`, `/opplevelser/[slug]` | Dedikert rute (beholdes) |
| `/produkter/[slug]` | Dedikert rute (beholdes) |
| `/blogg`, `/blogg/[slug]` | Dedikert rute (beholdes) |
| `/konto/*` | Dedikert rute (beholdes) |
| `/admin/*` | Dedikert rute (beholdes) |
| `/[slug]` | Catch-all: rendrer `pageContent` der `slug` matcher |

Catch-all `app/[slug]/page.tsx` slår opp `pageContent` med matchende slug. Returnerer 404 om ikke funnet eller ikke publisert.

## Navigasjon

Header-navigasjonen bygges dynamisk:
1. Hent alle sider med `showInNavigation: true` fra Firestore
2. Sorter etter `navigationOrder`
3. Faste ruter (`/opplevelser`, `/blogg`) inkluderes som navigasjonselementer i CMS-dataen
4. Header-komponenten rendrer navigasjonen fra denne dataen

Ny funksjon: `getNavigationPages()` i data-laget.

## Admin CMS-editor

### Sideoversikt (`/admin/innhold`)

- Tabell med alle sider: tittel, slug, status (publisert/kladd), sist oppdatert
- "Opprett ny side"-knapp som åpner modal med tittel + slug-input
- Klikk rad -> åpner editor

### Sideeditor (`/admin/innhold/[pageId]`)

**Sideinnstillinger (øverst):**
- Tittel (input)
- Slug (input, manuell)
- isPublished (toggle)
- showInNavigation (toggle)
- navigationOrder (number input)

**Seksjonsliste:**
- Sortable liste med drag-and-drop via `@dnd-kit/core` + `@dnd-kit/sortable`
- Hver seksjon vises som sammenklappbar rad:
  - Drag-handle (grip-ikon)
  - Seksjonstype-badge + heading-preview
  - Expand/collapse chevron
  - Slett-knapp (med bekreftelse)
- Ekspandert: Viser relevante felter for seksjonstypen
- Body-felt bruker eksisterende `TiptapEditor`-komponent
- Bilde-felt bruker eksisterende `CmsImageUpload`-komponent

**"Legg til seksjon"-knapp:**
- Dropdown med alle 12 seksjonstyper
- Oppretter ny seksjon med standardverdier og neste `order`-verdi
- Ny seksjon legges til nederst, ekspandert

**Lagre:**
- PUT til `/api/page-content/[pageId]`
- Lagrer alle seksjoner med oppdaterte `order`-verdier
- Viser bekreftelse med toast

## Dynamisk seksjon-renderer (public)

### Komponentstruktur

```
src/components/sections/
  SectionRenderer.tsx          — Switch på section.type, rendrer riktig komponent
  HeroSection.tsx
  TextSection.tsx
  TextImageSection.tsx
  CtaSection.tsx
  FaqSection.tsx
  ValuesSection.tsx
  TeamSection.tsx
  GallerySection.tsx
  ContactInfoSection.tsx
  ExperiencesGridSection.tsx   — Async Server Component, kaller getExperiences()
  ArticlesGridSection.tsx      — Async Server Component, kaller getArticles()
  ProductsGridSection.tsx      — Async Server Component, kaller getProducts()
```

### SectionRenderer

```typescript
function SectionRenderer({ section }: { section: PageSection }) {
  switch (section.type) {
    case 'hero': return <HeroSection section={section} />
    case 'text': return <TextSection section={section} />
    // ... etc
  }
}
```

### DynamicPage (brukes av alle sider)

```typescript
async function DynamicPage({ pageId }: { pageId: string }) {
  const page = await getPageContent(pageId)
  if (!page || !page.isPublished) notFound()

  return page.sections
    .sort((a, b) => a.order - b.order)
    .map(section => <SectionRenderer key={section.id} section={section} />)
}
```

## Refaktorering

### Fjernes / erstattes
- `app/page.tsx` — All hardkodet seksjon-HTML erstattes med `DynamicPage({ pageId: 'forside' })`
- `app/(public)/om-oss/page.tsx` — Erstattes av catch-all `app/[slug]/page.tsx`
- `app/(public)/kontakt/page.tsx` — Erstattes av catch-all (kontaktskjema beholdes som del av `contact-info`-seksjonen)

### Oppdateres
- `src/types/index.ts` — Nye felt på PageContent, nye SectionType-verdier
- `src/lib/data/page-content.ts` — Nye felt i mapping, ny `getNavigationPages()`
- `src/lib/data/mock-data.ts` — Nye felt (`slug`, `isPublished`, etc.) på alle mockPageContent
- `src/components/layout/Header.tsx` — Dynamisk navigasjon fra Firestore
- `src/app/admin/innhold/page.tsx` — Ny side-opprettelse
- `src/app/admin/innhold/[pageId]/page.tsx` — Drag-and-drop, seksjon-opprettelse/sletting
- `src/app/api/page-content/[pageId]/route.ts` — Støtte for nye felt, opprettelse av nye sider
- `firestore.indexes.json` — Evt. ny indeks for navigasjonsquery

### Nye filer
- `src/components/sections/*.tsx` — 13 seksjonskomponenter
- `app/[slug]/page.tsx` — Catch-all dynamisk side

## Avhengigheter

Ny npm-pakke: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`

## Verifisering

1. Start dev-server (`npm run dev`)
2. Gå til `/admin/innhold` — se alle sider i liste
3. Klikk en side — se seksjoner med drag-handles
4. Dra en seksjon til ny posisjon — se at rekkefølgen oppdateres
5. Klikk "Legg til seksjon" — velg type, se ny seksjon
6. Lagre og se endringene på public-siden
7. Opprett ny side med manuell slug — verifiser at den rendres på `/[slug]`
8. Toggle `showInNavigation` — verifiser at header oppdateres
