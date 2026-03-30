# Technology Stack

**Project:** Roots & Culture
**Researched:** 2026-03-30
**Overall confidence:** HIGH (Next.js/Tailwind verified from official docs), MEDIUM (Firebase/Stripe versions from training data cross-referenced with architecture patterns)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15+ (currently 16.2.1) | Full-stack React framework | App Router is the current standard for SSR/SSG/Server Actions. Vercel-native: zero-config deployment, edge network, preview URLs. Server Components reduce client JS bundle — critical for performance on mobile |
| React | 19 (bundled with Next.js) | UI library | Bundled with Next.js 15+. React 19 `useActionState` replaces legacy form handling patterns |
| TypeScript | ^5.4 | Type safety | Use throughout. Prevents class of bugs in Firestore data modeling, Stripe webhook event types, and form validation |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | v4.x (currently 4.2) | Utility-first CSS | v4 is the current generation — uses `@tailwindcss/postcss` plugin (not the old `tailwind.config.js` approach). Zero-runtime, tree-shaken at build time. Native CSS custom properties enable the dark-green + autumn palette cleanly |
| `@tailwindcss/postcss` | v4.x | Tailwind build integration | Replaces the v3 PostCSS plugin setup. Required for Next.js v4 integration |

### Database & Backend Services

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Firebase (client) | ^11.x | Firestore, Auth, Storage on client | Modular v9+ API (`firebase/firestore`, `firebase/auth`, `firebase/storage`) tree-shakes correctly. v11 is current major. Use only in Client Components and client-initialized contexts |
| firebase-admin | ^12.x | Server-side Firestore, Auth token verification | Admin SDK must run server-only (Next.js Server Components, Server Actions, Route Handlers). Critical for: verifying Firebase ID tokens in middleware, server-side Firestore writes, and webhook handlers |

### Payment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| stripe | ^17.x | Server-side Stripe API | Server-only. Used in Server Actions and Route Handlers to create Checkout Sessions, retrieve payment intents, and verify webhook signatures. Never expose secret key to client |
| @stripe/stripe-js | ^4.x | Client-side Stripe.js loader | Loads Stripe.js asynchronously. Required for Stripe Checkout redirect (`loadStripe`) and Stripe Elements if used. Use `loadStripe` inside Client Components only |

### Form Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| zod | ^3.x | Schema validation | Next.js official docs use Zod for Server Action validation. Validates Stripe webhook payloads, product form inputs, booking form data. Works identically server and client |

### Session Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| jose | ^5.x | JWT encryption/decryption | Edge Runtime compatible (unlike jsonwebtoken). Used to encrypt Firebase UID + role into an HttpOnly session cookie. Next.js official auth docs recommend jose for stateless sessions |
| server-only | ^0.x | Compile-time import guard | Prevents server modules (firebase-admin, session logic, Stripe secret) from being accidentally imported in Client Components. Zero-cost safety net |

### Hosting

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel | current | Hosting and deployment | Native Next.js integration — zero-config serverless functions, ISR, edge middleware, preview deployments. Firebase cannot host Next.js Server Components natively |

---

## Architecture: How These Pieces Fit Together

### Authentication Flow (Firebase Auth + jose sessions)

The stack uses a hybrid auth model that bridges Firebase Auth (client) with Next.js middleware (server):

1. **Client**: Firebase Auth handles sign-in/sign-up UI and delivers an `idToken` (JWT from Firebase)
2. **Server Action** (`/app/actions/auth.ts`): Receives the Firebase `idToken`, verifies it with `firebase-admin.auth().verifyIdToken(idToken)`, then creates a `jose`-encrypted HttpOnly session cookie containing `{ uid, role, expiresAt }`
3. **Middleware** (`middleware.ts`): On every request, decrypts the session cookie with `jose` to read `uid` and `role`. Redirects unauthenticated users away from `/konto/*` routes and non-admins away from `/admin/*` routes
4. **Server Components/Actions**: Call `verifySession()` from a DAL (Data Access Layer) to get the current user before any Firestore operations

Why not Firebase session cookies directly? Firebase Admin's `createSessionCookie` works, but `jose` + HttpOnly JWT is simpler, fully Edge Runtime compatible, and avoids an extra Firebase Admin network call on every request in middleware.

### Data Access Pattern (Firestore + Server Components)

```
Server Component
  → calls data function from lib/data.ts
  → data function: firebase-admin Firestore query wrapped in React cache()
  → returns typed data
  → Server Component renders HTML
```

Use `unstable_cache` (not `fetch` cache) for Firestore queries that should be cached across requests. Tag them with `revalidateTag` so admin edits invalidate the cache immediately:

```typescript
// lib/data/products.ts
import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'

export const getProducts = unstable_cache(
  async () => {
    const snap = await adminDb.collection('products').get()
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  ['products'],
  { tags: ['products'], revalidate: 3600 }
)
```

When admin saves a product: call `revalidateTag('products')` to flush the cache.

### Stripe Checkout Flow (e-commerce + booking unified)

Both physical products and experience bookings go through the same Stripe Checkout pattern:

1. User clicks "Kjop" / "Bestill" — triggers a Server Action
2. Server Action verifies session, validates input with Zod, creates a Stripe Checkout Session with `stripe.checkout.sessions.create(...)` including `metadata: { type: 'product' | 'booking', ... }`
3. Server Action returns the `session.url` — client redirects to Stripe-hosted checkout
4. User completes payment on Stripe
5. Stripe calls webhook at `/api/webhooks/stripe` (Route Handler)
6. Route Handler: verifies signature with `stripe.webhooks.constructEvent(body, sig, secret)`, handles `checkout.session.completed` event
7. Webhook creates Firestore order document and (for bookings) decrements available spots using a Firestore transaction

### Environment Variable Conventions

```
# Server-only (never NEXT_PUBLIC_)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SESSION_SECRET=

# Client-exposed (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Firebase Admin credentials (project ID, client email, private key) are server-only. Firebase client config is safe to expose — it's public by design, protected by Firestore Security Rules.

### Firestore Data Model (high-level)

```
/users/{uid}            — profile, role ('admin' | 'customer'), createdAt
/products/{id}          — name, description, price, category, stock, images[], slug
/experiences/{id}       — name, description, dates[], maxSpots, price, images[], slug
/bookings/{id}          — experienceId, userId, date, spots, stripeSessionId, status
/orders/{id}            — userId (optional for guests), items[], total, shippingAddress, stripeSessionId, status
/articles/{id}          — title, body, slug, publishedAt, author, tags[]
```

### Norwegian Language Implementation

No i18n routing needed (single language). Implement as:
- `<html lang="nb">` in root layout (Norwegian Bokmål)
- All UI strings as TypeScript constants in `lib/strings.ts` (or inline — single language means no translation overhead)
- Date formatting: `Intl.DateTimeFormat('nb-NO')` for all displayed dates
- Currency: `Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' })`
- Error messages from Server Actions returned in Norwegian

Do NOT use next-intl or any i18n routing library — it adds unnecessary complexity for a single-language site.

### WCAG 2.1 AA Implementation

Norwegian law (universell utforming) mandates WCAG 2.1 AA for commercial websites. Implement at stack level:

- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<button>`) — never `<div onClick>`
- All interactive elements reachable via keyboard (Tab, Enter, Space, Arrow keys)
- All images: meaningful `alt` text or `alt=""` for decorative images
- Color contrast: dark-green + autumn palette must pass 4.5:1 ratio for text
- `aria-live` regions for cart updates, booking confirmations, form errors
- Focus management after navigation (Next.js App Router handles most automatically)
- No motion without `prefers-reduced-motion` media query guard for animations
- Form labels: every input has associated `<label>` (not just placeholder)

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` + `tailwind-merge` | latest | Conditional className merging | All components that conditionally apply Tailwind classes. Prevents class conflicts |
| `lucide-react` | latest | Icon library | Open-source, tree-shakeable, accessible icons. Covers all e-commerce icons needed |
| `date-fns` | ^3.x | Date formatting/manipulation | Booking date display, order timestamps. Locale-aware with `nb` locale. Lighter than moment.js |
| `react-hot-toast` or `sonner` | latest | Toast notifications | Cart add confirmations, booking success, error feedback. Must be accessible (aria-live) |
| `@next/third-parties` | bundled | Third-party script loading | If Google Analytics or similar is added later. Avoids manual Script tag management |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Auth | Firebase Auth + jose | NextAuth.js (Auth.js) | NextAuth adds complexity without benefit since Firebase Auth is already part of the stack. Firebase Auth handles email/password + social logins natively |
| Auth | Firebase Auth + jose | Supabase Auth | Supabase would mean replacing Firebase entirely — outside scope |
| Database | Firestore (firebase-admin) | Firestore REST API directly | Admin SDK provides TypeScript types, transactions, batched writes. REST API is lower-level with no added benefit |
| Styling | Tailwind CSS v4 | CSS Modules | Tailwind v4 has better DX for design system tokens. CSS Modules are a valid alternative but require more boilerplate for responsive utility classes |
| Styling | Tailwind CSS v4 | shadcn/ui + Radix | shadcn/ui is excellent but introduces component coupling. For a brand-specific design (dark green + autumn), starting from Tailwind primitives gives more control. Radix primitives (headless) can be added selectively |
| Styling | Tailwind CSS v4 | Tailwind CSS v3 | v4 is current. The `@tailwindcss/postcss` setup is slightly different but superior. Do not use v3 for new projects |
| Validation | Zod | Yup | Zod has better TypeScript inference and is now the Next.js official docs standard |
| i18n | None (inline strings) | next-intl | Single language — routing-based i18n adds URL segments and complexity with zero benefit |
| Toast | sonner | react-toastify | Sonner is lighter, more modern, and integrates well with Tailwind |
| Booking state | Firestore transaction | External booking service | No external dependency needed. Firestore transactions handle concurrent spot-decrement correctly |

---

## Installation

```bash
# Core Next.js project
npx create-next-app@latest roots-culture --typescript --eslint --app --tailwind --src-dir --import-alias "@/*"

# Tailwind v4 setup (if not already configured by create-next-app)
npm install tailwindcss @tailwindcss/postcss postcss

# Firebase
npm install firebase firebase-admin

# Stripe
npm install stripe @stripe/stripe-js

# Session management
npm install jose server-only

# Validation
npm install zod

# Utilities
npm install clsx tailwind-merge lucide-react date-fns sonner

# Dev dependencies
npm install -D @types/node
```

### postcss.config.mjs (Tailwind v4)

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### app/globals.css (Tailwind v4)

```css
@import "tailwindcss";

/* CSS custom properties for Roots & Culture palette */
:root {
  --color-forest: #1a3d2e;       /* dark green */
  --color-rust: #8b3a2a;          /* rust red */
  --color-ember: #c4611f;         /* burnt orange */
  --color-bark: #5c3d1e;          /* warm brown */
  --color-cream: #f5f0e8;         /* warm off-white */
}
```

### lib/firebase-admin.ts (server-only)

```typescript
import 'server-only'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : getApps()[0]

export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)
```

### lib/firebase.ts (client-side)

```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
```

---

## Route Structure

```
app/
  (marketing)/           # Public pages group
    page.tsx             # Forside
    produkter/page.tsx   # Produktkatalog
    produkter/[slug]/    # Produktside
    opplevelser/page.tsx # Opplevelsesoversikt
    opplevelser/[slug]/  # Opplevelsesside
    blogg/page.tsx       # Bloggoversikt
    blogg/[slug]/        # Bloggartikkel
    om-oss/page.tsx
    kontakt/page.tsx
  konto/                 # Authenticated customer routes
    layout.tsx           # Auth guard: redirect to /logg-inn if no session
    dashboard/page.tsx
    ordrer/page.tsx
    bookinger/page.tsx
    profil/page.tsx
  admin/                 # Admin-only routes
    layout.tsx           # Auth guard: redirect if role !== 'admin'
    produkter/           # CRUD for products
    opplevelser/         # CRUD for experiences
    blogg/               # CMS for articles
    ordrer/              # Order management
    oversikt/page.tsx    # Dashboard
  api/
    webhooks/
      stripe/route.ts    # Stripe webhook handler
  (auth)/
    logg-inn/page.tsx
    registrer/page.tsx
    glemt-passord/page.tsx
middleware.ts            # Session validation, route protection
```

### next.config.ts

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
    ],
  },
}

export default config
```

---

## What NOT to Use

| Tool | Reason to Avoid |
|------|----------------|
| `next-intl` | Single-language site. Adds routing complexity and bundle size with zero benefit |
| `redux` / `zustand` | Most state is server state (Firestore). Use React `useState` + Server Actions for cart. Global client state store is overkill |
| `react-query` / `swr` | Server Components fetch data server-side. For client-side real-time Firestore (e.g. live booking spots), use Firestore's `onSnapshot` directly, not a query library |
| `prisma` / `drizzle` | Firebase Firestore is the decided database. SQL ORMs are irrelevant |
| `nodemailer` | Use Resend or Firebase Extensions for transactional email. Avoid raw SMTP on serverless |
| `next-auth` | Firebase Auth covers all auth needs. NextAuth would duplicate auth infrastructure |
| `tailwind.config.js` (v3 pattern) | Tailwind v4 uses CSS-native configuration via CSS custom properties. No JS config file needed |
| `pages/` directory | App Router only. Do not mix Pages Router patterns |
| `getServerSideProps` / `getStaticProps` | App Router patterns replace these. Use async Server Components + `unstable_cache` |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Next.js version + App Router patterns | HIGH | Verified from nextjs.org/docs (version 16.2.1) |
| Tailwind CSS v4 setup for Next.js | HIGH | Verified from tailwindcss.com/docs — `@tailwindcss/postcss` confirmed |
| Firebase modular SDK architecture | MEDIUM | Training data (Firebase v10/11 modular API) — verify exact version at npmjs.com/package/firebase before install |
| firebase-admin version | MEDIUM | Training data — verify latest at npmjs.com/package/firebase-admin |
| Stripe package versions | MEDIUM | Training data — verify at npmjs.com/package/stripe before install |
| jose for session management | HIGH | Verified from Next.js official auth docs recommending jose explicitly |
| Norwegian-only = no i18n routing | HIGH | Confirmed from Next.js i18n docs — single-language sites do not benefit from locale routing |
| WCAG 2.1 AA requirements | HIGH | Norwegian universell utforming law requires this for commercial websites |
| Firestore `unstable_cache` pattern | HIGH | Verified from Next.js caching docs — correct approach for non-fetch data sources |

---

## Sources

- Next.js 16.2.1 documentation: https://nextjs.org/docs (fetched 2026-03-30)
- Next.js authentication guide: https://nextjs.org/docs/app/guides/authentication (fetched 2026-03-30)
- Next.js forms guide: https://nextjs.org/docs/app/guides/forms (fetched 2026-03-30)
- Next.js caching guide: https://nextjs.org/docs/app/guides/caching (fetched 2026-03-30)
- Next.js i18n guide: https://nextjs.org/docs/app/guides/internationalization (fetched 2026-03-30)
- Next.js image optimization: https://nextjs.org/docs/app/getting-started/images (fetched 2026-03-30)
- Tailwind CSS v4 Next.js guide: https://tailwindcss.com/docs/installation/framework-guides/nextjs (fetched 2026-03-30)
- Firebase official docs: https://firebase.google.com/docs (training data, verify versions)
- Stripe official docs: https://docs.stripe.com (training data, verify versions)
