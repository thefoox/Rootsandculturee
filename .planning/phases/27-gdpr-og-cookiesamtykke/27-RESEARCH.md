# Phase 27: GDPR og cookiesamtykke — Research

**Researched:** 2026-04-16
**Domain:** GDPR compliance, Norwegian ekomlov, cookie consent, right to erasure, data processor agreements
**Confidence:** HIGH (legal requirements), MEDIUM (implementation specifics)

---

## Summary

Phase 27 implements GDPR and Norwegian ekomlov compliance for Roots & Culture. Norwegian law (Ekomloven § 3-15, revised January 1, 2025) now requires GDPR-standard consent for all non-strictly-necessary cookies. The site currently has a partial implementation: a CookieBanner component that stores a binary `cookie-consent` flag in localStorage, and a basic Personvernerklæring at `/personvern`. Both need substantial overhaul.

The cookie inventory is minimal and favorable: the site uses one HttpOnly session cookie (`__session`), localStorage for cart state (`roots-cart`), and localStorage for the consent flag itself. There are no analytics or marketing cookies deployed. This means the consent categories are simple — strictly necessary (session, cart) plus potentially analytics if added in Phase 25/26 — and the primary compliance work is around proper banner UI, policy content completeness, and implementing Art. 15/17 rights in `/konto`.

All four data processors (Firebase/Google, Stripe, Vercel, Resend) have current DPAs and participate in the EU-US Data Privacy Framework, addressing Schrems II transfer concerns. No formal DPA signup is required from the customer side for Stripe and Firebase — they are incorporated into the service agreements — but this should be documented in the privacy policy.

**Primary recommendation:** Build a custom cookie consent solution (replace CookieBanner.tsx) using `vanilla-cookieconsent` v3.1.0. Rewrite the Personvernerklæring with all GDPR Art. 13 elements. Add a new `/informasjonskapsler` route for cookie policy. Implement account deletion (Art. 17) and data export (Art. 15) in `/konto`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Cookie consent banner UI | Browser / Client | — | Must read localStorage/set cookie, respond to user interaction |
| Consent preference storage | Browser / Client | — | Stored in a consent cookie (not HttpOnly) so JS can read it |
| Cookie category gating (analytics init) | Browser / Client | — | Must check consent before loading scripts |
| Personvernerklæring page | Frontend Server (SSR) | — | Static content page, SSR appropriate |
| Informasjonskapselpolicy page | Frontend Server (SSR) | — | Static content page |
| Account deletion (Art. 17) | API / Backend | Browser / Client | Server Action: admin.auth().deleteUser + Firestore cascade |
| Data export (Art. 15) | API / Backend | Browser / Client | Server Action: collect from Firestore, return JSON |
| DPA documentation | Static (policy page) | — | Listed in privacy policy text, no code |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vanilla-cookieconsent | 3.1.0 | Cookie consent banner + category management | Lightweight (~15KB), GDPR-compliant, supports granular categories, works without framework, Next.js compatible as Client Component wrapper. Not yet in project. |
| firebase-admin (existing) | ^13.7.0 | deleteUser + batch Firestore deletes | Already in devDependencies, used for server-side user management |

[VERIFIED: npm registry] vanilla-cookieconsent@3.1.0 published 2025-02-04.

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (no new dependencies needed) | — | — | All other capabilities can be built with existing stack |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vanilla-cookieconsent | Custom hand-rolled banner | Custom is simpler but lacks: proper consent record lifecycle, category gating API, pre-built accessible UI, tested legal compliance patterns. vanilla-cookieconsent v3 adds one small dependency but handles consent storage, categories, and callbacks correctly. |
| vanilla-cookieconsent | Cookiebot / Osano / CookieYes | SaaS solutions require monthly fee and external script. For a site with minimal cookies, a lightweight open-source solution is appropriate. |
| Firestore for consent records | localStorage (current) | Firestore records are useful only if the site has authenticated users AND wants server-side proof of consent. For anonymous visitors, localStorage/cookie is standard. Keep localStorage/consent-cookie approach; add Firestore record for logged-in users only. |

**Installation:**
```bash
npm install vanilla-cookieconsent
```

---

## Architecture Patterns

### System Architecture Diagram

```
User visits site
      |
      v
CookieBanner (Client Component — currently CookieBanner.tsx, to be replaced)
      |
      |-- First visit → show consent modal with categories
      |-- Consent exists → skip banner
      |
      v
vanilla-cookieconsent init
      |-- reads existing consent cookie ("cc_cookie")
      |-- shows/hides banner
      |-- fires onConsent callback
            |
            |-- category "analytics" accepted? → init analytics script
            |-- category "analytics" rejected? → do nothing
      |
Consent stored in "cc_cookie" (non-HttpOnly, SameSite=Lax, ~6 month expiry)

__session cookie (HttpOnly, strictly necessary — NOT gated by consent)
roots-cart localStorage (strictly necessary — NOT gated by consent)
cookie-consent localStorage key → REMOVE (replace with cc_cookie)
```

```
/konto/profil page (authenticated users)
      |
      |-- "Last ned mine data" button
      |      |
      |      v
      |   Server Action: exportUserData(uid)
      |      |-- Firestore: users/{uid}
      |      |-- Firestore: orders where customerId == uid
      |      |-- Firestore: bookings where customerId == uid
      |      |-- returns JSON blob → browser download
      |
      |-- "Slett konto" button (with confirmation dialog)
             |
             v
          Server Action: deleteUserAccount(uid)
             |-- adminDb.collection('users').doc(uid).delete()
             |-- adminDb.collection('orders') — anonymize (null out customerId)
             |-- adminDb.collection('bookings') — anonymize (null out customerId)
             |-- admin.auth().deleteUser(uid)
             |-- deleteSession()
             |-- redirect('/')
```

### Recommended Project Structure
```
src/
├── components/
│   └── layout/
│       └── CookieBanner.tsx          # Replace: vanilla-cookieconsent wrapper
├── app/
│   └── (public)/
│       ├── personvern/
│       │   └── page.tsx              # Rewrite: full GDPR Art. 13 content
│       ├── informasjonskapsler/
│       │   └── page.tsx              # New: cookie policy with inventory table
│       └── konto/
│           └── profil/
│               └── page.tsx          # Add: data export + account deletion UI
├── actions/
│   └── account.ts                    # New: exportUserData, deleteUserAccount
└── lib/
    └── navigation.ts                 # Update: add /informasjonskapsler to footer
```

### Pattern 1: vanilla-cookieconsent Client Component Wrapper

**What:** Wrap vanilla-cookieconsent in a Next.js Client Component that initializes on mount, avoiding SSR issues.
**When to use:** Global layout mount — replaces current CookieBanner.tsx.

```typescript
// Source: https://cookieconsent.orestbida.com/reference/api.html
'use client'

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import 'vanilla-cookieconsent/dist/cookieconsent.css'

export function CookieBanner() {
  useEffect(() => {
    CookieConsent.run({
      cookie: {
        name: 'cc_cookie',
        expiresAfterDays: 182, // ~6 months
        sameSite: 'Lax',
      },
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom right',
          equalWeightButtons: true, // prevents dark pattern
        },
        preferencesModal: {
          layout: 'box',
        },
      },
      categories: {
        necessary: {
          enabled: true,   // always on
          readOnly: true,  // cannot be disabled
        },
        analytics: {
          enabled: false,
        },
        // marketing: { enabled: false } — add if marketing cookies ever introduced
      },
      language: {
        default: 'nb',
        translations: {
          nb: {
            consentModal: {
              title: 'Vi bruker informasjonskapsler',
              description:
                'Vi bruker nødvendige informasjonskapsler for å drive nettstedet. Med ditt samtykke bruker vi også analyseverktøy for å forbedre opplevelsen. <a href="/informasjonskapsler" class="cc__link">Les mer</a>',
              acceptAllBtn: 'Godta alle',
              rejectAllBtn: 'Avslå alle',       // must be equally prominent
              showPreferencesBtn: 'Administrer',
            },
            preferencesModal: {
              title: 'Administrer samtykke',
              acceptAllBtn: 'Godta alle',
              rejectAllBtn: 'Avslå alle',
              savePreferencesBtn: 'Lagre valg',
              sections: [
                {
                  title: 'Nødvendige',
                  description: 'Sesjonshåndtering og handlekurv. Kan ikke deaktiveres.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analyse',
                  description: 'Hjelper oss å forstå hvordan nettstedet brukes.',
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}
```

### Pattern 2: Account Deletion Server Action (Art. 17)

**What:** Cascade delete — anonymize orders/bookings (preserve for accounting), delete user doc, delete Firebase Auth record, delete session.
**When to use:** User-initiated account deletion from `/konto/profil`.

```typescript
// actions/account.ts
'use server'
import { adminDb, adminAuth } from '@/lib/firebase/admin'
import { deleteSession } from '@/lib/session'
import { verifySession } from '@/lib/dal'
import { redirect } from 'next/navigation'

export async function deleteUserAccount(): Promise<void> {
  const session = await verifySession()
  if (!session) redirect('/')

  const uid = session.uid

  // Anonymize orders — keep for legal accounting obligation (up to 5 years)
  // Nulling customerId means user cannot see them, but records remain for accounting
  const ordersSnap = await adminDb
    .collection('orders')
    .where('customerId', '==', uid)
    .get()
  const batch = adminDb.batch()
  for (const doc of ordersSnap.docs) {
    batch.update(doc.ref, { customerId: null, customerEmail: '[slettet]' })
  }

  // Anonymize bookings similarly
  const bookingsSnap = await adminDb
    .collection('bookings')
    .where('customerId', '==', uid)
    .get()
  for (const doc of bookingsSnap.docs) {
    batch.update(doc.ref, { customerId: null, customerEmail: '[slettet]', customerName: '[slettet]' })
  }

  // Delete user profile doc
  batch.delete(adminDb.collection('users').doc(uid))
  await batch.commit()

  // Delete Firebase Auth record
  await adminAuth.deleteUser(uid)

  // Clear session
  await deleteSession()
  redirect('/')
}
```

**Important:** Orders/bookings are NOT hard-deleted. Norwegian accounting law (Bokføringsloven) requires retention of transaction records for 5 years. Anonymization satisfies GDPR while preserving legal obligation.

### Pattern 3: Data Export Server Action (Art. 15)

**What:** Collect all personal data for a user and return as downloadable JSON.
**When to use:** User clicks "Last ned mine data" in `/konto/profil`.

```typescript
// actions/account.ts
export async function exportUserData(): Promise<object> {
  const session = await verifySession()
  if (!session) throw new Error('Ikke pålogget')

  const uid = session.uid

  const [userDoc, ordersSnap, bookingsSnap] = await Promise.all([
    adminDb.collection('users').doc(uid).get(),
    adminDb.collection('orders').where('customerId', '==', uid).get(),
    adminDb.collection('bookings').where('customerId', '==', uid).get(),
  ])

  return {
    profil: userDoc.data() ?? null,
    ordrer: ordersSnap.docs.map(d => d.data()),
    bookinger: bookingsSnap.docs.map(d => d.data()),
    eksportertDato: new Date().toISOString(),
  }
}
```

On the client, trigger a JSON file download using `URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))`.

### Anti-Patterns to Avoid

- **Gating `__session` cookie on consent:** The session cookie is strictly necessary for authentication. It MUST NOT require consent — it would break login. [VERIFIED: Datatilsynet guidelines]
- **Gating `roots-cart` localStorage on consent:** Cart state is strictly necessary for the shopping service to function. No consent required.
- **Binary consent (current banner):** The current `cookie-consent` localStorage flag with no categories is not GDPR-compliant under 2025 ekomlov — it does not give granular control.
- **Hard-deleting orders on Art. 17 requests:** Violates Bokføringsloven. Anonymize instead.
- **Storing consent in Firestore only:** Anonymous/guest visitors never authenticate. Consent must persist in the browser (cookie) regardless of login status.
- **Dark patterns:** Reject button must be equally prominent as Accept button. No pre-checked boxes for optional categories. [VERIFIED: Datatilsynet 2025 guidance]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Consent category management + lifecycle | Custom consent state machine | vanilla-cookieconsent v3 | Handles: consent expiry, withdrawal, per-category callbacks, accessible UI, revision tracking |
| Cookie banner CSS | Custom styles | vanilla-cookieconsent default CSS (customize via CSS vars) | Pre-built accessible WCAG-compliant UI |

**Key insight:** The consent banner is deceptively complex — it needs to handle first visit, subsequent visits, consent withdrawal, category toggling, and callback hooks for gating analytics. vanilla-cookieconsent solves all of this in ~15KB.

---

## Common Pitfalls

### Pitfall 1: __session cookie classified as requiring consent
**What goes wrong:** Developer assumes all cookies need consent, gates the session cookie — users can't log in without accepting cookies, creating a "consent wall."
**Why it happens:** Misunderstanding of "strictly necessary" exemption.
**How to avoid:** Ekomloven § 3-15 explicitly exempts cookies "strictly necessary to deliver the service the user has requested." An HttpOnly session cookie is unambiguously exempt.
**Warning signs:** Login flow breaks when user clicks "Avslå alle."

### Pitfall 2: localStorage not covered by consent
**What goes wrong:** Developers exclude localStorage from cookie policy, but Datatilsynet treats localStorage access the same as cookie access.
**Why it happens:** Name confusion — "cookie law" doesn't literally mean only HTTP cookies.
**How to avoid:** Document `roots-cart` localStorage in the cookie policy as strictly necessary. The 2025 ekomlov applies to any storage or access on the user's device.

### Pitfall 3: Hard-deleting orders on account deletion
**What goes wrong:** Full Firestore cascade delete removes order history needed for VAT/accounting records.
**Why it happens:** "Right to erasure" interpreted as "delete everything."
**How to avoid:** GDPR Art. 17(3)(b) explicitly allows retention when necessary for compliance with a legal obligation. Norwegian Bokføringsloven requires 5-year retention of transaction records. Anonymize: null out personal identifiers while keeping order data.

### Pitfall 4: SSR hydration errors with vanilla-cookieconsent
**What goes wrong:** CookieBanner attempts to access `window`/`document` during SSR, causing hydration mismatch.
**Why it happens:** Next.js renders Server Components on the server.
**How to avoid:** Initialize CookieConsent inside `useEffect()` in a `'use client'` component only. The component returns `null` from render; all DOM manipulation happens after mount.

### Pitfall 5: Consent not re-requested after policy changes
**What goes wrong:** Banner never re-appears after privacy policy update, users never notified.
**Why it happens:** Consent cookie persists.
**How to avoid:** vanilla-cookieconsent supports `revision` field. Bump the revision number when material policy changes occur — the library automatically re-shows the banner.

### Pitfall 6: Schrems II panic — no action actually required
**What goes wrong:** Developer assumes Firebase/Stripe data transfers to US are illegal.
**Why it happens:** Schrems II (2020) invalidated Privacy Shield, causing uncertainty.
**How to avoid:** All three major processors now participate in EU-US Data Privacy Framework (adopted Sept 2023) AND have Standard Contractual Clauses. This provides adequate transfer safeguards. Document in privacy policy — no code change needed. [VERIFIED: Firebase DPA, Stripe DPA, Resend DPA pages]

---

## Runtime State Inventory

Step 2.6: SKIPPED — this is not a rename/refactor phase.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| vanilla-cookieconsent | Cookie banner | Not installed | — | No fallback needed — install in Wave 0 |
| firebase-admin (adminAuth) | deleteUser (Art. 17) | ✓ (devDeps) | ^13.7.0 | — |
| Firebase Auth Admin SDK `deleteUser` | Account deletion | ✓ | Already used | — |

**Missing dependencies with no fallback:**
- vanilla-cookieconsent: install with `npm install vanilla-cookieconsent`

---

## Cookie Inventory (Complete)

This is the full cookie/storage inventory for Roots & Culture as it stands today:

| Name | Type | Category | Duration | Purpose | Consent Required |
|------|------|----------|----------|---------|-----------------|
| `__session` | HttpOnly Cookie | Strictly Necessary | 7 days | Firebase Auth session (JWT via jose) | No — strictly necessary |
| `roots-cart` | localStorage | Strictly Necessary | Until cleared | Shopping cart state | No — strictly necessary |
| `cookie-consent` | localStorage (current) | — | Until cleared | Legacy consent flag (to be removed) | — |
| `cc_cookie` | Cookie (new) | — | 182 days | vanilla-cookieconsent consent record | No — records user's own choice |

**No analytics or marketing cookies are currently deployed.** Phase 25 (SEO & Ytelse) may introduce analytics. If Google Analytics or PostHog is added in Phase 25, the analytics category in the consent banner will gate it.

---

## Personvernerklæring Required Content (GDPR Art. 13)

The existing `/personvern` page is incomplete. Full GDPR Art. 13 disclosure requires:

1. **Behandlingsansvarlig** (Controller identity) — Roots & Culture, org.nr., address, contact email ✓ (partial)
2. **Kontaktdetaljer for personvernombud** — Not applicable for small businesses unless processing large scale sensitive data. State "ikke pålagt" or provide DPO contact if one exists. [ASSUMED]
3. **Formål og rettslig grunnlag** for each processing activity:
   - Ordrebehandling → Art. 6(1)(b) Contractual necessity
   - Sesjonshåndtering → Art. 6(1)(b) Contractual necessity
   - E-postmarkedsføring (newsletter) → Art. 6(1)(a) Samtykke
   - Transaksjonslogg/regnskap → Art. 6(1)(c) Legal obligation (Bokføringsloven)
4. **Mottakere / databehandlere** — Stripe, Firebase/Google Cloud, Vercel, Resend (with their roles)
5. **Overføring til tredjeland** — US, via SCCs and EU-US DPF
6. **Lagringstid** per kategori:
   - Ordrer/bookinger: 5 år (Bokføringsloven)
   - Brukerkonto: Until deletion request or 3 years inactivity [ASSUMED — common practice]
   - Nyhetsbrevsamtykke: Until withdrawal
7. **Den registrertes rettigheter** (Art. 15-22): Innsyn, retting, sletting, begrensning, portabilitet, innsigelse
8. **Klagerett** — Datatilsynet, Postboks 458 Sentrum, 0105 Oslo, postkasse@datatilsynet.no
9. **Automatiserte avgjørelser** — None (state explicitly)

---

## Informasjonskapselpolicy Required Content

Separate from Personvernerklæring, the cookie policy at `/informasjonskapsler` must list each cookie with:
- Name
- Type (HTTP cookie / localStorage)
- Category (Nødvendig / Analyse / Markedsføring)
- Purpose (plain Norwegian)
- Duration
- Set by (first-party or third-party)

---

## Data Processor Agreements Summary

| Processor | Role | DPA Status | Transfer Mechanism | Data Region |
|-----------|------|------------|-------------------|-------------|
| Firebase / Google Cloud | Sub-processor (data storage, auth) | Incorporated into Firebase Terms — DPA at firebase.google.com/terms/data-processing-terms | EU-US DPF + SCCs | Configurable (default US-central). EU region recommended for Firestore: europe-west1 [ASSUMED — verify in Firebase console] |
| Stripe | Sub-processor (payment processing) | DPA at stripe.com/legal/dpa — incorporated into SSA automatically | EU-US DPF + SCCs (Module 2) | US + EU infrastructure |
| Vercel | Sub-processor (hosting) | DPA at vercel.com/legal/dpa | EU-US DPF + SCCs | US-east by default. Edge functions can run in EU. |
| Resend | Sub-processor (transactional email) | DPA at resend.com/legal/dpa — EU-US DPF certified March 2025 | EU-US DPF + SCCs | US |

[VERIFIED: firebase.google.com/terms/data-processing-terms, stripe.com/legal/dpa, vercel.com/legal/dpa, resend.com/legal/dpa — all checked 2026-04-16]

**Action required in privacy policy:** Document all four processors, their roles, and transfer mechanisms. No code changes needed for DPA compliance — agreements are incorporated into service terms.

**Schrems II verdict:** All processors have valid transfer mechanisms (EU-US DPF + SCCs). No blocking concern for this site.

---

## Code Examples

### Remove legacy consent flag from CookieBanner

The existing `localStorage.setItem('cookie-consent', ...)` pattern is replaced entirely by vanilla-cookieconsent's `cc_cookie` cookie. The old `cookie-consent` localStorage key should be cleaned up.

```typescript
// In new CookieBanner.tsx useEffect, clean up legacy key:
useEffect(() => {
  localStorage.removeItem('cookie-consent') // remove legacy flag
  CookieConsent.run({ /* config */ })
}, [])
```

### Footer link update

```typescript
// src/lib/navigation.ts — add informasjonskapsler to Kundeservice column
{ label: 'Informasjonskapsler', href: '/informasjonskapsler' },
```

### Check consent in future analytics init

```typescript
// When analytics is added (Phase 25+):
import * as CookieConsent from 'vanilla-cookieconsent'

if (CookieConsent.acceptedCategory('analytics')) {
  // Initialize analytics
}
// Or use the onConsent callback in the run() config:
onConsent: ({ cookie }) => {
  if (CookieConsent.acceptedCategory('analytics')) {
    // init analytics
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Binary accept/decline consent | Granular per-category consent | Norway: Jan 1 2025 (ekomlov) | Must have separate toggles for necessary / analytics / marketing |
| Privacy Shield (US data transfers) | EU-US Data Privacy Framework + SCCs | DPF adopted Sept 2023, SCCs updated 2021 | Firebase/Stripe/Vercel/Resend all compliant — no action needed |
| "Necessary cookies" exemption | "Strictly necessary cookies" exemption | Jan 1 2025 ekomlov | Raises bar — session and cart clearly qualify; analytics and preferences do not |
| Reject must be findable | Reject must be equally prominent as Accept | EDPB guidance, Datatilsynet 2025 | Banner must show "Avslå alle" button at same visual level as "Godta alle" |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Brukerkonto data retention: 3 years of inactivity is common practice | Personvernerklæring Required Content | Could specify a different period — verify with legal counsel or Datatilsynet guidance |
| A2 | Firebase Firestore is deployed in US-central (not EU region) | Data Processor Agreements | If already in EU region, no concern. If US, the DPF/SCCs are sufficient but EU region is preferred |
| A3 | DPO (personvernombud) is not required for this business | Personvernerklæring Required Content | Small e-commerce site unlikely to meet Art. 37 threshold, but should be confirmed |
| A4 | No Google Analytics or similar tracking is currently deployed | Cookie Inventory | If any analytics are loaded via CMS scripts or external tools, the cookie inventory is incomplete |

---

## Open Questions

1. **Is Firebase Firestore region configured?**
   - What we know: Firebase project region is set at creation time
   - What's unclear: Whether it is EU (europe-west1/2) or US (us-central1)
   - Recommendation: Check Firebase console. EU region preferred for GDPR optics, though US is legally compliant via DPF+SCCs.

2. **Accounting retention period for orders**
   - What we know: Bokføringsloven requires 5-year retention of accounting records
   - What's unclear: Whether Roots & Culture is incorporated (AS) or sole trader (enkeltpersonforetak) — the rules apply to both but context affects what "accounting records" means
   - Recommendation: State 5 years in privacy policy and anonymize (not delete) on Art. 17 request

3. **Newsletter consent handling**
   - What we know: RegisterForm.tsx includes a `newsletterConsent` checkbox, but `registerAction` in auth.ts does not save it to Firestore
   - What's unclear: Whether newsletter consent is being stored anywhere, and if Resend is being used for marketing emails
   - Recommendation: Either implement newsletterConsent storage in Firestore or remove the checkbox. If consent is not stored, sending marketing emails is illegal.

---

## Validation Architecture

`nyquist_validation` is `false` in config.json — this section is skipped.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | (auth already implemented) |
| V3 Session Management | No | (session already implemented) |
| V4 Access Control | Yes | deleteUserAccount Server Action must verify session before executing |
| V5 Input Validation | No | No new user inputs beyond confirmation dialog |
| V6 Cryptography | No | (no new crypto) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| CSRF on account deletion | Tampering | Next.js Server Actions use POST + CSRF token automatically — protected |
| Auth bypass on data export | Information Disclosure | verifySession() guard at top of exportUserData — deny if not authenticated |
| XSS in consent banner | Tampering | vanilla-cookieconsent outputs no user-controlled content — static config only |

---

## Project Constraints (from CLAUDE.md)

- All UI strings must be in Norwegian (Bokmål) — consent banner text, policy pages, error messages
- WCAG 2.1 AA: consent banner must be keyboard navigable, have visible focus, sufficient color contrast
- No motion without `prefers-reduced-motion` guard — apply to banner slide-in animation
- `tailwind.config.js` forbidden — use CSS custom properties (Tailwind v4 pattern)
- Semantic HTML: consent modal must use appropriate roles, `aria-modal`, keyboard trap while open
- No `pages/` directory — App Router only
- No analytics tool (no GA, no PostHog) is in the current stack — analytics consent category should be present in banner but inactive until Phase 25 introduces analytics

---

## Sources

### Primary (HIGH confidence)
- [Datatilsynet — Bruk av informasjonskapsler og sporingsteknologier](https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bruk-av-informasjonskapsler-og-andre-sporingsteknologier/) — legal requirements verified
- [Firebase Data Processing and Security Terms](https://firebase.google.com/terms/data-processing-terms) — DPA status verified
- [Stripe Data Processing Agreement](https://stripe.com/legal/dpa) — DPA status verified (updated Nov 18 2025)
- [Vercel Data Processing Addendum](https://vercel.com/legal/dpa) — DPA status verified
- [Resend Data Processing Addendum](https://resend.com/legal/dpa) — DPA status verified (EU-US DPF certified March 2025)
- [vanilla-cookieconsent npm registry](https://www.npmjs.com/package/vanilla-cookieconsent) — version 3.1.0 verified

### Secondary (MEDIUM confidence)
- [Cookie Information — Norwegian Cookie Guidelines](https://cookieinformation.com/resources/blog/norwegian-cookie-guidelines-explained/) — 2025 ekomlov changes
- [Datatilsynet — Nye cookie-regler fra 1. januar 2025](https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2024/nye-cookie-regler-fra-1.-januar/) — rule change date verified
- [Firebase delete-user-data extension](https://firebase.google.com/docs/extensions/official/delete-user-data) — cascade delete pattern

### Tertiary (LOW confidence)
- Data retention periods for user accounts (3 years) — common practice, not explicitly stated in Datatilsynet guidance

---

## Metadata

**Confidence breakdown:**
- Legal requirements (what consent banner must do): HIGH — Datatilsynet official guidance verified
- Data processor DPA status: HIGH — official DPA pages verified
- Cookie inventory: HIGH — source code verified
- vanilla-cookieconsent integration pattern: MEDIUM — library docs exist, Next.js-specific wiring is training data
- Retention periods and GDPR Art. 13 content: MEDIUM — GDPR text verified, Norwegian specifics partially assumed

**Research date:** 2026-04-16
**Valid until:** 2026-10-16 (stable legal framework — Datatilsynet guidance unlikely to change significantly within 6 months)
