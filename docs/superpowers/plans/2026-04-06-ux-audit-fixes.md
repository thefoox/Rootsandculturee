# UX/UI Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 60+ Norwegian encoding errors, structural HTML issues, missing metadata, broken empty states, and add contact form with Resend, hero enhancements, and "coming soon" states.

**Architecture:** 7 sequential commits, each self-contained and testable. Encoding fixes are pure string replacements. EmptyState gets optional CTA props (backward compatible). Contact form uses existing Resend client via a new server action. Trust bar is a new CMS section type.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, Firebase, Resend, Zod, lucide-react

---

## Task 1: Norwegian Encoding Fixes

**Goal:** Replace all incorrect Norwegian strings (missing ø, å, æ) across the entire codebase.

**Files to modify (grouped by area):**

### Shared libraries

- [ ] **Step 1: Fix `src/lib/validations.ts`**

```
Line 6:  'pakrevd' → 'påkrevd'
Line 10: 'pakrevd' → 'påkrevd'
Line 13: 'pakrevd' → 'påkrevd'
Line 15: 'pakrevd' → 'påkrevd'
Line 16: 'ma vaere' → 'må være'
Line 18: 'pakrevd' → 'påkrevd'
Line 24: 'pakrevd' → 'påkrevd'
Line 27: 'pakrevd' → 'påkrevd'
Line 29: 'pakrevd' → 'påkrevd'
Line 31: 'pakrevd' → 'påkrevd'
Line 33: 'pakrevd' → 'påkrevd'
Line 34: 'pakrevd' → 'påkrevd'
Line 41: 'pakrevd' → 'påkrevd'
Line 45: 'ma vaere' → 'må være'
Line 55: 'pakrevd' → 'påkrevd'
Line 58: 'pakrevd' → 'påkrevd'
Line 61: 'pakrevd' → 'påkrevd'
Line 69: 'pakrevd' → 'påkrevd'
Line 70: 'pakrevd' → 'påkrevd'
Line 71: 'pakrevd' → 'påkrevd'
```

Use `replace_all` for `pakrevd` → `påkrevd` and `ma vaere` → `må være`.

- [ ] **Step 2: Fix `src/lib/navigation.ts`**

```
Line 23: 'Handplukket' → 'Håndplukket'
Line 33: 'Laer tradisjoner og handverk' → 'Lær tradisjoner og håndverk'
Line 91: 'Vanlige sporsmal' → 'Vanlige spørsmål'
Line 94: 'Vilkar' → 'Vilkår'
Line 98: 'Folg oss' → 'Følg oss'
```

- [ ] **Step 3: Fix `src/lib/email/templates.ts`**

```
Line 53: 'nar' → 'når'
Line 83: 'Husk a ta med' → 'Husk å ta med'
Line 86: 'a se deg' → 'å se deg'
Line 109: 'fatt' → 'fått'
Line 117: 'pa rootsculture.no for a handle' → 'på rootsculture.no for å handle'
Line 118: 'maneder' → 'måneder'
```

### Layout components

- [ ] **Step 4: Fix `src/components/layout/Footer.tsx`**

```
Line 46: 'apner i nytt vindu' → 'åpner i nytt vindu'
Line 72: 'Fa nyheter' → 'Få nyheter'
```

- [ ] **Step 5: Fix `src/components/layout/Header.tsx`**

```
Line 188: 'Apne meny' → 'Åpne meny'
```

- [ ] **Step 6: Fix `src/components/layout/NewsletterSignup.tsx`**

```
Line 39: 'Meld pa' → 'Meld på'
```

- [ ] **Step 7: Fix `src/components/shared/Breadcrumbs.tsx`**

```
Line 17: 'Brodsmuler' → 'Brødsmuler'
```

### Auth components

- [ ] **Step 8: Fix `src/components/auth/LoginForm.tsx`**

```
Line 62: 'forsok' → 'forsøk', 'prov' → 'prøv'
Line 66: 'prover pa nytt' → 'prøver på nytt'
Line 94: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 9: Fix `src/components/auth/RegisterForm.tsx`**

```
Line 68: 'prover pa nytt' → 'prøver på nytt'
Line 96: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 10: Fix `src/components/auth/PasswordResetForm.tsx`**

```
Line 41: 'prover pa nytt' → 'prøver på nytt'
```

- [ ] **Step 11: Fix `src/components/konto/PasswordChangeForm.tsx`**

```
Line 33: 'paakrevd' → 'påkrevd'
Line 36: 'ma vaere' → 'må være'
Line 39: 'paakrevd' → 'påkrevd'
Line 56: 'pa nytt' → 'på nytt'
Line 77: 'Prov igjen' → 'Prøv igjen'
Line 81: 'Prov igjen' → 'Prøv igjen'
```

### Cart & checkout

- [ ] **Step 12: Fix `src/components/cart/CartDrawer.tsx`**

```
Line 136: 'Ga til betaling' → 'Gå til betaling'
```

- [ ] **Step 13: Fix `src/components/cart/OrderSummaryPanel.tsx`**

```
Line 19: 'Ga til betaling' → 'Gå til betaling'
```

- [ ] **Step 14: Fix `src/components/checkout/BookingChecklist.tsx`**

```
Line 20: 'Husk a ta med' → 'Husk å ta med'
```

- [ ] **Step 15: Fix `src/components/checkout/CheckoutForm.tsx`**

```
Line 19: 'pakrevd' → 'påkrevd'
Line 20: 'pakrevd' → 'påkrevd'
Line 21: 'ma vaere' → 'må være'
Line 22: 'pakrevd' → 'påkrevd'
Line 113: 'oppsto' → 'oppstod', 'Prov' → 'Prøv'
Line 119: 'Prov' → 'Prøv'
Line 129: 'oppsto' → 'oppstod', 'Prov' → 'Prøv'
```

- [ ] **Step 16: Fix `src/app/(public)/handlekurv/page.tsx`**

```
Line 64: 'Fortsett a handle' → 'Fortsett å handle'
Line 73: 'Ga til betaling' → 'Gå til betaling'
```

- [ ] **Step 17: Fix `src/app/(public)/handlekurv/layout.tsx`**

```
Line 5: 'ga til kassen' → 'gå til kassen'
```

- [ ] **Step 18: Fix `src/app/(public)/checkout/page.tsx`**

```
Line 59: 'Prov igjen' → 'Prøv igjen'
```

### Server actions

- [ ] **Step 19: Fix `src/actions/auth.ts`**

```
Line 70: 'prov pa nytt' → 'prøv på nytt'
Line 113: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 20: Fix `src/actions/profile.ts`**

```
Line 10: 'ma vaere' → 'må være'
Line 16: 'paakrevd' → 'påkrevd'
Line 19: 'ma vaere' → 'må være'
Line 20: 'paakrevd' → 'påkrevd'
Line 58: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 21: Fix `src/actions/checkout.ts`**

```
Line 12: 'pakrevd' → 'påkrevd'
Line 13: 'pakrevd' → 'påkrevd'
Line 14: 'ma vaere' → 'må være'
Line 15: 'pakrevd' → 'påkrevd'
Line 95: 'belop' → 'beløp'
Line 158: 'totalbelop' → 'totalbeløp'
Line 220: 'Prov igjen' → 'Prøv igjen'
Line 226: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 22: Fix `src/actions/email.ts`**

```
Line 10: 'pakrevd' → 'påkrevd'
Line 11: 'pakrevd' → 'påkrevd'
Line 56: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 23: Fix `src/actions/newsletter.ts`**

```
Line 40: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 24: Fix `src/actions/orders.ts`**

```
Line 130: 'vaere' → 'være'
```

- [ ] **Step 25: Fix `src/actions/bookings.ts`**

```
Line 68: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 26: Fix `src/app/api/create-payment-intent/route.ts`**

```
Line 34: 'Prov igjen' → 'Prøv igjen'
```

### Experience pages

- [ ] **Step 27: Fix `src/components/experiences/DateCardPicker.tsx`**

```
Line 72: 'oyeblikket' → 'øyeblikket'
```

- [ ] **Step 28: Fix `src/app/(public)/opplevelser/[slug]/page.tsx`**

```
Line 162: 'bor ta med' → 'bør ta med'
Line 175: 'Kanselleringsvilkar' → 'Kanselleringsvilkår'
Line 247: 'oppmotested' → 'oppmøtested'
```

### Gavekort pages

- [ ] **Step 29: Fix `src/app/(public)/gavekort/page.tsx`**

```
Line 45: 'belop' → 'beløp'
Line 47: 'Belop ma vaere' → 'Beløp må være'
Line 51: 'pakrevd' → 'påkrevd'
Line 54: 'pakrevd' → 'påkrevd'
Line 96: 'Kjop gavekort' → 'Kjøp gavekort'
Line 100-103: 'far' → 'får', 'maneder' → 'måneder'
Line 109: 'Velg belop' → 'Velg beløp'
Line 146: 'Belop' → 'Beløp'
```

- [ ] **Step 30: Fix `src/app/(public)/gavekort/layout.tsx`**

```
Line 4: 'Kjop gavekort' → 'Kjøp gavekort'
Line 5: 'maneder' → 'måneder'
Line 7: 'Kjop gavekort' → 'Kjøp gavekort'
```

### Konto pages

- [ ] **Step 31: Fix `src/app/konto/page.tsx`**

```
Line 55: 'enna' → 'ennå'
Line 81: 'enna' → 'ennå'
```

- [ ] **Step 32: Fix `src/app/konto/ordrer/page.tsx`**

```
Line 27: 'enna' → 'ennå'
```

### Other public pages

- [ ] **Step 33: Fix `src/app/(public)/produkter/page.tsx`**

```
Line 69: 'enna' → 'ennå'
```

- [ ] **Step 34: Fix `src/app/(public)/blogg/page.tsx`**

```
Line 41: 'enna' → 'ennå'
```

### Admin pages

- [ ] **Step 35: Fix `src/app/admin/artikler/page.tsx`**

```
Line 32: 'Prover pa nytt' → 'Prøver på nytt'
Line 100: 'enna' → 'ennå'
Line 101: 'a skrive din forste' → 'å skrive din første'
```

- [ ] **Step 36: Fix `src/app/admin/produkter/page.tsx`**

```
Line 38: 'Prover pa nytt' → 'Prøver på nytt'
Line 119: 'enna' → 'ennå'
Line 120: 'a legge til ditt forste' → 'å legge til ditt første'
```

- [ ] **Step 37: Fix `src/app/admin/opplevelser/page.tsx`**

```
Line 33: 'Prover pa nytt' → 'Prøver på nytt'
Line 100: 'enna' → 'ennå'
Line 101: 'a legge til din forste' → 'å legge til din første'
```

- [ ] **Step 38: Fix `src/app/admin/opplevelser/ny/page.tsx`**

```
Line 224: 'Kanselleringsvilkar' → 'Kanselleringsvilkår'
```

- [ ] **Step 39: Fix `src/app/admin/opplevelser/[id]/page.tsx`**

```
Line 258: 'Kanselleringsvilkar' → 'Kanselleringsvilkår'
```

- [ ] **Step 40: Fix `src/app/admin/ordrer/page.tsx`**

```
Line 105: 'gjennomfort kjop' → 'gjennomført kjøp'
Line 130: 'gjennomfort kjop' → 'gjennomført kjøp'
```

- [ ] **Step 41: Fix `src/app/admin/ordrer/[id]/page.tsx`**

```
Line 85: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 42: Fix `src/app/admin/gavekort/page.tsx`**

```
Line 68: 'enna' → 'ennå'
Line 77: 'Belop' → 'Beløp'
```

- [ ] **Step 43: Fix `src/app/admin/bookinger/page.tsx`**

```
Line 77: 'Prov igjen' → 'Prøv igjen'
```

- [ ] **Step 44: Fix `src/components/admin/RefundDialog.tsx`**

```
Line 66: 'belop' → 'beløp'
Line 70: 'Belopet' → 'Beløpet'
Line 81: 'gjennomfort' → 'gjennomført'
Line 162: 'Belop' → 'Beløp'
```

- [ ] **Step 45: Verify encoding sweep**

Run: `grep -rn "pakrevd\|paakrevd\|vaere\|belop\|Belop\|forsok\|Prov igjen\|prov igjen\|pa nytt\|Ga til\|ga til\|Apne\|apner\|Folg\|sporsmal\|Vilkar\|Kjop\|kjop\|enna\b\|forste\|oyeblikk\|Fortsett a\|gjennomfort\|oppsto\|Husk a ta\|a skrive\|a legge\|Handplukket\|handverk\|Laer \|Brodsmuler\|Meld pa\|maneder\|fatt\b\|oppmotested\|Kanselleringsvilkar\|bor ta\|a se deg\|Fa nyheter" src/`

Expected: zero results (all encoding issues fixed).

- [ ] **Step 46: Commit**

```bash
git add -A
git commit -m "fix: correct Norwegian special character encoding (ø, å, æ) across codebase"
```

---

## Task 2: Structural HTML + Page Metadata

**Files:**
- Modify: `src/app/konto/layout.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/konto/page.tsx`
- Modify: `src/app/konto/ordrer/page.tsx`
- Modify: `src/app/konto/bookinger/page.tsx`

- [ ] **Step 1: Fix nested `<main>` in `src/app/konto/layout.tsx`**

Replace `<main className="max-w-4xl mx-auto px-4 py-8">` with `<div className="max-w-4xl mx-auto px-4 py-8">` and the closing `</main>` with `</div>`.

```tsx
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-heading text-h2 font-bold text-forest mb-6">
        Min konto
      </h1>
      <KontoTabs />
      {children}
    </div>
  )
```

- [ ] **Step 2: Add metadata to `src/app/not-found.tsx`**

Add at top of file, after imports:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Side ikke funnet — Roots & Culture',
}
```

- [ ] **Step 3: Add metadata to `src/app/konto/page.tsx`**

Add after imports:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Min konto — Roots & Culture',
}
```

- [ ] **Step 4: Add metadata to `src/app/konto/ordrer/page.tsx`**

Add after imports:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mine ordrer — Roots & Culture',
}
```

- [ ] **Step 5: Add metadata to `src/app/konto/bookinger/page.tsx`**

Add after imports:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mine bookinger — Roots & Culture',
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/konto/layout.tsx src/app/not-found.tsx src/app/konto/page.tsx src/app/konto/ordrer/page.tsx src/app/konto/bookinger/page.tsx
git commit -m "fix: resolve nested <main> in konto layout and add page metadata"
```

---

## Task 3: Empty State CTA Enhancements

**Files:**
- Modify: `src/components/shared/EmptyState.tsx`
- Modify: `src/components/konto/EmptyState.tsx`
- Modify: `src/app/konto/page.tsx`
- Modify: `src/app/konto/ordrer/page.tsx`
- Modify: `src/app/konto/bookinger/page.tsx`
- Modify: `src/components/experiences/DateCardPicker.tsx`
- Modify: `src/app/(public)/handlekurv/page.tsx`
- Modify: `src/components/sections/ExperiencesGridSection.tsx`
- Modify: `src/components/sections/ProductsGridSection.tsx`

- [ ] **Step 1: Extend shared EmptyState with CTA**

Replace the full content of `src/components/shared/EmptyState.tsx`:

```tsx
import Link from 'next/link'
import type { ElementType } from 'react'

interface EmptyStateProps {
  icon: ElementType | string
  heading: string
  body: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({ icon: Icon, heading, body, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
      {typeof Icon === 'string' ? (
        <span className="text-4xl text-forest" aria-hidden="true">{Icon}</span>
      ) : (
        <Icon className="h-12 w-12 text-forest" aria-hidden="true" />
      )}
      <h2 className="mt-4 font-heading text-h4 font-bold text-forest">
        {heading}
      </h2>
      <p className="mt-2 font-body text-body">
        {body}
      </p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center rounded-full border border-forest px-5 py-2.5 font-body text-body font-medium text-forest motion-safe:transition-colors motion-safe:duration-150 hover:bg-forest hover:text-cream"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Extend konto EmptyState with CTA**

Replace the full content of `src/components/konto/EmptyState.tsx`:

```tsx
import Link from 'next/link'
import { Package } from 'lucide-react'

interface EmptyStateProps {
  message: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({ message, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-10 w-10 text-body/40 mb-3" aria-hidden="true" />
      <p className="text-body">{message}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 inline-flex items-center rounded-full border border-forest px-4 py-2 font-body text-label font-medium text-forest motion-safe:transition-colors motion-safe:duration-150 hover:bg-forest hover:text-cream"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add CTAs to konto empty states**

In `src/app/konto/page.tsx`, update line 55:
```tsx
<EmptyState message="Du har ingen ordrer ennå." ctaLabel="Utforsk opplevelser" ctaHref="/opplevelser" />
```

Update line 81:
```tsx
<EmptyState message="Du har ingen bookinger ennå." ctaLabel="Utforsk opplevelser" ctaHref="/opplevelser" />
```

In `src/app/konto/ordrer/page.tsx`, update line 27:
```tsx
<EmptyState message="Du har ingen ordrer ennå." ctaLabel="Utforsk opplevelser" ctaHref="/opplevelser" />
```

In `src/app/konto/bookinger/page.tsx`, update line 41:
```tsx
<EmptyState message="Du har ingen kommende bookinger." ctaLabel="Utforsk opplevelser" ctaHref="/opplevelser" />
```

- [ ] **Step 4: Add CTA to DateCardPicker empty state**

In `src/components/experiences/DateCardPicker.tsx`, add `import Link from 'next/link'` at top. Replace lines 65-75 (the empty return block):

```tsx
  if (futureDates.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="font-heading text-h4 font-bold text-forest">
          Velg dato
        </h2>
        <p className="mt-4 font-body text-body">
          Ingen tilgjengelige datoer for øyeblikket.
        </p>
        <Link
          href="/kontakt"
          className="mt-3 inline-flex items-center text-label font-medium text-forest hover:underline"
        >
          Kontakt oss for tilgjengelige datoer
        </Link>
      </section>
    )
  }
```

- [ ] **Step 5: Update handlekurv empty state CTA**

In `src/app/(public)/handlekurv/page.tsx`:

Change line 29 from `<Link href="/produkter" className="mt-6">` to `<Link href="/opplevelser" className="mt-6">`.

Change line 30 from `<Button variant="primary">Se produkter</Button>` to `<Button variant="primary">Utforsk opplevelser</Button>`.

Change line 60 from `href="/produkter"` to `href="/opplevelser"`.

- [ ] **Step 6: Add empty fallback to ExperiencesGridSection**

In `src/components/sections/ExperiencesGridSection.tsx`, wrap the grid in a conditional. After line 40 (closing `</div>` of the header), replace lines 41-86 with:

```tsx
        {experiencesWithDates.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {experiencesWithDates.map(({ experience, nextDate }) => {
              const mainImage = experience.images[0]
              return (
                <Link
                  key={experience.id}
                  href={`/opplevelser/${experience.slug}`}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  <div className="relative aspect-[3/4]">
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={mainImage.alt}
                        fill
                        className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-card" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h3 className="font-heading text-h3 font-bold leading-tight text-cream">
                      {experience.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-cream/80">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {experience.location}
                      </span>
                      {nextDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatDate(nextDate.date)}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 font-body text-lg font-bold text-cream">
                      fra {formatPrice(experience.basePrice)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="mt-10 text-center font-body text-body">
            Ingen opplevelser tilgjengelig akkurat nå.
          </p>
        )}
```

- [ ] **Step 7: Add empty fallback to ProductsGridSection**

In `src/components/sections/ProductsGridSection.tsx`, wrap lines 35-72 (the grid) in a conditional:

```tsx
        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {/* ... existing product cards unchanged ... */}
          </div>
        ) : (
          <p className="mt-10 text-center font-body text-body">
            Ingen produkter tilgjengelig akkurat nå.
          </p>
        )}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/shared/EmptyState.tsx src/components/konto/EmptyState.tsx src/app/konto/page.tsx src/app/konto/ordrer/page.tsx src/app/konto/bookinger/page.tsx src/components/experiences/DateCardPicker.tsx src/app/\(public\)/handlekurv/page.tsx src/components/sections/ExperiencesGridSection.tsx src/components/sections/ProductsGridSection.tsx
git commit -m "feat: add CTA support to EmptyState components with browse links"
```

---

## Task 4: Gavekort Validation + Miscellaneous

**Files:**
- Modify: `src/app/(public)/gavekort/page.tsx`
- Modify: `src/components/konto/ProfileForm.tsx`

- [ ] **Step 1: Add `required` and `placeholder` to gavekort form**

In `src/app/(public)/gavekort/page.tsx`:

Add `required` to the Input on line 171-175 (recipientName):
```tsx
            <Input
              label="Mottakers navn"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              error={errors.recipientName}
              required
            />
```

Add `required` to the Input on line 176-181 (recipientEmail):
```tsx
            <Input
              label="Mottakers e-post"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              error={errors.recipientEmail}
              required
            />
```

Add `placeholder` to the custom amount Input on line 145-155:
```tsx
              <Input
                label={`Beløp (${MIN_CUSTOM}–${MAX_CUSTOM} kr)`}
                type="number"
                min={MIN_CUSTOM}
                max={MAX_CUSTOM}
                value={customAmount}
                placeholder="f.eks. 750"
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setErrors((prev) => ({ ...prev, amount: '' }))
                }}
                error={errors.amount}
              />
```

- [ ] **Step 2: Add email hint to ProfileForm**

In `src/components/konto/ProfileForm.tsx`, after the disabled email Input (line 37), add:

```tsx
      <p className="text-label text-body/60 -mt-2">
        Kontakt oss for å endre e-postadresse
      </p>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/gavekort/page.tsx src/components/konto/ProfileForm.tsx
git commit -m "fix: gavekort form validation, profile email hint"
```

---

## Task 5: Hero Enhancements

**Files:**
- Modify: `src/components/sections/HeroSection.tsx`
- Modify: `src/app/(public)/opplevelser/[slug]/page.tsx`
- Modify: `src/app/(public)/opplevelser/kurs/page.tsx`
- Modify: `src/app/(public)/opplevelser/matopplevelse/page.tsx`
- Create: `src/components/sections/TrustBarSection.tsx`
- Modify: `src/types/index.ts`
- Modify: `src/components/sections/SectionRenderer.tsx`

- [ ] **Step 1: Add top gradient + scroll indicator to HeroSection**

In `src/components/sections/HeroSection.tsx`, add `ChevronDown` import:

```tsx
import { ChevronDown } from 'lucide-react'
```

After the existing gradient overlay div (line 24, closing `/>`) and before the content div (line 26), add the top gradient:

```tsx
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
        }}
      />
```

Before the closing `</section>` tag (line 48), add the scroll indicator:

```tsx
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 motion-safe:animate-bounce" aria-hidden="true">
        <ChevronDown className="h-6 w-6 text-cream/70" />
      </div>
```

- [ ] **Step 2: Add top gradient to experience detail hero**

In `src/app/(public)/opplevelser/[slug]/page.tsx`, after the existing `<div className="absolute inset-0 bg-black/25" />` (line 70), add:

```tsx
          <div
            className="absolute inset-x-0 top-0 h-32"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
            }}
          />
```

- [ ] **Step 3: Add top gradient to kurs hero**

In `src/app/(public)/opplevelser/kurs/page.tsx`, after the existing `<div className="absolute inset-0 bg-black/25" />` (line 40), add:

```tsx
        <div
          className="absolute inset-x-0 top-0 h-32"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
          }}
        />
```

- [ ] **Step 4: Add top gradient to matopplevelse hero**

In `src/app/(public)/opplevelser/matopplevelse/page.tsx`, after the existing `<div className="absolute inset-0 bg-black/25" />` (line 40), add:

```tsx
        <div
          className="absolute inset-x-0 top-0 h-32"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
          }}
        />
```

- [ ] **Step 5: Create TrustBarSection component**

Create `src/components/sections/TrustBarSection.tsx`:

```tsx
import { Leaf, RotateCcw, Mountain } from 'lucide-react'
import type { PageSection } from '@/types'

const trustItems = [
  { icon: Leaf, label: 'Lokal produksjon', description: 'Alle produkter fra norsk natur' },
  { icon: RotateCcw, label: '14 dagers angrerett', description: 'Full returrett på alle produkter' },
  { icon: Mountain, label: 'Norsk natur', description: 'Autentiske naturopplevelser' },
]

export function TrustBarSection({ section: _section }: { section: PageSection }) {
  return (
    <section className="border-y border-forest/8 bg-cream py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {trustItems.map(({ icon: Icon, label, description }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <Icon className="h-8 w-8 text-forest" aria-hidden="true" />
              <p className="mt-3 font-heading text-lg font-bold text-forest">{label}</p>
              <p className="mt-1 font-body text-label text-body/70">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Register trust-bar as CMS section type**

In `src/types/index.ts`, update the `SectionType` union (line 119) to add `'trust-bar'`:

```ts
export type SectionType = 'hero' | 'text-image' | 'text' | 'values' | 'team' | 'faq' | 'cta' | 'gallery' | 'contact-info' | 'experiences-grid' | 'articles-grid' | 'products-grid' | 'trust-bar'
```

In `src/components/sections/SectionRenderer.tsx`, add the import and case:

```tsx
import { TrustBarSection } from './TrustBarSection'
```

Add before the `default` case (before line 41):
```tsx
    case 'trust-bar':
      return <TrustBarSection section={section} />
```

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/HeroSection.tsx src/app/\(public\)/opplevelser/\[slug\]/page.tsx src/app/\(public\)/opplevelser/kurs/page.tsx src/app/\(public\)/opplevelser/matopplevelse/page.tsx src/components/sections/TrustBarSection.tsx src/types/index.ts src/components/sections/SectionRenderer.tsx
git commit -m "feat: hero gradient overlay, scroll indicator, and trust bar section"
```

**Note:** To display the trust bar on the homepage, add a section with `type: 'trust-bar'` to the Firestore `pages/forside` document's `sections` array (position it after the hero section). This can be done via the admin CMS editor.

---

## Task 6: Contact Form with Resend

**Files:**
- Create: `src/actions/contact.ts`
- Modify: `src/app/(public)/kontakt/ContactForm.tsx`
- Modify: `src/app/(public)/kontakt/page.tsx`

- [ ] **Step 1: Create contact server action**

Create `src/actions/contact.ts`:

```ts
'use server'

import { z } from 'zod'
import { resend, FROM_EMAIL } from '@/lib/email/resend'

const contactSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd.').max(100),
  email: z.string().email('Ugyldig e-postadresse.'),
  message: z.string().min(10, 'Meldingen må være minst 10 tegn.').max(5000),
})

export interface ContactFormState {
  success: boolean
  error?: string
}

export async function submitContactForm(
  _prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  if (!resend) {
    return { success: false, error: 'E-posttjenesten er ikke konfigurert.' }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: 'post@rootsculture.no',
      replyTo: parsed.data.email,
      subject: `Kontaktskjema: ${parsed.data.name}`,
      text: `Navn: ${parsed.data.name}\nE-post: ${parsed.data.email}\n\nMelding:\n${parsed.data.message}`,
    })

    return { success: true }
  } catch (err) {
    console.error('Contact form error:', err)
    return { success: false, error: 'Kunne ikke sende meldingen. Prøv igjen.' }
  }
}
```

- [ ] **Step 2: Rewrite ContactForm to use server action**

Replace the full content of `src/app/(public)/kontakt/ContactForm.tsx`:

```tsx
'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { submitContactForm, type ContactFormState } from '@/actions/contact'

const initialState: ContactFormState = { success: false }

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast.success('Melding sendt! Vi svarer deg så snart vi kan.')
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <Input
        label="Navn"
        name="name"
        type="text"
        placeholder="Ditt fulle navn"
        required
        autoComplete="name"
      />
      <Input
        label="E-post"
        name="email"
        type="email"
        placeholder="din@epost.no"
        required
        autoComplete="email"
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="melding"
          className="text-label font-normal tracking-wide text-forest"
        >
          Melding
        </label>
        <textarea
          id="melding"
          name="message"
          rows={6}
          placeholder="Skriv din melding her..."
          required
          minLength={10}
          className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-body text-forest placeholder:text-body/60 motion-safe:transition-colors motion-safe:duration-100 focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-forest"
        />
      </div>
      {state && !state.success && state.error && (
        <FormError id="contact-error" message={state.error} />
      )}
      <Button type="submit" loading={isPending} className="w-full md:w-auto">
        Send melding
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Wire ContactForm into kontakt page**

Replace the full content of `src/app/(public)/kontakt/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { DynamicPage } from '@/components/sections/DynamicPage'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt oss — Roots & Culture',
  description:
    'Ta kontakt med Roots & Culture. Vi hjelper deg gjerne med spørsmål om produkter, opplevelser og bestillinger.',
}

export default function KontaktPage() {
  return (
    <>
      <DynamicPage pageId="kontakt" />
      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-[600px] px-4 md:px-8">
          <h2 className="font-heading text-h2 font-bold text-forest">
            Send oss en melding
          </h2>
          <p className="mt-2 font-body text-body">
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

- [ ] **Step 4: Commit**

```bash
git add src/actions/contact.ts src/app/\(public\)/kontakt/ContactForm.tsx src/app/\(public\)/kontakt/page.tsx
git commit -m "feat: wire contact form to Resend email service"
```

---

## Task 7: Coming Soon States

**Files:**
- Modify: `src/app/(public)/blogg/page.tsx`
- Modify: `src/app/(public)/opplevelser/kurs/page.tsx`
- Modify: `src/app/(public)/opplevelser/matopplevelse/page.tsx`

- [ ] **Step 1: Update blogg empty state**

In `src/app/(public)/blogg/page.tsx`, replace the EmptyState usage (lines 38-42):

```tsx
        <EmptyState
          icon={BookOpen}
          heading="Kommer snart"
          body="Vi jobber med å skrive artikler om norsk natur og kultur. Følg med!"
          ctaLabel="Utforsk opplevelser"
          ctaHref="/opplevelser"
        />
```

- [ ] **Step 2: Update kurs empty state**

In `src/app/(public)/opplevelser/kurs/page.tsx`, replace the EmptyState usage (line 82):

```tsx
              <EmptyState icon={Compass} heading="Kommer snart" body="Vi planlegger nye kurs i norsk natur og tradisjoner. Følg med!" ctaLabel="Se alle opplevelser" ctaHref="/opplevelser" />
```

- [ ] **Step 3: Update matopplevelse empty state**

In `src/app/(public)/opplevelser/matopplevelse/page.tsx`, replace the EmptyState usage (line 82):

```tsx
              <EmptyState icon={Compass} heading="Kommer snart" body="Vi planlegger nye matopplevelser med norske tradisjonsretter. Følg med!" ctaLabel="Se alle opplevelser" ctaHref="/opplevelser" />
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/blogg/page.tsx src/app/\(public\)/opplevelser/kurs/page.tsx src/app/\(public\)/opplevelser/matopplevelse/page.tsx
git commit -m "feat: add coming soon states for Blogg, Kurs, and Matopplevelser"
```

---

## Task 8: Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Final encoding sweep**

```bash
grep -rn "pakrevd\|paakrevd\|vaere\|Belop\|belop\|forsok\|Prov igjen\|prov igjen\|pa nytt\|Ga til\|ga til\|Apne\|apner\|Folg\|sporsmal\|Vilkar\|Kjop\|kjop\|Fortsett a\b\|gjennomfort\|Husk a ta\|Brodsmuler\|Meld pa\|maneder\|oppmotested\|Kanselleringsvilkar\|oyeblikk" src/ --include="*.tsx" --include="*.ts"
```

Expected: Zero results.
