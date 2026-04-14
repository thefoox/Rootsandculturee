# Roadmap: Roots & Culture

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6 (shipped 2026-04-07) | [Archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Polish & Production Readiness** — Phases 7-11 (shipped 2026-04-08) | [Archive](milestones/v1.1-ROADMAP.md)

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

<details>
<summary>✅ v1.1 Polish & Production Readiness (Phases 7-11) — SHIPPED 2026-04-08</summary>

- [x] Phase 7: CMS-fikser og Admin CRUD (5/5 plans) — completed 2026-04-07
- [x] Phase 8: E-commerce, Stripe og Booking-flyter (2/2 plans) — completed 2026-04-07
- [x] Phase 9: Typografi og UI-polish (4/4 plans) — completed 2026-04-07
- [x] Phase 10: Gavekort, Kundekonto og SEO (2/2 plans) — completed 2026-04-07
- [x] Phase 11: UI-kvalitet og premium design (6/6 plans) — completed 2026-04-08

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-6 | v1.0 | 13/13 | Complete | 2026-04-07 |
| 7-11 | v1.1 | 19/19 | Complete | 2026-04-08 |

### Phase 12: Fullstendig QA

**Goal**: Ga gjennom hele nettsiden og verifiser at alt fungerer korrekt etter layout-endringene — alle sider, alle flyter, alle komponenter
**Requirements**: QA-01, QA-02, QA-03, QA-04, QA-05, QA-06, QA-07
**Depends on**: Phase 11
**Plans:** 2/3 plans complete

Plans:
- [x] 12-01-PLAN.md — Fix --color-rust token, CategoryTabs sticky offset, experience sidebar sticky offset
- [x] 12-02-PLAN.md — Fix HeroImage header overlap, add FilterableExperienceGrid empty state, remove DynamicPage dead code
- [ ] 12-03-PLAN.md — Human verification checkpoint

### Phase 13: Prodklar opprydding

**Goal**: Fiks alle 20 bekymringer fra codebase-scan — sikkerhet, autentisering, XSS-sanitisering, security headers, booking-bug, gavekort-e-post, error monitoring, og lav-prioritet polish
**Requirements**: SEC-01 through SEC-20
**Depends on**: Phase 12
**Plans:** 3/3 plans complete

Plans:
- [x] 13-01-PLAN.md — Security: delete credentials file, auth-gate CMS write endpoints, HTTP security headers, XSS sanitization
- [x] 13-02-PLAN.md — Data integrity: gift card field mapping, booking seat preserve, isEarlybird metadata, revalidateTag cleanup, cached getOrders
- [x] 13-03-PLAN.md — Polish: error/loading pages, Stripe API pin, RESEND env validation, stats query cap, placeholder content, mock data guard

### Phase 14: Komplett revisjon

**Goal**: Fiks alle avdekkede feil fra komplett revisjon — kritiske betalingsfeil (gavekort + variant-lager), Google-innlogging, og gjor om-oss/kontakt/forside til fullt CMS-styrte sider
**Requirements**: REV-01 (CMS dynamiske seksjoner), REV-02 (Kritiske betalingsfeil), REV-03 (Google-innlogging), REV-04 (Dataintegritet og opprydding)
**Depends on**: Phase 13
**Plans:** 3/3 plans complete

Plans:
- [x] 14-01-PLAN.md — Critical: gift card PI amount fix, variant stock decrement, Google login CSP, session module safety
- [x] 14-02-PLAN.md — CMS: convert om-oss, kontakt, forside to fully dynamic SectionRenderer pages + fix imagePosition
- [x] 14-03-PLAN.md — Integrity: refund seat restore, dead code cleanup, middleware, Stripe API version

### Phase 15: Redesign hovedsider

**Goal**: Bygg om forside, kontakt og om-oss med nye layouts fra HTML-prototyper — fullscreen hero, filtrerbare opplevelseskort, overlappende story-layout, kontaktkort, FAQ-grid. Alle seksjoner CMS-styrte via SectionRenderer med oppdaterte section-komponenter.
**Requirements**: RD-01 (Forside redesign), RD-02 (Kontakt redesign), RD-03 (Om-oss redesign)
**Depends on**: Phase 14
**Plans:** 3/3 plans complete

Plans:
- [x] 15-01-PLAN.md — Oppgrader section-komponenter: HeroSection (fullscreen bunn-tekst + compact variant), TrustBarSection (dark inline), ExperiencesGridSection (filter-tabs + detaljkort), FaqSection (2-kolonne kort), ContactInfoSection (overlappende kort), TeamSection (foto-strip), ny LocationSection
- [x] 15-02-PLAN.md — Bygg om forside (page.tsx) med forside-v4 layout: fullscreen hero, dark trust bar, kategori-kort, filter-opplevelser, produkter 4-grid, testimonials, blogg, nyhetsbrev
- [x] 15-03-PLAN.md — Bygg om kontakt og om-oss: kontakt-v2 (compact hero + overlappende kort + skjema + FAQ-grid + lokasjon) og om-oss (centered hero + overlappende story + verdier + team + lokasjon dark + CTA)

### Phase 16: Admin Dashboard Redesign

**Goal**: Redesign admin-panelet med hvitt sidepanel, mulighet til a lukke/apne sidepanelet, og forbedret navigasjon — behold alle eksisterende menylenker og seksjoner, bytt fra mork bakgrunn til hvit, legg til lucide-react ikoner og collapsed-modus
**Requirements**: ADR-01 (White sidebar), ADR-02 (Lucide icons), ADR-03 (Collapsible sidebar), ADR-04 (Mobile top bar white), ADR-05 (WCAG 2.1 AA), ADR-06 (Motion-safe transitions)
**Depends on**: Phase 15
**Plans:** 2/2 plans complete

Plans:
- [x] 16-01-PLAN.md — White admin navigation with lucide icons: retheme sidebar and top bar from dark green to white, add lucide-react icons to all nav items and footer actions
- [x] 16-02-PLAN.md — Collapsible sidebar: add collapsed state management, toggle button, icon-only mode with tooltips, width transition with motion-safe guard

### Phase 17: Checkout Redesign + Header Floating Pill

**Goal**: Implementer godkjent checkout-prototype (3-stegs ikon-indikator, bottom-border inputs, delt navn, produktbilder i sammendrag, gavekort i sidebar, mobil bottom sheet) og legg til floating pill header med bruker-initialer avatar.
**Requirements**: UI-SPEC (visual design contract)
**Depends on**: Phase 16
**Plans:** 3/3 plans complete

Plans:
- [x] 17-01-PLAN.md — Input underline variant + CheckoutForm redesign: 3-step icon indicator, split Fornavn/Etternavn, bottom-border inputs, section descriptions, recap card, premium CTA
- [x] 17-02-PLAN.md — OrderSummaryPanel white card with product images, earlybird tags, legal text + GiftCardInput collapsible sidebar disclosure
- [x] 17-03-PLAN.md — Checkout page grid layout (1120px, 1fr+380px), GiftCardInput in sidebar, mobile bottom sheet with peek bar + Header floating pill + user initials avatar

### Phase 20: CMS Futureproofing

**Goal**: Gjor CMS-editoren skuddsikker med profesjonell UX — sikkerhet mot datatap (isDirty + beforeunload + navigasjonsvarsling), forbedret seksjonshaandtering (dupliser, gruppert typeveljer, kollapser/utvid alle), autosave, elementsortering, og versjonshistorikk med mulighet for gjenoppretting
**Requirements**: CMS-FP-01 through CMS-FP-17
**Depends on**: Phase 19
**Plans:** 3/3 plans complete

Plans:
- [x] 20-01-PLAN.md — Safety and validation: isDirty tracking, beforeunload guard, navigation intercept dialog, DeleteConfirmDialog for sections, multi-open sections with collapse/expand, required field asterisks, save validation warnings, PublishBar integration
- [x] 20-02-PLAN.md — UX and productivity: duplicate section button, grouped SectionTypePicker modal with icons and descriptions, autosave with 30s debounce, item reorder up/down buttons, character counts on heading/subheading
- [x] 20-03-PLAN.md — Version history: Firestore versions subcollection API (create/list/revert/prune), VersionHistoryPanel component, automatic version creation on save, Firestore security rule for subcollection

### Phase 21: Admin Robusthet

**Goal**: Fiks alle kritiske og viktige admin-robusthetsproblemer funnet i revisjon — beforeunload pa alle skjemaer, try/catch pa alle slette-handlinger, valideringsfeil-fikser, loading-skjeletter, og feilhandtering for edge cases
**Requirements**: AR-01 through AR-08
**Depends on**: Phase 20
**Plans:** 3/3 plans complete

Plans:
- [x] 21-01-PLAN.md — Beforeunload guard on all 6 create/edit pages + try/catch on all 3 delete actions + article edit error toast
- [x] 21-02-PLAN.md — Validation fixes: ImageUpload alt-text bug, DateSlotsEditor date constraints, TipTap character count + paste sanitization, gift card deactivation confirmation
- [x] 21-03-PLAN.md — Loading skeletons on 3 admin list pages + order detail timeout/error state

### Phase 22: E-commerce Robusthet + Tilbudspris

**Goal**: Fiks kritiske e-commerce problemer (checkout-frys, webhook-feil, stock race condition, manglende timeout) og legg til tilbudspris-funksjonalitet for produkter og opplevelser
**Requirements**: EC-01, EC-02, EC-03, EC-04, EC-05, EC-06, EC-07
**Depends on**: Phase 21
**Plans:** 3/3 plans complete

Plans:
- [x] 22-01-PLAN.md — Checkout robustness: ConfirmationModal escape/timeout, confirmPayment 30s timeout, 3DS redirect error fix
- [x] 22-02-PLAN.md — Webhook/stock safety: idempotency for processing status, stock guard in transaction, gift card zero-amount idempotency
- [x] 22-03-PLAN.md — Tilbudspris: salePrice on types/schemas/mappers/actions/admin forms/cards/checkout verification
