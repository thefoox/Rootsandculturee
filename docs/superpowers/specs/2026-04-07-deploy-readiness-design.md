# Deploy-Readiness: Production Launch Spec

**Dato:** 2026-04-07
**Status:** Godkjent design
**Tilnærming:** Infrastruktur først

## Kontekst

Roots & Culture v1.0 er feature-komplett (42/42 krav fullført), men mangler kritisk infrastruktur for produksjonslansering. Denne spec dekker 7 blokkere som må løses før siten kan gå live med betalende kunder.

## Rekkefølge

| Steg | Item | Kompleksitet | Estimat |
|------|------|-------------|---------|
| 1 | Security headers | Lav | ~1 time |
| 2 | Sentry error logging | Lav-Medium | ~2 timer |
| 3 | Resend e-post oppsett | Lav | ~1 time |
| 4 | Stripe Tax (MVA) | Medium | ~3 timer |
| 5 | Refund-workflow i admin | Medium | ~4 timer |
| 6 | Tester (kritiske flows) | Medium-Høy | ~6 timer |
| 7 | Juridisk gjennomgang | Ekstern | Utkast ~2 timer, jurist TBD |

---

## 1. Security Headers

**Mål:** Beskytte mot clickjacking, MIME-sniffing, og injection-angrep.

**Fil:** `next.config.ts`

**Headers å legge til via `headers()` config:**

| Header | Verdi |
|--------|-------|
| `Content-Security-Policy` | Tilpasset policy — se detaljer under |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

**CSP policy (tillatte domener):**
- `script-src`: `'self'`, `js.stripe.com`, Sentry CDN
- `connect-src`: `'self'`, `*.firebaseio.com`, `*.googleapis.com`, `api.stripe.com`, `*.sentry.io`, `*.resend.com`
- `frame-src`: `js.stripe.com`
- `img-src`: `'self'`, `firebasestorage.googleapis.com`, `data:`, `blob:`
- `style-src`: `'self'`, `'unsafe-inline'` (nødvendig for Tailwind)
- `font-src`: `'self'`
- `default-src`: `'self'`

**Verifisering:** Kjør `curl -I https://rootsculture.no` og sjekk at alle headers er tilstede. Bruk securityheaders.com for scoring.

---

## 2. Sentry Error Logging

**Mål:** Synlighet i produksjonsfeil, performance monitoring, og source maps.

**Pakke:** `@sentry/nextjs`

**Filer å opprette/endre:**
- `sentry.client.config.ts` — klient-side error tracking
- `sentry.server.config.ts` — server-side error tracking
- `sentry.edge.config.ts` — edge runtime tracking
- `next.config.ts` — wrappe med `withSentryConfig()`
- `src/app/global-error.tsx` — Sentry error boundary for app-wide feil

**Konfigurasjon:**
- DSN fra Sentry-prosjekt (env var: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`)
- Source maps: automatisk upload ved build (`hideSourceMaps: true` for produksjon)
- Environment: `production` / `development` basert på `NODE_ENV`
- Sample rate: `tracesSampleRate: 0.1` (10% av transaksjoner for performance)
- `replaysSessionSampleRate: 0` (session replay av for personvern/GDPR)

**Integrasjon med eksisterende kode:**
- Stripe webhook-feil: `Sentry.captureException()` i catch-blokker i `/api/webhooks/stripe`
- Firebase-feil: wrap kritiske Firestore-operasjoner
- Server Actions: feil i ordreopprettelse, bookinger, refunds

**Env vars som trengs:**
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN` (for source map upload ved build)
- `SENTRY_ORG`
- `SENTRY_PROJECT`

**Verifisering:** Trigger en testfeil i dev, sjekk at den dukker opp i Sentry dashboard.

---

## 3. Resend E-post Oppsett

**Mål:** Ordrebekreftelser, bookingbekreftelser og gavekort-e-poster sendes til kunder.

**Eksisterende kode:** `src/lib/email/resend.ts`, `src/lib/email/templates.ts` — allerede implementert.

**Steg:**
1. Opprett Resend-konto og hent API-nøkkel
2. Verifiser domenet `rootsculture.no` i Resend (DNS: SPF, DKIM, DMARC records)
3. Fyll inn env vars:
   - `RESEND_API_KEY=re_xxxxxxxx`
   - `RESEND_FROM_EMAIL=ordre@rootsculture.no` (eller `hei@rootsculture.no`)
   - `RESEND_WEBHOOK_SECRET=whsec_xxxxxxxx`
4. Test alle e-postmaler manuelt:
   - Ordrebekreftelse (produktkjøp)
   - Bookingbekreftelse (opplevelse)
   - Blandet handlekurv (produkter + booking)
   - Gavekort-levering
5. Verifiser at Stripe webhook → e-post-kjeden fungerer end-to-end

**Resend-segmenter og topics (kan vente til v2):**
- `RESEND_SEGMENT_PRODUKTKUNDER`, `RESEND_SEGMENT_OPPLEVELSESKUNDER`, `RESEND_SEGMENT_BLOGGLESERE`
- `RESEND_TOPIC_PRODUKTNYHETER`, `RESEND_TOPIC_OPPLEVELSER`, `RESEND_TOPIC_NYHETSBREV`

**Verifisering:** Gjennomfør testkjøp → motta ordrebekreftelse på e-post.

---

## 4. Stripe Tax (MVA)

**Mål:** Norsk 25% MVA beregnes korrekt og vises til kunder.

**Forutsetning:** Prisene i Firestore er lagret UTEN MVA (nettopris). Stripe Tax legger til MVA automatisk.

**Steg:**
1. **Stripe Dashboard:** Aktiver Stripe Tax, registrer norsk MVA-nummer
2. **Stripe produkter:** Sett `tax_behavior: 'exclusive'` på alle produkter (MVA legges på toppen)
3. **Kode:** Oppdater `src/app/api/create-payment-intent/route.ts`:
   - Bytt fra PaymentIntent til Checkout Session (Stripe Tax krever Checkout Session eller Invoice)
   - Legg til `automatic_tax: { enabled: true }`
   - Inkluder `customer_update: { address: 'auto' }` for lokasjon-basert MVA
4. **Frontend:** Oppdater handlekurv-visning til å vise:
   - Delsum (uten MVA)
   - MVA-beløp (25%)
   - Totalt (inkl. MVA)
5. **E-post:** Oppdater ordrebekreftelse-mal med MVA-linje
6. **Opplevelser/bookinger:** Samme MVA-håndtering for bookinger

**Viktig beslutning:** Hvis prisene i Firestore allerede inkluderer MVA, bruk `tax_behavior: 'inclusive'` i stedet, og Stripe beregner MVA-andelen. Denne beslutningen må tas før implementering.

**Verifisering:** Testkjøp → kvittering viser korrekt MVA-beløp. Sjekk Stripe Dashboard at tax vises.

---

## 5. Refund-workflow i Admin

**Mål:** Admin kan refundere ordrer direkte fra admin-panelet, uten å gå til Stripe Dashboard.

**Filer å endre/opprette:**
- `src/actions/refunds.ts` — fullføre eksisterende fil
- `src/app/admin/ordrer/[id]/page.tsx` — legge til refund-UI
- `src/lib/email/templates.ts` — refund-bekreftelse e-postmal

**Server Action (`refundOrder`):**
```
Input: orderId, amount (optional for delvis refund), reason
1. Hent ordre fra Firestore → valider status (ikke allerede refunded)
2. Hent payment_intent_id fra ordren
3. Stripe: refunds.create({ payment_intent, amount?, reason })
4. Firestore: oppdater ordrestatus til 'refunded' / 'partially_refunded'
5. Firestore: logg refund med beløp, dato, admin-bruker, grunn
6. Resend: send refund-bekreftelse e-post til kunde
7. Sentry: logg feil hvis noe feiler
```

**Admin UI:**
- "Refunder ordre"-knapp på ordredetalj-siden
- Bekreftelsesdialog med:
  - Valg mellom full og delvis refund
  - Beløpsinput for delvis refund (maks = ordrebeløp)
  - Obligatorisk begrunnelse (dropdown: "kundens ønske", "feil produkt", "skadet vare", "annet")
  - Viser hva kunden vil motta tilbake
- Etter refund: ordrestatus oppdateres live, refund-historikk synlig

**Verifisering:** Opprett testordre → refunder fra admin → sjekk at Stripe viser refund, kunde mottar e-post, ordrestatus er oppdatert.

---

## 6. Tester (kritiske flows)

**Mål:** Automatiserte tester for de mest risikable delene av systemet.

**Test-framework:** Vitest + @testing-library/react for komponent-tester.

**Prioriterte test-suites:**

### 6.1 Stripe Webhook (integrasjonstest)
- `payment_intent.succeeded` → ordre opprettes i Firestore
- Idempotency: samme event sendt to ganger → kun én ordre
- Ugyldig signatur → 400 response
- Manglende metadata → feilhåndtering uten krasj

### 6.2 Booking-atomisitet (enhetstest)
- Kapasitet dekrementeres korrekt ved booking
- Booking avvises når kapasitet = 0
- Concurrent bookings håndteres (Firestore transaction)

### 6.3 Cart-logikk (enhetstest)
- Legg til produkt → korrekt totalpris
- Fjern produkt → oppdatert totalpris
- Oppdater antall → pris recalculated
- Gavekort-rabatt applisert korrekt

### 6.4 MVA-beregning (enhetstest)
- 25% MVA beregnes korrekt
- Riktig visning av delsum, MVA, totalt

### 6.5 Refund-flow (integrasjonstest)
- Full refund → status 'refunded'
- Delvis refund → status 'partially_refunded', korrekt beløp
- Dobbel-refund avvises

### 6.6 Auth Middleware (enhetstest)
- Admin-ruter krever admin-rolle
- Utløpt session → redirect til login
- Ugyldig token → 401

**Verifisering:** `npm test` kjører alle tester grønt.

---

## 7. Juridisk Gjennomgang

**Mål:** Vilkår, personvern og bookingvilkår som er juridisk korrekte for norsk lov.

**Dokumenter å oppdatere:**

### 7.1 Kjøpsvilkår (`/vilkar`)
- Angrerettloven (14 dagers angrefrist for fysiske produkter)
- Leveringsvilkår og fraktkostnader
- Reklamasjonsrett (5 år for varige produkter, 2 år ellers)
- Betalingsvilkår (Stripe som betalingsformidler)
- Force majeure
- Verneting (norsk lov)

### 7.2 Personvernerklæring (`/personvern`)
- Behandlingsansvarlig (firmanavn, org.nr, kontaktinfo)
- Kategorier av persondata som samles inn
- Formål og rettslig grunnlag (GDPR art. 6)
- Tredjeparter (Firebase, Stripe, Resend, Sentry, Vercel)
- Oppbevaringsperioder
- Den registrertes rettigheter (innsyn, sletting, portabilitet)
- Databehandleravtaler
- Cookies og sporingsverktøy

### 7.3 Bookingvilkår (ny side eller del av vilkår)
- Avbestillingsvilkår (frist, refund-policy)
- Endring av booking
- Minimumsdeltakere / avlysning fra arrangør
- Ansvar og forsikring

### 7.4 Returpolicy (ny side eller del av vilkår)
- Fysiske produkter: prosess for retur
- Fraktkostnad ved retur
- Tilstand for returvare

**Fremgangsmåte:** Vi skriver førsteutkast basert på standard norske e-handelsmaler (Forbrukertilsynets veiledning). Deretter anbefales gjennomgang av norsk jurist.

**Verifisering:** Alle juridiske sider er publisert og lenket fra footer/checkout.

---

## Avhengigheter mellom stegene

```
1. Security Headers ──┐
2. Sentry ────────────┤──→ 4. Stripe Tax ──→ 5. Refund ──→ 6. Tester
3. Resend ────────────┘                                        ↑
7. Juridisk (parallelt med alt) ───────────────────────────────┘
```

- Steg 1-3 er uavhengige og kan gjøres i hvilken rekkefølge
- Steg 4 (Stripe Tax) bør komme etter Sentry (for feilsporing) og Resend (for oppdaterte e-poster)
- Steg 5 (Refund) avhenger av at Stripe og Resend fungerer
- Steg 6 (Tester) bør komme sist — tester det ferdige systemet
- Steg 7 (Juridisk) kan kjøres parallelt med alt teknisk arbeid

## Env vars som trengs totalt

| Variabel | Kilde |
|----------|-------|
| `RESEND_API_KEY` | resend.com dashboard |
| `RESEND_FROM_EMAIL` | Velg adresse (f.eks. `hei@rootsculture.no`) |
| `RESEND_WEBHOOK_SECRET` | resend.com webhook config |
| `SENTRY_DSN` | sentry.io prosjekt |
| `NEXT_PUBLIC_SENTRY_DSN` | Samme DSN |
| `SENTRY_AUTH_TOKEN` | sentry.io API tokens |
| `SENTRY_ORG` | sentry.io org slug |
| `SENTRY_PROJECT` | sentry.io project slug |
