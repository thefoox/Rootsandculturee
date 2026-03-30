# Requirements: Roots & Culture

**Defined:** 2026-03-30
**Core Value:** Kunder kan enkelt oppdage, kjope og booke autentiske norske natur- og kulturopplevelser i en informativ og tilgjengelig nettbutikk.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation (FOUND)

- [x] **FOUND-01**: Next.js App Router prosjekt med Tailwind v4, TypeScript og Firebase oppsett
- [ ] **FOUND-02**: Firebase Auth (email/passord) med registrering, innlogging, utlogging og passord-reset
- [ ] **FOUND-03**: Server-side auth via jose-krypterte HttpOnly cookies og middleware-beskyttelse
- [x] **FOUND-04**: Firestore sikkerhetstestede security rules for alle collections
- [ ] **FOUND-05**: Design system med morkgronn + hostfarger (rustrod, brent oransje, varm brun) som oppfyller WCAG 2.1 AA kontrastkrav
- [ ] **FOUND-06**: Responsivt layout-system (mobil-first, 375px+)
- [ ] **FOUND-07**: Norsk sprak gjennomgaende i all UI, feilmeldinger og varsler

### Produkter (PROD)

- [ ] **PROD-01**: Produktkatalog med kategorier (drikke, kaffe/te, naturprodukter)
- [ ] **PROD-02**: Produktdetaljside med bilder, beskrivelse, pris og legg-i-handlekurv
- [ ] **PROD-03**: Handlekurv som overlever sidenavigasjon og refresh
- [ ] **PROD-04**: Fraktkostnad vist for checkout (flat rate eller vektbasert tabell)
- [ ] **PROD-05**: Checkout-flow med Stripe (bade gjest og innlogget bruker)
- [ ] **PROD-06**: Ordrebekreftelse pa side og via e-post etter betaling
- [ ] **PROD-07**: Enkelt lagertall per produkt (manuelt oppdatert av admin)

### Booking (BOOK)

- [ ] **BOOK-01**: Opplevelsesliste med tilgjengelige datoer, plasser igjen og pris
- [ ] **BOOK-02**: Opplevelsesdetaljside med beskrivelse, bilder, hva som er inkludert, sted og kanselleringsvilkar
- [ ] **BOOK-03**: Dato-/sesjonsvelger som viser tilgjengelige datoer med gjenstaende plasser
- [ ] **BOOK-04**: Booking-checkout via Stripe med atomisk plassreservering (Firestore transaction)
- [ ] **BOOK-05**: Bookingbekreftelse med unik bekreftelseskode pa side og via e-post
- [ ] **BOOK-06**: Kapasitetssperring — bookingen blokkeres nar alle plasser er fylt
- [ ] **BOOK-07**: Vanskelighetsgrad-indikator pa opplevelser (lett, moderat, krevende)
- [ ] **BOOK-08**: "Hva du ma ta med"-sjekkliste pa bookingbekreftelse

### Innhold (CONT)

- [ ] **CONT-01**: Bloggoversiktsside med artikler sortert etter publiseringsdato
- [ ] **CONT-02**: Artikkeldetaljside med tittel, brødtekst, bilder og publiseringsdato
- [ ] **CONT-03**: SEO-metadata (tittel, beskrivelse, OG-tags) pa alle sider
- [ ] **CONT-04**: SSR for produkter og opplevelser, SSG/ISR for artikler
- [ ] **CONT-05**: Sitemap og robots.txt

### Admin CMS (ADMN)

- [ ] **ADMN-01**: Admin-ruter (/admin) beskyttet med rollebasert tilgang
- [ ] **ADMN-02**: Produkthandtering — opprett, rediger, slett produkter med bilder, pris, kategori og lagertall
- [ ] **ADMN-03**: Opplevelseshandtering — opprett, rediger, slett opplevelser med datoer, plassgrenser og innhold
- [ ] **ADMN-04**: Artikkelhandtering — opprett, rediger, publiser/avpubliser artikler med rik tekst og bilder
- [ ] **ADMN-05**: Ordrehandtering — vis ordrer, oppdater status (bekreftet, sendt, levert)
- [ ] **ADMN-06**: Bookinghandtering — vis bookinger per opplevelse/dato, kanseller
- [ ] **ADMN-07**: Bildeopplasting til Firebase Storage fra admin-UI
- [ ] **ADMN-08**: Innholdsredigering pa nettsiden (hero-tekst, om oss, etc.)

### Kundeprofil (CUST)

- [ ] **CUST-01**: Kundedashboard (/konto) med oversikt
- [ ] **CUST-02**: Ordrehistorikk med status per ordre
- [ ] **CUST-03**: Bookinghistorikk med kommende og tidligere bookinger
- [ ] **CUST-04**: Profilredigering (navn, e-post, adresse)

### Tilgjengelighet (WCAG)

- [ ] **WCAG-01**: Tastaturnavigasjon pa hele nettsiden med synlig fokus-indikator
- [ ] **WCAG-02**: Tilstrekkelig fargekontrast (minimum 4.5:1) pa all tekst
- [ ] **WCAG-03**: Skjermleser-stotte med semantisk HTML, ARIA-attributter og korrekt overskriftshierarki
- [ ] **WCAG-04**: Alt-tekst pa alle bilder (med patvunget felt i admin CMS)
- [ ] **WCAG-05**: Tilgjengelige skjemafeilmeldinger med aria-describedby
- [ ] **WCAG-06**: Skip-link til hovedinnhold

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Utvidede funksjoner

- **V2-01**: Venteliste for utsolgte opplevelser (e-post-registrering)
- **V2-02**: Oppfolgingse-post etter gjennomfort opplevelse
- **V2-03**: "Om produsenten"-seksjoner pa produkter
- **V2-04**: Sesongbasert kategorisering av opplevelser
- **V2-05**: Rabattkoder / kampanjesystem via Stripe Coupons
- **V2-06**: Avansert lagerstyring med lavt-pa-lager-varsler
- **V2-07**: Nyhetsbrev-paamelding
- **V2-08**: Sok pa tvers av produkter og opplevelser
- **V2-09**: Automatisert fraktintegrasjon (Bring/Posten API)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Flerspraklig stotte | Norsk identitet er kjernen; dobler innholdsvedlikehold |
| Abonnements-/medlemsmodell | Kompleks fakturering, ikke aktuelt for v1-volum |
| Produktvurderinger/-anmeldelser | Krever moderering; ingen kunder a anmelde for enda |
| Onskeliste / lagre til senere | Lav konverteringseffekt for lite produktkatalog |
| Live chat / kundesupport-widget | Tung JS, konstant moderering; kontaktskjema holder |
| Produktvarianter (storrelse/farge) | Naturprodukter og drikke har sjelden varianter |
| Sosial innlogging (Google/Facebook) | Oker angrepsflate; e-post/passord er tilstrekkelig |
| Digitale produkter/nedlastinger | Kun fysiske varer; andre MVA-regler |
| Bruker-generert innhold | Modereringsbyrde; bloggen er redaksjonell |
| Poeng/lojalitetsprogram | Krever stor kundebase for a ha verdi |
| Mobilapp | Web-first; responsivt design dekker mobil |
| Apen kalender-booking (foresporselsbasert) | Admin styrer tilgjengelighet med faste datoer |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| FOUND-07 | Phase 1 | Pending |
| WCAG-01 | Phase 1 | Pending |
| WCAG-02 | Phase 1 | Pending |
| WCAG-03 | Phase 1 | Pending |
| WCAG-05 | Phase 1 | Pending |
| WCAG-06 | Phase 1 | Pending |
| PROD-01 | Phase 2 | Pending |
| PROD-02 | Phase 2 | Pending |
| BOOK-01 | Phase 2 | Pending |
| BOOK-02 | Phase 2 | Pending |
| BOOK-07 | Phase 2 | Pending |
| CONT-01 | Phase 2 | Pending |
| CONT-02 | Phase 2 | Pending |
| CONT-03 | Phase 2 | Pending |
| CONT-04 | Phase 2 | Pending |
| CONT-05 | Phase 2 | Pending |
| ADMN-01 | Phase 2 | Pending |
| ADMN-02 | Phase 2 | Pending |
| ADMN-03 | Phase 2 | Pending |
| ADMN-04 | Phase 2 | Pending |
| ADMN-07 | Phase 2 | Pending |
| ADMN-08 | Phase 2 | Pending |
| WCAG-04 | Phase 2 | Pending |
| PROD-03 | Phase 3 | Pending |
| PROD-04 | Phase 3 | Pending |
| PROD-05 | Phase 3 | Pending |
| PROD-06 | Phase 3 | Pending |
| PROD-07 | Phase 3 | Pending |
| BOOK-03 | Phase 3 | Pending |
| BOOK-04 | Phase 3 | Pending |
| BOOK-05 | Phase 3 | Pending |
| BOOK-06 | Phase 3 | Pending |
| BOOK-08 | Phase 3 | Pending |
| ADMN-05 | Phase 3 | Pending |
| ADMN-06 | Phase 3 | Pending |
| CUST-01 | Phase 4 | Pending |
| CUST-02 | Phase 4 | Pending |
| CUST-03 | Phase 4 | Pending |
| CUST-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 — Traceability updated for coarse 4-phase roadmap*
