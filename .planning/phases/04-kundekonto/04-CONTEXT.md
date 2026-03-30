# Phase 4: Kundekonto - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Bygg kundedashboard pa /konto med ordrehistorikk, bookinghistorikk og profilredigering. Kun read-side av data fra Phase 3 + profilmutasjoner. Ingen ny betalingslogikk eller admin-funksjonalitet.

</domain>

<decisions>
## Implementation Decisions

### Dashboard-layout
- **D-01:** Fane-navigasjon overst: Oversikt | Ordrer | Bookinger | Profil — lettere og mobilvennlig
- **D-02:** Oversiktssiden viser siste aktivitet: siste 3 ordrer + siste 3 bookinger + profil-sammendrag
- **D-03:** Rutestruktur: /konto (oversikt), /konto/ordrer, /konto/bookinger, /konto/profil

### Ordrehistorikk
- **D-04:** Ordrer vises som kort-liste — ordrekort med dato, total, status — klikk for detaljer
- **D-05:** Ordredetalj viser alle varer, leveringsadresse, betalingsstatus og fraktstatus

### Bookinghistorikk
- **D-06:** Bookinger delt i to seksjoner: "Kommende" overst, "Tidligere" under
- **D-07:** Hver booking viser opplevelsesnavn, dato, bekreftelseskode og status
- **D-08:** Kommende bookinger inkluderer "hva du ma ta med"-info

### Profilredigering
- **D-09:** Kunden kan redigere fullt navn og leveringsadresse — e-post er last (Firebase Auth)
- **D-10:** Kunden kan endre passord fra profilen (passordendring-skjema)
- **D-11:** Passordendring krever gammelt passord for verifisering

### Claude's Discretion
- Fane-komponent design og aktiv-indikator
- Ordrekort-komponent layout
- Bookingkort-komponent layout
- Profilskjema validering og feilmeldinger
- Tomtilstand-meldinger for nye kontoer uten ordrer/bookinger

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prosjektdokumenter
- `.planning/REQUIREMENTS.md` — CUST-01 til CUST-04

### Prior phase context
- `.planning/phases/01-fundament/01-CONTEXT.md` — Auth-flyt, layout
- `.planning/phases/03-betaling-og-booking/03-CONTEXT.md` — Ordre/booking datamodell

### Eksisterende kode
- `src/types/index.ts` — Order, Booking, User typer
- `src/lib/data/orders.ts` — Ordredata-funksjoner
- `src/lib/data/bookings.ts` — Bookingdata-funksjoner
- `src/lib/dal.ts` — Data Access Layer med verifySession
- `src/lib/session.ts` — Session management
- `src/middleware.ts` — /konto rutebeskyttelse
- `src/components/ui/Button.tsx` — UI primitiver
- `src/components/ui/Input.tsx` — Input med label og error
- `src/lib/firebase/auth.ts` — updatePassword funksjon
- `src/lib/firebase/admin.ts` — Admin SDK for profiloppdatering

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getOrdersByUser()` og `getBookingsByUser()` — allerede i data layer fra Phase 3
- `OrderStatusBadge` fra admin — kan gjenbrukes i kundevisning
- `Button`, `Input`, `FormError` — UI primitiver
- `verifySession()` fra DAL — for a beskytte /konto-ruter
- `updatePassword` fra firebase/auth.ts — for passordendring

### Established Patterns
- Server Components for datalasting
- Server Actions for mutasjoner
- unstable_cache med revalidateTag

### Integration Points
- Header profil-ikon → lenke til /konto
- Middleware beskytter /konto/* (allerede implementert)
- Firestore users collection → profildata
- Firestore orders/bookings → brukerfiltrert data

</code_context>

<specifics>
## Specific Ideas

- Fane-navigasjon (ikke sidebar) — lettere og mer mobilvennlig enn admin-dashboardet
- Kort-liste for ordrer — visuelt og klikkbart
- To seksjoner for bookinger — tydelig skille mellom kommende og tidligere
- Passordendring i profilen — brukeren slipper a ga gjennom "glemt passord"-flyten

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-kundekonto*
*Context gathered: 2026-03-30*
