# Roots & Culture

## What This Is

Roots & Culture er en norsk nettbutikk som selger naturopplevelser og autentiske produkter knyttet til norsk kulturarv og natur. Kundene kan kjope fysiske produkter (drikke, kaffe/te, naturprodukter), booke opplevelser (naturretreater, kurs, matopplevelser), og lese bloggartikler om natur, kultur og tradisjoner. Alt er pa norsk, med Stripe-betaling og stotte for bade gjestekjop og brukerkonto.

## Core Value

Kunder kan enkelt oppdage, kjope og booke autentiske norske natur- og kulturopplevelser i en informativ og tilgjengelig nettbutikk.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Produktkatalog med kategorier (drikke, kaffe/te, naturprodukter)
- [ ] Handlekurv og checkout med Stripe-betaling
- [ ] Fysisk frakt med fraktkalkulator
- [ ] Gjestekjop og konto-kjop
- [ ] Bookingsystem for opplevelser (naturretreater, kurs, matopplevelser)
- [ ] Faste datoer med begrenset antall plasser for opplevelser
- [ ] Blogg med artikler om natur, kultur og tradisjoner
- [ ] Admin CMS for innhold, produkter, opplevelser og artikler
- [ ] Kundeprofil-dashboard med ordrehistorikk og bookinger
- [ ] Brukerautentisering (registrering, innlogging, passord-reset)
- [ ] Universalutforming (WCAG 2.1 AA)
- [ ] Norsk sprak gjennomgaende
- [ ] Responsivt design (mobil, nettbrett, desktop)
- [ ] SEO-optimalisert med SSR/SSG

### Out of Scope

- Flerspraklig stotte — norsk kun, v1
- Mobilapp — web-first, vurderes i v2
- Abonnements-/medlemsmodell — ikke aktuelt i v1
- Digitale produkter/nedlastinger — kun fysiske varer
- Live chat/kundesupport-widget — kontaktskjema er tilstrekkelig
- Egendefinert fraktintegrasjon (Bring/Posten API) — manuell fraktpris i v1
- Foresporselsbasert booking — kun faste datoer med plasser

## Context

- **Domene**: Norsk natur og kulturarv — autentisk, jordnaert, tradisjonelt
- **Malgruppe**: Nordmenn som er interessert i natur, tradisjoner og baerekraftige produkter
- **Design-retning**: Morkgronn + hostfarger (ikke gul). Informativt, oversiktlig, tilgjengelig. Fokus pa brukeropplevelse og intuitive losninger
- **Admin**: Dashboard for innholdsredigering, produkthandtering, opplevelsesoppretting og ordrebehandling. Implementeres som /admin-ruter i samme Next.js-app med rollebasert tilgang (enklere arkitektur, delt kodebase)
- **Booking-modell**: Admin oppretter opplevelser med fast dato og maks antall plasser. Kunder velger dato og booker. Plasser reduseres automatisk
- **Produkter**: Fysiske varer som sendes med post

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
| Next.js App Router | SSR/SSG, lettvektig, Vercel-optimalisert | — Pending |
| Firebase som backend | Auth, Firestore, Storage — alt-i-ett, rask utvikling | — Pending |
| Admin i same app (/admin) | Delt kodebase, enklere vedlikehold, rollebasert tilgang | — Pending |
| Stripe for betaling | Norsk stotte, produkter + bookinger i ett system | — Pending |
| Faste datoer for booking | Enklere system, admin styrer tilgjengelighet | — Pending |

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
*Last updated: 2026-03-30 after initialization*
