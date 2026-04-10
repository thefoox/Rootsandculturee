# Debug-kontekst: Vercel deployment-problemer

## Dato: 2026-04-10
## Prosjekt: Roots & Culture (Next.js 16 + Firebase + Stripe + Vercel)

---

## HOVEDPROBLEM: `firebase-admin` kan IKKE lastes på Vercel

**Feilmelding:** `Error: Failed to load external module` — vises på ALLE serverless function-kall.

**Hva dette betyr:**
- `firebase-admin` npm-pakken har native/gRPC-avhengigheter som Vercel Turbopack ikke kan bundle
- `serverExternalPackages: ['firebase-admin']` i next.config.ts hjelper IKKE
- ALLE former for import feiler: statisk import, dynamic `await import()`, lazy loading — ALT krasjer
- Når firebase-admin importeres i en fil, krasjer HELE filen — inkludert andre funksjoner i samme fil
- Dette betyr: `adminDb = null`, `adminAuth = null` i HELE produksjonsmiljøet

**Konsekvenser:**
1. Alle Firestore-spørringer feiler → sider viser mock-data i stedet for ekte data
2. Alle server actions som importerer firebase-admin krasjer med 500
3. Auth actions (login, logout, register) krasjet fordi de importerte firebase-admin for Firestore user docs

---

## HVA SOM ER FIKSET (fungerer nå)

### Google Login ✅
- **Løsning:** Server-side OAuth via API routes (ingen popup, ingen iframe)
- **Filer:** `src/app/api/auth/google/route.ts` og `src/app/api/auth/google/callback/route.ts`
- **Flyt:** `<a href="/api/auth/google">` → Google consent → callback → session cookie → redirect til forsiden
- **Env vars:** `GOOGLE_OAUTH_CLIENT_SECRET` i Vercel, redirect URIs i Google Cloud Console
- **Token-verifisering:** `jose` + Google JWKS endpoint (IKKE firebase-admin)

### Auth Actions (login/logout/register) ✅ (siste push)
- **Løsning:** Fjernet ALL firebase-admin fra `src/actions/auth.ts`
- **Token-verifisering:** `src/lib/auth/verify-token.ts` — bruker `jose.jwtVerify` + Google JWKS
- **Session:** `src/lib/session.ts` — `jose` for JWT signing, `__session` HttpOnly cookie
- **IKKE fikset:** Firestore user docs opprettes ikke ved e-post/passord login (kun ved Google OAuth callback)

### E-post/passord login ✅ (bør fungere nå)
- **Flyt:** Firebase client SDK `signInWithEmailAndPassword` → `loginAction(idToken)` → jose-verifisering → session
- **Ingen firebase-admin involvert**

---

## HVA SOM IKKE FUNGERER

### 1. Admin-tilgang
- **Problem:** Google OAuth callback setter `role: 'customer'` hardkodet (linje 63 i callback/route.ts)
- **Koden sjekker:** ADMIN_EMAILS env var → firebase-admin Custom Claims → Firestore user doc
- **Men:** firebase-admin feiler, og ADMIN_EMAILS er ikke lagt til i Vercel
- **Fix:** Legg til `ADMIN_EMAILS=wlundskall@gmail.com` i Vercel env vars, logg ut/inn

### 2. Firestore data i produksjon
- **Problem:** Alle data-fetchere (produkter, opplevelser, artikler, sider) faller tilbake til mock-data
- **Grunn:** `adminDb = null` fordi firebase-admin ikke kan lastes
- **Ved build-time:** DECODER routines::unsupported (OpenSSL) — Firestore queries feiler
- **Ved runtime:** Failed to load external module — firebase-admin kan ikke importeres
- **Mock-data fallback:** Sidene rendrer, men med hardkodet testinnhold
- **Mulig fix:** Bruk Firestore REST API direkte (uten firebase-admin) for data-fetching

### 3. Firestore user docs
- **Problem:** Bruker-dokumenter opprettes ikke ved login (firebase-admin utilgjengelig)
- **Google OAuth:** callback/route.ts prøver firebase-admin men feiler silently
- **E-post/passord:** registerAction oppretter ikke user doc lenger
- **Konsekvens:** /konto sider kan mangle brukerdata

---

## HVA VI HAR PRØVD (og som IKKE fungerte)

| Forsøk | Hvorfor det feilet |
|--------|-------------------|
| `signInWithPopup` | COOP header blokkerer `window.closed` på Vercel |
| `signInWithRedirect` + `getRedirectResult` | Third-party storage blokkert, redirect result = null |
| Auth proxy (`/__/auth` rewrite) | Krevde iframe → X-Frame-Options DENY blokkerte det |
| `X-Frame-Options: SAMEORIGIN` for `/__/auth` | Fortsatt blokkert av CSP |
| CSP `frame-src 'self'` | Fungerte men X-Frame-Options tok presedens |
| `Cross-Origin-Opener-Policy: same-origin-allow-popups` | Warning forsvant ikke, Vercel setter egen COOP |
| `Cross-Origin-Opener-Policy: unsafe-none` | Popup fungerte men server action krasjet |
| `authDomain = window.location.host` | Krevde proxy som skapte iframe-problemer |
| PKCS#8 key-konvertering | Feilen er fra google-auth-library internt, ikke vår kode |
| `applicationDefault()` med temp JSON-fil | Vercel read-only filesystem |
| `initializeFirestore(app, { preferRest: true })` | Hjelper med gRPC, men cert() feiler fortsatt |
| `serverExternalPackages: ['firebase-admin']` | Hjelper ikke med Turbopack bundling |
| `force-dynamic` på sider | Firebase-admin feiler ved runtime også → 500 |
| Top-level `await import()` i auth actions | Krasjer hele server action-filen |
| Lazy `getAdminDb()` funksjon | Dynamic import krasjer serverless-funksjonen uansett |

---

## NØKKELFILER

| Fil | Rolle | Status |
|-----|-------|--------|
| `src/lib/firebase/admin.ts` | Firebase Admin init (cert + initializeFirestore preferRest) | Krasjer på Vercel |
| `src/lib/firebase/client.ts` | Firebase client init (authDomain fra env var) | ✅ Fungerer |
| `src/lib/firebase/auth.ts` | signInWithPopup (brukes ikke for Google lenger) | Brukes for e-post login |
| `src/lib/auth/verify-token.ts` | jose + Google JWKS token-verifisering | ✅ Fungerer |
| `src/lib/session.ts` | jose JWT session cookies | ✅ Fungerer |
| `src/actions/auth.ts` | Login/logout/register server actions (INGEN firebase-admin) | ✅ Bør fungere nå |
| `src/app/api/auth/google/route.ts` | Google OAuth start (redirect til Google) | ✅ Fungerer |
| `src/app/api/auth/google/callback/route.ts` | Google OAuth callback (token exchange, session) | ✅ Fungerer |
| `src/lib/data/products.ts` | Produkter fra Firestore (fallback til mock) | Mock-data pga adminDb=null |
| `src/lib/data/experiences.ts` | Opplevelser fra Firestore (fallback til mock) | Mock-data pga adminDb=null |
| `src/lib/data/articles.ts` | Artikler fra Firestore (fallback til mock) | Mock-data pga adminDb=null |
| `src/lib/data/page-content.ts` | CMS-sider fra Firestore (fallback til mock) | Mock-data pga adminDb=null |
| `next.config.ts` | serverExternalPackages, headers, images | Ingen proxy/COOP/CSP lenger |

---

## VERCEL ENV VARS

| Var | Satt? |
|-----|-------|
| FIREBASE_PROJECT_ID | ✅ |
| FIREBASE_CLIENT_EMAIL | ✅ |
| FIREBASE_PRIVATE_KEY | ✅ (ny nøkkel) |
| SESSION_SECRET | ✅ |
| GOOGLE_OAUTH_CLIENT_SECRET | ✅ |
| ADMIN_EMAILS | ❌ MANGLER — legg til `wlundskall@gmail.com` |
| NEXT_PUBLIC_FIREBASE_* (6 stk) | ✅ |
| STRIPE keys | ✅ (test-modus) |
| RESEND_API_KEY | ✅ |
| RESEND_FROM_EMAIL | ❌ Tom |

---

## OFFISIELL DOKUMENTASJON — LES DISSE

### Firebase Admin SDK på Vercel/Serverless
- **Firebase Admin Node.js SDK setup:** https://firebase.google.com/docs/admin/setup
- **initializeFirestore med preferRest:** https://github.com/firebase/firebase-admin-node — se `initializeFirestore(app, { preferRest: true })`
- **Firestore REST API (alternativ til firebase-admin):** https://firebase.google.com/docs/firestore/use-rest-api
- **Firestore REST API referanse:** https://cloud.google.com/firestore/docs/reference/rest

### Firebase Auth og Google Login
- **signInWithRedirect best practices (third-party cookies):** https://firebase.google.com/docs/auth/web/redirect-best-practices
- **Firebase Auth Web SDK:** https://firebase.google.com/docs/auth/web/start
- **Google OAuth 2.0 server-side flow:** https://developers.google.com/identity/protocols/oauth2/web-server
- **Google JWKS endpoint (for token-verifisering):** https://www.googleapis.com/service_account/v1/jwk/securetoken@system.gserviceaccount.com
- **Verify Firebase ID tokens (uten Admin SDK):** https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library

### Vercel + Next.js
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **serverExternalPackages:** https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages
- **Next.js headers config:** https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- **Next.js rewrites:** https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites
- **Vercel Environment Variables:** https://vercel.com/docs/environment-variables

### COOP/CSP/Iframe-problematikk
- **Next.js GitHub Discussion #51135 (COOP + Firebase):** https://github.com/vercel/next.js/discussions/51135
- **Firebase JS SDK Issue #8541 (COOP):** https://github.com/firebase/firebase-js-sdk/issues/8541
- **Firebase JS SDK Issue #8295 (COOP):** https://github.com/firebase/firebase-js-sdk/issues/8295
- **SO: COOP fix for Firebase:** https://stackoverflow.com/questions/76446840/cross-origin-opener-policy-policy-would-block-the-window-closed-call-error-while

### Nøkkelkonsepter å forstå
- **COOP (Cross-Origin-Opener-Policy):** Vercel setter denne automatisk. `same-origin-allow-popups` tillater popup-kommunikasjon. COOP-warnings i konsollen er fra Google og kan IKKE fjernes — de er ufarlige.
- **Firestore REST API:** Kan brukes uten firebase-admin npm-pakken. Krever OAuth2 access token fra service account. Kan være løsningen for å hente ekte data fra Firestore på Vercel.
- **jose biblioteket:** Allerede installert (v6.2.2). Brukes for JWT-verifisering og session-cookies. Kan verifisere Firebase ID tokens via Google JWKS.
- **`Failed to load external module`:** Turbopack (Vercel bundler) kan ikke bundle firebase-admin sine native gRPC-avhengigheter. Ingen kjent workaround for Next.js 16 + Turbopack.

---

## NESTE STEG

1. **Verifiser** at logout fungerer etter siste push (fjernet firebase-admin fra auth actions)
2. **Legg til** `ADMIN_EMAILS=wlundskall@gmail.com` i Vercel → logg ut/inn → test /admin
3. **Løs firebase-admin på Vercel** — det store uløste problemet. Alternativer:
   - **Firestore REST API** direkte (uten firebase-admin npm-pakke) — mest lovende
   - Flytt til Firebase Hosting (Cloud Functions kjører firebase-admin nativt)
   - Aksepter mock-data og bruk admin CMS lokalt
4. **Test** e-post/passord login + registrering
5. **Test** checkout-flow med Stripe test-kort
