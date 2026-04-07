# Roadmap: Roots & Culture

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6 (shipped 2026-04-07) | [Archive](milestones/v1.0-ROADMAP.md)
- 🔄 **v1.1 Polish & Production Readiness** — Phases 7-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) — SHIPPED 2026-04-07</summary>

- [x] Phase 1: Fundament (5/5 plans) — completed 2026-03-30
- [x] Phase 2: Butikkvindu og Admin (2/2 plans) — completed 2026-03-30
- [x] Phase 3: Betaling og Booking (2/2 plans) — completed 2026-03-30
- [x] Phase 4: Kundekonto (1/1 plan) — completed 2026-03-31
- [x] Phase 5: Checkout-bekreftelse wiring (1/1 plan) — completed 2026-04-07
- [x] Phase 6: Admin QA og feilsider (2/2 plans) — completed 2026-04-07

</details>

### v1.1 Polish & Production Readiness

- [ ] **Phase 7: CMS-fikser og Admin CRUD** — Full CMS-funksjonalitet og verifisert admin-panel
- [ ] **Phase 8: E-commerce, Stripe og Booking-flyter** — Alle kjops- og bookingflyter verifisert ende-til-ende
- [ ] **Phase 9: Typografi og UI-polish** — Designsystem-konsistens og komponentkvalitet pa alle sider
- [ ] **Phase 10: Gavekort, Kundekonto og SEO** — Gavekort-system QA, kundekonto QA og fullstendig SEO

## Phase Details

### Phase 7: CMS-fikser og Admin CRUD
**Goal**: Admin kan redigere alt innhold uten bugs — cache invalideres korrekt, sider kan slettes, og alle admin CRUD-operasjoner fungerer komplett
**Depends on**: Nothing (first v1.1 phase)
**Requirements**: CMS-01, CMS-02, CMS-03, CMS-04, CMS-05, CMS-06, CMS-07, CMS-08, CMS-09, CMS-10, ADMN-09, ADMN-10, ADMN-11, ADMN-12, ADMN-13, ADMN-14
**Success Criteria** (what must be TRUE):
  1. Admin lagrer en seksjon og siden oppdateres umiddelbart uten hard refresh — cache er invalidert
  2. Admin kan slette en side fra listen med slett-knapp og siden forsvinner
  3. Admin kan opprette, redigere og slette produkter, opplevelser og artikler uten feil
  4. Admin-dashboardet viser korrekte tall for produkter, opplevelser, ordrer, bookinger og inntekt
  5. Alle CMS-seksjonstyper (trust-bar, text, text-image, contact-info, gallery) har fungerende admin-editorer
**Plans**: 5 plans
Plans:
- [x] 07-01-PLAN.md — CMS API: revalidateTag i PUT, DELETE-endpoint, TrustBarSection dynamisk, imagePosition type
- [x] 07-02-PLAN.md — Slett-knapp i innhold-listen, 409-feilhåndtering, dashboard-verifisering
- [x] 07-03-PLAN.md — Produkt CRUD: inline VariantsEditor i opprett/rediger-skjema
- [x] 07-04-PLAN.md — Opplevelses-edit med DateSlotsEditor, artikkel-edit med Tiptap, ordrer/bookinger verifisert
- [x] 07-05-PLAN.md — CMS seksjoneditor fikser: trust-bar items, text body, imagePosition, contact-info href, gallery heading, Vis side, ContentBlockEditor slettet
**UI hint**: yes

### Phase 8: E-commerce, Stripe og Booking-flyter
**Goal**: Kunder kan gjennomfore kjop og bookinger fra start til slutt uten feil — ordre og bookinger opprettes korrekt i Firestore og bekreftelsespost sendes
**Depends on**: Phase 7
**Requirements**: ECOM-01, ECOM-02, ECOM-03, ECOM-04, ECOM-05, ECOM-06, ECOM-07, ECOM-08, STRIPE-01, STRIPE-02, STRIPE-03, BOOK-09, BOOK-10, BOOK-11, BOOK-12
**Success Criteria** (what must be TRUE):
  1. Kunde kan legge produkt og opplevelse i handlekurven, gjennomsore checkout og motta bekreftelsespost
  2. Handlekurven overlever sidenavigasjon og nettleserrefresh
  3. Opplevelsessiden viser sanntids plasser og blokkerer booking nar alle plasser er fylt
  4. Gjestekjop og innlogget kjop oppretter ordre korrekt i Firestore med riktig bruker-tilknytning
  5. Bekreftelseskode for booking vises bade pa siden og i bekreftelsesposten
**Plans**: 2 plans
Plans:
- [ ] 08-01-PLAN.md — Fix PaymentIntent metadata bug (placeholder email) + logged-in user email pre-fill
- [ ] 08-02-PLAN.md — Harden ConfirmationModal + cart redirect race fix + end-to-end human verification

### Phase 9: Typografi og UI-polish
**Goal**: Alle sider bruker designsystemets tokens konsekvent og alle komponenter fungerer korrekt pa alle skarmstorlelser med riktige interaksjonstilstander
**Depends on**: Phase 7
**Requirements**: TYPO-01, TYPO-02, TYPO-03, TYPO-04, TYPO-05, UIPOL-01, UIPOL-02, UIPOL-03, UIPOL-04, UIPOL-05, UIPOL-06, UIPOL-07
**Success Criteria** (what must be TRUE):
  1. Alle headings, body-tekst og labels pa alle sider bruker CSS-variablene — ingen hardkodede storelsesverdier eller hex-farger
  2. Alle sider er fullt responsive fra 375px mobil til desktop uten layout-brudd
  3. Sider med data-lasting viser skeleton eller spinner — ingen blank skjerm
  4. CartDrawer apner og lukker korrekt, viser riktig totalsum og navigerer til kassen
  5. Alle interaktive elementer (knapper, lenker, kort) har tydelige hover- og active-states
**Plans**: TBD
**UI hint**: yes

### Phase 10: Gavekort, Kundekonto og SEO
**Goal**: Gavekort kan kjopes og loses inn korrekt, kundekontoen viser fullstendig historikk, og alle offentlige sider har komplett SEO-metadata
**Depends on**: Phase 8, Phase 9
**Requirements**: GAVE-01, GAVE-02, GAVE-03, GAVE-04, KONTO-01, KONTO-02, KONTO-03, KONTO-04, SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. Kunde kan kjope gavekort og lose det inn i checkout — saldo reduseres korrekt
  2. Kundekonto viser siste ordrer, bookinger med bekreftelseskode, og tillater profil- og passordendring
  3. Alle offentlige sider har norsk title, meta description og Open Graph-metadata
  4. Sitemap inkluderer alle offentlige sider, produkter, opplevelser og artikler
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Fundament | v1.0 | 5/5 | Complete | 2026-03-30 |
| 2. Butikkvindu og Admin | v1.0 | 2/2 | Complete | 2026-03-30 |
| 3. Betaling og Booking | v1.0 | 2/2 | Complete | 2026-03-30 |
| 4. Kundekonto | v1.0 | 1/1 | Complete | 2026-03-31 |
| 5. Checkout-bekreftelse wiring | v1.0 | 1/1 | Complete | 2026-04-07 |
| 6. Admin QA og feilsider | v1.0 | 2/2 | Complete | 2026-04-07 |
| 7. CMS-fikser og Admin CRUD | v1.1 | 0/5 | Not started | - |
| 8. E-commerce, Stripe og Booking-flyter | v1.1 | 0/2 | Not started | - |
| 9. Typografi og UI-polish | v1.1 | 0/? | Not started | - |
| 10. Gavekort, Kundekonto og SEO | v1.1 | 0/? | Not started | - |
