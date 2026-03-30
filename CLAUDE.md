<!-- GSD:project-start source:PROJECT.md -->
## Project

**Roots & Culture**

Roots & Culture er en norsk nettbutikk som selger naturopplevelser og autentiske produkter knyttet til norsk kulturarv og natur. Kundene kan kjope fysiske produkter (drikke, kaffe/te, naturprodukter), booke opplevelser (naturretreater, kurs, matopplevelser), og lese bloggartikler om natur, kultur og tradisjoner. Alt er pa norsk, med Stripe-betaling og stotte for bade gjestekjop og brukerkonto.

**Core Value:** Kunder kan enkelt oppdage, kjope og booke autentiske norske natur- og kulturopplevelser i en informativ og tilgjengelig nettbutikk.

### Constraints

- **Tech stack**: Next.js (App Router) + Firebase (Firestore, Auth, Storage) + Stripe + Vercel
- **Hosting**: Vercel — optimalisert for Next.js, edge network
- **Betaling**: Stripe — checkout, produkter og bookinger
- **Sprak**: Norsk — all UI, innhold og feilmeldinger pa norsk
- **Tilgjengelighet**: WCAG 2.1 AA — universalutforming er lovpalagt i Norge
- **Ytelse**: Lettvektig, SSR for raskt innhold, minimal JavaScript pa klienten
- **Design**: Morkgronn + hostfarger (rustrod, brent oransje, varm brun). Ingen gul
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
## Architecture: How These Pieces Fit Together
### Authentication Flow (Firebase Auth + jose sessions)
### Data Access Pattern (Firestore + Server Components)
### Stripe Checkout Flow (e-commerce + booking unified)
### Environment Variable Conventions
# Server-only (never NEXT_PUBLIC_)
# Client-exposed (NEXT_PUBLIC_ prefix)
### Firestore Data Model (high-level)
### Norwegian Language Implementation
- `<html lang="nb">` in root layout (Norwegian Bokmål)
- All UI strings as TypeScript constants in `lib/strings.ts` (or inline — single language means no translation overhead)
- Date formatting: `Intl.DateTimeFormat('nb-NO')` for all displayed dates
- Currency: `Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' })`
- Error messages from Server Actions returned in Norwegian
### WCAG 2.1 AA Implementation
- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<button>`) — never `<div onClick>`
- All interactive elements reachable via keyboard (Tab, Enter, Space, Arrow keys)
- All images: meaningful `alt` text or `alt=""` for decorative images
- Color contrast: dark-green + autumn palette must pass 4.5:1 ratio for text
- `aria-live` regions for cart updates, booking confirmations, form errors
- Focus management after navigation (Next.js App Router handles most automatically)
- No motion without `prefers-reduced-motion` media query guard for animations
- Form labels: every input has associated `<label>` (not just placeholder)
## Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` + `tailwind-merge` | latest | Conditional className merging | All components that conditionally apply Tailwind classes. Prevents class conflicts |
| `lucide-react` | latest | Icon library | Open-source, tree-shakeable, accessible icons. Covers all e-commerce icons needed |
| `date-fns` | ^3.x | Date formatting/manipulation | Booking date display, order timestamps. Locale-aware with `nb` locale. Lighter than moment.js |
| `react-hot-toast` or `sonner` | latest | Toast notifications | Cart add confirmations, booking success, error feedback. Must be accessible (aria-live) |
| `@next/third-parties` | bundled | Third-party script loading | If Google Analytics or similar is added later. Avoids manual Script tag management |
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
## Installation
# Core Next.js project
# Tailwind v4 setup (if not already configured by create-next-app)
# Firebase
# Stripe
# Session management
# Validation
# Utilities
# Dev dependencies
### postcss.config.mjs (Tailwind v4)
### app/globals.css (Tailwind v4)
### lib/firebase-admin.ts (server-only)
### lib/firebase.ts (client-side)
## Route Structure
### next.config.ts
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
