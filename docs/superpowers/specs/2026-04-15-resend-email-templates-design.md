# Resend E-post Templates — Design Spec

## Mål

Oppgradere eksisterende plain text e-post-templates til React Email-komponenter med HTML-rendering via Resend. Legge til 3 nye templates (velkomst, nyhetsbrev, passord-tilbakestilling).

## Avhengigheter

Installer: `@react-email/components`

## Mappestruktur

```
src/lib/email/
├── resend.ts                          # Uendret
├── contacts.ts                        # Uendret
├── send.ts                            # NY — sendEmail() wrapper
├── templates.ts                       # Refaktorert — returnerer { subject, html, text }
└── templates/
    ├── components/
    │   └── email-layout.tsx           # Felles layout
    ├── order-confirmation.tsx
    ├── booking-confirmation.tsx
    ├── gift-card.tsx
    ├── mixed-confirmation.tsx
    ├── welcome.tsx
    ├── newsletter.tsx
    └── password-reset.tsx
```

## Delt layout: `EmailLayout`

Wrapper-komponent som alle templates bruker.

**Props:**
```ts
interface EmailLayoutProps {
  previewText: string
  children: React.ReactNode
  showLogo?: boolean    // default: true
  showFooter?: boolean  // default: true
}
```

**Struktur:**
- `<Html lang="nb">`
- `<Preview>` med previewText
- `<Body>` med beige bakgrunn `#f4f1ec`
- `<Container>` sentrert, max-width 600px
- `<Section>` hvit bakgrunn `#ffffff`, border-radius 8px
- Logo: sirkel `#2d5016` med "R", tekst "Roots & Culture"
- `{children}` — template-innhold
- Footer: "Roots & Culture · Oslo, Norge" + avmeld-lenke

**Designtokens (konstanter i layout-filen):**
```ts
const colors = {
  bg: '#f4f1ec',
  content: '#ffffff',
  primary: '#2d5016',
  accent: '#a0522d',
  text: '#1a1a1a',
  muted: '#6b7280',
}

const typography = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  headingSize: '24px',
  bodySize: '15px',
  lineHeight: '1.6',
}

const spacing = {
  contentPadding: '32px',
  sectionGap: '24px',
  btnRadius: '6px',
}
```

## Templates

### 1. Ordrebekreftelse (`order-confirmation.tsx`)

**Props:** Same interface som eksisterende `OrderEmailData` i templates.ts.

**Innhold:**
- Overskrift: "Takk for din bestilling!"
- Hilsen med kundenavn (fra shipping)
- Ordrenummer
- Vareliste som tabell (navn, variant, antall, pris)
- Subtotal, frakt, totalt
- Leveringsadresse (hvis finnes)
- CTA-knapp: "Se bestillingen din" (lenker til ordresiden)
- Avslutningstekst om forsendelse

### 2. Bookingbekreftelse (`booking-confirmation.tsx`)

**Props:** Same interface som eksisterende `BookingEmailData`.

**Innhold:**
- Overskrift: "Booking bekreftet!"
- Hilsen med kundenavn
- Bekreftelseskode
- Opplevelseskort med bakgrunn:
  - Opplevelsesnavn (stor tekst, primærfarge)
  - Dato, antall plasser, pris per plass
  - Earlybird-markering hvis relevant
- Totalt
- "Hva du må ta med"-liste
- CTA-knapp: "Vis booking"
- Avbestillingsinfo i muted tekst

### 3. Gavekort (`gift-card.tsx`)

**Props:** Same interface som eksisterende `GiftCardEmailData`.

**Innhold:**
- Overskrift: "Du har fått et gavekort!"
- Hilsen med mottakernavn
- Gavekort-kode (fremhevet i aksentfarge-boks)
- Verdi
- Personlig hilsen (hvis oppgitt)
- Bruksinformasjon
- Gyldighetsperiode (12 måneder)

### 4. Kombinert ordre+booking (`mixed-confirmation.tsx`)

**Props:** `OrderEmailData` + `BookingEmailData[]`.

**Innhold:**
- Overskrift: "Bestilling og booking bekreftet"
- Ordreseksjon (vareliste, totalt, leveringsadresse)
- Skillelinje
- Bookingseksjon(er) — en per booking
- CTA-knapp

### 5. Velkomst (`welcome.tsx`) — NY

**Props:**
```ts
interface WelcomeEmailData {
  customerName?: string
  customerEmail: string
}
```

**Innhold:**
- Overskrift: "Velkommen til Roots & Culture!"
- Hilsen med kundenavn
- Kort velkomsttekst
- To feature-kort med lys bakgrunn:
  - "Utforsk butikken" — honning, te, naturprodukter
  - "Book en opplevelse" — retreater, kurs, matopplevelser
- CTA-knapp: "Kom i gang"

### 6. Nyhetsbrev (`newsletter.tsx`) — NY

**Props:**
```ts
interface NewsletterEmailData {
  month: string           // f.eks. "April 2026"
  title: string
  intro: string
  articleTitle?: string
  articleDescription?: string
  articleUrl?: string
  articleImageUrl?: string
  products?: Array<{
    name: string
    description: string
    price: number
    url?: string
  }>
}
```

**Innhold:**
- Dato-stempel: "Nyhetsbrev · {month}"
- Hovedoverskrift
- Introtekst
- Artikkel-kort med bilde (hvis oppgitt)
- Produktliste med priser
- CTA-knapp: "Se alle produkter"

### 7. Passord-tilbakestilling (`password-reset.tsx`) — NY

**Props:**
```ts
interface PasswordResetEmailData {
  resetUrl: string
  customerEmail: string
}
```

**Innhold:**
- Overskrift: "Tilbakestill passordet ditt"
- Kort beskrivelse
- CTA-knapp: "Tilbakestill passord"
- Utløpsinformasjon (60 minutter)
- Sikkerhetsmelding

## send.ts — Felles send-wrapper

```ts
export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}): Promise<void>
```

Bruker `resend.emails.send()` med `FROM_EMAIL`. Logger feil, kaster ikke — e-post skal aldri blokkere hovedflyten.

## templates.ts — Refaktorering

Eksisterende funksjoner (`orderConfirmationEmail`, `bookingConfirmationEmail`, etc.) endres til å:
1. Rendre React-komponenten med `render()` fra `@react-email/components`
2. Returnere `{ subject, html, text }` i stedet for `{ subject, text }`
3. Beholde plain text som fallback

Nye funksjoner legges til: `welcomeEmail()`, `newsletterEmail()`, `passwordResetEmail()`.

## Norsk språk

All tekst i templatene er på norsk med riktige æøå. Datoer formateres med `formatDate()` fra `lib/format.ts`. Priser formateres med `formatPrice()`.
