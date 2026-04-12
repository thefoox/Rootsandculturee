---
phase: 18-cms-revisjon
reviewed: 2026-04-12T14:22:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - firestore.rules
  - src/actions/articles.ts
  - src/actions/bookings.ts
  - src/actions/experiences.ts
  - src/actions/orders.ts
  - src/actions/products.ts
  - src/actions/refunds.ts
  - src/actions/site-content.ts
  - src/app/admin/ordrer/[id]/page.tsx
  - src/app/api/page-content/[pageId]/route.ts
  - src/app/api/page-content/route.ts
  - src/app/api/upload/route.ts
  - src/app/api/webhooks/stripe/route.ts
  - src/lib/validations.ts
findings:
  critical: 3
  warning: 8
  info: 5
  total: 16
status: issues_found
---

# Phase 18: Code Review Report

**Reviewed:** 2026-04-12T14:22:00Z
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

Reviewed all server actions, API route handlers, Firestore security rules, validation schemas, and one admin client page. The codebase demonstrates solid patterns overall -- consistent admin auth checks via `verifySession()`, Zod validation on mutations, Firestore transactions for seat/stock management, and Stripe webhook signature verification with idempotency.

Key concerns center on: (1) missing Firestore security rules for collections actively written to by the webhook, (2) a server action exposed without auth that reads sensitive booking data, (3) the Stripe webhook returning 200 even on processing errors (masking failures), and (4) several null-safety issues where `.data()` is called on potentially missing documents without existence checks.

## Critical Issues

### CR-01: Missing Firestore rules for stripeEvents and order refunds subcollection

**File:** `firestore.rules:1-69`
**Issue:** The Stripe webhook (`src/app/api/webhooks/stripe/route.ts`) writes to two collections that have no Firestore security rules: `stripeEvents` (line 90) and `orders/{orderId}/refunds` (line 426). Without explicit rules, Firestore's default-deny behavior blocks client SDK access, but the lack of explicit rules means there is no documented security posture for these collections. More critically, if any future code uses the client SDK to read these collections, it will silently fail. The `stripeEvents` collection is written to by the admin SDK (which bypasses rules), so this is not a runtime bug today, but it is a security hygiene gap -- rules should explicitly deny client access to financial/webhook data.
**Fix:**
```
// Add after the orders/{orderId}/notes rule block:

// Stripe webhook events — admin SDK only, deny all client access
match /stripeEvents/{eventId} {
  allow read, write: if false;
}

// Order refunds — admin-only read, no client writes
match /orders/{orderId}/refunds/{refundId} {
  allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow write: if false;
}
```

### CR-02: getBookingsByPaymentIntentAction exposed without auth check

**File:** `src/actions/bookings.ts:85-89`
**Issue:** The `getBookingsByPaymentIntentAction` server action is exported as a public server action (in a `'use server'` file) but performs no authentication or authorization check. Any client can call this action with a `paymentIntentId` to retrieve booking details including customer email, name, phone, and confirmation codes. The underlying `getBookingsByPaymentIntent` function in `lib/data/bookings.ts` also has no auth guard. While the function is currently called only from `ConfirmationModal.tsx` (which uses it to display booking confirmation after payment), a payment intent ID is not a secret -- Stripe surfaces it in URLs and client-side metadata.
**Fix:**
```typescript
export async function getBookingsByPaymentIntentAction(
  paymentIntentId: string
): Promise<Booking[]> {
  const session = await verifySession()
  if (!session) return []
  return getBookingsByPaymentIntent(paymentIntentId)
}
```
At minimum, require the user to be logged in. Ideally, also filter results to only return bookings where `customerId` matches `session.uid`, unless the user is an admin.

### CR-03: Stripe webhook returns 200 on processing errors, masking failures

**File:** `src/app/api/webhooks/stripe/route.ts:471-475`
**Issue:** The outer try/catch at line 471 catches all processing errors and logs them, but then returns `{ received: true }` with status 200. This tells Stripe the webhook was successfully processed, so Stripe will never retry the event. If the `payment_intent.succeeded` handler fails mid-way (e.g., order created but booking transaction fails, or stock decrement fails), the system enters an inconsistent state with no automatic recovery. Stripe retries are a critical safety net for webhook reliability.
**Fix:**
```typescript
  } catch (err) {
    console.error('Webhook processing error:', err)
    // Return 500 so Stripe retries the event
    return NextResponse.json(
      { error: 'Webhook processing failed.' },
      { status: 500 }
    )
  }
```
Note: This is safe because the idempotency check at line 84-87 prevents double-processing on retry. However, the idempotency marker is written *before* processing (line 90-93), which means a failed event will be marked as processed and skipped on retry. The idempotency write should be moved to *after* successful processing, or the marker should include a status field that differentiates "processing" from "completed."

## Warnings

### WR-01: Null-unsafe .data() calls after fetching documents without existence check

**File:** `src/actions/articles.ts:144-154`, `src/actions/experiences.ts:210-221`, `src/actions/products.ts:174-183`
**Issue:** In `updateArticle`, `updateExperience`, and `updateProduct`, the code fetches the existing document and calls `.data()` on it without checking `.exists` first. If the document was deleted between the form load and submission, `.data()` returns `undefined` and `existing.publishedAt` throws a TypeError at runtime.
**Fix:**
```typescript
// Example fix for updateArticle (line 144):
const existingDoc = await adminDb.collection('articles').doc(id).get()
if (!existingDoc.exists) {
  return { success: false, errors: { _form: 'Artikkelen ble ikke funnet.' } }
}
const existing = existingDoc.data()
```
Apply the same pattern to `updateExperience` (line 210-211) and `updateProduct` (line 174-175).

### WR-02: Idempotency key in refund uses Date.now(), not truly idempotent

**File:** `src/actions/refunds.ts:53`
**Issue:** The idempotency key `refund-${orderId}-${Date.now()}` includes a timestamp, which means every call generates a unique key. This defeats the purpose of idempotency protection -- if the admin accidentally double-clicks the refund button, two separate refunds will be created. The key should be deterministic based on the refund parameters.
**Fix:**
```typescript
const refund = await stripe.refunds.create(refundParams, {
  idempotencyKey: `refund-${orderId}-${amount || 'full'}-${reason || 'none'}`,
})
```
Or better, generate a client-side request ID and pass it through to ensure true idempotency.

### WR-03: Upload route does not validate MIME type, only file extension

**File:** `src/app/api/upload/route.ts:79-85`
**Issue:** The upload handler validates the file extension from `file.name` but does not check the actual MIME type (`file.type`) or file content magic bytes. An attacker with admin access could upload an HTML file renamed to `.jpg`, which when served could execute XSS in the context of the storage domain. While the file is served from `firebasestorage.googleapis.com` (different origin), SVG files are particularly dangerous as they can contain JavaScript and the route allows `.svg` uploads.
**Fix:** Add MIME type validation alongside extension validation:
```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
]

if (!ALLOWED_MIME_TYPES.includes(file.type)) {
  return NextResponse.json(
    { error: 'Ugyldig filtype.' },
    { status: 400 }
  )
}
```
For SVG specifically, consider sanitizing the content to strip `<script>` tags and event handlers, or disallow SVG uploads entirely.

### WR-04: pageContentUpdateSchema does not validate slug format

**File:** `src/lib/validations.ts:119-126`
**Issue:** The `pageContentUpdateSchema` validates `slug` as simply `z.string().min(1)` with no format constraint, while `pageContentCreateSchema` (line 116) enforces `/^[a-z0-9-/]+$/`. This inconsistency means a page created with a valid slug can be updated to have an invalid slug containing special characters, spaces, or uppercase letters, which could break routing.
**Fix:**
```typescript
export const pageContentUpdateSchema = z.object({
  title: z.string().min(1, 'Tittel er pakrevd.').max(200),
  slug: z.string().min(1, 'Slug er pakrevd.').regex(/^[a-z0-9-/]+$/, 'Slug kan kun inneholde sma bokstaver, tall, bindestreker og skrastrek.'),
  isPublished: z.boolean(),
  showInNavigation: z.boolean(),
  navigationOrder: z.number().int().min(0),
  sections: z.array(pageSectionSchema),
})
```

### WR-05: GET /api/page-content filters out unpublished pages from admin listing

**File:** `src/app/api/page-content/route.ts:28`
**Issue:** The GET handler at line 28 filters with `.filter((page) => page.isPublished !== false)`. This is the admin CMS API endpoint (protected by admin auth check on line 7-9), but it hides unpublished/draft pages from the admin. An admin creating a new page (which starts as `isPublished: false` per POST handler line 60) will not see it in the page list until they somehow publish it -- but they cannot publish it if they cannot access it.
**Fix:** Remove the filter, since this is an admin-only endpoint. All pages should be visible to admins regardless of publish status:
```typescript
const pages = snapshot.docs.map((doc) => {
  // ... mapping logic
})
return NextResponse.json(pages)
```

### WR-06: Webhook idempotency marker written before processing begins

**File:** `src/app/api/webhooks/stripe/route.ts:90-93`
**Issue:** The idempotency marker in `stripeEvents` is written *before* the event is processed (line 90-93). If processing fails (and even with the 200 return issue from CR-03), the event is permanently marked as processed. On retry (if CR-03 is fixed), the idempotency check at line 84-86 will skip the event, leaving the system in an inconsistent state.
**Fix:** Move the idempotency write to after successful processing, or use a two-phase approach:
```typescript
// Before processing: mark as "processing"
await adminDb.collection('stripeEvents').doc(event.id).set({
  type: event.type,
  status: 'processing',
  startedAt: new Date(),
})

// ... process event ...

// After success: mark as "completed"
await adminDb.collection('stripeEvents').doc(event.id).update({
  status: 'completed',
  processedAt: new Date(),
})
```
And update the idempotency check to only skip events with status `'completed'`.

### WR-07: Empty catch blocks silently swallow errors in webhook JSON parsing

**File:** `src/app/api/webhooks/stripe/route.ts:109-111`
**Issue:** Three consecutive `try { JSON.parse(...) } catch { /* empty */ }` blocks silently swallow parse errors for `orderItems`, `bookingItems`, and `giftCardItems`. If Stripe metadata is malformed, the webhook will proceed with empty arrays, creating an order with zero items -- or worse, creating an order document but skipping all stock decrements and booking confirmations.
**Fix:** At minimum, log the parse failures. Ideally, if all three arrays are empty after parsing, treat it as an error condition:
```typescript
try { orderItems = JSON.parse(metadata.orderItems || '[]') } catch (e) {
  console.error('Failed to parse orderItems metadata:', e)
}
try { bookingItems = JSON.parse(metadata.bookingItems || '[]') } catch (e) {
  console.error('Failed to parse bookingItems metadata:', e)
}
try { giftCardItems = JSON.parse(metadata.giftCardItems || '[]') } catch (e) {
  console.error('Failed to parse giftCardItems metadata:', e)
}

if (orderItems.length === 0 && bookingItems.length === 0 && giftCardItems.length === 0) {
  console.error('No items found in payment metadata:', paymentIntent.id)
  // Consider whether to proceed or bail
}
```

### WR-08: createOrder server action has no auth check

**File:** `src/actions/orders.ts:76-85`
**Issue:** The `createOrder` function is exported from a `'use server'` file but has no `verifySession()` check. Any client could call this server action to create arbitrary order documents in Firestore. While the Firestore rules block client writes to orders (`allow write: if false`), the server action uses `adminDb` which bypasses rules. Currently this function appears to only be imported within the webhook handler, but as a public server action it represents an authorization bypass.
**Fix:** Either add an auth check, or move this function to a non-`'use server'` module (e.g., `lib/data/orders.ts`) so it is not exposed as a callable server action:
```typescript
export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt'>
): Promise<string> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    throw new Error('Ikke autorisert.')
  }
  // ...
}
```

## Info

### IN-01: Read-only server actions lack auth guards

**File:** `src/actions/articles.ts:34-46`, `src/actions/experiences.ts:48-68`, `src/actions/products.ts:36-48`, `src/actions/site-content.ts:9-20`
**Issue:** Functions like `getAllArticles`, `getArticleById`, `getAllExperiences`, `getExperienceById`, `getAllProducts`, `getProductById`, `getExperienceDatesAdmin`, and `fetchSiteContent` are public server actions without auth checks. While these return data that is either publicly readable or used in admin pages, exposing them as unauthenticated server actions means any client can call them to enumerate all articles (including drafts), products (including unpublished), and experiences. The admin SDK bypasses Firestore rules, so draft/unpublished content is returned.
**Fix:** Add auth guards to functions returning admin-sensitive data, or move them to `lib/data/` modules that are not `'use server'`.

### IN-02: console.error calls in production code

**File:** `src/actions/articles.ts:103`, `src/actions/orders.ts:71`, `src/app/api/webhooks/stripe/route.ts:472`, `src/app/api/upload/route.ts:140,153`
**Issue:** Multiple `console.error` calls throughout production code. While these aid debugging, they may leak sensitive information to server logs without structured logging. Consider a structured logging utility.
**Fix:** Not urgent. Consider introducing a logger utility that adds context (request ID, timestamp) and controls log levels per environment.

### IN-03: Hardcoded hex color values in admin page

**File:** `src/app/admin/ordrer/[id]/page.tsx:364,397,417,432-435`
**Issue:** Several hardcoded hex colors (`#C0392B`, `#DCFCE7`, `#166534`, `#FEF3C7`, `#92400E`) are used inline rather than through Tailwind theme tokens. This is inconsistent with the project's Tailwind-based design system.
**Fix:** Define semantic color tokens in the Tailwind theme (e.g., `text-error`, `bg-success-light`) and reference them in markup.

### IN-04: Unused import in orders action

**File:** `src/actions/orders.ts:4`
**Issue:** The `stripe` import from `@/lib/stripe/server` is only used in `getStripeOrderStats` and `getRecentStripePayments`, but the import is at the top level. This is not a bug (tree-shaking handles it), but the import pulls in the Stripe SDK for any server action call to this module.
**Fix:** Consider lazy-importing Stripe only in functions that need it, using dynamic `import()`.

### IN-05: Order detail page is fully client-rendered

**File:** `src/app/admin/ordrer/[id]/page.tsx:1`
**Issue:** The order detail page uses `'use client'` and fetches all data via `useEffect`, meaning it has no SSR benefit, shows a loading state on every navigation, and is not crawlable (though admin pages do not need SEO). For consistency with Next.js App Router patterns, consider making this a server component that fetches data at the page level and passes it to client interactive sections.
**Fix:** Not urgent. Refactoring to a server component with client islands would improve initial load performance and align with the project's SSR-first architecture.

---

_Reviewed: 2026-04-12T14:22:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
