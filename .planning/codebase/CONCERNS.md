# Codebase Concerns

**Analysis Date:** 2026-04-07

---

## CRITICAL

### Firebase service account key file in project root

- **Issue:** `roots-and-culture-firebase-adminsdk-fbsvc-ecf479a4eb.json` is a live service account credentials file sitting in the project root. It contains the private key in plaintext.
- **Files:** `roots-and-culture-firebase-adminsdk-fbsvc-ecf479a4eb.json`
- **Current status:** The file is excluded by `.gitignore` (`*-firebase-adminsdk-*.json`) so it has not been committed to git history. However it exists on disk in the working directory alongside the codebase.
- **Risk:** If this file is accidentally committed, pushed to any remote, or exposed via the Vercel deployment pipeline, it grants full admin access to Firestore, Auth, and Storage. A single `git add -A` would commit it.
- **Fix approach:** Delete this file immediately. All server-side Firebase access uses `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` environment variables — the JSON file is not used by the application and has no runtime purpose.

---

### `PUT /api/page-content/[pageId]` has no authentication check

- **Issue:** The `PUT` handler in `src/app/api/page-content/[pageId]/route.ts` writes arbitrary content to Firestore without verifying session or admin role. Only the `DELETE` handler on the same route checks `verifySession`.
- **Files:** `src/app/api/page-content/[pageId]/route.ts` (lines 39–68)
- **Impact:** Any unauthenticated HTTP `PUT` request to `/api/page-content/<any-page-id>` can overwrite page sections in Firestore, including published CMS pages visible to all users.
- **Fix approach:** Add `verifySession` check at the top of the `PUT` handler, identical to the pattern used in `DELETE` (lines 74–76 of the same file).

### `POST /api/page-content` has no authentication check

- **Issue:** The `POST` handler in `src/app/api/page-content/route.ts` creates new CMS pages without verifying session or admin role.
- **Files:** `src/app/api/page-content/route.ts` (lines 28–57)
- **Impact:** Any unauthenticated request can create new pages in Firestore.
- **Fix approach:** Add `verifySession` + admin role check before the Firestore write.

---

## HIGH

### Gift card metadata is incorrectly field-mapped in PaymentIntent

- **Issue:** In both `createPaymentIntent` and `updatePaymentIntentMetadata` in `src/actions/checkout.ts`, gift card recipient fields are read from experience-specific fields on the CartItem — `experienceName` for `giftCardRecipientName`, `experienceDate` for `giftCardRecipientEmail`, and `experienceDateId` for `giftCardMessage`.
- **Files:** `src/actions/checkout.ts` (lines 220–222 and 414–416)
- **Impact:** When a customer purchases a gift card, the recipient name, recipient email, and personal message are all empty strings in the PaymentIntent metadata. The webhook at `src/app/api/webhooks/stripe/route.ts` reads these same fields and passes them to `createGiftCard`. The gift card is created with no recipient info and the gift card email is sent with blank fields.
- **Fix approach:** Add dedicated fields to `CartItem` (e.g. `giftCardRecipientName`, `giftCardRecipientEmail`, `giftCardMessage`) and use them instead of reusing experience fields. Alternatively, store the recipient data in the PaymentIntent description or a separate metadata namespace.

### `updateExperience` resets bookedSeats to 0 on every save

- **Issue:** When an admin updates an experience, all existing date subcollection documents are deleted and recreated from scratch. New date documents are always written with `bookedSeats: 0` and `availableSeats: maxSeats`.
- **Files:** `src/actions/experiences.ts` (lines 219–248)
- **Impact:** Any date that already has confirmed bookings will have its seat counters reset, allowing overbooking. The existing booking documents remain in Firestore but the date shows full availability again.
- **Fix approach:** When updating dates, preserve existing booking counts. For each date, check if a matching date already exists (by date timestamp or explicit ID), carry over `bookedSeats` and recalculate `availableSeats = maxSeats - bookedSeats`, and only create truly new dates from scratch.

### No security headers on HTTP responses

- **Issue:** `next.config.ts` contains only `images.remotePatterns` — no `async headers()` configuration. There are no Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Strict-Transport-Security headers.
- **Files:** `next.config.ts`
- **Impact:** The site is vulnerable to clickjacking (no `X-Frame-Options`), MIME-sniffing (`X-Content-Type-Options`), and has no CSP to limit XSS impact. Norwegian ecommerce sites must comply with GDPR and may face audit scrutiny for missing security headers.
- **Fix approach:** Add `async headers()` to `next.config.ts` with at minimum: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a permissive initial CSP. Example pattern follows Next.js security headers documentation.

### CMS `section.body` rendered unsanitized in public pages

- **Issue:** `TextImageSection` and `TextSection` render `section.body` from Firestore directly via `dangerouslySetInnerHTML` without HTML sanitization. The blog article component (`ArticleProse`) correctly uses `sanitizeHtml` from `src/lib/sanitize.ts`, but the CMS section components do not.
- **Files:** `src/components/sections/TextImageSection.tsx` (line 33), `src/components/sections/TextSection.tsx` (line 20), `src/app/(public)/om-oss/page.tsx` (line 96)
- **Impact:** If the admin account is compromised or a malicious write occurs via the unauthenticated `PUT` endpoint (see above), arbitrary JavaScript can be injected into public pages.
- **Fix approach:** Wrap all `dangerouslySetInnerHTML={{ __html: content }}` calls in CMS sections with `sanitizeHtml(content)` from `src/lib/sanitize.ts`.

### No error monitoring in production

- **Issue:** The codebase has no Sentry, Datadog, or equivalent error monitoring integration. `error.tsx` and `global-error.tsx` only call `console.error`. Runtime exceptions on Vercel will go undetected unless someone actively watches logs.
- **Files:** `src/app/error.tsx`, `src/app/global-error.tsx`
- **Impact:** Webhook failures, checkout errors, and payment processing issues will be invisible until a customer complains.
- **Fix approach:** Install `@sentry/nextjs` and add `Sentry.captureException(error)` in both error boundaries, and in the webhook catch block at `src/app/api/webhooks/stripe/route.ts` (line that only calls `console.error`).

### No rate limiting on public API routes

- **Issue:** `/api/create-payment-intent`, `/api/auth/session`, `/api/page-content` (POST), `/api/upload`, and the contact/newsletter Server Actions have no rate limiting.
- **Files:** `src/app/api/create-payment-intent/route.ts`, `src/app/api/upload/route.ts`, `src/actions/contact.ts`, `src/actions/newsletter.ts`
- **Impact:** The checkout endpoint can be called in a loop to create large numbers of Stripe PaymentIntents (billing risk). The upload endpoint allows rapid repeated file uploads to Firebase Storage. The contact form can be spammed without friction.
- **Fix approach:** Use Vercel's built-in rate limiting middleware or an edge middleware using `@upstash/ratelimit` (Redis-backed). At minimum protect `/api/create-payment-intent` and `/api/upload`.

---

## MEDIUM

### `revalidateTag` called with undocumented second argument throughout codebase

- **Issue:** All Server Actions call `revalidateTag('tag-name', 'max')` with two arguments. According to Next.js source (verified in `node_modules/next/dist/server/lib/revalidate.js`), `revalidateTag` takes a second argument as a `profile` parameter — this is an internal/undocumented API. The correct documented API for time-based cache invalidation is `revalidatePath` or calling `revalidateTag` with only one argument.
- **Files:** `src/actions/experiences.ts`, `src/actions/products.ts`, `src/actions/orders.ts`, `src/actions/bookings.ts`, `src/actions/refunds.ts`, `src/actions/site-content.ts`, `src/app/api/page-content/[pageId]/route.ts`
- **Impact:** Low immediate risk — it appears to work today — but this pattern relies on an undocumented internal argument that may break on a Next.js upgrade.
- **Fix approach:** Remove the `'max'` second argument from all `revalidateTag` calls. Example: `revalidateTag('products', 'max')` → `revalidateTag('products')`.

### `isEarlybird` flag missing in `updatePaymentIntentMetadata`

- **Issue:** In `createPaymentIntent` (line 211), booking items include `isEarlybird: i.isEarlybird ?? false` in the metadata. In `updatePaymentIntentMetadata` (lines 397–406), the same booking items mapping omits the `isEarlybird` field entirely.
- **Files:** `src/actions/checkout.ts` (lines 396–406)
- **Impact:** When a user applies a gift card after the initial PaymentIntent is created, `updatePaymentIntentMetadata` overwrites the booking items metadata. The webhook then reads `isEarlybird` as `undefined` → `false`, potentially creating bookings with wrong earlybird status.
- **Fix approach:** Add `isEarlybird: i.isEarlybird ?? false` to the booking items map inside `updatePaymentIntentMetadata`.

### `placeholder@init.no` email used to initialize Stripe PaymentIntent

- **Issue:** The checkout page creates a PaymentIntent immediately on load using `{ email: 'placeholder@init.no' }` as the customer email. The server action detects this via string comparison (`formData.email === 'placeholder@init.no'`) and skips validation. This is a fragile string-based sentinel that bypasses all schema validation.
- **Files:** `src/app/(public)/checkout/page.tsx` (line 56), `src/actions/checkout.ts` (line 59)
- **Impact:** The sentinel pattern skips Zod validation entirely on the first call. It also means every checkout creates a PaymentIntent (potentially with no matching order) even if the user abandons immediately. Stripe will accumulate many abandoned PaymentIntents.
- **Fix approach:** Pass an explicit `isInit: true` flag in the request body rather than using a sentinel email. Or delay PaymentIntent creation until the user advances past step 1. The current approach also means Stripe receives `placeholder@init.no` as `receipt_email` if something goes wrong before metadata is updated.

### Admin dashboard loads all orders and all bookings on every page render

- **Issue:** `src/app/admin/page.tsx` calls `getOrders()` and `getBookingsFiltered()` (both return up to 100 documents). `getOrders` in `src/lib/data/orders.ts` uses `unstable_cache` but has no `revalidate` time set — only a tag. `getFirestoreOrderStats` in `src/actions/orders.ts` (line 179) fetches ALL orders from Firestore without a limit for revenue calculation.
- **Files:** `src/app/admin/page.tsx`, `src/actions/orders.ts` (lines 179–189), `src/lib/data/orders.ts` (lines 31–45)
- **Impact:** `getFirestoreOrderStats` is an unbounded full-collection scan. With 1,000+ orders this becomes slow and expensive. The dashboard also issues 7 parallel Firestore/Stripe requests on every cold render.
- **Fix approach:** Store running totals in a separate Firestore `stats` document updated by the webhook instead of scanning all orders. Add a `revalidate: 300` to the orders `unstable_cache` config.

### Emails are plain-text only, no HTML version

- **Issue:** All email templates in `src/lib/email/templates.ts` return only a `text` field. Resend sends plain-text emails with no HTML body. Order confirmation emails from major Norwegian ecommerce competitors use styled HTML.
- **Files:** `src/lib/email/templates.ts`
- **Impact:** Emails look unprofessional and may be flagged as spam by some providers. No order confirmation links, no product images, no branding.
- **Fix approach:** Add an `html` field alongside `text` in each template function. Can use template literals with inline styles; does not require a library.

### `getOrders` admin action duplicated between `src/actions/orders.ts` and `src/lib/data/orders.ts`

- **Issue:** Both files export a `getOrders` function. `src/actions/orders.ts` has an additional `'use server'` directive and its `getOrders` does NOT use `unstable_cache`. `src/lib/data/orders.ts` has the cached version. The admin page imports from `src/actions/orders.ts` (uncached), not from `src/lib/data/orders.ts`.
- **Files:** `src/actions/orders.ts` (lines 58–68), `src/lib/data/orders.ts` (lines 31–45)
- **Impact:** The admin orders page always bypasses the cache and hits Firestore on every render.
- **Fix approach:** Remove the duplicate `getOrders` from `src/actions/orders.ts` or have it delegate to the cached version from `src/lib/data/orders.ts`.

---

## LOW

### Placeholder team member names on `om-oss` page

- **Issue:** The team section of `src/app/(public)/om-oss/page.tsx` (lines 40–43) contains `'Navn Navnesen'` three times as placeholder names and roles.
- **Files:** `src/app/(public)/om-oss/page.tsx`
- **Impact:** Visible to all public visitors.
- **Fix approach:** Replace with real names/roles or conditionally hide the team section until content is ready.

### Fallback `'kunde@example.com'` shown in ConfirmationModal

- **Issue:** `src/app/(public)/checkout/page.tsx` (line 84) passes `customerEmail || 'kunde@example.com'` to `ConfirmationModal`. If `customerEmail` is empty for any reason, the confirmation screen shows `kunde@example.com` to the customer.
- **Files:** `src/app/(public)/checkout/page.tsx` (line 84)
- **Fix approach:** Fall back to an empty string and handle the missing email case in `ConfirmationModal` with a generic message.

### `RESEND_WEBHOOK_SECRET` and `RESEND_FROM_EMAIL` not in `validateEnv`

- **Issue:** `src/lib/env.ts` only validates `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and (in production) `SESSION_SECRET`. `RESEND_API_KEY` is listed as optional with a warning. `RESEND_WEBHOOK_SECRET` and `RESEND_FROM_EMAIL` are not mentioned at all. If `RESEND_API_KEY` is missing, emails silently fail (resend is `null`), no customer receives confirmation.
- **Files:** `src/lib/env.ts`, `src/lib/email/resend.ts`
- **Impact:** Email delivery silently stops in production if the Resend key is missing or rotated.
- **Fix approach:** Move `RESEND_API_KEY` to the required list (at least in production). Add a startup warning for `RESEND_FROM_EMAIL` and `RESEND_WEBHOOK_SECRET`.

### Mock data fallback active in production if Firebase env vars missing

- **Issue:** All data access functions in `src/lib/data/products.ts`, `src/lib/data/experiences.ts`, `src/lib/data/articles.ts`, `src/lib/data/page-content.ts`, and `src/lib/data/site-content.ts` fall back to `mockProducts`, `mockExperiences`, etc. from `src/lib/data/mock-data.ts` when `adminDb` is null.
- **Files:** `src/lib/data/products.ts` (line 46), `src/lib/data/experiences.ts` (lines 59, 79, 101), `src/lib/data/articles.ts`, `src/lib/data/site-content.ts`
- **Impact:** If Firebase environment variables are misconfigured on Vercel, the site silently serves mock data (fake products with hardcoded prices, fake experiences) rather than failing visibly. A customer could add a mock product to cart and attempt payment.
- **Fix approach:** In production (`NODE_ENV === 'production'`), throw instead of returning mock data when `adminDb` is null. Keep the fallback only for build time and local dev without credentials.

### `GET /api/page-content` returns all CMS pages including unpublished

- **Issue:** `src/app/api/page-content/route.ts` returns all documents from the `pageContent` Firestore collection including drafts (`isPublished: false`). There is no authentication check on GET.
- **Files:** `src/app/api/page-content/route.ts` (lines 7–22)
- **Impact:** Draft pages are exposed via the public API. The content is CMS content only (no PII), so risk is low, but unpublished marketing content may be leaked.
- **Fix approach:** Either filter to `isPublished: true` for unauthenticated requests, or add a session check that returns all pages to admins and only published pages to others.

### No `error.tsx` boundary below the root for checkout and konto routes

- **Issue:** There is only one `src/app/error.tsx`. Checkout (`src/app/(public)/checkout/`) and konto (`src/app/konto/`) do not have their own `error.tsx` files, so any unhandled error in these flows renders the root error boundary which redirects away from the checkout flow entirely.
- **Files:** `src/app/error.tsx`
- **Impact:** A runtime error during checkout (e.g. Stripe Elements failing to render) will show a generic error page, discarding the cart and client secret.
- **Fix approach:** Add `src/app/(public)/checkout/error.tsx` with a payment-specific error message that preserves the cart and offers retry.

### Stripe API version not pinned

- **Issue:** `src/lib/stripe/server.ts` initializes Stripe without specifying `apiVersion`. This means the Stripe SDK uses whatever version Stripe defaults to for the account, which can change without notice.
- **Files:** `src/lib/stripe/server.ts`
- **Fix approach:** Add `apiVersion: '2024-12-18.acacia'` (or the current stable version) to the Stripe constructor options.

### `getStripeOrderStats` fetches only the latest 100 PaymentIntents for revenue stats

- **Issue:** `src/actions/orders.ts` line 203 calls `stripe.paymentIntents.list({ limit: 100 })`. Stripe's list endpoint maximum is 100 per page. If there are more than 100 succeeded PaymentIntents, revenue stats in the admin dashboard will be understated.
- **Files:** `src/actions/orders.ts` (lines 203–213)
- **Impact:** Revenue figures displayed on the admin dashboard will be wrong once the store exceeds 100 orders.
- **Fix approach:** Use Firestore-based revenue stats (the `getFirestoreOrderStats` fallback) exclusively, or implement pagination using Stripe's `auto_paging_iter` when calculating totals.

### No `loading.tsx` for checkout or konto subpages

- **Issue:** `loading.tsx` exists for `/admin/`, `/konto/`, `/blogg/`, `/opplevelser/`, and `/produkter/`, but not for `/checkout/`, `/konto/bookinger/`, `/konto/ordrer/`, or `/konto/profil/`.
- **Files:** `src/app/(public)/checkout/` (missing), `src/app/konto/bookinger/` (missing), `src/app/konto/ordrer/` (missing)
- **Impact:** These pages render nothing during the Suspense streaming phase, creating a flash of blank content.
- **Fix approach:** Add minimal `loading.tsx` skeletons for these routes.

---

*Concerns audit: 2026-04-07*
