---
status: awaiting_human_verify
trigger: "rest-api-regression — After replacing firebase-admin with a Firestore REST API client, multiple things are broken on Vercel: products/experiences don't display, logout doesn't work, possible cookie/env var issues"
created: 2026-04-10T00:00:00Z
updated: 2026-04-10T00:00:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: Two independent failure modes confirmed:
  (1) Products/experiences show empty or show mock data because either the Firestore query returns 0 results (no published docs in DB) OR OAuth2 token fails silently with fallback to mockProducts
  (2) Logout structurally correct but the client's window.location.href = '/' after logoutAction() may fail to reflect deleted cookie if there is a timing/race condition in Next.js 15 App Router server action cookie mutation

test: Code review complete — all REST client mechanics verified structurally correct
expecting: Fixing error logging + making logout use redirect() inside server action ensures reliable behavior
next_action: implementing fixes

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Products and experiences should display real Firestore data. Logout should work. Session cookies should be properly managed.
actual: Products/experiences don't show. Can't log out after logging in. Something fundamentally wrong with the REST API migration code.
errors: No specific error messages — pages likely show empty or mock data. Logout button doesn't work.
reproduction: Visit production site on Vercel. Products/experiences pages are empty. Log in then try to log out — doesn't work.
started: Immediately after firebase-admin → Firestore REST API migration was deployed (commit a190b10). Previous firebase-admin code worked locally but crashed on Vercel due to native gRPC deps.

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-10
  checked: firestore-rest.ts — JWT signing, OAuth2 token exchange, query encoding, URL construction
  found: JWT structure is correct (jose SignJWT with payload claims works). OAuth2 scope is correct. URL construction for runQuery is correct. Value encoding/decoding is correct. The only runtime uncertainty is whether FIREBASE_PRIVATE_KEY has correct newlines.
  implication: If the private key is correctly formatted (actual \n not literal backslash-n), the REST client should work.

- timestamp: 2026-04-10
  checked: session.ts — createSession and deleteSession
  found: createSession sets cookie with path:/ secure:true sameSite:lax. deleteSession calls cookies().delete(name) which in Next.js edge-runtime sets value='', expires=epoch(0), path='/' by default. Structurally correct.
  implication: Logout should work. But the Admin Sidebar calls logoutAction() without await and without redirect — this is a bug.

- timestamp: 2026-04-10
  checked: AdminSidebar.tsx logout button
  found: onClick={() => logoutAction()} — NOT awaited. No redirect after. This is broken logout for admin.
  implication: Admin logout fires the server action without waiting for it, so the cookie is never reliably cleared before the user continues interacting.

- timestamp: 2026-04-10
  checked: Header.tsx logout flow
  found: await logoutAction() then window.location.href = '/'. Structurally correct.
  implication: Header logout IS awaited correctly. But logoutAction returns void with no redirect — the recommended pattern in Next.js App Router docs is to call redirect() inside the server action.

- timestamp: 2026-04-10
  checked: products.ts / experiences.ts — data fetcher fallback logic
  found: getProducts() falls back to mockProducts ONLY when _getProducts() THROWS. If _getProducts() SUCCEEDS and returns [], getProducts() returns []. So if Firestore is reachable but has 0 published products, the empty state shows (not mock data).
  implication: This is a BEHAVIOR CHANGE from before migration. Before: firebase-admin always crashed -> always showed mockProducts. After: REST client works -> queries Firestore -> if 0 published items exist, shows EmptyState. User sees 'products don't display' meaning EmptyState, not that the page is broken.

- timestamp: 2026-04-10
  checked: Firestore security rules (firestore.rules)
  found: products/experiences require publishedAt != null for read. Service account token bypasses security rules. So REST API reads all documents.
  implication: Security rules are NOT blocking the REST API reads.

- timestamp: 2026-04-10
  checked: Error swallowing in data fetchers
  found: getProducts/getExperiences catch blocks do console.warn() but don't log the full error stack. On Vercel, this means the actual OAuth2 failure message (e.g., 'invalid_grant', 'DECODER_ROUTINES unsupported') is swallowed and not visible unless you specifically look at function logs.
  implication: Add console.error() with the full error object to make failures visible in Vercel logs.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: |
  Two separate issues found:

  (1) LOGOUT BROKEN (confirmed code bug):
  AdminSidebar.tsx called logoutAction() without awaiting it — the server action
  fired and was immediately abandoned, so the cookie deletion response was never
  processed by the browser. Header.tsx awaited correctly but used window.location.href
  after the action returned void, which is slightly racy. The correct Next.js pattern
  is redirect() inside the server action so cookie deletion and navigation happen
  atomically in one response.

  (2) PRODUCTS/EXPERIENCES EMPTY (behavior change, not a code bug):
  Before migration: firebase-admin always crashed -> exception always thrown ->
  getProducts() catch always returned mockProducts (hardcoded items visible).
  After migration: REST client works correctly -> queries Firestore -> if the
  Firestore database has 0 published products (publishedAt != null), returns []
  -> getProducts() returns [] (no error, no fallback) -> EmptyState shown.
  The REST client code itself is structurally correct. The "fix" is either:
  (a) Add real products via admin panel with publishedAt set, OR
  (b) If OAuth2 is failing, diagnose via /api/debug-firestore endpoint.

fix: |
  1. logoutAction() now calls redirect('/') after deleteSession() — atomic cookie
     deletion + redirect in one server response.
  2. Header.tsx handleLogout() simplified — no client-side navigation code needed
     since redirect() handles it server-side.
  3. AdminSidebar.tsx logout button changed from onClick={() => logoutAction()} to
     a <form action={logoutAction}> with a submit button — properly invokes the
     server action via form submission which handles the redirect response correctly.
  4. Added console.error() with full error details to all data fetcher catch blocks
     so failures are visible in Vercel function logs.
  5. Added console.error() in getAccessToken() that logs status, body, clientEmail,
     projectId, and key preview (first 80 chars) when OAuth2 token exchange fails.
  6. Added /api/debug-firestore diagnostic endpoint (protected by DEBUG_FIRESTORE_KEY
     env var) that tests connection, queries products, and queries published products
     — surfaces the exact failure without code changes.

verification: |
  Deploy to Vercel, then:
  1. Set DEBUG_FIRESTORE_KEY env var on Vercel to a random string.
  2. Hit: curl -H "x-debug-key: YOUR_KEY" https://rootsnew.vercel.app/api/debug-firestore
  3. If productsQuery.ok=true and publishedProductsQuery.docsReturned=0:
     -> REST client works, database just has no published products. Add products via admin.
  4. If productsQuery.ok=false with error containing 'invalid_grant' or 'DECODER':
     -> FIREBASE_PRIVATE_KEY is incorrectly formatted on Vercel. Re-paste the key
        as a raw multi-line value (not JSON-escaped) in Vercel env vars.
  5. Test logout: log in, click logout — should immediately redirect to /.
     Re-visit the site — should show 'Logg inn' button (not profile icon).

files_changed:
  - src/actions/auth.ts (logoutAction now calls redirect('/'))
  - src/components/layout/Header.tsx (handleLogout simplified)
  - src/components/admin/AdminSidebar.tsx (logout uses form action, not fire-and-forget onClick)
  - src/lib/firebase/firestore-rest.ts (better error logging in getAccessToken)
  - src/lib/data/products.ts (console.warn -> console.error in all catch blocks)
  - src/lib/data/experiences.ts (console.warn -> console.error in all catch blocks)
  - src/app/api/debug-firestore/route.ts (new — diagnostic endpoint)
