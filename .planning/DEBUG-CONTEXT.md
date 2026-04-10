# Debug-kontekst: Vercel deployment — RESOLVED 2026-04-10

## LØST: Alle hovedproblemer fikset

### 1. firebase-admin krasjet på Vercel ✅
- **Løsning:** Erstattet firebase-admin med Firestore REST API client (`src/lib/firebase/firestore-rest.ts`)
- Bruker `jose` for JWT-signing + Google OAuth2 token exchange
- Ingen native dependencies — fungerer på Vercel serverless
- firebase-admin flyttet til devDependencies (kun for lokale scripts)

### 2. Produkter og opplevelser viste ikke ✅
- **Årsak 1:** `NOT_EQUAL nullValue` i REST API fungerer ikke — må bruke `unaryFilter` med `IS_NOT_NULL`
- **Årsak 2:** Vercel Data Cache bevarte tomme resultater fra før fixen. Løst med `vercel cache purge` + `cache: 'no-store'` på fetch-kall
- **Årsak 3:** Firestore var tom — seedet med 8 produkter og 4 retreats via `scripts/seed-firestore.mjs`

### 3. Logout fungerte ikke ✅
- **Årsak 1:** Server actions på homepage krasjet pga firebase-admin i Turbopack-bundle
- **Årsak 2:** Firebase client SDK beholdt auth-state etter server-cookie ble slettet
- **Løsning:** Logout bruker nå API route (`POST /api/auth/logout`) + `signOut()` fra Firebase client SDK + `window.location.href = '/'`

### 4. E-post/passord login fungerte ikke ✅
- **Årsak 1:** JWKS URL var feil — `/service_account/v1/jwk/` returnerte 404. Riktig URL: `/robot/v1/metadata/jwk/`
- **Årsak 2:** `FIREBASE_PROJECT_ID` env var hadde trailing `\n` — fikset med `.trim()` i koden + re-satt env var
- **Årsak 3:** Server actions krasjet — login flyttet til API route (`POST /api/auth/login`)
- **Løsning:** All auth bruker nå standalone API routes, ikke server actions

### 5. Admin-kontoer manglet ✅
- Opprettet `william@rootsandculture.no` og `admin@rootsandculture.no` i Firebase Auth med admin custom claims

---

## Arkitektur etter fiks

| Komponent | Implementasjon |
|-----------|---------------|
| Firestore queries | REST API via `src/lib/firebase/firestore-rest.ts` (jose + fetch) |
| Token-verifisering | `jose` + Google JWKS (`/robot/v1/metadata/jwk/`) |
| Session | `jose` JWT i `__session` HttpOnly cookie |
| Login (e-post) | Firebase client SDK → `POST /api/auth/login` |
| Login (Google) | Server-side OAuth → `/api/auth/google/callback` |
| Logout | `signOut()` + `POST /api/auth/logout` + full page reload |
| Admin-sjekk | `ADMIN_EMAILS` env var + Firebase Custom Claims |

## Lærdom
- firebase-admin fungerer IKKE på Vercel serverless (gRPC native deps)
- Vercel Data Cache overlever deployments — må purges eksplisitt
- Server actions bundles med page dependencies — bruk API routes for auth
- Alltid `.trim()` env vars — Vercel kan lagre trailing whitespace
- Google JWKS URL for Firebase: `/robot/v1/metadata/jwk/` (IKKE `/service_account/v1/jwk/`)
