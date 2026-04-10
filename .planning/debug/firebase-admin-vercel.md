---
status: awaiting_human_verify
trigger: "firebase-admin npm package cannot be loaded on Vercel due to native/gRPC dependencies"
created: 2026-04-10T00:00:00Z
updated: 2026-04-10T12:00:00Z
---

## Current Focus

hypothesis: firebase-admin uses gRPC native bindings and google-auth-library OpenSSL operations that cannot run on Vercel's serverless runtime. The fix is a complete replacement of firebase-admin with a Firestore REST API client backed by a service-account OAuth2 token.
test: Replace src/lib/firebase/admin.ts with a REST-based firestoreDb object that provides the same collection/doc/query/write interface, then update all 27 dependent files to use the new client.
expecting: All Firestore reads and writes succeed in production. adminDb is never null. No native module load errors.
next_action: Implement firestoreRestClient — the core abstraction — then update admin.ts, then update all callers.

## Symptoms

expected: Firebase Admin SDK initializes on Vercel and Firestore queries return real data from the database. Admin auth, user doc creation, and all data fetchers work in production.
actual: firebase-admin crashes with "Error: Failed to load external module" at runtime and "DECODER routines::unsupported (OpenSSL)" at build time. adminDb=null in production. All data fetchers (products, experiences, articles, page-content) fall back to hardcoded mock data. User docs are not created at login. Admin role checking via Custom Claims fails.
errors: "Error: Failed to load external module" — on ALL serverless function calls that import firebase-admin. "DECODER routines::unsupported (OpenSSL)" — at build time when firebase-admin tries to parse the private key.
reproduction: Deploy to Vercel. Any page that fetches Firestore data server-side shows mock data. Any server action importing firebase-admin returns 500.
started: Ongoing since deploying to Vercel with Next.js 16 + Turbopack.

## Eliminated

- hypothesis: preferRest: true on initializeFirestore bypasses gRPC
  evidence: cert() call in google-auth-library still fails before Firestore init; OpenSSL error at build time regardless
  timestamp: 2026-04-10

- hypothesis: serverExternalPackages: ['firebase-admin'] helps Turbopack
  evidence: firebase-admin uses native .node binaries that simply don't exist in Vercel's Lambda environment; externalizing the package doesn't fix missing binaries
  timestamp: 2026-04-10

- hypothesis: dynamic import of firebase-admin inside functions
  evidence: Import still fails at runtime in the serverless function; the binary is not present in the deployed bundle
  timestamp: 2026-04-10

- hypothesis: PKCS#8 key conversion
  evidence: Error comes from google-auth-library internals, not from our key processing
  timestamp: 2026-04-10

- hypothesis: applicationDefault() with temp JSON file
  evidence: Vercel filesystem is read-only at runtime; writing credentials JSON fails
  timestamp: 2026-04-10

## Evidence

- timestamp: 2026-04-10
  checked: All 27 files that import from @/lib/firebase/admin
  found: Every file uses adminDb (Firestore) or adminApp (Storage) or adminAuth (Auth). adminAuth is only used in google/callback route to check custom claims. adminApp is only used in upload route for Firebase Storage. All remaining usage is adminDb for Firestore.
  implication: The fix scope is: (1) replace all adminDb usage with REST Firestore client, (2) handle adminAuth separately (already replaced with ADMIN_EMAILS env var fallback), (3) handle adminApp/Storage separately (upload route needs separate solution or Firebase Storage client-side upload).

- timestamp: 2026-04-10
  checked: Firestore REST API capabilities
  found: Firestore REST API at https://firestore.googleapis.com/v1/ supports: runQuery (structured queries with filters/ordering/limit), get document, list documents, createDocument, updateDocument (patch), deleteDocument, batchWrite (for batch operations). Does NOT support: server-side transactions with optimistic locking (runTransaction), FieldValue.serverTimestamp() sentinel, count() aggregation queries, CollectionGroup queries.
  implication: Transactions need to be replaced with optimistic retry or sequential writes. serverTimestamp() needs to be replaced with new Date(). count() needs to be replaced with full collection fetch + .length. These are all viable replacements.

- timestamp: 2026-04-10
  checked: google-auth-library / JWT signing for service account OAuth2
  found: Can use jose (already in package.json) to sign a JWT with RS256 using the private key, then exchange it for a Google access token via https://oauth2.googleapis.com/token. No native OpenSSL required — jose uses Web Crypto API which is available in Node.js 18+ (Vercel's runtime).
  implication: We can get OAuth2 access tokens for Firestore REST API calls using jose alone. No firebase-admin or google-auth-library needed.

- timestamp: 2026-04-10
  checked: Firebase Storage (upload route)
  found: adminApp is only used in src/app/api/upload/route.ts to call getStorage(adminApp).bucket(). This is the only Storage usage. The upload route requires firebase-admin/storage which has the same gRPC issue.
  implication: Upload route needs to be rewritten to use Firebase Storage REST API or signed URLs. This can be done with a direct REST upload to Firebase Storage using the OAuth2 token. Included in fix scope.

- timestamp: 2026-04-10
  checked: FieldValue.serverTimestamp(), FieldValue imports, Timestamp imports in actions
  found: Used in: actions/products.ts, actions/experiences.ts, actions/articles.ts, actions/site-content.ts. All use FieldValue.serverTimestamp() for createdAt/updatedAt/publishedAt fields. actions/experiences.ts also uses Timestamp.fromDate() for date fields.
  implication: Must replace FieldValue.serverTimestamp() with new Date() in all action writes. Replace Timestamp.fromDate(date) with date directly (REST API accepts ISO strings). All these are simple substitutions.

- timestamp: 2026-04-10
  checked: Transactions used in codebase
  found: adminDb.runTransaction() used in: stripe webhook (seat decrement, stock decrement), actions/bookings.ts (cancel booking + seat restore), actions/gift-cards.ts (redeem gift card with balance check). These require atomic read-modify-write.
  implication: Firestore REST API supports transactions via beginTransaction/commit endpoints but it's complex. Given these are critical operations (inventory, seats, gift card balances), implement optimistic transactions via the REST API's precondition/etag support, or implement as sequential writes with idempotency checks. For seat/stock decrements, use REST runAggregationQuery + conditional update with currentDocument precondition.

- timestamp: 2026-04-10
  checked: count() aggregation queries
  found: Used in: users.ts (getUserCount), orders.ts (getOrderStats - bookings.count, users.count). 
  implication: Replace with full collection list query and use docs.length, or use runAggregationQuery REST endpoint (COUNT is supported via Firestore REST aggregation queries since 2023).

## Resolution

root_cause: firebase-admin uses google-auth-library which requires OpenSSL native bindings and gRPC native .node binaries. Vercel's Lambda/serverless environment does not provide compatible native binaries, causing "Failed to load external module" errors. The preferRest: true option does not bypass the auth initialization failure.
fix: Replace firebase-admin entirely with a pure-HTTP Firestore REST API client. Use jose (already installed) to sign service-account JWTs and exchange them for Google OAuth2 access tokens. Build a thin Firestore REST client that provides collection/doc query/write interfaces compatible with all 27 callers. Replace FieldValue.serverTimestamp() with new Date(). Replace transactions with REST transactions using beginTransaction/commit. Replace count() with REST aggregation queries.
verification: TypeScript compiles with zero errors. No remaining firebase-admin imports in source. All 27 callers updated. Awaiting Vercel deploy confirmation.
files_changed:
  - src/lib/firebase/firestore-rest.ts (new — Firestore REST API client using jose)
  - src/lib/firebase/admin.ts (replaced firebase-admin with REST client export)
  - src/lib/data/products.ts
  - src/lib/data/experiences.ts
  - src/lib/data/articles.ts
  - src/lib/data/page-content.ts
  - src/lib/data/users.ts
  - src/lib/data/site-content.ts
  - src/lib/data/orders.ts
  - src/lib/data/bookings.ts
  - src/lib/data/gift-cards.ts
  - src/actions/products.ts
  - src/actions/experiences.ts
  - src/actions/articles.ts
  - src/actions/site-content.ts
  - src/actions/bookings.ts
  - src/actions/orders.ts
  - src/actions/profile.ts
  - src/actions/refunds.ts
  - src/actions/email.ts
  - src/actions/customers.ts
  - src/actions/checkout.ts
  - src/app/api/webhooks/stripe/route.ts
  - src/app/api/webhooks/resend/route.ts
  - src/app/api/page-content/route.ts
  - src/app/api/page-content/[pageId]/route.ts
  - src/app/api/upload/route.ts
  - src/app/api/auth/google/callback/route.ts
