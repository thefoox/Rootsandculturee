# Phase 1: Fundament - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 01-fundament
**Areas discussed:** Fargepalett, Typografi, Auth-flyt, Sidelayout

---

## Fargepalett

### Gronntone

| Option | Description | Selected |
|--------|-------------|----------|
| Skoggronn | Dyp, rik skogbunn-gronn (#1B4332) — tett og jordlig | ✓ |
| Moseronn | Varmere, gulere undertone (#2D5016) — myk og organisk | |
| Grantraer-gronn | Blalig, kjolig norsk natur (#1A3C34) — skandinavisk og rolig | |

**User's choice:** Skoggronn (#1B4332)

### Hostfarger

| Option | Description | Selected |
|--------|-------------|----------|
| Varm rust | Rustrod (#A0522D) + brent oransje (#CC5500) — kraftig og jordlig | ✓ |
| Dempet host | Terrakotta (#C67B5C) + varm brun (#8B6914) — mykere, mer sofistikert | |
| Dyp host | Vinrod (#722F37) + kobber (#B87333) — moden og eksklusiv | |

**User's choice:** Varm rust

### Bakgrunn

| Option | Description | Selected |
|--------|-------------|----------|
| Varm hvit | Krem/off-white (#FEFCF3) — myk og naturlig, ikke steril | ✓ |
| Lys sand | Sandfarge (#F5F0E8) — varmere, mer jordlig | |
| Ren hvit | Hvit (#FFFFFF) — ren og moderne | |

**User's choice:** Varm hvit (#FEFCF3)

### Mork modus

| Option | Description | Selected |
|--------|-------------|----------|
| Nei | Kun lys modus — enklere, passer natur/organisk folelse | ✓ |
| Ja | Stotte for mork modus — mer arbeid, men moderne | |

**User's choice:** Nei

---

## Typografi

### Overskrifter

| Option | Description | Selected |
|--------|-------------|----------|
| Serif | Tradisjonell og autoritativ (f.eks. Playfair Display, Lora) | |
| Sans-serif | Moderne og ren (f.eks. Inter, DM Sans) | |
| Slab serif | Kraftig og jordnaer (f.eks. Roboto Slab) | |

**User's choice:** Merriweather (serif) — user specified exact font, not from options
**Notes:** User typed "Merriweather" as custom input

### Brodtekst

| Option | Description | Selected |
|--------|-------------|----------|
| Sans-serif | Lettlest pa skjerm (f.eks. Inter, Source Sans) | |
| Serif | Mer bokaktig folelse (f.eks. Source Serif) | |
| You decide | Claude velger det som passer best | |

**User's choice:** Inter — user specified exact font
**Notes:** User typed "Inter" as custom input

### Skriftstil-retning

| Option | Description | Selected |
|--------|-------------|----------|
| Luftig og stor | Store overskrifter, god linjeavstand — rolig og oversiktlig | |
| Kompakt og effektiv | Mindre tekst, tettere layout — mer innhold synlig | ✓ |
| You decide | Claude velger balansert typografi | |

**User's choice:** Kompakt og effektiv

---

## Auth-flyt

### Login-presentasjon

| Option | Description | Selected |
|--------|-------------|----------|
| Egne sider | /logg-inn og /registrer som separate fullskjerm-sider | |
| Modal/overlay | Pop-up modal over gjeldende side | ✓ |
| Side-panel | Skyves inn fra hoyre — moderne, men mer komplekst | |

**User's choice:** Modal/overlay

### Etter login

| Option | Description | Selected |
|--------|-------------|----------|
| Tilbake | Tilbake til siden de var pa for login | ✓ |
| Forsiden | Alltid til forsiden etter login | |
| Kundeprofil | Til /konto-dashboardet | |

**User's choice:** Tilbake til forrige side

### Registreringskrav

| Option | Description | Selected |
|--------|-------------|----------|
| Minimalt | Bare e-post + passord | |
| Standard | E-post + passord + fullt navn | |
| Komplett | E-post + passord + navn + adresse | ✓ |

**User's choice:** Komplett registrering

---

## Sidelayout

### Header

| Option | Description | Selected |
|--------|-------------|----------|
| Fast topp-bar | Alltid synlig oerst (sticky header) | ✓ |
| Skjules ved scroll | Header skjules nar brukeren scroller ned | |
| Transparent hero | Gjennomsiktig pa forsiden, solid pa andre sider | |

**User's choice:** Fast sticky header

### Navigasjon

| Option | Description | Selected |
|--------|-------------|----------|
| Enkel navbar | Flat liste: Produkter, Opplevelser, Blogg, Om oss | |
| Mega-meny | Dropdown med kategorier og bilder | ✓ |
| Du velger | Claude velger basert pa innholdsstrukturen | |

**User's choice:** Mega-meny

### Mobilmeny

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger-meny | Klassisk ikon som apner fullskjerm overlay | ✓ |
| Bottom nav | Fast navigasjonslinje i bunnen (app-stil) | |
| Side-drawer | Skyves inn fra siden | |

**User's choice:** Hamburger-meny

### Footer

| Option | Description | Selected |
|--------|-------------|----------|
| Informativ | Kolonner med lenker, kontaktinfo, sosiale medier | ✓ |
| Minimal | Enkel linje med copyright og noen lenker | |
| Du velger | Claude designer passende footer | |

**User's choice:** Informativ footer

---

## Claude's Discretion

- Tailwind v4 CSS custom property-verdier
- Font-storrelse/linjeavstand-skala
- Firestore collection-struktur
- Firebase Security Rules
- Middleware-logikk
- Skip-link og fokus-indikator styling

## Deferred Ideas

None — discussion stayed within phase scope
