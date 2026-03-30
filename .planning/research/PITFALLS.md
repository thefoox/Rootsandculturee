# Domain Pitfalls

**Domain:** Norwegian e-commerce + experience booking (Next.js App Router + Firebase + Stripe + Vercel)
**Researched:** 2026-03-30
**Confidence note:** All external search tools are disabled in this environment. Findings are based on training knowledge (cutoff August 2025), which covers this stack comprehensively. Confidence levels reflect that limitation.

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, security vulnerabilities, or legal exposure.

---

### Pitfall 1: Firebase Auth in Server Components — Using Client SDK on the Server

**What goes wrong:** Developers import `firebase/auth` (client SDK) inside Next.js Server Components or Route Handlers, then call `getAuth().currentUser` expecting a user object. This always returns `null` on the server because the client SDK stores state in browser memory, not on the server. The page renders as unauthenticated even when the user is logged in.

**Why it happens:** Firebase's client SDK documentation shows `getAuth().currentUser`, which works in browser context. Developers new to App Router assume the same call works universally.

**Consequences:**
- Protected pages render as public (security hole or blank pages)
- SSR-rendered HTML has no user data, causing hydration mismatches
- Session cookies are never checked, so auth state is invisible to the server

**Prevention:**
- Use `firebase-admin` SDK on the server exclusively. Never import `firebase/auth` in server components or route handlers.
- Pattern: client sets a session cookie (via `/api/session` endpoint) after login using `firebase/auth` + `getIdToken()`. Server reads that cookie and verifies with `admin.auth().verifySessionCookie()` or `verifyIdToken()`.
- Use `next/headers` `cookies()` to read the session cookie in Server Components.
- Consider the `next-firebase-session` pattern or similar middleware-based session management.

**Detection:** Auth state is always undefined/null in Server Component props. Protected routes render for anonymous users. Console warnings about hydration mismatch involving user data.

**Phase:** Foundation / Authentication phase. Must be correct from day one — retrofitting this pattern after building protected pages is expensive.

---

### Pitfall 2: Booking Race Conditions — Not Using Firestore Transactions for Spot Decrement

**What goes wrong:** When a spot is booked, two concurrent users read `availableSpots: 3`, both see capacity, both write `availableSpots: 2`, and both get confirmed bookings — but only one spot was actually consumed. The experience ends up overbooked.

**Why it happens:** Developers use simple reads + writes: `getDoc(experienceRef)` then `updateDoc(experienceRef, { availableSpots: current - 1 })`. This is not atomic. Under concurrent load the read-modify-write is not isolated.

**Consequences:**
- Overbooking: more confirmed customers than physical spots
- Legal liability under Norwegian consumer law (confirmed bookings are binding contracts)
- Manual cancellations, refunds, reputational damage

**Prevention:**
- Use Firestore transactions (`runTransaction`) for all booking writes. The transaction reads `availableSpots`, checks `> 0`, decrements, and writes the booking document atomically. Firestore retries the transaction on contention.
- Structure: single transaction that (1) reads experience doc, (2) checks spots > 0, (3) creates booking document, (4) decrements `availableSpots` — all or nothing.
- Cloud Functions (or Next.js Route Handler secured server-side) should own the booking write, never the client directly.
- Add a `status: 'pending' | 'confirmed' | 'cancelled'` field on booking documents. Only confirmed bookings count against capacity.

**Detection:** Stress test with concurrent booking requests. Check if final `availableSpots` matches expected value after N concurrent bookings. A non-transactional implementation will show wrong counts.

**Phase:** Booking system phase. Architect this correctly before building the checkout flow — changing the atomicity model after Stripe integration is painful.

---

### Pitfall 3: Stripe Webhooks Without Idempotency — Double-Fulfillment

**What goes wrong:** Stripe retries webhooks when it doesn't receive a 200 response within a timeout, or when network errors occur. If the handler is not idempotent, the same `payment_intent.succeeded` event triggers order fulfillment, booking confirmation, or inventory updates multiple times. Customers get duplicate booking confirmations; inventory goes negative.

**Why it happens:** Webhook handlers are written as: "receive event → create order → send email." No check whether the event was already processed.

**Consequences:**
- Duplicate orders created in Firestore
- Multiple confirmation emails sent to customer
- `availableSpots` decremented twice for one booking
- Inventory counts go negative for physical products

**Prevention:**
- Store processed Stripe event IDs in Firestore. Before processing: check `stripeEvents/{eventId}` exists. If yes, return 200 immediately. If no, write the event ID and then process.
- Use Stripe's `idempotencyKey` when creating payment intents (use the Firestore document ID or a stable client-generated key).
- Structure webhook processing as a Firestore transaction where possible.
- Always return HTTP 200 to Stripe even for duplicate events (to stop retries).
- Verify webhook signatures using `stripe.webhooks.constructEvent(body, sig, webhookSecret)` — raw body required, not parsed JSON.

**Detection:** Inspect Firestore for duplicate order documents with the same `stripePaymentIntentId`. Check email logs for duplicate sends. Stripe Dashboard shows retry counts.

**Phase:** Checkout/Payment phase. Must be implemented alongside the webhook handler — not as a later hardening step.

---

### Pitfall 4: Stripe Webhook Raw Body Parsing — Silent Signature Failures

**What goes wrong:** Next.js App Router Route Handlers parse the request body as JSON by default when using `request.json()`. Stripe webhook signature verification requires the raw, unparsed body bytes. Using the parsed JSON causes `stripe.webhooks.constructEvent` to always throw `WebhookSignatureVerificationError`, and either webhooks silently fail or the developer disables signature verification entirely.

**Why it happens:** `request.json()` is the natural way to read POST body in App Router. The need for raw bytes is not obvious until the error appears.

**Consequences:**
- If verification is skipped: webhook endpoint accepts forged events — an attacker can trigger fake `payment_intent.succeeded` events to get free orders
- If verification is kept but broken: all webhooks return 500, Stripe retries indefinitely, no orders are fulfilled

**Prevention:**
- In the Route Handler, use `request.text()` (not `request.json()`) to get the raw string body, then pass it to `stripe.webhooks.constructEvent(rawBody, sig, secret)`.
- Alternatively use `request.arrayBuffer()` and convert to Buffer.
- Never disable signature verification in production, even temporarily.
- Add a dedicated test for this using `stripe trigger payment_intent.succeeded` in dev.

**Detection:** `WebhookSignatureVerificationError` in logs. Stripe Dashboard shows all webhook deliveries failing. Orders not being created after successful payment.

**Phase:** Payment integration phase. Test this on day one of webhook implementation.

---

### Pitfall 5: Firestore Security Rules Left Open or Overly Permissive

**What goes wrong:** During development, rules are set to `allow read, write: if true;` for convenience. This is forgotten or never tightened before deployment. Alternatively, rules check `request.auth != null` but don't validate that a user can only access their own data — any authenticated user can read/write any other user's orders and bookings.

**Why it happens:** Firestore security rules feel like an afterthought when admin SDK on the server "handles security." But client-side Firebase calls (real-time listeners, client SDK writes) bypass server-side validation entirely.

**Consequences:**
- Any user can read all orders, bookings, customer addresses — GDPR violation
- Any user can modify other users' bookings (cancellation, data corruption)
- Admin documents (products, experiences) writable by any authenticated user
- GDPR fines under Norwegian law (Datatilsynet enforcement)

**Prevention:**
- Write security rules from day one, in lockstep with data model design.
- Pattern: `allow read, write: if request.auth.uid == resource.data.userId;` for user-scoped documents.
- Admin operations should only use the Admin SDK from server-side (never client SDK for admin writes).
- Use Firebase emulator to test rules before deploying — `firebase emulator:exec` with rules tests.
- Never grant `write` on experience/product collections to non-admin users via client SDK.

**Detection:** Firebase Console > Firestore > Rules Playground — test unauthenticated and cross-user access. Run `firebase emulator:start` and execute rules unit tests.

**Phase:** Foundation phase. Rules must be written before any data is written from production.

---

### Pitfall 6: Vercel Serverless Function Timeout — Long-Running Operations

**What goes wrong:** Vercel Hobby plan has a 10-second function timeout; Pro plan allows up to 60 seconds. Complex checkout flows that (1) validate inventory, (2) create Stripe payment intent, (3) write to Firestore, (4) send email confirmation can exceed this under load or slow network conditions. The function times out mid-operation, leaving Firestore in an inconsistent state (payment taken, order not created).

**Why it happens:** Developers build checkout as a single monolithic API route that does everything synchronously. This works in local dev but fails under real conditions.

**Consequences:**
- Payment taken but no order created — manual reconciliation required
- Customer sees error page but their card is charged
- Partial booking state (Stripe session created, Firestore not updated)

**Prevention:**
- Keep Route Handlers lean: create the Stripe Checkout Session (fast) and return the URL. Let Stripe's webhook handle the fulfillment asynchronously after payment confirmation.
- Never perform email sending inside the synchronous checkout route — trigger it from the webhook handler.
- Use Firestore's `serverTimestamp()` and a pending order document that gets confirmed by the webhook, not by the initial request.
- On Vercel Pro, set `maxDuration` in route config if needed, but prefer async patterns.

**Detection:** Vercel function logs showing timeout errors. Stripe Dashboard showing sessions with no corresponding webhook processing. Customer support reports of "charged but no confirmation."

**Phase:** Checkout phase. Architecture decision — async fulfillment via webhook is the correct pattern from the start.

---

### Pitfall 7: Norwegian Cookie Consent — Ignoring Ekomloven and GDPR Consent Requirements

**What goes wrong:** The site deploys with Google Analytics, Firebase Analytics, or any third-party tracking without a cookie consent banner. Norway's ekomloven §2-7b requires informed consent before storing non-essential cookies or accessing device information. This applies even for Norwegian-only sites. Many developers assume this only matters for large companies or that "functional" cookies are exempt.

**Why it happens:** Cookie law compliance feels like a legal problem, not a technical one. It gets deferred until "the site is done." But adding it retroactively means auditing every third-party script already deployed.

**Consequences:**
- Violation of ekomloven and GDPR — Datatilsynet can issue fines
- Firebase Analytics and Google Analytics are non-functional without consent
- If consent is added late, historical data collected without consent is tainted

**Prevention:**
- Decide before writing any code which analytics/tracking will be used. Only load analytics scripts after user consent.
- Use a compliant consent management platform (CMP) — Cookiebot, CookieYes, or a custom solution — from day one.
- For Firebase Analytics: initialize conditionally based on consent state. Use `firebase/analytics` lazily with `isSupported()` check.
- Strictly necessary cookies (session, CSRF, shopping cart) do not require consent — document these explicitly.
- Store consent choice in a first-party cookie (not localStorage for GDPR compliance).

**Detection:** Audit with a cookie scanner (e.g., cookiebot.com/en/cookie-check/) before launch. If any third-party cookies fire before consent is given, compliance is broken.

**Phase:** Foundation phase. Must be designed into the architecture before any analytics integration.

---

## Moderate Pitfalls

---

### Pitfall 8: Firestore Data Model — Denormalization Neglect

**What goes wrong:** Developers model data relationally (foreign keys / nested references) and then discover Firestore cannot do JOINs. Displaying an order summary requires fetching the order document, then separately fetching each product document, then each experience document — N+1 query problem. Pages become slow and expensive.

**Prevention:**
- Denormalize at write time. When an order is created, snapshot the product name, price, image URL, and experience date into the order document itself. The order record must be self-contained.
- Booking documents should contain the experience title, date, and spot count — not just a reference to the experience document.
- Accept that some data duplication is intentional and correct in Firestore. Design read patterns first, then model data to match.
- Use subcollections for 1:many relationships owned by a parent (e.g., `users/{uid}/orders/{orderId}`).

**Detection:** Any page that requires more than 1-2 Firestore reads to display a list is likely under-denormalized.

**Phase:** Foundation / Data modeling phase. Wrong choices here propagate through every feature.

---

### Pitfall 9: Next.js App Router — Mixing Server and Client Component Boundaries Incorrectly

**What goes wrong:** Developers add `'use client'` to large layout components to access browser APIs or hooks, pulling the entire subtree into the client bundle. This eliminates SSR benefits for large portions of the page, increases bundle size, and prevents Server Components in the subtree from accessing server-only resources.

**Prevention:**
- Push `'use client'` to the leaves: small, interactive components only (buttons, forms, dropdowns).
- Pass Server Component data as props to Client Components — never re-fetch in Client Components what was already fetched on the server.
- Use the pattern: Server Component fetches Firestore data → passes as props to Client Component → Client Component handles interaction only.
- Avoid `'use client'` in layout files, page wrappers, or data-fetching components.

**Detection:** Bundle analyzer (`@next/bundle-analyzer`) shows unexpectedly large client bundles. Pages have long Time-to-Interactive despite small visible content.

**Phase:** Foundation phase. Establish the pattern early; retrofitting component boundaries after building 20 pages is painful.

---

### Pitfall 10: Stripe Checkout for Bookings — Not Passing Experience Metadata

**What goes wrong:** The Stripe Checkout Session is created with just a price and quantity. When the webhook fires `checkout.session.completed`, the handler has no context about which experience, which date, and which user made the booking. The handler cannot create the booking document without querying back to find this context.

**Prevention:**
- Pass all required fulfillment data as `metadata` on the Stripe Checkout Session: `{ experienceId, experienceDate, userId, spots }`.
- Also store a pending document in Firestore before redirecting to Stripe, keyed by `stripeSessionId`. The webhook then looks up this document and confirms it.
- The metadata approach is more reliable for recovery scenarios.

**Detection:** Webhook handler has a database query to find "what was being purchased" — this is the symptom. Fulfillment data should come from the event, not require a lookup.

**Phase:** Checkout/Payment phase.

---

### Pitfall 11: Physical Shipping — VAT and Frakt Not Handled Correctly in Stripe

**What goes wrong:** Norwegian VAT (MVA) is 25% on most goods and services. Developers create Stripe products with prices that don't account for VAT, or they add VAT as a separate line item incorrectly. This causes accounting inconsistencies and potential tax compliance issues.

**Prevention:**
- Decide upfront whether prices displayed are inclusive or exclusive of MVA. Norwegian consumer-facing prices must display the full price inclusive of MVA (Markedsføringsloven).
- Configure Stripe Tax for Norwegian VAT or handle VAT calculation manually. If manual: store `priceExVat`, `vatRate: 0.25`, `vatAmount`, `priceIncVat` on every product.
- Stripe supports automatic tax collection — evaluate this before building manual tax logic.
- Shipping costs are also subject to MVA in Norway.

**Detection:** Check if price stored in Stripe matches price shown to customer inclusive of 25% MVA. Run test purchases and verify the Stripe receipt shows correct tax breakdown.

**Phase:** Checkout phase. Must be defined before any test purchases.

---

### Pitfall 12: WCAG 2.1 AA — Automated Testing Misses 70% of Issues

**What goes wrong:** Teams run Lighthouse or axe-core and get a "passing" accessibility score, then consider compliance done. Automated tools only catch approximately 30% of WCAG violations. Issues like keyboard trap in booking modals, focus management after form submission, screen reader announcements for dynamic content (cart updates, booking confirmation), and color contrast in the dark-green-and-autumn-color palette all require manual testing.

**Prevention:**
- Use automated tools (axe-core in CI, Lighthouse) as a minimum baseline, not a certification.
- Conduct keyboard-only navigation tests of every user flow: browse → add to cart → checkout → booking.
- Test with at least one screen reader: NVDA + Firefox (Windows) or VoiceOver + Safari (macOS).
- The dark green + rust red palette requires explicit contrast ratio checks — particularly for text over background and interactive states.
- Use `focus-visible` CSS, not `outline: none`. Never remove focus indicators.
- Norwegian law (Likestillings- og diskrimineringsloven + forskrift om universell utforming av IKT) requires WCAG 2.1 AA — this is a legal obligation, not a best practice.

**Detection:** Try completing a full booking using only the keyboard, no mouse. If you get stuck, there is a WCAG failure.

**Phase:** UI phase and ongoing. Accessibility is not a final audit — it must be built in throughout.

---

### Pitfall 13: Vercel Edge/Serverless — Firebase Admin SDK Initialization Cold Start

**What goes wrong:** `firebase-admin` is initialized at module level in a Route Handler file. On Vercel, serverless functions are stateless — each cold start re-initializes the admin app. If initialization is not guarded with a `getApps().length === 0` check, calling `initializeApp()` multiple times in rapid succession throws "Firebase App named '[DEFAULT]' already exists" errors.

**Prevention:**
- Always guard initialization: `if (!getApps().length) { initializeApp(config); }`.
- Create a single `lib/firebase-admin.ts` file that exports a lazy singleton. Import from this file everywhere — never call `initializeApp` in handler files directly.
- Store Firebase service account credentials in Vercel environment variables (not committed to git).

**Detection:** `FirebaseAppError: Firebase App named '[DEFAULT]' already exists` in Vercel function logs. Usually appears under concurrent traffic, not in single-threaded local dev.

**Phase:** Foundation phase. Set up the singleton pattern before writing any server-side Firebase code.

---

### Pitfall 14: Guest Checkout — Cart State Lost on Navigation

**What goes wrong:** Cart state is stored in React state (not persisted). Guest users add items, navigate to a product page, hit back, and find an empty cart. Worse, they complete checkout and then cannot find their order because there is no account and the order confirmation email is the only record.

**Prevention:**
- Store cart state in `localStorage` (synced to React context via `useEffect` on mount). For guest checkout, persist cart to localStorage keyed by a random `guestId`.
- Associate the `guestId` with the Stripe session metadata so orders can be looked up by guests via order number + email.
- Consider using Zustand or Jotai with localStorage persistence middleware — simpler than building custom sync.

**Detection:** Add an item to cart, navigate away, return — is the cart empty?

**Phase:** Cart/Checkout phase.

---

## Minor Pitfalls

---

### Pitfall 15: Firestore Indexes — Query Failures in Production

**What goes wrong:** Queries that work in the emulator fail in production Firestore with "The query requires an index" error. This is common for composite queries (filter + orderBy on different fields), which are required for most product listing and booking queries.

**Prevention:**
- Use the Firebase emulator from the start — it surfaces missing index requirements.
- When a missing index error occurs, the Firestore error message includes a direct link to create the index — use it, and commit the resulting `firestore.indexes.json` to the repository.
- Plan query patterns before designing the data model to avoid needing compound indexes on high-cardinality fields.

**Detection:** `FirebaseError: The query requires an index` in browser console or server logs on first production deployment.

**Phase:** Any phase that introduces Firestore queries.

---

### Pitfall 16: Next.js Image Optimization — Firebase Storage URLs Not Whitelisted

**What goes wrong:** Product images and experience images are stored in Firebase Storage. Using `<Image>` from `next/image` with Firebase Storage URLs fails with "Invalid src prop" because Firebase Storage hostnames are not in `next.config.js` `images.remotePatterns`.

**Prevention:**
- Add Firebase Storage hostnames to `next.config.js`:
  ```js
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ]
  }
  ```
- Do this before uploading the first image.

**Detection:** Next.js throws an error when rendering any `<Image>` with a Firebase Storage URL. Obvious on first product page render.

**Phase:** Foundation phase / first time images are added.

---

### Pitfall 17: Norwegian Angrerett — Refund Policy Must Be Explicitly Implemented

**What goes wrong:** Norwegian angrerrettloven (right of withdrawal) gives consumers 14 days to return most goods without giving a reason. However, experiences and courses where a specific date is booked are explicitly exempt from angrerett once the date has passed, but only if the customer was clearly informed before purchase. Physical products shipped by post are subject to full angrerett.

**Prevention:**
- Display angrerettinformasjon prominently before checkout for both products and bookings.
- For experiences: show explicit notice that angrerett does not apply after the booking date, per angrerrettloven §22 litra a. Get acknowledgement checkbox.
- For physical products: implement a returns flow and include angreskjema (withdrawal form) in order confirmation.
- This is a legal requirement — not optional copy.

**Detection:** Legal review of checkout flow. Is angrerettinformasjon displayed and acknowledged before payment?

**Phase:** Checkout phase.

---

### Pitfall 18: Environment Variables — Leaking Firebase Config to Client Bundle

**What goes wrong:** Firebase client config (apiKey, projectId, etc.) is placed in `NEXT_PUBLIC_` prefixed variables, which is correct. But the Firebase Admin service account JSON is also accidentally given a `NEXT_PUBLIC_` prefix, leaking the private key into the client bundle and to every visitor.

**Prevention:**
- Firebase client config (`NEXT_PUBLIC_FIREBASE_*`): safe to be public, by design.
- Firebase Admin credentials (service account key): must NOT have `NEXT_PUBLIC_` prefix. Store as `FIREBASE_ADMIN_KEY` or `FIREBASE_SERVICE_ACCOUNT_JSON`. Only accessible server-side.
- Audit `.env.local` and Vercel environment variable settings before launch.

**Detection:** `process.env.NEXT_PUBLIC_FIREBASE_ADMIN_*` in any client-accessible file. Run `next build` and inspect the `.next/static` bundle for service account JSON content.

**Phase:** Foundation phase. Set up environment variables correctly from the first commit.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Auth setup | Client SDK on server (Pitfall 1) | Admin SDK singleton + session cookie pattern from day one |
| Data modeling | Relational thinking in Firestore (Pitfall 8) | Design for reads, denormalize order/booking snapshots |
| Data modeling | Missing Firestore indexes (Pitfall 15) | Use emulator, commit `firestore.indexes.json` |
| Foundation | Firebase Admin cold-start (Pitfall 13) | `lib/firebase-admin.ts` singleton with `getApps()` guard |
| Foundation | Security rules open (Pitfall 5) | Write rules in lockstep with data model |
| Foundation | Firebase Storage image config (Pitfall 16) | Add `remotePatterns` to `next.config.js` immediately |
| Foundation | Environment variable leak (Pitfall 18) | Audit `NEXT_PUBLIC_` prefix usage before first commit |
| Foundation | Cookie consent architecture (Pitfall 7) | Consent-gated analytics before any tracking script is added |
| Booking system | Race conditions (Pitfall 2) | Firestore transaction for every spot decrement |
| Booking system | Metadata on Stripe session (Pitfall 10) | Pass `experienceId`, `date`, `userId` in session metadata |
| Checkout | Webhook raw body (Pitfall 4) | Use `request.text()` not `request.json()` |
| Checkout | Webhook idempotency (Pitfall 3) | Store processed event IDs in Firestore before fulfillment |
| Checkout | Vercel function timeout (Pitfall 6) | Async fulfillment via webhook, not synchronous checkout route |
| Checkout | Norwegian VAT handling (Pitfall 11) | Decide inclusive/exclusive pricing before first test purchase |
| Checkout | Angrerett legal requirements (Pitfall 17) | Acknowledgement checkbox + angrerettinformasjon before payment |
| Cart | Guest cart persistence (Pitfall 14) | localStorage persistence from the first cart implementation |
| UI | App Router client/server boundaries (Pitfall 9) | Keep `'use client'` at leaf components only |
| UI / ongoing | WCAG 2.1 AA insufficient testing (Pitfall 12) | Keyboard + screen reader tests, not just Lighthouse |

---

## Sources

**Confidence: MEDIUM** — External search tools were unavailable in this environment. All findings derive from training knowledge (cutoff August 2025). The technologies covered (Next.js App Router, Firebase Admin SDK, Stripe webhooks, Vercel serverless, Firestore transactions, Norwegian consumer law) are well-established and the patterns described reflect documented behavior and community-documented failure modes. Specific Norwegian legal references (ekomloven, angrerrettloven, WCAG mandate) are from primary legislation known at training cutoff.

Key authoritative sources for validation during implementation:
- Firebase Admin SDK for Node.js: https://firebase.google.com/docs/admin/setup
- Firebase Auth + Next.js session cookies: https://firebase.google.com/docs/auth/admin/manage-sessions
- Firestore transactions: https://firebase.google.com/docs/firestore/manage-data/transactions
- Stripe webhook best practices: https://stripe.com/docs/webhooks/best-practices
- Stripe idempotency: https://stripe.com/docs/api/idempotent_requests
- Next.js App Router + server components: https://nextjs.org/docs/app/building-your-application/rendering
- Vercel function limits: https://vercel.com/docs/functions/limitations
- Norwegian angrerrettloven: https://lovdata.no/dokument/NL/lov/2014-06-20-27
- Norwegian ekomloven §2-7b: https://lovdata.no/dokument/NL/lov/2003-07-04-83
- WCAG 2.1 AA Norwegian mandate: https://uutilsynet.no/wcag-standarden/wcag-21-standarden/86
