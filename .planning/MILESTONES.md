# Milestones

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
