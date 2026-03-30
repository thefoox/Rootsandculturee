---
phase: 01-fundament
plan: 04
subsystem: auth
tags: [firebase-auth, jose, jwt, session, middleware, server-actions, dal]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Firebase client SDK (auth object) and Admin SDK (adminAuth, adminDb) singletons"
provides:
  - "Client-side Firebase Auth helpers (signIn, signUp, signOut, resetPassword)"
  - "jose-encrypted HttpOnly session cookie management (createSession, getSession, deleteSession)"
  - "Auth Server Actions bridging client Firebase Auth to server jose sessions"
  - "DAL with cached verifySession() for Server Components and Actions"
  - "Middleware route protection for /admin (admin role) and /konto (authenticated)"
  - "TypeScript interfaces for User, SessionPayload, AuthResult"
affects: [auth-pages, customer-dashboard, admin-dashboard, checkout, booking]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Firebase client auth -> Server Action verifyIdToken -> jose session cookie", "server-only import guard on server modules", "React cache() for per-request DAL deduplication", "jose jwtVerify in Edge Middleware (not firebase-admin)"]

key-files:
  created: [src/types/index.ts, src/lib/firebase/auth.ts, src/lib/session.ts, src/actions/auth.ts, src/lib/dal.ts, src/middleware.ts]
  modified: []

key-decisions:
  - "Cookie name __session follows Firebase convention for Vercel compatibility"
  - "Middleware redirects to / (not login page) to prevent admin path enumeration"
  - "Admin role checked via Firebase Custom Claims (decoded.admin === true) not Firestore document read"
  - "DAL verifySession returns null (not throw) to let consumers decide redirect behavior"

patterns-established:
  - "Auth pipeline: client Firebase Auth -> idToken -> Server Action verifyIdToken -> jose session cookie"
  - "Middleware uses jose jwtVerify directly (firebase-admin not compatible with Edge Runtime)"
  - "Server-only modules use import 'server-only' guard"
  - "DAL wraps session access in React cache() for request-level deduplication"

requirements-completed: [FOUND-02, FOUND-03]

# Metrics
duration: 2min
completed: 2026-03-30
---

# Phase 01 Plan 04: Auth Backend Summary

**Firebase Auth client helpers with jose-encrypted HttpOnly session cookies, Server Actions bridging client to server auth, DAL for server components, and middleware route protection for /admin and /konto**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-30T17:01:06Z
- **Completed:** 2026-03-30T17:02:52Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Complete auth pipeline from client Firebase Auth sign-in through server-side token verification to jose-encrypted session cookie
- Middleware protects /admin (admin-only via Custom Claims) and /konto (any authenticated user) using jose in Edge Runtime
- DAL provides cached verifySession() for server-side auth checks in Server Components and Actions
- Server Actions create Firestore user documents on registration with displayName and address

## Task Commits

Each task was committed atomically:

1. **Task 1: Create types, Firebase Auth client helpers, and jose session management** - `662709d` (feat)
2. **Task 2: Create Server Actions for auth flows, DAL, and middleware route protection** - `33034ac` (feat)

## Files Created/Modified
- `src/types/index.ts` - User, SessionPayload, AuthResult TypeScript interfaces
- `src/lib/firebase/auth.ts` - Client-side Firebase Auth wrappers (signIn, signUp, signOut, resetPassword)
- `src/lib/session.ts` - jose-encrypted HttpOnly session cookie management (createSession, getSession, deleteSession)
- `src/actions/auth.ts` - Server Actions bridging Firebase client auth to server jose sessions (loginAction, registerAction, logoutAction)
- `src/lib/dal.ts` - Data Access Layer with cached verifySession() for server components
- `src/middleware.ts` - Route protection middleware for /admin and /konto routes

## Decisions Made
- Cookie name `__session` follows Firebase convention for Vercel compatibility
- Middleware redirects unauthorized users to `/` (not login page) to prevent admin path enumeration per ARCHITECTURE.md
- Admin role determined from Firebase Custom Claims (`decoded.admin === true`) -- no extra Firestore read
- DAL `verifySession()` returns `null` instead of throwing to let consumers decide redirect behavior
- Error messages in Norwegian per project requirements (FOUND-07)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

Environment variable `SESSION_SECRET` must be set (at least 32 characters) for jose session encryption. This should be configured in `.env.local` for development and in Vercel environment variables for production.

## Next Phase Readiness
- Auth backend complete -- ready for auth UI pages (login, register, forgot password)
- Middleware active and protecting routes
- DAL available for any Server Component or Action needing auth state
- Server Actions ready to be called from client-side auth forms

## Self-Check: PASSED

All 6 created files verified on disk. Both task commits (662709d, 33034ac) verified in git log.

---
*Phase: 01-fundament*
*Completed: 2026-03-30*
