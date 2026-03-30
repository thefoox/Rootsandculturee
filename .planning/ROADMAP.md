# Roadmap: Roots & Culture

## Overview

Fire opp en norsk nettbutikk for natur- og kulturopplevelser i fire faser: Legg fundamentet med auth og design-system, bygg det offentlige butikkvinduet med admin-CMS, implementer betalingsflytene for bade produkter og bookinger, og fullfdr med kundeprofil-dashboardet. Resultatet er en komplett, WCAG-godkjent norsk e-handelsplattform.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Fundament** - Next.js-prosjekt, Firebase-oppsett, auth-system og design-system med innebygd WCAG-tilgjengelighet
- [ ] **Phase 2: Butikkvindu og Admin** - Offentlig produktkatalog, blogg, opplevelseslister og fullt admin-CMS
- [ ] **Phase 3: Betaling og Booking** - Handlekurv, Stripe-checkout for produkter, fullstendig bookingsystem med atomisk plassreservering
- [ ] **Phase 4: Kundekonto** - Kundedashboard med ordrehistorikk, bookinghistorikk og profilinnstillinger

## Phase Details

### Phase 1: Fundament
**Goal**: Utviklere kan bygge funksjonalitet pa en solid base — auth, datalag og tilgjengelig design-system er pa plass og korrekte fra dag en
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, WCAG-01, WCAG-02, WCAG-03, WCAG-05, WCAG-06
**Success Criteria** (what must be TRUE):
  1. En bruker kan registrere seg, logge inn, logge ut og tilbakestille passord via e-post
  2. En innlogget bruker med admin-rettigheter nar /admin, mens en vanlig bruker og gjest omdirigeres
  3. Alle farger i design-systemet oppfyller WCAG 2.1 AA kontrastkrav (minimum 4.5:1 for tekst)
  4. Hele grensesnittet er navigerbart med tastatur — fokus-indikator er synlig pa alle interaktive elementer og en skip-link til hovedinnhold finnes
  5. Siden er responsiv og brukbar pa 375px mobilskjerm, nettbrett og desktop
**Plans:** 5 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffold, Firebase SDK setup, Firestore security rules
- [ ] 01-02-PLAN.md — Design system tokens, fonts, UI primitives (Button, Input, FormError)
- [ ] 01-03-PLAN.md — Layout shell (SkipLink, Header, MegaMenu, MobileNav, Footer)
- [ ] 01-04-PLAN.md — Auth backend (Firebase Auth, jose sessions, middleware, DAL)
- [ ] 01-05-PLAN.md — Auth UI (AuthModal, login/register/reset forms, Header integration)

**UI hint**: yes

### Phase 2: Butikkvindu og Admin
**Goal**: Kunder kan bla gjennom produkter, opplevelser og bloggartikler — og admin kan opprette og redigere alt innholdet
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-07, ADMN-08, BOOK-01, BOOK-02, BOOK-07, WCAG-04
**Success Criteria** (what must be TRUE):
  1. En kunde kan se produktkatalog med kategorier, klikke inn pa et produkt og se bilder, beskrivelse og pris
  2. En kunde kan se en liste over tilgjengelige opplevelser med datoer, plasser igjen, pris og vanskelighetsgrad
  3. En kunde kan lese en bloggartikkel og finne siden via Google (SSR/SSG, SEO-metadata, sitemap og robots.txt er pa plass)
  4. En admin kan opprette, redigere og slette produkter, opplevelser, artikler og generelt innhold via /admin-grensesnittet
  5. Alle bilder i admin har et patapt alt-tekst-felt — siden kan ikke publiseres uten det
**Plans**: TBD
**UI hint**: yes

### Phase 3: Betaling og Booking
**Goal**: Kunder kan kjope produkter og booke opplevelser med Stripe-betaling — plasser reserveres atomisk og ordre bekreftes via e-post
**Depends on**: Phase 2
**Requirements**: PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, BOOK-03, BOOK-04, BOOK-05, BOOK-06, BOOK-08, ADMN-05, ADMN-06
**Success Criteria** (what must be TRUE):
  1. En gjestekunde kan legge varer i handlekurven, fulldfre Stripe-checkout og motta ordrebekreftelse pa side og via e-post — handlekurven overlever sidenavigasjon og refresh
  2. En innlogget kunde kan gjfre det samme, og ordren knyttes til kontoen
  3. En kunde kan velge dato for en opplevelse, se gjenstaende plasser i sanntid og fulldfre booking — plasser reduseres atomisk og kunden mottar bekreftelseskode
  4. Nar alle plasser er fylt blokkeres booking og kunden ser en tydelig melding
  5. Admin kan se alle ordrer og bookinger og oppdatere statusen pa dem
**Plans**: TBD
**UI hint**: yes

### Phase 4: Kundekonto
**Goal**: Innloggede kunder kan se sin ordrehistorikk, bookinghistorikk og redigere profilinformasjonen sin
**Depends on**: Phase 3
**Requirements**: CUST-01, CUST-02, CUST-03, CUST-04
**Success Criteria** (what must be TRUE):
  1. En innlogget kunde kan navigere til /konto og se en oversikt med sine siste ordrer og bookinger
  2. Kunden kan klikke inn pa en ordre og se status (bekreftet, sendt, levert)
  3. Kunden kan se kommende og tidligere bookinger med detaljer og bekreftelseskode
  4. Kunden kan oppdatere navn, e-post og adresse fra profilsiden
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundament | 0/5 | Planned | - |
| 2. Butikkvindu og Admin | 0/? | Not started | - |
| 3. Betaling og Booking | 0/? | Not started | - |
| 4. Kundekonto | 0/? | Not started | - |
