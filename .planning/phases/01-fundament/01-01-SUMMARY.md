---
phase: 01-fundament
plan: 01
subsystem: infra
tags: [nextjs, tailwind-v4, firebase, firebase-admin, typescript, postcss]

# Dependency graph
requires: []
provides:
  - "Next.js 16.2.1 App Router project with TypeScript, ESLint, Tailwind v4"
  - "Firebase client SDK singleton (db, auth, storage)"
  - "Firebase Admin SDK singleton with server-only guard (adminDb, adminAuth)"
  - "Firestore security rules for all 6 collections"
  - "Environment variable template (.env.local.example)"
  - "next.config.ts with Firebase Storage image domain whitelist"
affects: [01-02, 01-03, 01-04, 01-05, 02-storefront, 03-admin, 04-checkout]

# Tech tracking
tech-stack:
  added: [next@16.2.1, react@19.2.4, firebase@12.11.0, firebase-admin@13.7.0, jose@6.2.2, server-only@0.0.1, zod@4.3.6, clsx@2.1.1, tailwind-merge@3.5.0, lucide-react@1.7.0, date-fns@4.1.0, sonner@2.0.7, tailwindcss@4, "@tailwindcss/postcss@4"]
  patterns: ["Firebase SDK singleton with getApps() guard", "server-only import for Admin SDK", "Tailwind v4 via @tailwindcss/postcss plugin", "lang=nb for Norwegian Bokmal"]

key-files:
  created: [package.json, tsconfig.json, next.config.ts, postcss.config.mjs, src/app/globals.css, src/app/layout.tsx, src/app/page.tsx, src/lib/firebase/client.ts, src/lib/firebase/admin.ts, .env.local.example, .gitignore, firestore.rules, eslint.config.mjs]
  modified: []

key-decisions:
  - "Tailwind v4 with @tailwindcss/postcss (no tailwind.config.js)"
  - "Firebase Admin singleton with getApps() guard to prevent cold-start errors on Vercel"
  - "server-only import in admin.ts to prevent client bundle leakage"
  - "Firestore rules use Custom Claims (request.auth.token.admin) not document reads for admin checks"
  - "Orders and bookings have allow write: if false (Admin SDK only writes)"

patterns-established:
  - "Firebase client SDK: singleton via getApps().length === 0 check"
  - "Firebase Admin SDK: singleton + server-only import guard"
  - "Environment variables: NEXT_PUBLIC_ for client-safe, plain for server-only"
  - "Firestore security: defense-in-depth with isAuthenticated/isAdmin/isOwner helpers"

requirements-completed: [FOUND-01, FOUND-04]

# Metrics
duration: 4min
completed: 2026-03-30
---

# Phase 01 Plan 01: Project Scaffold Summary

**Next.js 16.2.1 with Tailwind v4, Firebase client/admin SDK singletons, and Firestore security rules for all 6 collections**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T16:44:29Z
- **Completed:** 2026-03-30T16:49:17Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments
- Next.js 16.2.1 project scaffolded with App Router, TypeScript, ESLint, and Tailwind v4 via @tailwindcss/postcss
- Firebase client SDK (client.ts) and Admin SDK (admin.ts) initialized as singletons with proper guards
- All Phase 1 runtime dependencies installed (firebase, firebase-admin, jose, server-only, zod, clsx, tailwind-merge, lucide-react, date-fns, sonner)
- Firestore security rules written for all 6 collections with principle-of-least-privilege access control
- Environment variable template with proper separation of client-safe and server-only credentials

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js project with all dependencies and Firebase SDK init** - `05e1748` (feat)
2. **Task 2: Create Firestore security rules for all collections** - `5424b2d` (feat)

## Files Created/Modified
- `package.json` - All project dependencies (Next.js, Firebase, utilities)
- `tsconfig.json` - TypeScript configuration (from create-next-app)
- `next.config.ts` - Firebase Storage image domain whitelist
- `postcss.config.mjs` - Tailwind v4 PostCSS plugin configuration
- `src/app/globals.css` - Minimal Tailwind v4 import
- `src/app/layout.tsx` - Root layout with lang="nb" and metadata
- `src/app/page.tsx` - Placeholder page confirming Tailwind works
- `src/lib/firebase/client.ts` - Firebase client SDK singleton (db, auth, storage)
- `src/lib/firebase/admin.ts` - Firebase Admin SDK singleton with server-only guard (adminDb, adminAuth)
- `.env.local.example` - Environment variable template (client + server credentials)
- `.gitignore` - Ignore patterns with .env.local.example exception
- `firestore.rules` - Security rules for products, experiences, orders, bookings, users, blog
- `eslint.config.mjs` - ESLint configuration (from create-next-app)

## Decisions Made
- Used Tailwind v4 with @tailwindcss/postcss (no tailwind.config.js) -- CSS-native configuration
- Firebase Admin SDK uses getApps().length === 0 singleton guard to prevent Vercel cold-start errors
- server-only import in admin.ts prevents accidental client bundle inclusion
- Firestore security rules use Custom Claims for admin checks (not document reads) per architecture anti-pattern 3
- Orders and bookings have `allow write: if false` -- only Admin SDK writes these collections

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed .gitignore .env* pattern blocking .env.local.example**
- **Found during:** Task 1 (environment variable template)
- **Issue:** create-next-app's .gitignore uses `.env*` pattern which also matches `.env.local.example`, preventing the example file from being committed
- **Fix:** Added `!.env.local.example` exception to .gitignore
- **Files modified:** .gitignore
- **Verification:** `git status --short` shows .env.local.example as untracked (ready for commit)
- **Committed in:** 05e1748 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor fix required for correctness. No scope creep.

## Issues Encountered
- create-next-app rejected the project name "Rootsnew" due to npm naming restrictions (capital letters). Worked around by scaffolding in /tmp with lowercase name and copying files to project directory.

## User Setup Required

**External services require manual configuration.** Firebase project setup is required before the app can connect to backend services:

- Create Firebase project and enable Firestore, Auth (Email/Password), and Storage
- Register a Web App in Firebase project
- Enable Email/Password sign-in method
- Copy Firebase config values to `.env.local` (use `.env.local.example` as template)
- Generate Firebase Admin service account key and add credentials to `.env.local`
- Deploy Firestore security rules: `firebase deploy --only firestore:rules`

## Next Phase Readiness
- Project builds successfully (`npm run build` exits 0)
- Ready for Plan 02 (design system tokens and Tailwind theme)
- Ready for Plan 03 (auth system with middleware)
- Firebase SDKs and Firestore rules are the foundation for all subsequent plans

## Self-Check: PASSED

All 13 created files verified present. Both task commits (05e1748, 5424b2d) verified in git log.

---
*Phase: 01-fundament*
*Completed: 2026-03-30*
