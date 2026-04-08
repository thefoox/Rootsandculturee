# Milestones

## v1.1 Polish & Production Readiness (Shipped: 2026-04-08)

**Phases completed:** 5 phases, 19 plans, 35 tasks

**Key accomplishments:**

- revalidateTag cache-invalidering i PUT, nytt autentisert DELETE-endepunkt, dynamisk TrustBarSection med Firestore-data, og imagePosition-felt pa PageSection
- Admin innhold list now has delete with confirmation dialog; 409 duplicate-slug handled as Norwegian toast; dashboard stats verified correct without code changes
- `src/app/(public)/opplevelser/[slug]/page.tsx`
- Opplevelser og artikler edit-sider verifisert komplett: DateSlotsEditor med korrekt date-initialisering, TiptapEditor med article.body, PublishBar med isPublished state — ingen kodeendringer nodvendig
- All section editor types fully wired: trust-bar items editor, text Tiptap body, imagePosition toggle, contact-info href, gallery heading, Vis side link, and dead code removed
- Fixed critical checkout bug where webhook received placeholder@init.no by adding stripe.paymentIntents.update() call on form submit to set real customer metadata on the PI Stripe Elements is bound to
- Race-condition-free cart redirect, isEarlybird confirmation display, and sold-out mock scenario — all checkout/booking flows ready for E2E verification
- CSS design-token cleanup: badge status tokens added, all inline hex replaced with Tailwind token classes in badges, focus ring, and article-prose typography
- DataTable med horizontal scroll-wrapper pa mobil, CartDrawer hover-state, og 5 loading.tsx-filer som eliminerer blank-side-opplevelse under sideinnlasting
- konto/EmptyState upgraded to icon+heading pattern via optional props; all 5 call sites updated with lucide-react icons; admin/ordrer empty state fixed from blank icon string to ShoppingBag with Norwegian error toast
- VariantSelector viser live variant-pris under knappene via formatPrice(activePrice), og statisk PriceBadge skjules betinget for produkter med varianter
- Gavekort page converted to server+client pattern for Next.js Metadata export; konto layout header overlap and order detail email-fallback security fixed
- Norwegian metadata on all public pages plus schema.org Article JSON-LD for blog posts, completing structured data coverage across all three content types (Product, Event, Article)
- 1. `@keyframes hero-enter`
- Button gains px-5 py-2.5 default padding and shadow-sm lift on primary variant; Input gains rounded-lg, px-4 py-3, font-medium label, soft focus ring, and bg-destructive/5 error tint — all transitions upgraded to motion-safe:duration-150
- One-liner:
- `src/hooks/useScrollReveal.ts`

---

## v1.0 MVP (Shipped: 2026-04-07)

**Phases completed:** 6 phases, 13 plans, 25 tasks

**Key accomplishments:**

- Next.js 16.2.1 with Tailwind v4, Firebase client/admin SDK singletons, and Firestore security rules for all 6 collections
- Tailwind v4 @theme brand palette with 7 WCAG-verified colors, Google Fonts via next/font, and three UI primitives (Button, Input, FormError) with full accessibility states
- Sticky header with mega-menu navigation (hover + arrow keys), cart icon placeholder, mobile hamburger overlay with focus trap, 4-column footer with social media, and skip-link -- all Norwegian, WCAG-compliant, responsive from 375px
- Firebase Auth client helpers with jose-encrypted HttpOnly session cookies, Server Actions bridging client to server auth, DAL for server components, and middleware route protection for /admin and /konto
- Auth modal overlay with login, register, and password reset forms wired to Firebase Auth + Server Actions, all Norwegian UI with WCAG-compliant field-level error handling
- Product catalog, experience listing, blog pages with category filtering, Firestore data layer, and full SEO infrastructure (sitemap, robots.txt, metadata)
- Complete admin CMS with sidebar navigation, CRUD for products/experiences/articles, Tiptap rich text editor, Firebase Storage image upload with mandatory alt-text, and site content editing
- localStorage-persisted cart with drawer/page views, Stripe Elements inline checkout, webhook-driven order fulfillment with Firestore transactions, and Resend email confirmations
- Date card picker with real-time Firestore availability, booking-to-cart integration, and admin order/booking management dashboards
- Customer dashboard with tab navigation, order/booking history, profile editing, and password change via Firebase Auth
- Booking confirmation details and real customer email now appear in the ConfirmationModal by adding a Firestore query on stripePaymentIntentId, a public server action for client polling, combined order+booking polling via Promise.all, and threading email through the CheckoutForm callback
- One-liner:
- One-liner:

---
