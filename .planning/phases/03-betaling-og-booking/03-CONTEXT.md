# Phase 3: Betaling og Booking - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementer handlekurv, Stripe-checkout (Elements) for produkter, fullstendig bookingsystem med atomisk plassreservering via Firestore transactions, og ordrebekreftelse via e-post (Resend). Bade gjestekjop og konto-kjop. Admin kan se og handtere ordrer og bookinger.

</domain>

<decisions>
## Implementation Decisions

### Handlekurv
- **D-01:** Handlekurven lagres i localStorage — overlever refresh, ingen auth krevd for gjester
- **D-02:** Mixed cart — kunder kan ha bade produkter og opplevelser i same kurv
- **D-03:** Handlekurven vises som bade side-drawer (kjapt overblikk) OG full side /handlekurv
- **D-04:** Kunder kan endre antall med +/- knapper direkte i kurven
- **D-05:** Handlekurv-ikonet i header viser antall som rodt badge-tall

### Checkout-flyt
- **D-06:** Stripe Elements brukes — innebygd betalingsskjema pa nettsiden, ikke redirect til Stripe
- **D-07:** Flat rate frakt — en fast pris uansett (admin-konfigurerbar)
- **D-08:** Bekreftelse etter betaling vises som modal/overlay over gjeldende side
- **D-09:** Bade gjestekjop og konto-kjop stottesmed Stripe — gjester oppgir leveringsadresse i checkout

### Booking-flyt
- **D-10:** Datovelger for opplevelser: datokort i rad som kan klikkes — visuelt og tydelig
- **D-11:** Bookinger legges i handlekurven (mixed cart) — ikke direkte checkout
- **D-12:** Atomisk plassreservering via Firestore runTransaction — obligatorisk, ikke valgfritt
- **D-13:** Unik bekreftelseskode genereres ved betaling (Stripe webhook)
- **D-14:** "Hva du ma ta med"-sjekkliste inkluderes i bookingbekreftelse (side + e-post)
- **D-15:** Kapasitetssperring — booking blokkeres nar alle plasser er fylt, kunden ser tydelig melding
- **D-16:** Kansellering: kunden ma kontakte admin — ingen selvbetjent kansellering i v1

### E-post (Resend)
- **D-17:** Resend brukes som e-postleverandor — 2026 docs og integrasjon
- **D-18:** Fire automatiske e-poster: ordrebekreftelse, bookingbekreftelse, mixed bekreftelse, velkomst-e-post
- **D-19:** Enkel tekst-design pa e-poster — ingen HTML-styling, ren og rask
- **D-20:** E-poster trigges fra Stripe webhook (ordre/booking) og registrerings-Server Action (velkomst)

### Admin ordrehandtering
- **D-21:** Admin kan se alle ordrer og oppdatere status (bekreftet, sendt, levert)
- **D-22:** Admin kan se alle bookinger per opplevelse/dato og kansellere

### Claude's Discretion
- Stripe Elements komponent-konfigurasjon og styling
- Cart state management-losning (React Context, Zustand, eller annet)
- Bekreftelseskode-format (UUID, kort alfanumerisk, etc.)
- Webhook endpoint-arkitektur og idempotency-handtering
- Fraktkostnad-belop (admin-konfigurerbar i Firestore siteContent)
- Resend SDK-integrasjon og e-posttemplater
- Checkout-skjema layout og felt

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prosjektdokumenter
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — PROD-03 til PROD-07, BOOK-03 til BOOK-06, BOOK-08, ADMN-05, ADMN-06

### Research
- `.planning/research/STACK.md` — Stripe Checkout monsteret, webhook-arkitektur, Resend
- `.planning/research/ARCHITECTURE.md` — Firestore collection-design, booking transaction-monster
- `.planning/research/PITFALLS.md` — Stripe webhook idempotency, race conditions, raw body parsing

### Prior phase context
- `.planning/phases/01-fundament/01-CONTEXT.md` — Fargepalett, layout, auth-flyt
- `.planning/phases/02-butikkvindu-og-admin/02-CONTEXT.md` — Produktsider, admin CMS-design

### Eksisterende kode
- `src/types/index.ts` — Product, Experience, ExperienceDate typer
- `src/lib/firebase/client.ts` — Firebase client singleton
- `src/lib/firebase/admin.ts` — Firebase Admin singleton
- `src/lib/firebase/storage.ts` — Firebase Storage upload
- `src/lib/data/products.ts` — Produkt data-funksjoner
- `src/lib/data/experiences.ts` — Opplevelse data-funksjoner
- `src/actions/products.ts` — Produkt Server Actions
- `src/actions/experiences.ts` — Opplevelse Server Actions
- `src/components/layout/Header.tsx` — Header med handlekurv-ikon placeholder
- `src/middleware.ts` — Rutebeskyttelse
- `src/lib/session.ts` — jose session management
- `src/lib/dal.ts` — Data Access Layer

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` (primary/secondary/ghost) — bruk for checkout-knapper og booking-CTA
- `Input` (med label, error, aria-describedby) — bruk i checkout-skjema
- `FormError` (role="alert") — bruk for betalingsfeil
- Header med handlekurv-ikon placeholder — ma oppdateres med badge og drawer-trigger
- Firebase Admin singleton — bruk i webhook og booking-transaksjoner
- Eksisterende produkttyper og data-funksjoner — bruk direkte i handlekurv

### Established Patterns
- Server Actions for mutasjoner
- unstable_cache med revalidateTag for data
- Firestore Admin for server-side operasjoner
- Modal-monster (AuthModal) — gjenbruk for bekreftelsesmodal og drawer

### Integration Points
- Header handlekurv-ikon → drawer + badge
- Produktsider → "Legg i handlekurv" knapp (na disabled, ma aktiveres)
- Opplevelsessider → datovelger + "Legg i handlekurv"
- Stripe webhook → Firestore ordrer/bookinger + Resend e-poster
- Admin ordresider → Firestore ordrer/bookinger
- revalidateTag for cache-invalidering etter webhook-oppdateringer

</code_context>

<specifics>
## Specific Ideas

- Brukeren valgte Stripe Elements over Stripe Checkout — betalingsskjema pa nettsiden, ikke redirect
- Mixed cart er kritisk — bade produkter og opplevelser i same Stripe PaymentIntent
- Resend er eksplisitt valgt for e-post — bruker 2026 docs og integrasjon
- Bekreftelse som modal/overlay, ikke egen side — konsistent med auth-flyt fra Phase 1
- Datokort-velger for opplevelser — visuelt og klikkbart, ikke dropdown
- Enkel tekst for e-poster — ingen HTML-maler, bare ren tekst

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-betaling-og-booking*
*Context gathered: 2026-03-30*
