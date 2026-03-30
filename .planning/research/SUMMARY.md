# Project Research Summary

**Project:** Roots & Culture
**Domain:** Norwegian e-commerce + experience booking platform (nature/culture niche)
**Researched:** 2026-03-30
**Confidence:** HIGH (core stack and architecture verified from official docs; pitfalls well-documented)

## Executive Summary

Roots & Culture is a single-language Norwegian niche platform that combines physical product e-commerce (drinks, coffee/tea, natural products) with experience bookings (retreats, courses, food experiences). This dual-commerce model is the defining architectural complexity: a unified cart and single Stripe Checkout session must accommodate both physical goods and booking slots with different fulfillment paths. The recommended approach is a single Next.js 15+ App Router application on Vercel, using Firebase (Firestore, Auth, Storage) as the backend and Stripe for all payments. No separate backend service or microservices are needed — Next.js Server Actions and Route Handlers cover all server-side logic at this scale.

The recommended stack is tight and well-justified. Next.js App Router with React Server Components is the right choice for SEO-critical catalog pages (products and experiences must be server-rendered for Google indexing) while keeping client-side JS minimal for mobile performance. Firebase handles auth, data, and file storage without requiring a separate database service. The hybrid auth model — Firebase Auth on the client, `jose`-encrypted HttpOnly session cookie verified in middleware — is the current Next.js-recommended pattern for Edge Runtime compatibility. Tailwind CSS v4 (not v3) is the current generation and integrates cleanly with Next.js.

The platform faces four critical risk areas that must be designed correctly from day one: (1) Firestore booking transactions to prevent overbooking race conditions, (2) Stripe webhook idempotency to prevent double-fulfillment, (3) Firestore security rules to prevent GDPR violations under Norwegian law, and (4) Norwegian legal compliance requirements (WCAG 2.1 AA accessibility mandate, cookie consent under ekomloven, and angrerrettloven right-of-withdrawal notices). None of these can be retrofitted easily — they must be built into the foundation and the checkout phases respectively.

---

## Key Findings

### Recommended Stack

The stack centers on Next.js 15+ (App Router, Server Components, Server Actions) deployed on Vercel, with Firebase v11 (Firestore + Auth + Storage) as the backend platform and Stripe for payments. TypeScript is used throughout. Session management uses `jose` for Edge Runtime-compatible JWT encryption rather than Firebase Admin's session cookie API, which has more overhead. Tailwind CSS v4 with the `@tailwindcss/postcss` plugin (not the v3 `tailwind.config.js` approach) handles styling with CSS custom properties for the dark-green and autumn palette. Zod validates all Server Action inputs and webhook payloads.

The stack deliberately avoids over-engineering: no i18n routing library (single Norwegian language), no Redux/Zustand for server state (Firestore and Server Components handle it), no separate auth library like NextAuth (Firebase Auth covers all needs), and no SQL ORM (Firestore is the chosen database). Cart state is client-side only (localStorage) in v1, keeping the Firestore footprint lean.

**Core technologies:**
- **Next.js 15+ (App Router):** Full-stack framework — SSG/ISR for catalog pages, SSR for dynamic pages, Server Actions for all mutations
- **React 19:** Bundled with Next.js; `useActionState` for form handling
- **TypeScript 5.4+:** Throughout; prevents data modeling bugs in Firestore and Stripe event types
- **Tailwind CSS v4:** Utility CSS with CSS-native config via custom properties; `@tailwindcss/postcss` plugin required
- **Firebase client v11 (modular):** Auth and real-time Firestore listeners in Client Components only
- **firebase-admin v12:** All server-side Firestore reads/writes, Auth token verification; `server-only` import guard enforced
- **Stripe v17 (server) + @stripe/stripe-js v4 (client):** Unified checkout for products and bookings via Stripe-hosted Checkout
- **jose v5:** Edge Runtime-compatible JWT encryption for HttpOnly session cookie
- **Zod v3:** Server Action and webhook payload validation
- **date-fns v3 with `nb` locale:** Norwegian date formatting
- **Vercel:** Zero-config Next.js deployment; native ISR, edge middleware, preview URLs

### Expected Features

See `.planning/research/FEATURES.md` for the full feature inventory with complexity ratings.

**Must have (table stakes for v1 launch):**
- Product catalog with categories, detail pages, images, pricing
- Shopping cart (localStorage-persisted for guests)
- Stripe checkout — guest and account paths
- Order confirmation email + page
- Experience listing with available dates and spots remaining
- Booking checkout with atomic seat reservation
- Booking confirmation email + page
- Firebase Auth (email/password, password reset)
- Customer dashboard: order history, booking history, profile
- Admin CMS: full CRUD for products, experiences, articles, plus order and booking management
- Blog/editorial section for SEO and brand authority
- SEO metadata, server-side rendering for product/experience pages
- WCAG 2.1 AA accessibility (legally required in Norway — not optional)
- Norwegian language throughout (no EN fallback)

**Should have (differentiators worth building in v1):**
- Mixed cart (products + experiences in a single Stripe Checkout session)
- Difficulty/physical level indicator on experiences
- "What to bring" checklist in booking confirmation emails
- Seasonal experience categorization
- Cancellation policy visible on booking pages
- Unique booking reference/confirmation code

**Defer to v2+:**
- Waitlist for sold-out experiences (email collection only; no automated rebooking)
- Post-experience follow-up email (requires scheduled Cloud Function)
- "About the producer" rich fields on products
- Auto-generated sitemap (add before SEO push post-launch)
- Discount codes (Stripe supports natively; low v1 priority)
- Product variants (not relevant for natural products catalog)
- Social login, subscription/membership model, product reviews, wish lists

### Architecture Approach

Single Next.js application in a monorepo on Vercel. Three user surfaces (public storefront, customer dashboard `/konto/*`, admin dashboard `/admin/*`) live in the same codebase. Public storefront pages use SSG with ISR for catalog and blog content. Protected routes use SSR with auth context. The admin surface is forms-heavy (CSR for mutations, RSC for initial data load). All data mutations go through Server Actions (not client-side fetch to internal APIs). The Stripe webhook Route Handler is the only exception — it must be an API Route for raw body access. Firestore data is accessed exclusively via firebase-admin in Server Components and Server Actions; the client Firebase SDK is used only for Auth state and real-time `onSnapshot` listeners (booking availability). Prices are stored as integers in øre (1 NOK = 100 øre) throughout to avoid float arithmetic errors.

**Major components:**
1. **Public Storefront** — SSG/ISR catalog and blog pages; SSR checkout; client islands for cart and booking interactions; Firestore read-only via Admin SDK
2. **Customer Dashboard (`/konto/*`)** — SSR with auth guard; reads user's own orders and bookings from Firestore via Admin SDK; writes via Server Actions
3. **Admin Dashboard (`/admin/*`)** — Auth-guarded (admin Custom Claims); full CRUD on all Firestore collections; Firebase Storage image upload; Stripe order/payment read-back
4. **Booking System (cross-cutting)** — Firestore transactions for atomic seat reservation; booking state held in Firestore subcollection (`/experiences/{id}/dates/{dateId}`); Stripe session metadata carries fulfillment context
5. **Payment Layer** — Server Actions create Stripe Checkout Sessions; `/api/webhooks/stripe` Route Handler is the single source of truth for order and booking fulfillment; idempotency via stored Stripe event IDs in Firestore
6. **Auth / Middleware** — Firebase Auth client SDK + `jose`-encrypted session cookie; Next.js middleware decrypts cookie and checks Custom Claims; three-layer defense (middleware + Server Action guards + Firestore security rules)

### Critical Pitfalls

1. **Firebase client SDK used on the server** — `getAuth().currentUser` always returns `null` in Server Components. Use `firebase-admin` exclusively server-side with session cookie verification. Set up the Admin SDK singleton (`lib/firebase-admin.ts` with `getApps()` guard) on day one.

2. **Booking race conditions via non-transactional writes** — Two concurrent users reading the same `availableSeats` count and both writing decrements causes overbooking. Every seat decrement must be a `runTransaction` call. This is a legal liability under Norwegian consumer law. Architect before building the checkout flow.

3. **Stripe webhook double-fulfillment** — Stripe retries on timeout. Without idempotency, the same event creates duplicate orders and sends duplicate emails. Store processed Stripe event IDs in Firestore before fulfillment; return HTTP 200 for duplicates. Must be implemented alongside the webhook handler, not as later hardening.

4. **Stripe webhook raw body parsing failure** — Using `request.json()` in the Route Handler invalidates the signature verification, breaking the entire webhook flow or opening a security hole if verification is disabled. Use `request.text()` for raw body.

5. **Firestore security rules left open** — Development-mode `allow read, write: if true` left in production exposes all customer orders and bookings (GDPR violation) and enables data corruption by any user. Write rules in lockstep with the data model from day one.

6. **Norwegian legal gaps** — WCAG 2.1 AA is a legal mandate (not a best practice) under universell utforming law. Cookie consent under ekomloven §2-7b is required before any analytics fires. Angrerrettloven requires withdrawal notices with acknowledgement checkbox at checkout. All three must be designed in from the start, not added retroactively.

---

## Implications for Roadmap

Based on the dependency analysis in ARCHITECTURE.md and the pitfall phase-warnings in PITFALLS.md, a 7-phase structure is recommended. This matches the build-order derived from the architecture research.

### Phase 1: Foundation
**Rationale:** Auth, data access, and middleware must be correct before any feature is built. Three of the six critical pitfalls (client SDK on server, security rules, Firebase Admin cold-start) strike at this phase. Getting these wrong means expensive refactors across every subsequent phase.
**Delivers:** Working Firebase project (Auth, Firestore, Storage), Next.js scaffold with Tailwind v4, firebase-admin singleton, middleware auth routing, Firestore security rules skeleton, design system tokens (dark-green + autumn palette with verified WCAG contrast ratios), environment variable setup (no `NEXT_PUBLIC_` on admin credentials).
**Addresses features:** Auth (register, login, logout, password reset), role-based access guard
**Avoids pitfalls:** Pitfall 1 (Admin SDK on server), Pitfall 5 (security rules), Pitfall 7 (cookie consent architecture), Pitfall 13 (Admin SDK singleton), Pitfall 18 (env variable leaks)

### Phase 2: Public Storefront (Read-Only)
**Rationale:** The core customer-facing product. Build before write paths to validate the data model with real queries before committing to schemas. No auth dependency for public pages. This phase also validates ISR and SSG patterns before the more complex SSR checkout phases.
**Delivers:** Product catalog, product detail pages, experience catalog, experience detail pages, blog listing, article detail pages, homepage — all SSG with ISR. Norwegian date/currency formatting. SEO metadata per page. WCAG semantic HTML baseline on all components.
**Addresses features:** Product catalog, experience listing, blog/editorial, SEO, responsive mobile-first design
**Avoids pitfalls:** Pitfall 4 (fat client components — keep `use client` at leaf level), Pitfall 8 (denormalize display data into Firestore schemas now, before write paths)

### Phase 3: Admin Dashboard
**Rationale:** Real content must exist in Firestore before storefront can be tested with real data and before payment flows can be built. Admin CMS is also the write-path validation that proves the Firestore schema is correct before Stripe integration locks it in.
**Delivers:** Admin auth guard (Custom Claims check), product CRUD (create/edit/delete/publish), experience CRUD with date and seat management, blog article CRUD with draft/publish states, Firebase Storage image upload from admin UI. Admin is the template for all subsequent CRUD patterns.
**Addresses features:** Full admin CMS, image upload, role-based access
**Avoids pitfalls:** Pitfall 3 (anti-pattern: role in Firestore document — use Custom Claims), Pitfall 15 (Firestore indexes discovered here before payment phases)

### Phase 4: Cart + Checkout + Orders (Products)
**Rationale:** Payment is the highest-risk phase. Build it after the data model is stable and admin can seed real test products. Start with physical product checkout before adding the booking complexity. Webhook idempotency and raw body handling must be implemented here — not deferred.
**Delivers:** Cart state (localStorage-persisted, survives navigation), shipping cost calculator, Stripe Checkout Session creation via Server Action, Stripe webhook Route Handler with signature verification and idempotency, order creation in Firestore, checkout success/cancel pages with order status polling, guest checkout path.
**Addresses features:** Shopping cart, guest + account checkout, order confirmation, shipping calculation, Stripe payment
**Avoids pitfalls:** Pitfall 2 (webhook raw body — `request.text()`), Pitfall 3 (webhook idempotency — store event IDs), Pitfall 6 (Vercel timeout — async webhook fulfillment), Pitfall 11 (Norwegian VAT/MVA inclusive pricing), Pitfall 14 (guest cart localStorage persistence), Pitfall 17 (angrerrettloven acknowledgement checkbox for physical products)

### Phase 5: Booking System
**Rationale:** Depends on both admin (Phase 3 — experiences and dates must exist) and the Stripe/webhook infrastructure (Phase 4). The most complex single feature: atomic seat reservation, real-time availability, mixed cart, and booking-specific fulfillment in the webhook. Build after the simpler product checkout is proven working.
**Delivers:** Booking form with session/date selector, real-time seat availability via Firestore `onSnapshot`, atomic seat reservation via Firestore `runTransaction`, booking Stripe Checkout Session, booking webhook fulfillment (confirm booking, reverse on payment failure), booking confirmation email, mixed cart (products + experiences in one Stripe session).
**Addresses features:** Experience booking, spot enforcement, booking confirmation, mixed cart differentiator
**Avoids pitfalls:** Pitfall 1 (race conditions — `runTransaction` for every seat decrement), Pitfall 10 (Stripe session metadata for fulfillment context), Pitfall 17 (angrerrettloven exemption notice for experiences)

### Phase 6: Customer Dashboard
**Rationale:** Pure read-side surface consuming data created by Phases 4 and 5. No new data model work required. Building this after the write paths ensures the data being displayed is real and stable.
**Delivers:** Customer profile page, order history with status, order detail pages, booking history with details, booking detail pages, profile settings and password change.
**Addresses features:** Customer account dashboard, order history, booking history, profile management
**Avoids pitfalls:** Pitfall 5 (Firestore rules — customers can only read their own data; enforced at rules layer, not just middleware)

### Phase 7: Polish + Production Readiness
**Rationale:** Cross-cutting quality pass that cannot be fully done earlier because it requires the complete user flows to exist. WCAG audit requires all interactive flows to be complete. Performance audit needs real pages.
**Delivers:** Admin order management view, admin booking management view, WCAG 2.1 AA audit and remediation (keyboard navigation, screen reader testing, focus management), Core Web Vitals performance audit, error boundaries and loading states throughout, sitemap generation, Stripe production keys and webhook endpoint registration, cookie consent CMP integration, final security rules review.
**Addresses features:** WCAG 2.1 AA legal compliance, SEO sitemap/robots.txt, production readiness
**Avoids pitfalls:** Pitfall 12 (WCAG automated tools miss 70% — requires keyboard + screen reader manual testing)

### Phase Ordering Rationale

- **Auth before everything:** Three critical pitfalls are auth-related and propagate forward if wrong. Firebase Admin singleton and security rules cannot be retrofitted without touching every data access point.
- **Read before write:** Building the storefront before admin CMS validates the data model with real queries before the write schema is locked in by payment integration.
- **Admin before payment:** Payment flows require real Firestore data to test against. Admin CMS is the content seed mechanism.
- **Products before bookings:** The booking system shares the Stripe/webhook infrastructure built in Phase 4 but adds significant complexity. Proving the simpler product checkout first reduces risk on the harder booking checkout.
- **Customer dashboard last among features:** No new dependencies — only reads existing data. Safe to defer without blocking other phases.
- **Polish phase last:** WCAG and performance audits require complete user flows to be meaningful.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Cart + Checkout):** Norwegian VAT/MVA configuration in Stripe is nuanced — evaluate Stripe Tax vs. manual MVA calculation before implementation. Verify `@stripe/stripe-js` and `stripe` exact versions at npm before install.
- **Phase 5 (Booking System):** Mixed cart (products + bookings in one Stripe session) is the most novel pattern in this codebase. The Stripe line item structure for mixed types and the webhook routing logic need a design document before coding.
- **Phase 7 (Polish):** WCAG 2.1 AA manual testing requires specific tooling decisions (screen reader, contrast checker) not yet specified.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js + Firebase Admin + jose session cookie is a fully documented pattern in official Next.js auth docs.
- **Phase 2 (Storefront):** SSG/ISR with Server Components is core Next.js — well-documented, no novel patterns.
- **Phase 3 (Admin):** CRUD with Server Actions and Firebase Storage follows a repeatable pattern; build products first as the template, copy for experiences and articles.
- **Phase 6 (Customer Dashboard):** Read-side only; all data models established by earlier phases.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js, Tailwind v4, and jose verified from official docs (nextjs.org, tailwindcss.com). Firebase and Stripe versions are training-data-based — verify exact versions at npm before install |
| Features | HIGH | Table stakes are universally established e-commerce patterns; differentiators are well-suited to the niche; anti-features are confirmed by project scope constraints |
| Architecture | HIGH | All patterns (RSC, Server Actions, Firestore transactions, Stripe webhook as fulfillment source of truth) are standard, production-proven conventions for this stack combination |
| Pitfalls | MEDIUM | External documentation was unavailable during research; findings come from training data (cutoff August 2025). All described failure modes are well-documented community patterns, but Norwegian legal specifics (angrerrettloven, ekomloven) should be validated with a Norwegian legal source before launch |

**Overall confidence:** HIGH for technical decisions; MEDIUM for Norwegian legal compliance specifics

### Gaps to Address

- **Norwegian MVA (VAT) in Stripe:** Whether to use Stripe Tax (automatic Norwegian VAT) or manual price-inclusive-of-VAT storage needs a decision before Phase 4. Stripe Tax configuration for Norway needs verification.
- **Email provider:** Research identified Resend as the transactional email provider but did not establish a specific plan for email templates or the trigger mechanism (webhook → email). Decide before Phase 4.
- **Firebase package versions:** firebase v11, firebase-admin v12, stripe v17, @stripe/stripe-js v4 are from training data. Verify actual current versions at npmjs.com before installation.
- **Mixed cart Stripe structure:** The exact Stripe Checkout Session `line_items` structure for a cart containing both physical products (with shipping) and booking slots (no shipping) needs a design decision. This is the highest-complexity integration point in the platform.
- **Norwegian legal review:** Angrerrettloven withdrawal notice requirements and ekomloven cookie consent obligations should be reviewed against current Norwegian consumer law before the Phase 4 and Phase 7 implementations.

---

## Sources

### Primary (HIGH confidence)
- Next.js 16.2.1 documentation (nextjs.org/docs) — App Router, Server Components, Server Actions, caching, auth, i18n, image optimization
- Tailwind CSS v4 Next.js guide (tailwindcss.com) — `@tailwindcss/postcss` setup confirmed
- Next.js authentication guide — `jose` recommendation confirmed for Edge Runtime session management
- Project requirements (`.planning/PROJECT.md`)

### Secondary (MEDIUM confidence)
- Firebase official docs (training data) — Firestore transactions, Admin SDK, Custom Claims, Security Rules, Storage
- Stripe official docs (training data) — Checkout Sessions, webhook best practices, idempotency
- Norwegian WCAG mandate — uutilsynet.no (universell utforming legal requirement confirmed)
- Next.js Middleware + Edge Runtime constraints — Firebase Admin SDK incompatibility with Edge confirmed

### Tertiary (needs validation before implementation)
- Norwegian angrerrettloven §22 litra a — withdrawal exemption for dated experience bookings
- Norwegian ekomloven §2-7b — cookie consent requirements
- Firebase v11, firebase-admin v12, Stripe v17 exact versions — verify at npmjs.com before install
- Stripe Tax for Norwegian MVA — evaluate during Phase 4 planning

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
