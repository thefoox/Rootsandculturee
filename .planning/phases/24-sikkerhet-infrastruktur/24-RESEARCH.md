# Phase 24: Sikkerhet & Infrastruktur - Research

**Researched:** 2026-04-14
**Domain:** Next.js 16 security infrastructure — proxy.ts, CSP headers, rate limiting, upload hardening
**Confidence:** HIGH

---

## Summary

Phase 24 adds security infrastructure that is currently missing from the app: rate limiting for auth endpoints and server actions, a Content Security Policy header, host validation hardening on the Google OAuth route, and animated WebP blocking in the upload handler.

The app runs Next.js 16.2.1. In Next.js 16, `middleware.ts` has been replaced by `proxy.ts`. The API is nearly identical — same `export function proxy(request)` signature, same `export const config = { matcher: [...] }` — but proxy.ts runs before every request and CAN return `Response` objects directly (the old middleware had limitations here). Proxy.ts uses the Edge Runtime by default, which means no Node.js globals, but module-level `Map` state does not persist across Vercel Edge invocations (stateless per-request). In-memory Maps ARE valid in development and on self-hosted single-process deployments, but on Vercel serverless/edge they reset on each cold start. This is acceptable for rate limiting (resets do not cause security failures, only degraded protection); still worth documenting.

CSP headers belong in `next.config.ts headers()` (static, no nonce needed since the app does not use inline scripts outside of what Next.js generates). Rate limiting for HTTP API routes goes in proxy.ts intercepting by path. Rate limiting for Server Actions must live inside the action itself — proxy.ts matches on URL path, and Server Actions POST to the page URL (e.g., `/_next/action/...` or the page route), not to a dedicated API path.

**Primary recommendation:** (1) Create `src/proxy.ts` with in-memory Map rate limiting for auth/upload HTTP routes. (2) Add CSP + HSTS to `next.config.ts headers()`. (3) Add IP-based rate limit helper to `src/lib/rate-limit.ts` and call it from `contact.ts` and `newsletter.ts`. (4) Fix animated WebP detection in `upload/route.ts` using sharp metadata `pages`. (5) Harden Google OAuth host header with an allowlist.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Rate limiting — auth API routes | API (proxy.ts) | — | proxy.ts intercepts HTTP routes before they reach route handlers |
| Rate limiting — Server Actions | API (inside action) | — | Server Actions POST to page URLs; proxy.ts cannot discriminate by action identity |
| CSP headers | Frontend Server (next.config) | — | Static header via headers() applied at response time; no nonce needed |
| HSTS header | Frontend Server (next.config) | — | Same static headers() mechanism |
| Google OAuth host validation | API (route handler) | — | Host validation must happen at request-time, inside the route that uses host |
| Animated WebP blocking | API (upload route handler) | — | Sharp metadata inspection at processing time |
| Request logging | API (proxy.ts) | — | Centralized log point before all API routes |

---

## Standard Stack

### Core (already installed — no new deps needed)

| Library | Version (installed) | Purpose | Notes |
|---------|---------------------|---------|-------|
| next | 16.2.1 | proxy.ts runtime | `export function proxy` replaces middleware |
| sharp | 0.34.5 | Image processing | `.metadata()` exposes `pages` count for animation detection |

### No New Dependencies

This phase requires **zero new npm packages**. All capabilities are implemented with:
- `src/proxy.ts` — new file, built-in Next.js 16 API
- `src/lib/rate-limit.ts` — new file, pure TypeScript `Map` + `Date.now()`
- Edits to existing files: `next.config.ts`, `src/app/api/auth/google/route.ts`, `src/app/api/upload/route.ts`, `src/actions/contact.ts`, `src/actions/newsletter.ts`

[VERIFIED: npm registry — no rate-limiting package needed; in-memory Map pattern is documented in Next.js official docs]

---

## Architecture Patterns

### System Architecture Diagram

```
Incoming request
      |
      v
[proxy.ts] -- matches /api/auth/*, /api/upload/*
      |
      |-- Rate limit check (in-memory Map, keyed by IP + path)
      |     |
      |     |-- OVER LIMIT --> return 429 JSON
      |     |
      |     `-- OK --> NextResponse.next()
      |
      |-- Request log (console.log method + pathname)
      |
      v
[next.config.ts headers()]
      |
      `-- Adds to EVERY response: CSP, HSTS, X-Frame-Options (already there), etc.
                 |
                 v
         Route handler / Server Component
                 |
         [Server Action: contact.ts / newsletter.ts]
                 |
                 `-- rate-limit.ts helper (IP from headers())
                       |
                       |-- OVER LIMIT --> return error state
                       `-- OK --> send email
```

### Recommended Project Structure (new files only)

```
src/
├── proxy.ts                    # NEW — Next.js 16 proxy (replaces middleware.ts)
├── lib/
│   └── rate-limit.ts           # NEW — in-memory Map rate limiter helper
└── app/
    └── api/
        ├── auth/
        │   └── google/
        │       └── route.ts    # EDIT — add host allowlist validation
        └── upload/
            └── route.ts        # EDIT — add animated WebP detection
src/actions/
├── contact.ts                  # EDIT — add rate limit call
└── newsletter.ts               # EDIT — add rate limit call
next.config.ts                  # EDIT — add CSP + HSTS headers
```

### Pattern 1: proxy.ts with In-Memory Rate Limiter

**What:** Module-level `Map` keyed by `${ip}:${route-bucket}`, stores `{ count, resetAt }`. Returns 429 if count exceeds limit before `resetAt`.

**When to use:** Rate limiting HTTP API routes (auth endpoints, upload). Not for Server Actions.

**Caveat:** In-memory state does NOT persist across Vercel Edge/serverless cold starts. Each new instance starts fresh. This is acceptable for basic abuse prevention but not for strict quota enforcement. Document this limitation.

```typescript
// Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/backend-for-frontend.mdx
// src/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

// Rate limit buckets: [maxRequests, windowMs]
const RATE_LIMITS: Record<string, [number, number]> = {
  '/api/auth/login': [10, 60_000],       // 10/min
  '/api/auth/google': [10, 60_000],      // 10/min
  '/api/upload': [20, 3_600_000],        // 20/hr
}

type RateEntry = { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateEntry>()

function checkRateLimit(ip: string, bucket: string, max: number, windowMs: number): boolean {
  const key = `${ip}:${bucket}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return false // not limited
  }

  if (entry.count >= max) return true // limited

  entry.count++
  return false
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  // Request logging
  console.log(`[proxy] ${request.method} ${pathname} ip=${ip}`)

  // Rate limiting
  const limitConfig = RATE_LIMITS[pathname]
  if (limitConfig) {
    const [max, windowMs] = limitConfig
    const limited = checkRateLimit(ip, pathname, max, windowMs)
    if (limited) {
      return NextResponse.json(
        { error: 'For mange forsøk. Prøv igjen senere.' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/auth/login',
    '/api/auth/google',
    '/api/upload',
  ],
}
```

[VERIFIED: Context7 — proxy.ts API pattern, NextRequest/NextResponse usage, config.matcher]

### Pattern 2: CSP Headers in next.config.ts

**What:** Static Content-Security-Policy header added to all responses via `headers()`. No nonce needed since we have no inline scripts/styles that require nonce-based allowance (Next.js handles its own scripts internally with nonces only when proxy sets `x-nonce`).

**When to use:** Simple static CSP without nonces — correct for this app since no custom inline scripts.

**Sources to allow:**
- `script-src`: `'self'` + `https://js.stripe.com` (Stripe.js) + dev `'unsafe-eval'`
- `frame-src`: `https://js.stripe.com` (Stripe iframes)
- `img-src`: `'self'` + `blob:` + `data:` + `https://firebasestorage.googleapis.com` + `https://storage.googleapis.com`
- `font-src`: `'self'` + `https://fonts.gstatic.com`
- `style-src`: `'self'` + `'unsafe-inline'` + `https://fonts.googleapis.com`
- `connect-src`: `'self'` + Firebase APIs + Stripe APIs
- `form-action`: `'self'`
- `frame-ancestors`: `'none'`

```typescript
// Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/content-security-policy.mdx
// next.config.ts — without nonces
const isDev = process.env.NODE_ENV === 'development'

const cspHeader = `
  default-src 'self';
  script-src 'self' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://firebasestorage.googleapis.com https://storage.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.googleapis.com https://api.stripe.com wss://*.firebaseio.com;
  frame-src https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()
```

[VERIFIED: Context7 — CSP without nonces pattern from Next.js official docs]

### Pattern 3: In-Action Rate Limiting for Server Actions

**What:** Server Actions cannot be intercepted by proxy.ts by action identity (they POST to the page route). Rate limit logic must be placed inside each action. Use `headers()` from `next/headers` to extract IP.

**Why headers() works in Server Actions:** Server Actions are server-side functions — they have access to `next/headers`.

```typescript
// Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/data-security.mdx
// src/lib/rate-limit.ts
import { headers } from 'next/headers'

type RateEntry = { count: number; resetAt: number }
const store = new Map<string, RateEntry>()

export async function checkActionRateLimit(
  bucket: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const headerStore = await headers()
  const ip =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerStore.get('x-real-ip') ??
    'unknown'

  const key = `${ip}:${bucket}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= max) return true
  entry.count++
  return false
}
```

Usage in contact.ts:
```typescript
const limited = await checkActionRateLimit('contact', 5, 3_600_000) // 5/hr
if (limited) return { success: false, error: 'For mange forsøk. Prøv igjen om en time.' }
```

[CITED: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/data-security.mdx — rate limiting in Server Actions]

### Pattern 4: Animated WebP Detection via Sharp Metadata

**What:** Sharp's `.metadata()` returns `pages?: number`. If `pages > 1` for a WebP file, it is animated. Reject before processing.

**Current code gap:** `src/app/api/upload/route.ts` line 121 calls `.webp({ quality: WEBP_QUALITY })` but does NOT pass `animated: false` to the input stage. More importantly, the current code accepts `.webp` input and re-encodes it — but if the input is animated WebP, sharp by default only processes the first frame (since `animated` input option defaults to `false`). However, the phase requirement specifies we should explicitly block animated WebP to prevent DoS from large animated files.

**Detection approach:** Call `sharp(rawBuffer).metadata()` first. If `format === 'webp'` AND `pages > 1`, reject with 400.

```typescript
// Detect animated WebP BEFORE processing
if (ext === '.webp') {
  const meta = await sharp(rawBuffer).metadata()
  if ((meta.pages ?? 1) > 1) {
    return NextResponse.json(
      { error: 'Animerte WebP-filer er ikke tillatt.' },
      { status: 400 }
    )
  }
}
```

[VERIFIED: sharp 0.34.5 type definitions — `Metadata.pages?: number` documented for animated WebP]

### Pattern 5: Google OAuth Host Allowlist

**Current issue:** `src/app/api/auth/google/route.ts` accepts ANY `host` header value without validation:
```typescript
const host = request.headers.get('host') || 'rootsnew.vercel.app'
```
This means a spoofed `Host` header could construct an arbitrary `redirect_uri` that is sent to Google. While Google validates `redirect_uri` against registered URIs, defense-in-depth requires validating the Host on our side.

**Fix:** Validate against an allowlist from env vars or a hardcoded list.

```typescript
const ALLOWED_HOSTS = [
  'rootsnew.vercel.app',
  'localhost:3000',
  process.env.NEXT_PUBLIC_BASE_DOMAIN,
].filter(Boolean)

const host = request.headers.get('host') || ''
if (!ALLOWED_HOSTS.some(allowed => host === allowed || host.endsWith('.vercel.app'))) {
  return NextResponse.json({ error: 'Ugyldig forespørsel.' }, { status: 400 })
}
```

The same fix applies to `src/app/api/auth/google/callback/route.ts`.

[ASSUMED: The specific allowed hosts list. The pattern (allowlist validation) is standard security practice. The actual env var name `NEXT_PUBLIC_BASE_DOMAIN` may need to be confirmed or a new env var added.]

### Anti-Patterns to Avoid

- **CSRF tokens in Server Actions:** Next.js Server Actions already validate `Origin` header against `Host` and use `SameSite: Lax` cookies. No manual CSRF token needed. [VERIFIED: Context7 — "Server Actions use the POST HTTP method exclusively, which prevents most CSRF vulnerabilities... strengthened by SameSite cookies being the default"]
- **CSP via proxy.ts for static pages:** proxy.ts runs Edge Runtime; adding CSP there for non-API pages forces dynamic rendering. Use `next.config.ts headers()` for static CSP instead. [VERIFIED: Context7 — CSP without nonces pattern uses next.config.js headers()]
- **Relying on in-memory rate limits as hard security guarantee:** In-memory Maps reset on cold starts. Document this; it is acceptable for anti-abuse but not strict rate enforcement.
- **`animated: false` in WebP output options:** WebP output does not have an `animated` boolean in sharp's `WebpOptions`. The correct approach is to detect animated input via `metadata().pages` and reject early. [VERIFIED: sharp 0.34.5 type definitions]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting (advanced) | Custom distributed store | Upstash Redis + @upstash/ratelimit | For production-grade distributed limiting. Not needed here — in-memory Map is sufficient for v1 given single-region Vercel deployment |
| CSP nonce injection | Manual nonce threading through RSC | proxy.ts + `x-nonce` header | Only needed if inline scripts require nonces. This app doesn't — skip nonces |
| JWT verification in proxy | Custom token decode | Keep in route handlers via firebase-admin | proxy.ts uses Edge Runtime — firebase-admin requires Node.js. Auth verification stays in route handlers |

**Key insight:** The no-nonce CSP approach is correct for this app because Next.js manages its own script tags and there are no custom inline scripts/styles that would need nonce allowlisting.

---

## Common Pitfalls

### Pitfall 1: firebase-admin in proxy.ts

**What goes wrong:** Importing `firebase-admin` (or any Node.js-only package) into `proxy.ts` causes a build error — proxy.ts runs in Edge Runtime which lacks Node.js APIs.

**Why it happens:** The Edge Runtime is a subset of Node.js. firebase-admin uses Node.js crypto, net, etc.

**How to avoid:** Never import `@/lib/firebase/admin` or `server-only` modules in proxy.ts. Auth verification stays in route handlers. Proxy only does: IP extraction, rate limit Map lookup, logging.

**Warning signs:** Build error "The module ... is not compatible with Edge Runtime"

### Pitfall 2: In-Memory Map State on Vercel Edge

**What goes wrong:** Rate limit counts reset on every cold start on Vercel Edge. Heavy abusers who trigger many cold starts see their counts repeatedly reset.

**Why it happens:** Edge functions are stateless; the module-level Map lives in process memory, not shared storage.

**How to avoid:** Accept this limitation for v1. Document it. Upgrade path: Upstash Redis with `@upstash/ratelimit` for distributed counting.

**Warning signs:** Rate limits appearing ineffective under sustained load.

### Pitfall 3: CSP Blocking Stripe or Firebase

**What goes wrong:** A CSP that is too strict blocks `js.stripe.com` scripts or Firebase Realtime Database WebSocket connections, breaking checkout or auth flows.

**Why it happens:** Default `script-src 'self'` blocks all external scripts.

**How to avoid:** The CSP template in Pattern 2 above includes all required origins. Test checkout flow after deploying.

**Warning signs:** Browser console showing "Refused to load script" or "Refused to connect" for stripe.com or googleapis.com.

### Pitfall 4: proxy.ts placement in src/ project

**What goes wrong:** Placing proxy.ts at root `/proxy.ts` when the project uses `src/` directory. Next.js will not find it.

**Why it happens:** Convention — proxy.ts must be "at the same level as `pages` or `app`".

**How to avoid:** Since `app/` is at `src/app/`, place proxy.ts at `src/proxy.ts`. [VERIFIED: Context7 — "Create a proxy.ts file in the project root, or inside `src` if applicable, so that it is located at the same level as `pages` or `app`"]

### Pitfall 5: Server Action Rate Limit — Cannot Use NextRequest

**What goes wrong:** Trying to use `NextRequest` inside a Server Action (which doesn't receive a request object).

**Why it happens:** Server Actions are plain async functions, not route handlers.

**How to avoid:** Use `headers()` from `next/headers` to get `x-forwarded-for`. This works in Server Actions because they run server-side with access to the request context.

---

## Code Examples

### Full next.config.ts with CSP + HSTS

```typescript
// Source: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/content-security-policy.mdx
import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const cspHeader = `
  default-src 'self';
  script-src 'self' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://firebasestorage.googleapis.com https://storage.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://api.stripe.com wss://*.firebaseio.com;
  frame-src https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/v0/b/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

export default config
```

### Current Security Headers Gap (before this phase)

Currently in `next.config.ts`:
- X-Frame-Options: DENY — present
- X-Content-Type-Options: nosniff — present
- Referrer-Policy: strict-origin-when-cross-origin — present
- Permissions-Policy — present
- X-DNS-Prefetch-Control — present
- **Content-Security-Policy — MISSING**
- **Strict-Transport-Security (HSTS) — MISSING**
- **X-Permitted-Cross-Domain-Policies — MISSING**

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` (export `middleware`) | `proxy.ts` (export `proxy`) | Next.js 16 | Same API surface, new file convention; old middleware.ts still accepted in some versions but deprecated |
| CSP via middleware | CSP via next.config headers() (static) | Next.js 15+ | Static CSP is simpler; nonce approach only needed for inline scripts |
| Manual CSRF tokens in forms | Built-in origin validation for Server Actions | Next.js 14+ | Server Actions validate Origin vs Host automatically |

**Deprecated/outdated:**
- `middleware.ts` with `export function middleware`: Replaced by `proxy.ts` with `export function proxy` in Next.js 16. The old file name is deprecated.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Google OAuth allows any `*.vercel.app` subdomain as a valid redirect_uri if pre-registered. The host allowlist logic uses `host.endsWith('.vercel.app')` as a broad match. | Pattern 5 | If Google only allows exact registered URIs (it does), the broad endsWith check doesn't add security value. Make it exact match against env var instead. |
| A2 | `NEXT_PUBLIC_BASE_DOMAIN` env var exists or can be added for the production domain. | Pattern 5 | If not set, fallback to hardcoded `rootsnew.vercel.app`. Low risk. |
| A3 | Stripe only requires `https://js.stripe.com` in CSP. | Pattern 2 / Code Examples | If Stripe also loads from other domains (e.g., `stripe.com`), checkout will break. Verify Stripe CSP requirements. |
| A4 | Firebase Auth SDK (client-side) only calls googleapis.com endpoints, no additional CSP domains. | Pattern 2 | If Firebase Auth loads scripts from other origins, CSP will block auth flows. |

---

## Open Questions

1. **Stripe CSP domains**
   - What we know: `js.stripe.com` is the main Stripe JS host
   - What's unclear: Does Stripe Elements or checkout also load from `checkout.stripe.com` or `stripe.com` directly?
   - Recommendation: Start with `https://js.stripe.com https://checkout.stripe.com` in `frame-src` and `script-src`. Monitor browser console after deploy.

2. **Host allowlist for Google OAuth**
   - What we know: Current code uses raw `host` header without validation
   - What's unclear: What preview deployment URLs exist (Vercel generates `*.vercel.app` subdomains per deploy)
   - Recommendation: Use `process.env.VERCEL_URL` (available on Vercel) as dynamic allowed host, plus hardcoded production domain.

3. **`connect-src` for Firebase Realtime DB vs Firestore**
   - What we know: App uses Firestore (not Realtime Database)
   - What's unclear: Does Firestore JS SDK use WebSocket (`wss://`) or only HTTPS?
   - Recommendation: Include both `https://*.googleapis.com` and `wss://*.firebaseio.com` for safety. If no WebSocket is used, `wss://` directive is harmless.

---

## Environment Availability

Step 2.6: SKIPPED — this phase involves only code/config changes with no new external dependencies. All required tools (Node.js, sharp, next) are confirmed installed.

---

## Validation Architecture

> `nyquist_validation: false` in `.planning/config.json` — section skipped per instructions.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Rate limiting on login endpoint |
| V3 Session Management | partial | Session cookie already HttpOnly/Secure; no changes needed |
| V4 Access Control | partial | Host validation on OAuth route |
| V5 Input Validation | yes | Animated WebP type validation in upload |
| V6 Cryptography | no | No new crypto — session already uses jose/HS256 |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Brute-force login | Tampering/Elevation | Rate limit: 10 req/min per IP on /api/auth/login |
| Open redirect via Host header spoofing | Spoofing | Host allowlist in google/route.ts |
| DoS via animated WebP upload | Denial of Service | Detect `metadata().pages > 1`, return 400 |
| Email spam via contact form | Denial of Service | Rate limit: 5 req/hr per IP in contact.ts action |
| Newsletter sign-up spam | Denial of Service | Rate limit: 5 req/hr per IP in newsletter.ts action |
| XSS via third-party script injection | Tampering | CSP with `script-src 'self' https://js.stripe.com` |
| Clickjacking | Tampering | `X-Frame-Options: DENY` (already set) + `frame-ancestors 'none'` in CSP |
| Protocol downgrade | Tampering | HSTS: `max-age=63072000; includeSubDomains; preload` |

---

## Sources

### Primary (HIGH confidence)
- `/vercel/next.js` (Context7) — proxy.ts file conventions, CSP without nonces, rate limiting patterns, Server Actions CSRF protection, proxy config.matcher, Edge Runtime constraints
- sharp 0.34.5 TypeScript definitions (local node_modules) — `Metadata.pages`, `WebpOptions`, `AnimationOptions`

### Secondary (MEDIUM confidence)
- Next.js 16.2.1 installed in project — confirmed via `package.json` and `node_modules/next/package.json`
- Sharp 0.34.5 confirmed from `node_modules/sharp/package.json`

### Tertiary (LOW confidence / ASSUMED)
- Stripe CSP domain requirements (A3) — training knowledge, not verified via Stripe docs this session
- Firebase Auth CSP domain requirements (A4) — training knowledge, not verified via Firebase docs this session

---

## Metadata

**Confidence breakdown:**
- proxy.ts API and placement: HIGH — verified via Context7 Next.js docs
- CSP header pattern: HIGH — verified via Context7 Next.js CSP guide
- Rate limiting pattern (in-memory Map): HIGH — verified via Context7 Next.js security docs
- animated WebP detection via sharp metadata: HIGH — verified via local sharp type definitions
- Server Actions rate limit via headers(): HIGH — verified via Context7 pattern + Next.js data-security docs
- Google OAuth host validation: MEDIUM — pattern is correct, specific allowlist values ASSUMED
- Stripe/Firebase CSP domains: LOW — not verified from official docs this session

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable APIs — proxy.ts is Next.js 16 stable)
