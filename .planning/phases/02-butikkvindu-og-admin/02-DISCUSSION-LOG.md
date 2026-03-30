# Phase 2: Butikkvindu og Admin - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 02-butikkvindu-og-admin
**Areas discussed:** Produktsider, Opplevelsessider, Blogg, Admin CMS

---

## Produktsider

### Kataloglayout

| Option | Description | Selected |
|--------|-------------|----------|
| Kort-rutenett | Produktkort i 3-4 kolonner med bilde, navn, pris | ✓ |
| Listevisning | Bilde + info side om side | |
| Begge + toggle | Bruker kan bytte | |

### Bildevisning

| Option | Description | Selected |
|--------|-------------|----------|
| Hovedbilde + galleri | Stort hovedbilde med miniatyrbilder under | ✓ |
| Bildeslider | Swipe/scroll-basert karusell | |
| Enkel visning | Ett stort bilde | |

### Kategorier

| Option | Description | Selected |
|--------|-------------|----------|
| Faner/tabs | Kategorifaner overst | ✓ |
| Sidepanel-filter | Filterpanel pa venstre side | |
| URL-basert | Separate sider per kategori | |

---

## Opplevelsessider

### Opplisting

| Option | Description | Selected |
|--------|-------------|----------|
| Kort med bilde | Store kort med bilde, tittel, dato, pris | ✓ (uten vanskelighetsgrad) |
| Kompakt liste | Tabellaktig liste | |
| Kalendervisning | Kalender med opplevelser markert | |

**Notes:** Brukeren spesifiserte at vanskelighetsgrad IKKE skal vises pa listesiden, kun pa detaljsiden.

### Detaljside

| Option | Description | Selected |
|--------|-------------|----------|
| Hero-bilde | Stort fullbredde-bilde overst | |
| Info forst | Tittel, dato, pris overst | |
| Du velger | Claude designer | ✓ |

### Plasser

| Option | Description | Selected |
|--------|-------------|----------|
| Synlig teller | "3 av 10 plasser igjen" | ✓ |
| Status-merke | "Fa plasser igjen" | |
| Progressbar | Visuell bar | |

---

## Blogg

### Artikkelliste

| Option | Description | Selected |
|--------|-------------|----------|
| Kortrutenett | Artikkelkort med bilde, tittel, utdrag i rutenett | ✓ |
| Kronologisk liste | Artikler under hverandre | |
| Du velger | | |

### Rik tekst-editor

| Option | Description | Selected |
|--------|-------------|----------|
| Tiptap | Moderne, headless editor | ✓ |
| Enkel textarea | Markdown/plain text | |
| Du velger | | |

### Artikkel hero-bilde

| Option | Description | Selected |
|--------|-------------|----------|
| Ja, obligatorisk | Hver artikkel MA ha bilde | ✓ |
| Ja, valgfritt | | |
| Nei | | |

---

## Admin CMS

### Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar-nav | Fast venstre sidebar + innholdsomrade | ✓ |
| Top-nav | Navigasjon i toppen | |
| Du velger | | |

### CRUD-monster

| Option | Description | Selected |
|--------|-------------|----------|
| Tabell + skjema | Tabell med liste, klikk for redigeringsskjema | ✓ |
| Inline-redigering | Rediger direkte i listen | |
| Du velger | | |

### Bildeopplasting

| Option | Description | Selected |
|--------|-------------|----------|
| Drag-and-drop | Dra bilder inn i opplastingsomradet | ✓ |
| Filvelger | Klikk for a velge fil | |
| Begge | Bade drag-and-drop og filvelger | |

**Notes:** Brukeren understreket at CMS ogsa ma ha content management — admin ma kunne endre sideinnhold (hero, om oss) via admin-tilgang.

---

## Claude's Discretion

- Opplevelsesdetaljside-layout
- Admin sidebar navigasjonsstruktur
- Firestore collection-design
- SEO metadata og sitemap
- Tiptap editor-konfigurasjon

## Deferred Ideas

None
