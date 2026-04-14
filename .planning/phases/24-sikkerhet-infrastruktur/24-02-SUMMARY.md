---
phase: 24-sikkerhet-infrastruktur
plan: 02
subsystem: api
tags: [rate-limiting, security, webp, sharp, server-actions, dos-prevention]

# Dependency graph
requires: []
provides:
  - In-memory rate limiter helper (checkActionRateLimit) for Server Actions
  - Contact form rate-limited to 5 submissions per hour per IP
  - Newsletter form rate-limited to 5 submissions per hour per IP
  - Animated WebP detection and rejection in upload route (pages > 1 = 400)
affects: [contact, newsletter, upload, future-server-actions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - In-memory Map rate limiter for Server Actions using headers() IP extraction
    - Animated WebP detection via sharp metadata().pages before processing pipeline

key-files:
  created:
    - src/lib/rate-limit.ts
  modified:
    - src/actions/contact.ts
    - src/actions/newsletter.ts
    - src/app/api/upload/route.ts

key-decisions:
  - "Rate limit checks placed BEFORE Zod validation to reject spam before any processing"
  - "In-memory Map accepted as v1 — resets on cold start but acceptable for abuse prevention (documented upgrade path: Upstash Redis)"
  - "Animated WebP blocked via metadata().pages > 1 rather than animated: false output option (sharp docs confirm pages is the correct API)"

patterns-established:
  - "Pattern: checkActionRateLimit(bucket, max, windowMs) — reusable helper for any Server Action"
  - "Pattern: animated WebP gate — always call sharp(rawBuffer).metadata() before processing for .webp input"

requirements-completed: [SEC-ACTION-RATE, SEC-UPLOAD-WEBP]

# Metrics
duration: 12min
completed: 2026-04-14
---

# Phase 24 Plan 02: Rate Limiting & Animated WebP Detection Summary

**In-memory Server Action rate limiter (5/hr per IP) wired into contact and newsletter forms, plus animated WebP detection via sharp metadata.pages rejecting DoS uploads before processing**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-14T00:00:00Z
- **Completed:** 2026-04-14
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 edited)

## Accomplishments

- Created shared `src/lib/rate-limit.ts` with `checkActionRateLimit` helper using `headers()` for IP extraction — reusable from any Server Action
- Applied 5/hr rate limit to contact form (`submitContactForm`) and newsletter form (`subscribeAction`) before validation, returning Norwegian error on excess
- Added animated WebP detection to upload route using `sharp(rawBuffer).metadata().pages` — returns 400 with Norwegian error before any sharp processing begins

## Task Commits

Each task was committed atomically:

1. **Task 1: Create rate-limit.ts and wire into contact.ts + newsletter.ts** - `cd8f546` (feat)
2. **Task 2: Add animated WebP detection to upload route** - `85a4b83` (feat)

## Files Created/Modified

- `src/lib/rate-limit.ts` - Shared in-memory rate limiter for Server Actions; exports `checkActionRateLimit(bucket, max, windowMs)`
- `src/actions/contact.ts` - Rate limit check added before Zod validation; returns 'For mange forsøk. Prøv igjen om en time.' at 5/hr
- `src/actions/newsletter.ts` - Rate limit check added before Zod validation; returns 'For mange forsøk. Prøv igjen om en time.' at 5/hr
- `src/app/api/upload/route.ts` - Animated WebP gate added after rawBuffer, before sharp pipeline; returns 400 'Animerte WebP-filer er ikke tillatt.'

## Decisions Made

- Rate limit checks placed BEFORE Zod validation so spam requests are rejected before any schema parsing or email sending occurs
- In-memory Map accepted as v1 with documented caveat: state resets on Vercel serverless cold starts. Acceptable for anti-abuse, not strict quota enforcement. Upgrade path: Upstash Redis + @upstash/ratelimit
- Used `sharp(rawBuffer).metadata().pages` for animated WebP detection — the research explicitly confirmed `animated: false` is not a valid sharp output option; metadata check is the correct approach

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

TypeScript standalone file check (`npx tsc --noEmit src/lib/rate-limit.ts ...`) produced many node_modules type errors unrelated to this plan. Full project check (`npx tsc --noEmit`) produced no errors in source files — confirmed pre-existing node_modules type issues, not introduced by this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Rate limiting infrastructure complete; pattern established for future Server Actions
- Upload route hardened against animated WebP DoS
- Both mitigations from the threat register (T-24-07, T-24-08, T-24-09) are in place

---
*Phase: 24-sikkerhet-infrastruktur*
*Completed: 2026-04-14*

## Self-Check: PASSED

- src/lib/rate-limit.ts: FOUND
- src/actions/contact.ts: FOUND
- src/actions/newsletter.ts: FOUND
- src/app/api/upload/route.ts: FOUND
- 24-02-SUMMARY.md: FOUND
- Commit cd8f546: FOUND
- Commit 85a4b83: FOUND
