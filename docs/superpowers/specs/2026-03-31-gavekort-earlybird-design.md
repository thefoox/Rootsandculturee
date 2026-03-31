# Design: Gavekort + Earlybird-priser

**Dato:** 2026-03-31
**Status:** Godkjent

## Gavekort

### Kjøpsflyt
1. Kunde besøker `/gavekort`
2. Velger beløp: 500, 1000, 2000, 3000 kr — eller egendefinert (min 100, maks 10 000)
3. Fyller inn: mottakers navn, mottakers e-post, valgfri hilsen
4. Legger gavekort i handlekurv (type: 'giftcard')
5. Betaler via Stripe som vanlig checkout
6. Webhook genererer unik kode (`RC-XXXX-XXXX`) og sender e-post til mottaker via Resend

### Innløsning
1. I checkout: felt for gavekort-kode under betalingsskjema
2. Server Action validerer koden, sjekker saldo
3. Trekker fra totalbeløpet — rest betales med kort
4. Oppdaterer `remainingBalance` i Firestore
5. Hvis gavekort dekker hele beløpet: ingen Stripe-betaling nødvendig

### Datamodell

```typescript
interface GiftCard {
  id: string
  code: string              // RC-XXXX-XXXX (8 tegn, unik)
  amount: number            // Opprinnelig beløp i øre
  remainingBalance: number  // Gjenstående saldo i øre
  purchasedBy: string | null // Firebase UID eller null (gjest)
  purchaserEmail: string
  recipientName: string
  recipientEmail: string
  message: string
  status: 'active' | 'used' | 'expired'
  createdAt: Date
  usedAt: Date | null
  expiresAt: Date           // 12 måneder etter kjøp
}
```

Firestore: `giftCards` collection, dokument-ID = koden

### Admin
- Ny tab i sidebar: "Gavekort" under ORDRE
- Tabell: kode, beløp, saldo, status, kjøpt av, mottaker, dato
- Detalj: se full info, manuelt deaktivere kort

### Stripe-integrasjon
- Gavekort er en linje i PaymentIntent med `metadata.type = 'giftcard'`
- Webhook oppretter GiftCard-dokumentet etter betaling
- Ved innløsning: beregn nytt totalbeløp etter fradrag

## Earlybird-priser

### Admin-flyt
- Når admin oppretter/redigerer en opplevelsesdato:
  - Nytt felt: "Earlybird-pris" (valgfritt, i NOK)
  - Nytt felt: "Earlybird gyldig til" (valgfri dato)
- Hvis begge er satt: earlybird er aktiv til datoen passerer

### Kundevisning
- Opplevelsesdetaljside: hvis earlybird er gyldig for valgt dato:
  - Vis earlybird-pris som hovedpris
  - Vis normalpris gjennomstreket ved siden av
  - Badge: "Earlybird — gyldig til [dato]"
- Etter fristen: vis normalpris uten badge

### Datamodell (utvidelse)

```typescript
// Legg til på ExperienceDate:
interface ExperienceDate {
  // ... eksisterende felt ...
  earlyBirdPrice: number | null    // Øre, null = ingen earlybird
  earlyBirdDeadline: Date | null   // Utløpsdato, null = ingen earlybird
}
```

### Prisberegning
- `getEffectivePrice(date: ExperienceDate, experience: Experience): number`
- Hvis `date.earlyBirdPrice` finnes OG `date.earlyBirdDeadline > now`: returner earlyBirdPrice
- Ellers: returner `date.priceOverride ?? experience.basePrice`

### Stripe-integrasjon
- PaymentIntent bruker `getEffectivePrice()` — aldri hardkodet pris
- Webhook dobbeltsjekker at prisen er korrekt (forhindrer manipulasjon)

## Filer å opprette
- `src/app/(public)/gavekort/page.tsx` — gavekort-side
- `src/components/checkout/GiftCardInput.tsx` — innløsningsfelt i checkout
- `src/lib/data/gift-cards.ts` — data layer
- `src/actions/gift-cards.ts` — Server Actions
- `src/app/admin/gavekort/page.tsx` — admin oversikt

## Filer å modifisere
- `src/types/index.ts` — GiftCard type, earlybird-felt på ExperienceDate
- `src/lib/data/mock-data.ts` — mock earlybird-data
- `src/app/api/webhooks/stripe/route.ts` — håndtere gavekort-kjøp
- `src/actions/checkout.ts` — støtte gavekort-fradrag
- `src/app/(public)/checkout/page.tsx` — gavekort-felt
- `src/app/(public)/opplevelser/[slug]/page.tsx` — earlybird-visning
- `src/components/experiences/BookingInfoPanel.tsx` — earlybird-pris
- `src/components/experiences/DateCard.tsx` — earlybird-badge
- `src/app/admin/opplevelser/ny/page.tsx` — earlybird-felt
- `src/app/admin/opplevelser/[id]/page.tsx` — earlybird-felt
- `src/components/admin/AdminSidebar.tsx` — gavekort-lenke
- `src/lib/navigation.ts` — gavekort i footer
