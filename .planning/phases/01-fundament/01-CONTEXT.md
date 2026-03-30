# Phase 1: Fundament - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Sett opp Next.js App Router-prosjekt med Firebase (Auth, Firestore, Storage), Tailwind v4 design-system, auth-system med SSR-stotte, og WCAG 2.1 AA-tilgjengelig komponentbibliotek. Alt pa norsk. Ingen produkter, booking eller innhold — kun fundamentet som resten bygges pa.

</domain>

<decisions>
## Implementation Decisions

### Fargepalett
- **D-01:** Kjernefargen er skoggronn (#1B4332) — dyp, rik, jordlig grontone
- **D-02:** Aksentfarger er varm rust: rustrod (#A0522D) + brent oransje (#CC5500) — kraftig og jordlig
- **D-03:** Bakgrunnsfarge er varm hvit/krem (#FEFCF3) — myk og naturlig
- **D-04:** Ingen mork modus — kun lys modus
- **D-05:** Alle fargekombinasjoner ma oppfylle WCAG 2.1 AA kontrast (4.5:1 for tekst)

### Typografi
- **D-06:** Overskrifter bruker Merriweather (serif) — tradisjonell og autoritativ
- **D-07:** Brodtekst bruker Inter (sans-serif) — lettlest og tilgjengelig
- **D-08:** Kompakt og effektiv skriftstil — mindre tekst, tettere layout, mer innhold synlig
- **D-09:** Begge fonter fra Google Fonts

### Auth-flyt
- **D-10:** Innlogging og registrering presenteres som modal/overlay — brukeren forlater ikke konteksten
- **D-11:** Etter innlogging sendes brukeren tilbake til siden de var pa
- **D-12:** Registrering krever komplett info: e-post, passord, fullt navn og adresse
- **D-13:** Firebase Auth (email/passord) med jose-krypterte HttpOnly cookies for SSR

### Sidelayout
- **D-14:** Fast sticky header med logo, navigasjon, handlekurv-ikon og login/profil
- **D-15:** Mega-meny navigasjon med dropdown som viser kategorier og bilder
- **D-16:** Mobilnavigasjon: hamburger-meny (☰) som apner fullskjerm overlay
- **D-17:** Informativ footer med kolonner: lenker, kontaktinfo, sosiale medier

### Claude's Discretion
- Eksakte Tailwind v4 CSS custom property-verdier (basert pa de valgte HEX-fargene)
- Font-storrelse/linjeavstand-skala (innenfor "kompakt og effektiv" retning)
- Exact Firestore collection-struktur for users-collection
- Firebase Security Rules-implementering
- Middleware-logikk for auth-guard og admin-sjekk
- Skip-link plassering og styling
- Fokus-indikator styling (synlig, WCAG-kompatibel)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prosjektdokumenter
- `.planning/PROJECT.md` — Prosjektbeskrivelse, core value, constraints og key decisions
- `.planning/REQUIREMENTS.md` — FOUND-01 til FOUND-07 og WCAG-01 til WCAG-06 krav

### Research
- `.planning/research/STACK.md` — Tech stack-beslutninger: Next.js 16, Tailwind v4, Firebase, jose-auth-monsteret
- `.planning/research/ARCHITECTURE.md` — Rutestruktur, Firestore collections, auth-arkitektur
- `.planning/research/PITFALLS.md` — Firebase Auth SSR-gotchas, middleware-begrensninger, Tailwind v4 setup-endringer

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Ingen — greenfield-prosjekt, ingenting eksisterer enna

### Established Patterns
- Ingen — dette er forste fase, monstre etableres her

### Integration Points
- Firebase-prosjekt ma opprettes og konfigureres
- Vercel-deploy ma settes opp
- Google Fonts (Merriweather + Inter) lastes via next/font

</code_context>

<specifics>
## Specific Ideas

- Brukeren nevnte spesifikt Merriweather og Inter som fonter (ikke fra alternativlisten)
- Fargepaletten skal gi en folelse av norsk skog og host — autentisk og jordnaer
- Layout skal vaere "kompakt og effektiv" — prioriter informasjonstetthet over luftig design
- Mega-meny antyder at navigasjonen ma vaere innholdsrik selv om kategoritreet er relativt enkelt (Produkter → drikke/kaffe/te/naturprodukter, Opplevelser → retreater/kurs/matopplevelser, Blogg, Om oss)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-fundament*
*Context gathered: 2026-03-30*
