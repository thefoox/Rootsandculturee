---
phase: 24-sikkerhet-infrastruktur
plan: "03"
subsystem: auth
tags: [google-oauth, host-validation, security, open-redirect, allowlist]

# Dependency graph
requires: []
provides:
  - Host header allowlist validation on Google OAuth initiation route
  - Host header allowlist validation on Google OAuth callback route
  - Defense-in-depth against redirect_uri manipulation via spoofed Host headers
affects: [auth, google-oauth, security]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ALLOWED_HOSTS constant with env var expansion (VERCEL_URL, NEXT_PUBLIC_BASE_DOMAIN) for multi-env support"
    - "Validate Host header before constructing any URLs in OAuth route handlers"
    - "Initiation route returns 400 JSON for invalid hosts; callback route redirects to production with auth_error param"

key-files:
  created: []
  modified:
    - src/app/api/auth/google/route.ts
    - src/app/api/auth/google/callback/route.ts

key-decisions:
  - "Use exact ALLOWED_HOSTS.includes() matching, not endsWith('.vercel.app') — exact match is more precise since Google validates exact redirect_uri anyway"
  - "Callback route redirects to production (not 400 JSON) on invalid host — better UX mid-OAuth flow"
  - "ALLOWED_HOSTS array duplicated in both files (not shared) — they are separate route modules"

patterns-established:
  - "Pattern: OAuth route validates Host header against ALLOWED_HOSTS before constructing any redirect URIs"
  - "Pattern: env vars (VERCEL_URL, NEXT_PUBLIC_BASE_DOMAIN) in ALLOWED_HOSTS for dynamic Vercel preview support"

requirements-completed:
  - SEC-HOST-VALID

# Metrics
duration: 8min
completed: 2026-04-14
---

# Phase 24 Plan 03: Google OAuth Host Allowlist Validation Summary

**Host header allowlist validation added to both Google OAuth routes, blocking spoofed Host headers from constructing arbitrary redirect_uri values**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-14T21:11:00Z
- **Completed:** 2026-04-14T21:19:53Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `ALLOWED_HOSTS` constant to `google/route.ts` — validation before redirect_uri construction, returns 400 JSON for unknown hosts
- Added identical `ALLOWED_HOSTS` constant to `google/callback/route.ts` — validation before baseUrl/callbackUrl construction, redirects to production with `auth_error=invalid_host` for unknown hosts
- Allowlist supports multi-environment deployment: hardcoded `rootsnew.vercel.app` + `localhost:3000`, dynamic `VERCEL_URL` (Vercel preview deploys), `NEXT_PUBLIC_BASE_DOMAIN` (custom domain)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add host allowlist validation to Google OAuth initiation route** - `48d1e18` (feat)
2. **Task 2: Add host allowlist validation to Google OAuth callback route** - `a6edaf3` (feat)

## Files Created/Modified

- `src/app/api/auth/google/route.ts` - Added `ALLOWED_HOSTS` constant and host validation guard before `callbackUrl` construction; unknown hosts return 400 JSON `{ error: 'Ugyldig foresporsel.' }`
- `src/app/api/auth/google/callback/route.ts` - Added identical `ALLOWED_HOSTS` constant and host validation guard before `baseUrl`/`callbackUrl` construction; unknown hosts redirect to `https://rootsnew.vercel.app/?auth_error=invalid_host`

## Decisions Made

- **Exact match vs. suffix match:** Used `ALLOWED_HOSTS.includes(host)` (exact) rather than `host.endsWith('.vercel.app')`. Research assumption A1 noted that broad suffix matching adds no security value since Google validates exact redirect_uri. Exact matching is more precise and consistent with defense-in-depth intent.
- **Callback error response is redirect, not 400:** Mid-OAuth flow, a JSON 400 would be confusing to the user (browser showing raw JSON after Google redirects back). Redirecting to production with an error param gives the app UI a chance to show a meaningful Norwegian error message.
- **Duplicated ALLOWED_HOSTS in each file:** Both route modules are separate — no shared module extraction needed. Duplication is intentional and documented.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

TypeScript `--noEmit` on individual files produces errors from `node_modules/next` type declarations (pre-existing infrastructure issue unrelated to these changes). Verified no errors in source files by filtering out node_modules lines — confirmed clean.

## User Setup Required

None - no external service configuration required. `VERCEL_URL` is injected automatically by Vercel on all deployments. `NEXT_PUBLIC_BASE_DOMAIN` is optional — if unset, the allowlist falls back to the two hardcoded entries.

## Threat Mitigations Applied

| Threat ID | Category | Component | Status |
|-----------|----------|-----------|--------|
| T-24-11 | Spoofing | google/route.ts | Mitigated — Host validated before redirect_uri construction |
| T-24-12 | Spoofing | google/callback/route.ts | Mitigated — Host validated before baseUrl/callbackUrl construction |
| T-24-13 | Information Disclosure | ALLOWED_HOSTS | Accepted — allowlist contains only public domain names |

## Next Phase Readiness

- Host validation complete on both OAuth routes
- Normal Google login flow unchanged for allowed hosts (localhost:3000 and rootsnew.vercel.app)
- Ready for remaining phase 24 plans

---
*Phase: 24-sikkerhet-infrastruktur*
*Completed: 2026-04-14*
