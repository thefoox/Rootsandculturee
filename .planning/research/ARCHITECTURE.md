# Architecture Patterns: Roots & Culture

**Domain:** Norwegian e-commerce + experience booking platform
**Stack:** Next.js App Router + Firebase (Firestore, Auth, Storage) + Stripe + Vercel
**Researched:** 2026-03-30
**Confidence:** HIGH — standard, well-documented patterns for this exact stack combination

---

## Recommended Architecture

Single Next.js application on Vercel with Firebase as the backend platform and Stripe for payments. All three user surfaces (public storefront, customer dashboard, admin dashboard) live in the same Next.js codebase and share data models. No separate backend service is needed — Next.js Server Actions and API Route Handlers handle server-side logic.

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js App (Single Codebase)          │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │   Public    │  │   Customer   │  │   Admin   │  │   │
│  │  │  Storefront │  │  Dashboard   │  │ Dashboard │  │   │
│  │  │  /          │  │  /konto/*    │  │ /admin/*  │  │   │
│  │  │  /produkter │  │              │  │           │  │   │
│  │  │  /opplev..  │  │              │  │           │  │   │
│  │  │  /blogg     │  │              │  │           │  │   │
│  │  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  │   │
│  │         │                │                │         │   │
│  │  ┌──────▼────────────────▼────────────────▼──────┐  │   │
│  │  │          Server Actions + API Routes           │  │   │
│  │  │  /api/webhooks/stripe  /api/checkout  etc.     │  │   │
│  │  └──────────────────────┬─────────────────────────┘  │   │
│  └─────────────────────────┼───────────────────────────┘   │
└────────────────────────────┼────────────────────────────────┘
                             │
           ┌─────────────────┼──────────────────┐
           │                 │                  │
    ┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
    │  Firebase   │  │    Stripe    │  │  Firebase    │
    │  Firestore  │  │  (Payments)  │  │  Storage     │
    │  + Auth     │  │              │  │  (Images)    │
    └─────────────┘  └──────────────┘  └──────────────┘
```

---

## Component Boundaries

### 1. Public Storefront (`/`)
**Responsibility:** Product discovery, experience browsing, blog, checkout initiation, guest checkout.
**Rendering:** SSG for catalog/blog pages (ISR for updates), SSR for dynamic pages (cart, checkout).
**Communicates with:**
- Firestore (read: products, experiences, blog posts)
- Server Actions (cart operations, checkout session creation)
- Stripe (redirects to Checkout, receives success/cancel callbacks)

**Key constraint:** All public pages must be indexable by Google. Use Server Components by default. Minimize client-side JS. Ship `use client` only for interactive islands (cart drawer, booking date picker).

### 2. Customer Dashboard (`/konto/*`)
**Responsibility:** Profile management, order history, booking history, password change.
**Rendering:** SSR (requires auth context).
**Communicates with:**
- Firebase Auth (session verification via server-side token check)
- Firestore (read: user's orders, bookings; write: profile updates)

**Key constraint:** All routes behind auth middleware. No customer can read another customer's data. Firestore security rules enforce this at the database layer too.

### 3. Admin Dashboard (`/admin/*`)
**Responsibility:** Product CRUD, experience CRUD (with dates/seats), order management, booking management, blog CMS, user role management.
**Rendering:** CSR-heavy (complex forms, real-time data). Use RSC for initial data load, CSR for interactive mutations.
**Communicates with:**
- Firebase Auth (admin role verification)
- Firestore (full read/write on all collections)
- Firebase Storage (image upload for products/experiences/blog)
- Stripe (read order/payment status via API)

**Key constraint:** `/admin` routes protected by both Next.js middleware (redirect if no admin role) and Firestore security rules (defense in depth). Admin role stored as Firebase Custom Claims, not in Firestore document (to prevent privilege escalation).

### 4. Booking System (cross-cutting concern)
**Responsibility:** Atomic seat reservation, date availability display, booking confirmation.
**Lives in:** Server Actions + Firestore transactions.
**Communicates with:**
- Firestore (atomic transaction: check seats → decrement → create booking record)
- Stripe (booking checkout session creation)

**Key constraint:** Seat reservation MUST be a Firestore transaction to prevent race conditions. Never read seats and write separately. See Pitfalls for details.

### 5. Payment Layer (Server Actions + Webhooks)
**Responsibility:** Create Stripe Checkout sessions, handle post-payment fulfillment via webhook.
**Lives in:** `/src/app/api/webhooks/stripe/route.ts` + server actions.
**Communicates with:**
- Stripe API (create sessions, verify webhook signatures)
- Firestore (write: order records, booking confirmations, inventory updates)
- Firebase Auth (link orders to user accounts when available)

**Key constraint:** Never fulfill orders in the checkout success redirect (unreliable). ALWAYS fulfill via Stripe webhook (`checkout.session.completed` event). The success page only shows a confirmation message and polls for order status.

---

## Next.js Route Structure

```
src/app/
├── (public)/                          # Route group — no auth required
│   ├── layout.tsx                     # Public layout (nav, footer)
│   ├── page.tsx                       # Homepage (SSG)
│   ├── produkter/
│   │   ├── page.tsx                   # Product catalog (SSG, ISR)
│   │   └── [slug]/
│   │       └── page.tsx               # Product detail (SSG, ISR)
│   ├── opplevelser/
│   │   ├── page.tsx                   # Experience catalog (SSG, ISR)
│   │   └── [slug]/
│   │       └── page.tsx               # Experience detail + booking form (SSR)
│   ├── blogg/
│   │   ├── page.tsx                   # Blog listing (SSG, ISR)
│   │   └── [slug]/
│   │       └── page.tsx               # Blog article (SSG, ISR)
│   ├── handlekurv/
│   │   └── page.tsx                   # Cart (CSR, client state)
│   ├── checkout/
│   │   ├── page.tsx                   # Checkout initiation (SSR)
│   │   ├── suksess/
│   │   │   └── page.tsx               # Post-payment success (SSR, polls order)
│   │   └── avbryt/
│   │       └── page.tsx               # Cancelled checkout
│   ├── kontakt/
│   │   └── page.tsx                   # Contact form (SSG)
│   └── om-oss/
│       └── page.tsx                   # About page (SSG)
│
├── konto/                             # Customer dashboard — auth required
│   ├── layout.tsx                     # Auth guard + dashboard layout
│   ├── page.tsx                       # Profile overview
│   ├── bestillinger/
│   │   ├── page.tsx                   # Order history
│   │   └── [orderId]/
│   │       └── page.tsx               # Order detail
│   ├── bookinger/
│   │   ├── page.tsx                   # Booking history
│   │   └── [bookingId]/
│   │       └── page.tsx               # Booking detail
│   └── innstillinger/
│       └── page.tsx                   # Profile settings, password
│
├── admin/                             # Admin dashboard — admin role required
│   ├── layout.tsx                     # Admin auth guard + admin nav
│   ├── page.tsx                       # Admin overview / dashboard
│   ├── produkter/
│   │   ├── page.tsx                   # Product list
│   │   ├── ny/
│   │   │   └── page.tsx               # New product form
│   │   └── [id]/
│   │       └── page.tsx               # Edit product
│   ├── opplevelser/
│   │   ├── page.tsx                   # Experience list
│   │   ├── ny/
│   │   │   └── page.tsx               # New experience + dates
│   │   └── [id]/
│   │       └── page.tsx               # Edit experience
│   ├── bestillinger/
│   │   ├── page.tsx                   # All orders
│   │   └── [orderId]/
│   │       └── page.tsx               # Order detail + fulfillment status
│   ├── bookinger/
│   │   ├── page.tsx                   # All bookings
│   │   └── [bookingId]/
│   │       └── page.tsx               # Booking detail
│   ├── blogg/
│   │   ├── page.tsx                   # Article list
│   │   ├── ny/
│   │   │   └── page.tsx               # New article
│   │   └── [id]/
│   │       └── page.tsx               # Edit article
│   └── brukere/
│       └── page.tsx                   # User list + role management
│
├── api/
│   └── webhooks/
│       └── stripe/
│           └── route.ts               # Stripe webhook endpoint (POST)
│
├── layout.tsx                         # Root layout (fonts, providers)
├── not-found.tsx                      # 404 page
└── error.tsx                          # Global error boundary

src/
├── components/
│   ├── ui/                            # Primitive components (button, input, etc.)
│   ├── layout/                        # Nav, footer, sidebar
│   ├── products/                      # Product card, product grid, product detail
│   ├── experiences/                   # Experience card, booking form, date picker
│   ├── cart/                          # Cart drawer, cart item, cart summary
│   ├── checkout/                      # Checkout form, shipping calculator
│   ├── blog/                          # Article card, article body
│   ├── admin/                         # Admin-specific forms and tables
│   └── shared/                        # Loading states, error states, empty states
├── lib/
│   ├── firebase/
│   │   ├── client.ts                  # Firebase client SDK init
│   │   ├── admin.ts                   # Firebase Admin SDK init (server only)
│   │   ├── auth.ts                    # Auth helpers
│   │   ├── firestore.ts               # Firestore helpers + typed getters
│   │   └── storage.ts                 # Storage upload helpers
│   ├── stripe/
│   │   ├── client.ts                  # Stripe client init
│   │   └── helpers.ts                 # Session creation, webhook parsing
│   └── utils/
│       ├── currency.ts                # Norwegian currency formatting (NOK)
│       ├── dates.ts                   # Norwegian date formatting
│       └── validation.ts              # Zod schemas
├── hooks/                             # Client-side React hooks
│   ├── useCart.ts                     # Cart state (Zustand or localStorage)
│   ├── useAuth.ts                     # Auth state listener
│   └── useBookingAvailability.ts      # Real-time seat availability
├── actions/                           # Next.js Server Actions
│   ├── products.ts
│   ├── experiences.ts
│   ├── bookings.ts
│   ├── orders.ts
│   ├── blog.ts
│   └── auth.ts
├── types/                             # TypeScript interfaces
│   └── index.ts
└── middleware.ts                      # Auth routing guard
```

---

## Firestore Collection Structure

### Top-Level Collections

```
/products/{productId}
  id: string
  slug: string                         # URL-safe, unique
  name: string                         # Norwegian
  description: string                  # Markdown or HTML
  price: number                        # NOK, in øre (integer, avoid float)
  category: 'drikke' | 'kaffe-te' | 'naturprodukter'
  images: string[]                     # Storage URLs
  inStock: boolean
  stockCount: number
  weight: number                       # grams, for shipping calc
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt: Timestamp | null        # null = draft

/experiences/{experienceId}
  id: string
  slug: string
  name: string
  description: string
  category: 'retreat' | 'kurs' | 'matopplevelse'
  images: string[]
  basePrice: number                    # NOK, in øre
  location: string
  durationText: string                 # "2 dager", "3 timer"
  whatIsIncluded: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt: Timestamp | null

/experiences/{experienceId}/dates/{dateId}    # SUBCOLLECTION
  id: string
  date: Timestamp
  maxSeats: number
  bookedSeats: number                  # Incremented atomically
  availableSeats: number               # maxSeats - bookedSeats (denormalized)
  isActive: boolean
  priceOverride: number | null         # null = use basePrice

/orders/{orderId}
  id: string                           # Stripe session ID or custom
  stripeSessionId: string
  stripePaymentIntentId: string
  customerId: string | null            # Firebase UID, null for guest
  customerEmail: string
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded'
  items: OrderItem[]                   # Denormalized snapshot at time of purchase
  shipping: ShippingDetails
  subtotal: number                     # NOK, in øre
  shippingCost: number
  total: number
  createdAt: Timestamp
  paidAt: Timestamp | null
  fulfilledAt: Timestamp | null

/bookings/{bookingId}
  id: string
  stripeSessionId: string
  customerId: string | null            # Firebase UID, null for guest
  customerEmail: string
  customerName: string
  experienceId: string
  experienceName: string               # Denormalized
  dateId: string
  date: Timestamp                      # Denormalized
  seats: number
  pricePerSeat: number                 # NOK, in øre, snapshot
  total: number
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Timestamp
  confirmedAt: Timestamp | null

/users/{userId}
  uid: string                          # Same as Firebase Auth UID
  email: string
  displayName: string
  role: 'customer' | 'admin'           # Also stored as Firebase Custom Claim
  createdAt: Timestamp
  lastLoginAt: Timestamp

/blog/{articleId}
  id: string
  slug: string
  title: string
  excerpt: string
  body: string                         # HTML or Markdown
  coverImage: string                   # Storage URL
  author: string
  tags: string[]
  status: 'draft' | 'published'
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt: Timestamp | null
```

### Design Decisions for Firestore

**Prices in øre (integers):** Never store NOK as floats. 299.00 NOK → stored as 29900. Avoids floating-point rounding errors in totals.

**Denormalize display data into orders/bookings:** Store name, price, and other display fields at purchase time. Products change over time; historical orders must reflect what was bought at that price.

**Experience dates as subcollection:** Allows querying available dates for an experience without loading the parent document repeatedly. Seats are incremented atomically on this subcollection document.

**No cart in Firestore:** Cart state is client-side only (localStorage / Zustand). Persisting carts in Firestore adds complexity for marginal value in v1. If cart abandonment recovery is added in v2, migrate to Firestore.

**Blog in top-level collection:** Simple enough that a subcollection is unnecessary.

**User roles as Custom Claims + Firestore:** Custom Claims are checked server-side in middleware (fast, no DB read). The Firestore `users` doc is for display/profile data only.

---

## Data Flow

### Product Browse → Checkout → Fulfillment

```
1. Browser requests /produkter/[slug]
   └── Next.js Server Component reads Firestore (server-side, no auth needed)
   └── Page rendered as HTML, sent to browser (SSG with ISR)

2. Customer adds to cart
   └── Client-side cart state updated (localStorage / Zustand)
   └── No server call — cart is local only

3. Customer initiates checkout
   └── Server Action called with cart items
   └── Server Action validates items still exist + prices in Firestore
   └── Server Action creates Stripe Checkout Session
   └── Browser redirected to Stripe-hosted checkout page

4. Customer completes payment on Stripe
   └── Stripe redirects to /checkout/suksess?session_id=...
   └── Success page shows pending state, polls for order status

5. Stripe fires webhook to /api/webhooks/stripe
   └── Webhook handler verifies signature
   └── Writes order to Firestore with status: 'paid'
   └── Decrements product stockCount (if inventory tracking)
   └── Sends confirmation email (via Resend / Firebase Extension)

6. Success page poll sees order.status = 'paid'
   └── Shows confirmation to customer
   └── Clears cart state
```

### Booking Flow

```
1. Browser requests /opplevelser/[slug]
   └── Server Component loads experience + available dates from Firestore

2. Customer selects date and seat count
   └── Client component shows real-time availability
   └── Firestore onSnapshot listener on /experiences/{id}/dates/{dateId}

3. Customer submits booking form
   └── Server Action called with experienceId, dateId, seats, customerInfo
   └── Server Action runs Firestore TRANSACTION:
       a. Read current availableSeats for dateId
       b. If availableSeats >= requested seats: proceed
       c. Increment bookedSeats, decrement availableSeats
       d. Write pending booking document
       e. Commit transaction
   └── On success: create Stripe Checkout Session for the booking
   └── Browser redirected to Stripe checkout

4. Stripe webhook confirms payment
   └── Update booking status: 'pending' → 'confirmed'
   └── Stripe webhook is source of truth for confirmation

5. If payment fails/expires:
   └── Stripe webhook fires checkout.session.expired
   └── Server reverses seat reservation (re-increments availableSeats)
   └── Booking document status set to 'cancelled'
```

### Auth Flow

```
1. Customer registers / logs in
   └── Firebase Auth client SDK handles UI
   └── On success: Firebase issues ID token (JWT)
   └── ID token stored in browser (managed by Firebase SDK)

2. Customer accesses /konto/* route
   └── Next.js middleware reads session cookie
   └── Middleware verifies ID token with Firebase Admin SDK
   └── If invalid: redirect to /innlogging

3. Server Components in /konto/* fetch user-specific data
   └── Use verified UID from middleware to scope Firestore queries
   └── Firestore security rules provide second layer of enforcement

4. Admin accesses /admin/* route
   └── Middleware checks Firebase Custom Claims for admin role
   └── If not admin: redirect to homepage (not to login — prevents enumeration)
```

### Image Upload Flow (Admin)

```
1. Admin uploads product/experience/blog image
   └── Client sends file directly to Firebase Storage via SDK
   └── Storage security rules verify admin role before accepting
   └── Storage returns download URL

2. Admin saves form with image URL
   └── Server Action writes Firestore document with Storage URL
```

---

## Patterns to Follow

### Pattern 1: Server Components First

Use React Server Components (RSC) as the default for all pages and data-fetching components. Only add `'use client'` when component needs browser APIs, event listeners, or React state/effects.

This applies especially to the storefront — product pages, experience pages, and blog should ship zero client-side JS for the main content, only for interactive widgets (booking form, cart button).

```typescript
// Good — server component fetches data directly
// src/app/(public)/produkter/[slug]/page.tsx
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug); // direct Firestore read
  return <ProductDetail product={product} />;
}

// Only the "Add to cart" button needs 'use client'
// src/components/products/AddToCartButton.tsx
'use client';
export function AddToCartButton({ productId, price }: Props) { ... }
```

### Pattern 2: Server Actions for Mutations

All data mutations go through Next.js Server Actions. No client-side fetch to internal API routes except the Stripe webhook (which must be a Route Handler).

```typescript
// src/actions/bookings.ts
'use server';
export async function createBooking(data: BookingFormData) {
  // Verify auth, validate input, run Firestore transaction, create Stripe session
}
```

### Pattern 3: Firestore Transactions for Seat Reservation

Never check-then-write outside a transaction. Race condition window is real with concurrent bookings.

```typescript
// src/actions/bookings.ts
import { runTransaction } from 'firebase/firestore';

export async function reserveSeats(experienceId: string, dateId: string, seats: number) {
  const dateRef = doc(db, 'experiences', experienceId, 'dates', dateId);

  return runTransaction(db, async (transaction) => {
    const dateDoc = await transaction.get(dateRef);
    const available = dateDoc.data()?.availableSeats ?? 0;

    if (available < seats) {
      throw new Error('INSUFFICIENT_SEATS');
    }

    transaction.update(dateRef, {
      bookedSeats: increment(seats),
      availableSeats: increment(-seats),
    });
  });
}
```

### Pattern 4: Stripe Webhook as Source of Truth

The checkout success page must NOT write to Firestore directly. It polls for the order written by the webhook.

```typescript
// WRONG — don't do this
// /checkout/suksess/page.tsx
export default async function SuccessPage({ searchParams }) {
  await createOrder(searchParams.session_id); // WRONG — race condition, unreliable
}

// RIGHT — webhook writes, success page reads
// /api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(...);
  if (event.type === 'checkout.session.completed') {
    await createOrderFromSession(event.data.object);
  }
}
```

### Pattern 5: Defense in Depth for Auth

Three layers of auth enforcement, weakest to strongest:

1. **Next.js middleware** — redirects unauthenticated/unauthorized users before page loads (UX)
2. **Server Action guards** — re-verify auth in every Server Action (business logic)
3. **Firestore security rules** — final enforcement at data layer (data integrity)

Never rely on only one layer.

### Pattern 6: ISR for Catalog Pages

Product and experience catalog pages use Incremental Static Regeneration. They're generated statically for performance but revalidate on a time window.

```typescript
export const revalidate = 3600; // revalidate every hour

// Or on-demand revalidation when admin publishes
import { revalidatePath } from 'next/cache';
// In admin Server Action:
revalidatePath('/produkter');
revalidatePath(`/produkter/${product.slug}`);
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Firestore Reads for Protected Data

**What:** Fetching sensitive data (orders, user profiles) via Firebase client SDK directly from the browser.
**Why bad:** Firestore security rules are the only guard. One misconfigured rule exposes all customer data. Server-side reads using the Admin SDK bypass client SDK rules entirely and are more controllable.
**Instead:** Fetch sensitive user data in Server Components using Firebase Admin SDK. Pass only the needed data as props to client components.

### Anti-Pattern 2: Fulfillment on Success Page

**What:** Writing order/booking records when the browser loads `/checkout/suksess`.
**Why bad:** Users can navigate directly to success URL without paying. Network failures between Stripe redirect and your page cause lost orders.
**Instead:** Stripe webhook is the only place orders are created. Success page polls for confirmation.

### Anti-Pattern 3: Role in Firestore Document Instead of Custom Claims

**What:** Checking `users/{uid}.role === 'admin'` in middleware.
**Why bad:** Reading Firestore on every middleware invocation is slow and costly. Custom Claims are embedded in the JWT token — zero extra reads.
**Instead:** Set admin role via Firebase Admin SDK `setCustomUserClaims`. Check `decodedToken.admin === true` in middleware.

### Anti-Pattern 4: Fat Client Components in Storefront

**What:** Making product listing pages client components to fetch data with `useEffect`.
**Why bad:** Kills SSG/SSR benefits, bad Core Web Vitals, not crawlable until JS loads.
**Instead:** All catalog pages are Server Components. Client interactivity is limited to isolated islands (cart button, booking date selector).

### Anti-Pattern 5: Storing Prices in Firestore as Floats

**What:** `price: 299.99` as a JavaScript float.
**Why bad:** Float arithmetic errors accumulate in totals. 299.99 + 49.99 = 349.97999... in JS.
**Instead:** Store all money as integers in øre. 299 NOK = `29900`. Format for display only in the UI layer.

### Anti-Pattern 6: Unverified Stripe Sessions

**What:** Creating an order based on URL parameter `session_id` without verifying it via Stripe API.
**Why bad:** Anyone can craft a success URL with a fake session ID and receive order confirmation.
**Instead:** Webhook handler calls `stripe.checkout.sessions.retrieve(sessionId)` and checks `session.payment_status === 'paid'` before writing any order.

---

## Middleware Architecture

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — require admin custom claim
  if (pathname.startsWith('/admin')) {
    const token = await verifyFirebaseToken(request);
    if (!token?.admin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Customer routes — require any authenticated user
  if (pathname.startsWith('/konto')) {
    const token = await verifyFirebaseToken(request);
    if (!token) {
      return NextResponse.redirect(new URL('/innlogging', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/konto/:path*'],
};
```

**Note:** Firebase token verification in Edge middleware requires the Firebase Admin SDK or a custom JWT verification using `jose` (pure JS, works in Edge runtime). The full `firebase-admin` package does NOT work in Edge middleware — use `jose` for JWT verification in middleware, full Admin SDK only in Route Handlers and Server Actions.

---

## Scalability Considerations

| Concern | Current scale (v1) | If traffic grows |
|---------|-------------------|-----------------|
| Firestore reads | Direct reads in Server Components | Add Redis (Upstash) cache layer for catalog |
| Image delivery | Firebase Storage URLs | Move to Cloudinary or Imgix for transforms |
| Seat reservation | Firestore transactions | Sufficient to ~1000 concurrent; beyond that, move to Cloud Functions with queuing |
| Catalog pages | ISR with hourly revalidation | Tune revalidate window, add on-demand revalidation |
| Admin CMS | Firestore writes directly | Sufficient at small scale; consider CMS (Sanity) if content team grows |
| Email | Simple transactional | Upgrade from Resend basic to a marketing ESP if newsletters added |

---

## Build Order (Dependency Analysis)

Components must be built in this order because each layer depends on the previous:

```
Phase 1: Foundation
  ├── Firebase project setup (Auth, Firestore, Storage)
  ├── Next.js project scaffold (App Router, TypeScript, Tailwind)
  ├── Firestore security rules (basic)
  ├── Firebase Auth integration (client + admin SDK)
  ├── Middleware (auth routing guard)
  └── Design system (tokens, primitive UI components)

  WHY FIRST: Everything else depends on auth and data access being reliable.

Phase 2: Public Storefront (read-only)
  ├── Product catalog (SSG) — requires: Firestore schema, design system
  ├── Experience catalog (SSG) — requires: Firestore schema
  ├── Blog listing + article (SSG) — requires: Firestore schema
  └── Homepage (SSG) — requires: product + experience components

  WHY SECOND: Storefront is the core product. Also validates data model
  before building write paths. No auth dependency for public pages.

Phase 3: Admin Dashboard (write paths)
  ├── Admin auth guard — requires: Phase 1 auth
  ├── Product CRUD — requires: Phase 2 data model
  ├── Experience CRUD + date management — requires: Phase 2 data model
  ├── Blog CMS — requires: Phase 2 blog schema
  └── Image upload (Firebase Storage) — requires: Phase 1 Storage setup

  WHY THIRD: Admin must exist before storefront can have real content.
  Also validates all write paths before building payment flows.

Phase 4: Cart + Checkout + Orders
  ├── Cart state (client-side) — requires: Phase 2 product data
  ├── Shipping calculator — requires: product weight data
  ├── Stripe integration (checkout session) — requires: Phase 3 products in Firestore
  ├── Stripe webhook handler — requires: Stripe setup
  ├── Order creation in Firestore — requires: orders collection schema
  └── Checkout success/cancel pages — requires: webhook handler

  WHY FOURTH: Payment is highest risk. Build it after data model is
  stable. Stripe webhook must be testable before going live.

Phase 5: Booking System
  ├── Booking form + date picker — requires: Phase 3 experience dates
  ├── Real-time availability (Firestore listener) — requires: dates subcollection
  ├── Atomic seat reservation (transaction) — requires: Phase 1 Firestore
  ├── Booking checkout (Stripe) — requires: Phase 4 Stripe integration
  └── Booking webhook fulfillment — requires: Phase 4 webhook handler

  WHY FIFTH: Depends on both admin (experiences) and payment (Stripe).
  Most complex flow — build last among core features.

Phase 6: Customer Dashboard
  ├── Profile page — requires: Phase 1 auth, users collection
  ├── Order history — requires: Phase 4 orders
  ├── Booking history — requires: Phase 5 bookings
  └── Password change — requires: Phase 1 Firebase Auth

  WHY SIXTH: Pure read-side of existing data. No new data model work.
  Builds on stable Phase 4 and 5 foundations.

Phase 7: Polish + Production Readiness
  ├── Admin order management view — requires: Phase 4
  ├── Admin booking management view — requires: Phase 5
  ├── SEO (metadata API, sitemap, robots.txt)
  ├── WCAG 2.1 AA audit + fixes
  ├── Performance audit (Core Web Vitals)
  ├── Error boundaries + loading states
  └── Stripe production keys + webhook registration
```

---

## Firestore Security Rules (Skeleton)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Products — public read, admin write
    match /products/{productId} {
      allow read: if resource.data.publishedAt != null;
      allow write: if isAdmin();
    }

    // Experiences — public read, admin write
    match /experiences/{experienceId} {
      allow read: if resource.data.publishedAt != null;
      allow write: if isAdmin();

      match /dates/{dateId} {
        allow read: if true;          // Available seats are public
        allow write: if isAdmin();    // Atomic seat updates happen server-side
      }
    }

    // Orders — owner read, no client write (webhook writes via Admin SDK)
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.customerId) || isAdmin();
      allow write: if false;          // Only Admin SDK writes orders
    }

    // Bookings — owner read, no client write
    match /bookings/{bookingId} {
      allow read: if isOwner(resource.data.customerId) || isAdmin();
      allow write: if false;          // Only Admin SDK writes bookings
    }

    // Users — own profile read/write, admin full access
    match /users/{userId} {
      allow read, update: if isOwner(userId);
      allow create: if isOwner(userId);
      allow read, write: if isAdmin();
    }

    // Blog — public read for published, admin write
    match /blog/{articleId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
  }
}
```

---

## Sources

**Confidence: HIGH** — All patterns in this document reflect well-established conventions for this stack combination, actively used in production at scale as of 2025-2026.

- Next.js App Router documentation: https://nextjs.org/docs/app
- Firebase Firestore security rules: https://firebase.google.com/docs/firestore/security/get-started
- Firebase Admin SDK in Next.js: https://firebase.google.com/docs/admin/setup
- Stripe webhooks best practices: https://stripe.com/docs/webhooks/best-practices
- Next.js Middleware with Edge Runtime constraints: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Firebase Custom Claims: https://firebase.google.com/docs/auth/admin/custom-claims
- Firestore transactions: https://firebase.google.com/docs/firestore/manage-data/transactions

**Known limitation:** Firebase Admin SDK does not run in Next.js Edge Middleware. JWT verification in middleware must use `jose` or a lightweight JWT library. This is confirmed behavior as of Firebase Admin SDK v11+.
