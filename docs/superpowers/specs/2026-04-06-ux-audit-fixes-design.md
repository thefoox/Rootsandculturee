# UX/UI Audit Fixes — Design Spec

**Date:** 2026-04-06
**Status:** Draft
**Scope:** Full audit fixes + new features (encoding, HTML structure, metadata, empty states, contact form, hero enhancements, coming soon states)

---

## Context

A comprehensive UX/UI audit of the Roots & Culture website identified ~30 issues across 14 pages. Codebase verification confirmed most findings and uncovered the encoding problem is larger than reported (60+ instances across 30+ files, not 12). The "missing buy button" finding was a false positive -- the button exists in BookingInfoPanel but only appears after date selection.

This spec covers all confirmed fixes plus three new features: contact form with Resend, hero enhancements (gradient overlay, scroll indicator, trust bar), and "coming soon" states for empty pages.

---

## Wave 1: Norwegian Encoding Fixes

**Goal:** Fix all instances of missing ø, å, æ characters across the codebase.

**Strategy:** File-by-file string replacement. Full grep sweep for common misspellings before starting to catch any the audit missed.

### Known patterns to search for

| Pattern | Correct | Context |
|---------|---------|---------|
| `Apne` | `Åpne` | aria-labels, buttons |
| `apner` | `åpner` | footer text |
| `Fa ` / `fa ` | `Få ` / `få ` | newsletter text |
| `Folg` | `Følg` | footer heading |
| `Meld pa` | `Meld på` | newsletter button |
| `Brodsmuler` | `Brødsmuler` | breadcrumb aria-label |
| `sporsmal` | `spørsmål` | FAQ link text |
| `Vilkar` | `Vilkår` | footer link |
| `Kjop` / `kjop` | `Kjøp` / `kjøp` | gavekort title, checkout |
| `belop` / `Belop` | `beløp` / `Beløp` | gavekort validation |
| `vaere` | `være` | validation messages |
| `pakrevd` / `paakrevd` | `påkrevd` / `påkrevd` | validation messages |
| `forsok` | `forsøk` | auth error messages |
| `prov` / `Prov` | `prøv` / `Prøv` | retry messages |
| `pa nytt` | `på nytt` | retry messages |
| `enna` | `ennå` | empty state messages |
| `forste` | `første` | empty state messages |
| `oyeblikket` | `øyeblikket` | date picker |
| `Ga til` / `ga til` | `Gå til` / `gå til` | checkout buttons |
| `Fortsett a` | `Fortsett å` | cart links |
| `bor` | `bør` | experience detail |
| `Kanselleringsvilkar` | `Kanselleringsvilkår` | booking terms |
| `oppmotested` | `oppmøtested` | experience detail |
| `gjennomfort` | `gjennomført` | admin order status |
| `nar` | `når` | email templates |
| `fatt` | `fått` | email templates |
| `maneder` | `måneder` | gavekort text |
| `a ta med` | `å ta med` | checklist |
| `a skrive` | `å skrive` | admin empty state |
| `a legge` | `å legge` | admin empty state |
| `oppsto` | `oppstod` | checkout error |
| `Handplukket` | `Håndplukket` | navigation descriptions |
| `Laer` | `Lær` | navigation descriptions |
| `handverk` | `håndverk` | navigation descriptions |

### Files to modify

**Public components:**
- `src/components/layout/Footer.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/NewsletterSignup.tsx`
- `src/components/shared/Breadcrumbs.tsx`
- `src/components/cart/CartDrawer.tsx`
- `src/components/cart/OrderSummaryPanel.tsx`
- `src/components/checkout/BookingChecklist.tsx`
- `src/components/checkout/CheckoutForm.tsx`
- `src/components/experiences/DateCardPicker.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/auth/PasswordResetForm.tsx`
- `src/components/konto/PasswordChangeForm.tsx`

**Pages:**
- `src/app/(public)/gavekort/page.tsx`
- `src/app/(public)/gavekort/layout.tsx`
- `src/app/(public)/handlekurv/page.tsx`
- `src/app/(public)/handlekurv/layout.tsx`
- `src/app/(public)/opplevelser/[slug]/page.tsx`
- `src/app/(public)/produkter/page.tsx`
- `src/app/(public)/blogg/page.tsx`
- `src/app/konto/page.tsx`
- `src/app/konto/ordrer/page.tsx`

**Admin pages:**
- `src/app/admin/artikler/page.tsx`
- `src/app/admin/produkter/page.tsx`
- `src/app/admin/opplevelser/page.tsx`
- `src/app/admin/opplevelser/ny/page.tsx`
- `src/app/admin/opplevelser/[id]/page.tsx`
- `src/app/admin/ordrer/page.tsx`
- `src/app/admin/gavekort/page.tsx`
- `src/components/admin/RefundDialog.tsx`

**Shared logic:**
- `src/lib/navigation.ts`
- `src/lib/validations.ts` (20+ fixes in validation messages)
- `src/lib/email/templates.ts`
- `src/actions/auth.ts`
- `src/actions/profile.ts`
- `src/actions/checkout.ts`
- `src/actions/email.ts`
- `src/actions/newsletter.ts`
- `src/actions/orders.ts`
- `src/actions/bookings.ts`
- `src/app/api/create-payment-intent/route.ts`

**Commit:** `fix: correct Norwegian special character encoding (ø, å, æ) across codebase`

---

## Wave 2: Structural HTML + Page Metadata

### 2A: Nested `<main>` fix

**File:** `src/app/konto/layout.tsx`

Change `<main className="max-w-4xl mx-auto px-4 py-8">` to `<div className="...">`. The root layout at `src/app/layout.tsx:36` already provides `<main id="main-content">`.

### 2B: Add metadata exports

| Page | File | Title |
|------|------|-------|
| 404 | `src/app/not-found.tsx` | `Side ikke funnet — Roots & Culture` |
| Min konto | `src/app/konto/page.tsx` | `Min konto — Roots & Culture` |
| Mine ordrer | `src/app/konto/ordrer/page.tsx` | `Mine ordrer — Roots & Culture` |
| Mine bookinger | `src/app/konto/bookinger/page.tsx` | `Mine bookinger — Roots & Culture` |

Each file gets `export const metadata: Metadata = { title: '...' }` with the appropriate `import type { Metadata } from 'next'`.

**Commit:** `fix: resolve nested <main> in konto layout and add page metadata`

---

## Wave 3: Empty State CTA Enhancements

### 3A: Extend shared EmptyState component

**File:** `src/components/shared/EmptyState.tsx`

Add optional props:
```ts
interface EmptyStateProps {
  icon: ElementType | string
  heading: string
  body: string
  ctaLabel?: string
  ctaHref?: string
}
```

When both `ctaLabel` and `ctaHref` are provided, render a `<Link>` styled as a secondary button below the body text. All existing usages continue to work unchanged.

### 3B: Enhance konto EmptyState

**File:** `src/components/konto/EmptyState.tsx`

Same pattern -- add optional `ctaLabel` + `ctaHref` props. Update usages:
- `src/app/konto/ordrer/page.tsx` — CTA: "Utforsk opplevelser" -> `/opplevelser`
- `src/app/konto/bookinger/page.tsx` — CTA: "Utforsk opplevelser" -> `/opplevelser`

### 3C: DateCardPicker empty state

**File:** `src/components/experiences/DateCardPicker.tsx:65-75`

Add a "Kontakt oss" link below "Ingen tilgjengelige datoer for øyeblikket" pointing to `/kontakt`.

### 3D: Handlekurv empty state CTA

**File:** `src/app/(public)/handlekurv/page.tsx`

Change empty state CTA from "Se produkter" (`/produkter`) to "Utforsk opplevelser" (`/opplevelser`) since the products page is currently empty.

### 3E: Grid section empty fallbacks

**Files:**
- `src/components/sections/ExperiencesGridSection.tsx` — Show "Ingen opplevelser tilgjengelig akkurat nå." when grid is empty
- `src/components/sections/ProductsGridSection.tsx` — Show "Ingen produkter tilgjengelig akkurat nå." when grid is empty

**Commit:** `feat: add CTA support to EmptyState components with browse links`

---

## Wave 4: Gavekort Validation + Miscellaneous

### 4A: Gavekort form validation

**File:** `src/app/(public)/gavekort/page.tsx`

- Add `required` attribute to mottakers navn and e-post input fields
- Add `placeholder="f.eks. 750"` to custom amount field

### 4B: Copyright spacing

**File:** `src/components/layout/Footer.tsx`

Verify copyright renders as `© 2026 Roots & Culture` (with space). Fix if needed.

### 4C: Disabled email hint

**File:** `src/components/konto/ProfileForm.tsx` (or equivalent profile form component)

Add helper text below the disabled email field: "Kontakt oss for å endre e-postadresse"

**Commit:** `fix: gavekort form validation, copyright spacing, profile email hint`

---

## Wave 5: Hero Enhancements

### 5A: Dark gradient overlay for nav contrast (WCAG fix)

**File:** `src/components/sections/HeroSection.tsx`

Add a top-edge gradient overlay after the existing bottom-left gradient:
```tsx
<div
  className="absolute inset-x-0 top-0 h-32 z-[1]"
  style={{
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
  }}
/>
```

This ensures white nav text meets WCAG AA contrast (4.5:1) against any hero image.

Also apply to experience category pages that use hero-style headers:
- `src/app/(public)/opplevelser/kurs/page.tsx`
- `src/app/(public)/opplevelser/matopplevelse/page.tsx`
- `src/app/(public)/opplevelser/[slug]/page.tsx`

### 5B: Animated scroll indicator

**File:** `src/components/sections/HeroSection.tsx`

Add before closing `</section>`:
```tsx
<div className="absolute bottom-8 left-1/2 -translate-x-1/2 motion-safe:animate-bounce" aria-hidden="true">
  <ChevronDown className="h-6 w-6 text-cream/70" />
</div>
```

Uses `motion-safe:` prefix to respect `prefers-reduced-motion` (WCAG requirement from CLAUDE.md). Import `ChevronDown` from `lucide-react`.

### 5C: Trust bar section (new CMS section type)

**New file:** `src/components/sections/TrustBarSection.tsx`

Horizontal row with 3 items: "Lokal produksjon", "14 dagers angrerett", "Norsk natur". Each with a lucide-react icon (`Leaf`, `RotateCcw`, `Mountain`). Forest green icons on cream background.

**Type update:** `src/types/index.ts` — Add `'trust-bar'` to `SectionType` union.

**Renderer update:** `src/components/sections/SectionRenderer.tsx` — Add case for `'trust-bar'`.

**CMS data:** Add a `trust-bar` section to the Firestore `forside` page document (via admin panel or script).

**Commit:** `feat: hero gradient overlay, scroll indicator, and trust bar section`

---

## Wave 6: Contact Form with Resend

### 6A: Create contact server action

**New file:** `src/actions/contact.ts`

```ts
'use server'
import { z } from 'zod'
import { resend, FROM_EMAIL } from '@/lib/email/resend'

const contactSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd.').max(100),
  email: z.string().email('Ugyldig e-postadresse.'),
  message: z.string().min(10, 'Meldingen må være minst 10 tegn.').max(5000),
})

export async function submitContactForm(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData
) {
  const parsed = contactSchema.safeParse(...)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: 'post@rootsculture.no',
    replyTo: parsed.data.email,
    subject: `Kontaktskjema: ${parsed.data.name}`,
    text: `Navn: ${parsed.data.name}\nE-post: ${parsed.data.email}\n\nMelding:\n${parsed.data.message}`,
  })

  return { success: true }
}
```

Uses existing `src/lib/email/resend.ts` client. Follows same pattern as `src/actions/email.ts`.

### 6B: Rewrite ContactForm to use server action

**File:** `src/app/(public)/kontakt/ContactForm.tsx`

Replace `setTimeout` simulation with `useActionState(submitContactForm, null)`. On success: show toast, reset form. Follows same pattern as `ProfileForm.tsx`.

### 6C: Wire ContactForm into kontakt page

**File:** `src/app/(public)/kontakt/page.tsx`

```tsx
export default function KontaktPage() {
  return (
    <>
      <DynamicPage pageId="kontakt" />
      <section className="bg-cream section-padding">
        <div className="mx-auto max-w-[600px] px-4 md:px-8">
          <h2 className="font-heading text-h2 font-bold text-forest">
            Send oss en melding
          </h2>
          <p className="mt-2 text-body">
            Fyll ut skjemaet så svarer vi deg så snart vi kan.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
```

### 6D: Make email and Instagram clickable

The `ContactInfoSection` component already supports clickable items when `item.href` is present. The fix is in the CMS data -- add `href` fields to the Firestore kontakt page's contact-info section items:
- Email: `href: "mailto:post@rootsculture.no"`
- Instagram: `href: "https://instagram.com/rootsculture"`

**Commit:** `feat: wire contact form to Resend email service`

---

## Wave 7: Coming Soon States

### 7A: Blogg

**File:** `src/app/(public)/blogg/page.tsx`

Update empty state to use enhanced EmptyState with "Kommer snart" heading and CTA to `/opplevelser`.

### 7B: Kurs

**File:** `src/app/(public)/opplevelser/kurs/page.tsx`

Update empty state to "Kommer snart" with CTA to `/opplevelser`.

### 7C: Matopplevelser

**File:** `src/app/(public)/opplevelser/matopplevelse/page.tsx`

Same pattern with matopplevelse-specific copy.

**Commit:** `feat: add "coming soon" states for Blogg, Kurs, and Matopplevelser`

---

## Verification

After all waves:

1. **Build check:** `npm run build` must succeed with no errors
2. **Encoding sweep:** `grep -rn "Apne\|Folg\|sporsmal\|Vilkar\|Kjop\|belop\|vaere\|pakrevd\|forsok\|prov\b\|enna\b\|oyeblikk\|Ga til\|Brodsmuler" src/` should return zero results
3. **Visual check:** Open browser and verify:
   - Footer: all Norwegian characters render correctly
   - Header: mobile menu aria-label correct
   - `/kontakt`: form visible below CMS content, submit sends email
   - `/`: hero has gradient overlay at top, scroll indicator at bottom, trust bar section renders
   - `/blogg`: shows "Kommer snart" with CTA
   - `/konto`: no duplicate `<main>` in DOM inspector, correct page titles
   - `/gavekort`: form fields have required validation
4. **Accessibility:** Check with browser devtools that only one `<main>` element exists on konto pages
5. **Email test:** Submit contact form and verify email arrives at post@rootsculture.no (requires RESEND_API_KEY in `.env`)

---

## Out of Scope

- Product catalog population (products are empty -- this is a content/business issue, not a code fix)
- Login/registration flow for non-authenticated users in header
- FAQ styling improvements (native `<details>`/`<summary>`)
- Booking date availability data quality
- Product search/filtering
- Social sharing buttons
- Related experiences cross-sell
- Account email change flow
- Map on contact page
