# Feature Landscape

**Domain:** E-commerce + experience booking platform (Norwegian, nature/culture niche)
**Project:** Roots & Culture
**Researched:** 2026-03-30
**Confidence:** HIGH (domain patterns are well-established; project scope is clearly defined)

---

## Table Stakes

Features users expect from any e-commerce or booking platform. Missing = users abandon and go elsewhere.

### E-Commerce Core

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product catalog with categories | Every shop has categories; users can't find products otherwise | Low | Drinks, coffee/tea, natural products — 3 top-level categories + optional subcategories |
| Product detail page (images, description, price) | Users need full product info before buying | Low | Multiple images, rich description, clear pricing |
| Shopping cart | Persistent across page navigation; expected universally | Low | Cart state must survive page refresh (localStorage or server-side) |
| Checkout flow (guest + account) | Users won't register just to buy | Medium | Guest checkout is non-negotiable; account checkout for returning users |
| Stripe payment integration | Secure card payments are baseline; Norwegian buyers expect familiar payment | Medium | Stripe Elements or Payment Element; handles Norwegian cards |
| Order confirmation (email + page) | Without confirmation, users assume the order failed | Low | Transactional email via Stripe webhook triggering email send |
| Shipping cost calculation | Physical goods require shipping cost shown before payment | Low | Manual rate table in v1 (Norway domestic zones or flat rate) |
| Responsive design (mobile-first) | Majority of Norwegian e-commerce traffic is mobile | Medium | Must work on 375px screens without horizontal scroll |
| Search (product + experience) | Users arriving from Google expect to find things fast | Medium | Basic text search across products and experiences |
| SSL / secure checkout | Browser shows warning without HTTPS; users will not buy | Low | Handled by Vercel by default |

### Booking Core

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Experience listing page | Users need to browse available experiences | Low | Date, spots remaining, price, short description |
| Experience detail page | Full details: what's included, what to bring, location, cancellation | Low | Rich content with multiple images |
| Date picker / session selector | Experiences have fixed dates; user must choose | Low | Admin-defined dates, not open calendar — show available sessions |
| Spots remaining indicator | Scarcity is real; users need to see availability | Low | "3 av 10 plasser igjen" — drives urgency without being manipulative |
| Booking checkout (same cart as products) | Users expect one checkout for everything | High | Most complex feature — mixing physical products with bookings in one Stripe session |
| Booking confirmation (email + page) | Same expectation as order confirmation | Low | Include date, location, what to bring |
| Booking capacity enforcement | Overbooking = crisis; system must block when full | Medium | Firestore transaction to decrement spots atomically |

### Account & Auth

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Register / login / logout | Account users expect standard auth | Low | Firebase Auth (email/password) |
| Password reset via email | Users forget passwords; no reset = locked out forever | Low | Firebase Auth built-in flow |
| Customer profile dashboard | Account holders expect to see their history | Medium | Order history + booking history in one view |
| Order history with status | "Where is my order?" is the #1 customer service question | Medium | Status: placed, confirmed, shipped, delivered |
| Booking history with details | Same expectation for bookings | Low | Past and upcoming bookings; date, experience name, confirmation code |

### Content & SEO

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Blog / article section | Establishes trust and brand authority; SEO critical | Medium | Articles about nature, culture, traditions — editorial content |
| Article detail page | Each article needs a permalink for sharing and SEO | Low | Title, body, images, published date, author optional |
| SEO metadata (title, description, OG tags) | Without this, Google shows garbage previews; social sharing fails | Low | Next.js metadata API handles this per-page |
| Server-side rendering for product/experience pages | Google must crawl pricing and availability | Medium | SSR for dynamic pages, SSG for static articles |
| Sitemap + robots.txt | Search engines need to discover pages | Low | Next.js can auto-generate via next-sitemap |

### Accessibility (WCAG 2.1 AA — legally required in Norway)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Keyboard navigation throughout | Norwegian law (likestillings- og diskrimineringsloven) | Medium | Focus management, skip links, logical tab order |
| Sufficient color contrast (4.5:1 minimum) | Required by WCAG 2.1 AA | Low | Must verify dark green + autumn colors meet ratio |
| Screen reader support (semantic HTML, ARIA) | Required for blind users | Medium | Correct heading hierarchy, form labels, button roles |
| Alt text on all images | Required for WCAG 2.1 AA | Low | Admin must be guided to add alt text in CMS |
| Form error messages (accessible) | Errors must be announced to screen readers | Low | aria-describedby on inputs with errors |

### Admin CMS

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Product management (create, edit, delete) | Without CMS, every update requires a developer | Medium | Title, description, images, price, category, stock |
| Experience management (create, edit, delete) | Admin must control availability | Medium | Title, description, images, dates with spot limits, price |
| Article management (create, edit, publish) | Content must be manageable by non-developers | Medium | Rich text editor, images, publish/draft states |
| Order management (view, status update) | Admin must process and fulfil orders | Medium | List orders, view details, mark as shipped |
| Booking management (view, confirm, cancel) | Admin must see upcoming bookings | Medium | List bookings per experience, per date |
| Role-based access (admin only behind auth) | Admin routes must not be public | Low | Middleware checks Firebase Auth custom claims or a simple admin flag on user document |
| Image upload (products, experiences, articles) | Content needs media management | Low | Firebase Storage upload from admin UI |

---

## Differentiators

Features that set Roots & Culture apart from generic e-commerce. Not expected, but create memorable experiences and loyalty.

### Norwegian Identity & Cultural Immersion

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Norwegian language throughout (no EN fallback) | Feels local and authentic, not a generic global store | Low | All UI strings, error messages, emails in Bokmål |
| Nature-centric editorial content (blog) | Positions brand as authority on Norwegian nature/culture, not just a shop | Medium | Articles about seasonal traditions, foraging, Norwegian landscape — drives organic SEO |
| Seasonal experience categorization | Reflects Norwegian nature calendar (summer hikes, autumn harvest, winter traditions) | Low | Category filter by season — visually distinctive |
| "About the producer" sections on products | Story behind each product creates emotional connection rare in commodity stores | Medium | Rich product provenance fields in CMS — adds authencity |

### Booking Experience Quality

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "What to bring" checklist on booking confirmation | Reduces anxiety for first-time nature experience bookers; reduces support emails | Low | Static per-experience content in CMS; included in confirmation email |
| Experience difficulty / physical level indicator | Helps users self-select; reduces unsuitable bookings and complaints | Low | Simple enum field: lett, moderat, krevende |
| Mixed cart (products + experiences) | Users can buy a coffee kit AND book a retreat in one checkout | High | Significant UX differentiator; most platforms separate these |
| Early-bird / waitlist hint | "Sold out — add to waitlist" keeps users engaged and reduces lost revenue | Medium | Waitlist = email collection only in v1; no automated rebooking |

### Trust & Credibility

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| WCAG 2.1 AA accessibility | Legal compliance and genuine inclusivity — signals quality and professionalism | Medium | Differentiates from many small Norwegian niche shops that fail this |
| Visible cancellation policy on booking pages | Reduces pre-purchase anxiety for higher-ticket experiences | Low | Static policy text per experience in CMS |
| Confirmation code on bookings | Professional touch; enables easy support lookup | Low | Generate unique booking reference on Stripe payment confirmation |
| Post-experience follow-up email hook | Foundation for reviews and repeat bookings (not full review system in v1) | Low | Trigger thank-you email N days after experience date via scheduled function |

---

## Anti-Features

Features to deliberately NOT build in v1. Either they add complexity without proportional value, are explicitly out of scope, or create technical debt.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Multilingual support (EN/DE etc.) | Dilutes Norwegian identity; doubles content maintenance burden; out of scope | Norwegian only. Reassess in v2 if analytics show international traffic |
| Subscription / membership model | Adds billing complexity (Stripe subscriptions), churn management, member-only gating | Contact form for returning customers; loyalty via newsletter in v2 |
| Open calendar booking (request-based) | "Contact us to book" flows add admin overhead and user friction | Admin creates fixed sessions with defined dates and spot limits |
| Product reviews / ratings | Requires moderation pipeline, spam handling, trust signals infrastructure | Add after launch when there are actual customers to review |
| Discount codes / promo system | Complexity disproportionate to v1 customer volume | Stripe has coupons natively — add in v2 if there's a marketing campaign need |
| Wish list / save for later | Nice UX but adds persistence complexity; low conversion impact for small catalog | Users can bookmark product pages |
| Inventory management (advanced) | Full stock tracking with variants, bundles, low-stock alerts = significant scope | Simple stock count per product in v1; manual admin update |
| Live chat / customer support widget | Adds third-party JS weight and ongoing moderation | Contact form + email — sufficient for v1 volume |
| Product variants (size/color/etc.) | Natural products and drinks rarely have variants; adds catalog complexity | Single SKU per product in v1; revisit if product catalog grows |
| Automated shipping integration (Bring/Posten API) | API integration complexity; rate calculation edge cases | Manual flat-rate or weight-based shipping table in admin |
| Social login (Google/Facebook) | Adds OAuth surface area; Norwegian users are comfortable with email/password | Email/password + password reset is sufficient |
| Digital products / downloads | Not in product catalog; different VAT rules in Norway | Physical products only |
| User-generated content (photos, trip reports) | Moderation burden; authentication complexity for contributors | Blog is editorial/admin-created only |
| Points / loyalty program | Requires long-term customer base to have meaning | Newsletter signup as soft loyalty mechanism in v1 |
| Native mobile app | Web-first; responsive PWA covers mobile adequately | Assess mobile app in v2 based on traffic data |

---

## Feature Dependencies

```
Firebase Auth
  └── Customer account registration
        └── Customer profile dashboard
              ├── Order history
              └── Booking history

Stripe integration
  ├── Product checkout
  │     └── Guest checkout (no auth required)
  ├── Experience booking checkout
  │     └── Booking confirmation (webhook → email)
  └── Order confirmation (webhook → email)

Firestore product schema
  └── Product catalog
        └── Product detail page
              └── Add to cart

Firestore experience schema
  └── Experience listing
        └── Experience detail page
              └── Session/date selector
                    └── Spot availability check (Firestore transaction)
                          └── Booking checkout

Mixed cart (products + experiences)
  └── Requires unified cart state
        └── Requires unified Stripe payment session with line items for both

Admin CMS (protected /admin routes)
  ├── Product management → Firestore product documents
  ├── Experience management → Firestore experience documents + session subcollection
  ├── Article management → Firestore article documents
  ├── Order management → Firestore order documents (created by Stripe webhook)
  └── Booking management → Firestore booking documents (created by Stripe webhook)

Blog articles
  └── Article list (SSG)
        └── Article detail page (SSG)
              └── SEO metadata per article

WCAG 2.1 AA
  └── Affects ALL UI components — not a single feature but a quality standard
        ├── Color contrast check on design tokens
        ├── Keyboard focus management in cart/checkout/booking flow
        ├── ARIA on dynamic UI (spots counter, cart count, form errors)
        └── Alt text enforcement in CMS image upload UI
```

---

## MVP Recommendation

The critical path for a working, launchable v1 is:

**Build first (blocking everything else):**
1. Firebase Auth + basic user model
2. Firestore schemas (products, experiences, sessions, orders, bookings, articles)
3. Stripe integration (payment element, webhooks for order/booking creation)

**Build as core product:**
4. Product catalog + detail pages
5. Shopping cart
6. Checkout (guest + account) with Stripe
7. Experience listing + detail pages
8. Session selector + spot availability
9. Booking checkout (unified with product cart)
10. Order/booking confirmation emails
11. Blog article list + detail

**Build in parallel (admin enables content):**
12. Admin CMS — product, experience, article, order, booking management

**Build throughout (quality standard, not a phase):**
13. WCAG 2.1 AA compliance woven into every component

**Defer (not blocking launch):**
- Waitlist for sold-out experiences (low revenue impact in v1)
- Post-experience follow-up email (nice, but requires scheduled function setup)
- "About the producer" rich fields (can be added to CMS after launch)
- Sitemap auto-generation (add before SEO push)

---

## Key Complexity Warnings

| Feature | Why Complex | Mitigation |
|---------|-------------|------------|
| Mixed cart (products + experiences) | Single Stripe PaymentIntent must contain line items for physical goods AND booking slots — different fulfillment flows | Design Firestore cart document to hold both types with a `type` field; generate Stripe line items from cart at checkout; webhook handler must route order items vs booking items separately |
| Booking spot enforcement | Race condition: two users book last spot simultaneously | Use Firestore transaction (runTransaction) to read current spots, check > 0, then decrement atomically — never just read and write separately |
| WCAG throughout | Not a bolt-on; retrofitting accessibility is 3x more expensive | Establish design tokens with correct contrast ratios before building; add keyboard navigation to every interactive component as it's built |
| Admin CMS scope | Easily the largest feature surface in the system | Build CRUD for one entity (products) first as a template; copy pattern for experiences and articles |
| Stripe webhooks for fulfillment | If webhook processing fails, order exists in Stripe but not in Firestore | Implement idempotency key on webhook handler; use Firestore transaction to prevent double-processing; add dead-letter logging |

---

## Sources

- Project requirements: `/home/william/Documents/Rootsnew/.planning/PROJECT.md`
- Domain knowledge: E-commerce UX standards (Nielsen Norman Group patterns), WCAG 2.1 specification, Stripe integration patterns, Firebase Firestore transaction documentation
- Confidence: HIGH for table stakes (universally established patterns); MEDIUM for differentiators (based on niche product/market fit analysis); HIGH for anti-features (explicit project constraints + complexity assessment)
