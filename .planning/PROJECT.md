# Roots & Culture

## What This Is

Roots & Culture er en norsk nettbutikk som selger naturopplevelser og autentiske produkter knyttet til norsk kulturarv og natur. Kundene kan kjope fysiske produkter (drikke, kaffe/te, naturprodukter), booke opplevelser (naturretreater, kurs, matopplevelser), og lese bloggartikler om natur, kultur og tradisjoner. Alt er pa norsk, med Stripe-betaling og stotte for bade gjestekjop og brukerkonto. Gavekort kan kjopes og loses inn i checkout.

## Core Value

Kunder kan enkelt oppdage, kjope og booke autentiske norske natur- og kulturopplevelser i en informativ og tilgjengelig nettbutikk.

## Current State

**Shipped:** v1.1 Polish & Production Readiness (2026-04-08)
**Codebase:** ~20,000 LOC TypeScript, 200+ source files
**Stack:** Next.js 16.2.1, Firebase 12.x, Stripe, Vercel
**Timeline:** v1.0 2026-03-30 → 2026-04-07 | v1.1 2026-04-07 → 2026-04-08

## Requirements

### Validated

- ✓ Produktkatalog med kategorier (drikke, kaffe/te, naturprodukter) — v1.0
- ✓ Handlekurv og checkout med Stripe-betaling — v1.0
- ✓ Gjestekjop og konto-kjop — v1.0
- ✓ Bookingsystem for opplevelser med faste datoer og begrenset antall plasser — v1.0
- ✓ Blogg med artikler om natur, kultur og tradisjoner — v1.0
- ✓ Admin CMS for innhold, produkter, opplevelser og artikler — v1.0
- ✓ Kundeprofil-dashboard med ordrehistorikk og bookinger — v1.0
- ✓ Brukerautentisering (registrering, innlogging, passord-reset) — v1.0
- ✓ Universalutforming (WCAG 2.1 AA) — v1.0
- ✓ Norsk sprak gjennomgaende — v1.0
- ✓ Responsivt design (mobil, nettbrett, desktop) — v1.0
- ✓ SEO-optimalisert med SSR/SSG — v1.0

- ✓ CMS cache-invalidering, DELETE-endpoint, seksjonsforbedringer — v1.1
- ✓ Admin CRUD komplett med produktvarianter — v1.1
- ✓ PaymentIntent metadata bug fikset — v1.1
- ✓ Typografi og designsystem-konsistens — v1.1
- ✓ Loading skeletons, empty states, error toasts — v1.1
- ✓ SEO komplett med JSON-LD for alle innholdstyper — v1.1
- ✓ Premium UI: sticky header, scroll reveal, hero animasjon, card elevation — v1.1

### Active

(Fresh for next milestone)

### Out of Scope

- Flerspraklig stotte — norsk kun
- Mobilapp — web-first, vurderes i v2
- Abonnements-/medlemsmodell — ikke aktuelt
- Digitale produkter/nedlastinger — kun fysiske varer
- Live chat/kundesupport-widget — kontaktskjema er tilstrekkelig
- Foresporselsbasert booking — kun faste datoer med plasser

## Context

- **Domene**: Norsk natur og kulturarv — autentisk, jordnaert, tradisjonelt
- **Malgruppe**: Nordmenn som er interessert i natur, tradisjoner og baerekraftige produkter
- **Design-retning**: Morkgronn + hostfarger (ikke gul). Informativt, oversiktlig, tilgjengelig
- **Admin**: Dashboard for innholdsredigering, produkthandtering, opplevelsesoppretting og ordrebehandling (/admin-ruter, rollebasert tilgang)
- **Booking-modell**: Admin oppretter opplevelser med fast dato og maks antall plasser. Kunder velger dato og booker. Plasser reduseres atomisk
- **Produkter**: Fysiske varer som sendes med post
- **CMS**: Sider med seksjoner (hero, text, text-image, gallery, contact-info, trust-bar, auto-fetch grids)
- **Gavekort**: Kjop og innlosning i checkout

## Constraints

- **Tech stack**: Next.js (App Router) + Firebase (Firestore, Auth, Storage) + Stripe + Vercel
- **Hosting**: Vercel — optimalisert for Next.js, edge network
- **Betaling**: Stripe — checkout, produkter og bookinger
- **Sprak**: Norsk — all UI, innhold og feilmeldinger pa norsk
- **Tilgjengelighet**: WCAG 2.1 AA — universalutforming er lovpalagt i Norge
- **Ytelse**: Lettvektig, SSR for raskt innhold, minimal JavaScript pa klienten
- **Design**: Morkgronn + hostfarger (rustrod, brent oransje, varm brun). Ingen gul

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | SSR/SSG, lettvektig, Vercel-optimalisert | ✓ Good |
| Firebase som backend | Auth, Firestore, Storage — alt-i-ett | ✓ Good |
| Admin i same app (/admin) | Delt kodebase, enklere vedlikehold | ✓ Good |
| Stripe for betaling | Norsk stotte, produkter + bookinger i ett | ✓ Good |
| Faste datoer for booking | Enklere system, admin styrer tilgjengelighet | ✓ Good |
| jose for sessions | Edge Runtime-kompatibel, HttpOnly cookies | ✓ Good |
| Tailwind v4 CSS-native | Ingen tailwind.config.js, @theme tokens | ✓ Good |
| Firebase Storage for uploads | Erstatter lokal fs (broke pa Vercel) | ✓ Good (Phase 6 fix) |
| Cart via Context + localStorage | Ikke Zustand/Redux, enklere for v1 | ✓ Good |
| PaymentIntent-basert checkout | Stripe Elements inline, webhook fulfillment | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after v1.0 milestone*
