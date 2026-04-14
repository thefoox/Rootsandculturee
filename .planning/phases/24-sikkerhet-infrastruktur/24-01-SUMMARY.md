---
phase: 24-sikkerhet-infrastruktur
plan: "01"
subsystem: security-infrastructure
tags: [rate-limiting, csp, hsts, proxy, security-headers]
requirements: [SEC-PROXY, SEC-CSP, SEC-HSTS]

dependency_graph:
  requires: []
  provides:
    - in-memory rate limiting for /api/auth/login (10/min)
    - in-memory rate limiting for /api/auth/google (10/min)
    - in-memory rate limiting for /api/auth/session (30/min)
    - in-memory rate limiting for /api/upload (20/hr)
    - CSP header on all responses
    - HSTS header on all responses
    - X-Permitted-Cross-Domain-Policies header on all responses
  affects:
    - all API routes matched by proxy.ts config.matcher
    - all HTTP responses via next.config.ts headers()

tech_stack:
  added: []
  patterns:
    - Next.js 16 proxy.ts (replaces middleware.ts)
    - In-memory Map rate limiting keyed by IP + bucket
    - Static CSP via next.config.ts headers() without nonces

key_files:
  created:
    - src/proxy.ts
  modified:
    - next.config.ts

decisions:
  - Used in-memory Map for rate limiting (no new deps; documented cold-start caveat)
  - CSP without nonces (app has no custom inline scripts requiring nonce allowlisting)
  - unsafe-eval in script-src is development-only (conditioned on NODE_ENV)
  - connect-src includes both securetoken.googleapis.com and identitytoolkit.googleapis.com explicitly alongside *.googleapis.com for defense-in-depth

metrics:
  duration_seconds: 154
  completed: "2026-04-14"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 24 Plan 01: Rate Limiting + Security Headers Summary

**One-liner:** In-memory rate limiting via src/proxy.ts (Next.js 16) for 4 auth/upload endpoints, plus CSP + HSTS + X-Permitted-Cross-Domain-Policies headers in next.config.ts.

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create src/proxy.ts with rate limiting | `1e4336d` | src/proxy.ts (created) |
| 2 | Add CSP + HSTS + X-Permitted-Cross-Domain-Policies to next.config.ts | `de39043` | next.config.ts (modified) |

---

## What Was Built

### Task 1: src/proxy.ts

New file implementing Next.js 16's proxy convention (replaces middleware.ts). Runs on the Edge Runtime before matched API routes.

Rate limit configuration:
- `/api/auth/login` — 10 req/min per IP (brute-force protection)
- `/api/auth/google` — 10 req/min per IP (OAuth abuse protection)
- `/api/auth/session` — 30 req/min per IP (higher because client polls this endpoint)
- `/api/upload` — 20 req/hr per IP (upload flood protection)

Implementation:
- Module-level `Map<string, { count: number; resetAt: number }>` keyed by `${ip}:${pathname}`
- IP extracted from `x-forwarded-for` (first entry) falling back to `x-real-ip` then `'unknown'`
- 429 response includes Norwegian error message ("For mange forsok. Prov igjen senere.") and `Retry-After` header
- All matched requests logged: `[proxy] METHOD /path ip=x.x.x.x`

### Task 2: next.config.ts

Added 3 new headers to the existing `headers()` array (5 existing preserved, 8 total):

1. **Content-Security-Policy** — allows Stripe JS, Firebase APIs (googleapis, securetoken, identitytoolkit, firebaseio WebSocket), Google Fonts; blocks everything else. `unsafe-eval` in script-src is dev-only.
2. **Strict-Transport-Security** — `max-age=63072000; includeSubDomains; preload` (2-year HSTS with preload eligibility)
3. **X-Permitted-Cross-Domain-Policies** — `none`

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Limitations

- **Cold-start caveat:** The in-memory Map in proxy.ts resets on Vercel Edge cold starts. Rate limit counts do not persist across serverless invocations. This is acceptable for basic abuse prevention but not strict quota enforcement. Documented in code comment. Upgrade path: Upstash Redis with @upstash/ratelimit.
- **Build failure (pre-existing):** `validateCartItems` export missing from `src/actions/cart.ts` causes a build error in `handlekurv/page.tsx`. This is a pre-existing issue from plan 23-01, not caused by this plan's changes. Out of scope per deviation Rule scope boundary.

---

## Threat Coverage

| Threat ID | Threat | Mitigation |
|-----------|--------|------------|
| T-24-01 | Brute-force on /api/auth/login | Rate limited 10/min/IP in proxy.ts |
| T-24-02 | OAuth abuse on /api/auth/google | Rate limited 10/min/IP in proxy.ts |
| T-24-03 | Upload flooding /api/upload | Rate limited 20/hr/IP in proxy.ts |
| T-24-04 | XSS via third-party script injection | CSP script-src 'self' + js.stripe.com only |
| T-24-05 | Protocol downgrade attack | HSTS max-age=63072000 with preload |
| T-24-06 | In-memory rate limit state | Accepted (documented cold-start limitation) |

---

## Self-Check: PASSED

- src/proxy.ts: FOUND
- next.config.ts: FOUND
- 24-01-SUMMARY.md: FOUND
- Commit 1e4336d (proxy.ts): FOUND
- Commit de39043 (next.config.ts): FOUND
