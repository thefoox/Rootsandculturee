# Resend React Email Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace plain text email templates with React Email HTML templates and add 3 new templates (welcome, newsletter, password reset).

**Architecture:** React Email components in `src/lib/email/templates/` with a shared `EmailLayout` wrapper. Each template is a React component that gets rendered to HTML via `render()` from `@react-email/components`. The existing `templates.ts` becomes the orchestrator that renders components and returns `{ subject, html, text }`. A new `send.ts` centralizes all `resend.emails.send()` calls.

**Tech Stack:** `@react-email/components` (render + components), existing Resend SDK, React 19, TypeScript.

---

### Task 1: Install dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install @react-email/components**

```bash
npm install @react-email/components
```

- [ ] **Step 2: Verify installation**

```bash
node -e "const { render } = require('@react-email/components'); console.log(typeof render)"
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @react-email/components dependency"
```

---

### Task 2: Create shared EmailLayout component

**Files:**
- Create: `src/lib/email/templates/components/email-layout.tsx`

- [ ] **Step 1: Create the layout component**

```tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import * as React from 'react'

export const colors = {
  bg: '#f4f1ec',
  content: '#ffffff',
  primary: '#2d5016',
  accent: '#a0522d',
  text: '#1a1a1a',
  muted: '#6b7280',
}

export const typography = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  headingSize: '24px',
  bodySize: '15px',
  lineHeight: '1.6',
}

export const spacing = {
  contentPadding: '32px',
  sectionGap: '24px',
  btnRadius: '6px',
}

export const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: colors.primary,
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: spacing.btnRadius,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: typography.bodySize,
  fontFamily: typography.fontFamily,
}

interface EmailLayoutProps {
  previewText: string
  children: React.ReactNode
  showLogo?: boolean
  showFooter?: boolean
}

export function EmailLayout({
  previewText,
  children,
  showLogo = true,
  showFooter = true,
}: EmailLayoutProps) {
  return (
    <Html lang="nb">
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: colors.bg,
          fontFamily: typography.fontFamily,
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '32px 16px',
          }}
        >
          <Section
            style={{
              backgroundColor: colors.content,
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {showLogo && (
              <Section style={{ padding: `${spacing.contentPadding} ${spacing.contentPadding} ${spacing.sectionGap}`, textAlign: 'center' as const }}>
                <table role="presentation" style={{ margin: '0 auto 12px' }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: colors.primary,
                          textAlign: 'center' as const,
                          verticalAlign: 'middle',
                          color: '#ffffff',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          fontFamily: typography.fontFamily,
                        }}
                      >
                        R
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Text
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: colors.primary,
                    fontFamily: typography.fontFamily,
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}
                >
                  Roots &amp; Culture
                </Text>
              </Section>
            )}

            {children}

            {showFooter && (
              <>
                <Hr style={{ borderColor: `${colors.muted}33`, margin: `0 ${spacing.contentPadding}` }} />
                <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`, textAlign: 'center' as const }}>
                  <Text style={{ fontSize: '12px', color: colors.muted, margin: '0 0 8px', fontFamily: typography.fontFamily }}>
                    Roots &amp; Culture &middot; Oslo, Norge
                  </Text>
                  <Text style={{ fontSize: '12px', color: colors.muted, margin: 0, fontFamily: typography.fontFamily }}>
                    <Link href="https://rootsculture.no/avmeld" style={{ color: colors.muted, textDecoration: 'underline' }}>
                      Avmeld nyhetsbrev
                    </Link>
                  </Text>
                </Section>
              </>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /home/william/Documents/Rootsnew && npx tsc --noEmit src/lib/email/templates/components/email-layout.tsx 2>&1 | head -20
```

If tsc doesn't resolve paths, just run the full build check:

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/templates/components/email-layout.tsx
git commit -m "feat(email): add shared EmailLayout component with Roots & Culture branding"
```

---

### Task 3: Create OrderConfirmation template

**Files:**
- Create: `src/lib/email/templates/order-confirmation.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout, colors, typography, spacing, buttonStyle } from './components/email-layout'
import { formatPrice } from '@/lib/format'
import type { OrderItem, ShippingAddress } from '@/types'

interface OrderConfirmationProps {
  orderId: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  shipping: ShippingAddress | null
  customerEmail: string
}

export function OrderConfirmation({
  orderId,
  items,
  subtotal,
  shippingCost,
  total,
  shipping,
}: OrderConfirmationProps) {
  const greeting = shipping?.fullName ? `Hei ${shipping.fullName.split(' ')[0]}` : 'Hei'

  return (
    <EmailLayout previewText={`Ordrebekreftelse #${orderId}`}>
      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: typography.headingSize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, lineHeight: '1.3', margin: `0 0 12px` }}>
          Takk for din bestilling!
        </Text>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.sectionGap}` }}>
          {greeting}, vi har mottatt din bestilling og den er nå under behandling. Du får en oppdatering når pakken sendes.
        </Text>
      </Section>

      <Hr style={{ borderColor: `${colors.muted}33`, margin: `0 ${spacing.contentPadding}` }} />

      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
        <Text style={{ fontSize: '12px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 12px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
          Ordredetaljer — #{orderId}
        </Text>

        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' as const }}>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: '10px 0', borderBottom: `1px solid ${colors.muted}22`, fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily }}>
                  {item.name}{item.variantLabel ? ` (${item.variantLabel})` : ''} &times; {item.quantity}
                </td>
                <td style={{ padding: '10px 0', borderBottom: `1px solid ${colors.muted}22`, fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, textAlign: 'right' as const }}>
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: '8px 0 0', fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily }}>Subtotal</td>
              <td style={{ padding: '8px 0 0', fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily, textAlign: 'right' as const }}>{formatPrice(subtotal)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0 0', fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily }}>Frakt</td>
              <td style={{ padding: '4px 0 0', fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily, textAlign: 'right' as const }}>{shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis'}</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0 0', fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700 }}>Totalt</td>
              <td style={{ padding: '12px 0 0', fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, textAlign: 'right' as const }}>{formatPrice(total)}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {shipping && (
        <>
          <Hr style={{ borderColor: `${colors.muted}33`, margin: `${spacing.sectionGap} ${spacing.contentPadding} 0` }} />
          <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
            <Text style={{ fontSize: '12px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
              Leveringsadresse
            </Text>
            <Text style={{ fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, lineHeight: typography.lineHeight, margin: 0 }}>
              {shipping.fullName}<br />
              {shipping.address}<br />
              {shipping.postalCode} {shipping.city}
            </Text>
          </Section>
        </>
      )}

      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`, textAlign: 'center' as const }}>
        <Link href={`https://rootsculture.no/konto/bestillinger/${orderId}`} style={buttonStyle}>
          Se bestillingen din
        </Link>
      </Section>
    </EmailLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates/order-confirmation.tsx
git commit -m "feat(email): add OrderConfirmation React Email template"
```

---

### Task 4: Create BookingConfirmation template

**Files:**
- Create: `src/lib/email/templates/booking-confirmation.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout, colors, typography, spacing, buttonStyle } from './components/email-layout'
import { formatPrice, formatDate } from '@/lib/format'

interface BookingConfirmationProps {
  confirmationCode: string
  experienceName: string
  date: Date
  seats: number
  pricePerSeat: number
  total: number
  isEarlybird?: boolean
  whatToBring: string
  customerEmail: string
  customerName?: string
}

export function BookingConfirmation({
  confirmationCode,
  experienceName,
  date,
  seats,
  pricePerSeat,
  total,
  isEarlybird,
  whatToBring,
  customerName,
}: BookingConfirmationProps) {
  const greeting = customerName ? `Hei ${customerName.split(' ')[0]}` : 'Hei'
  const whatToBringItems = whatToBring
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)

  return (
    <EmailLayout previewText={`Booking bekreftet — ${experienceName}`}>
      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: typography.headingSize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, lineHeight: '1.3', margin: `0 0 12px` }}>
          Booking bekreftet!
        </Text>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.sectionGap}` }}>
          {greeting}, din plass er reservert. Her er detaljene for opplevelsen din.
        </Text>
      </Section>

      <Hr style={{ borderColor: `${colors.muted}33`, margin: `0 ${spacing.contentPadding}` }} />

      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
        <Section style={{ backgroundColor: `${colors.primary}08`, borderRadius: '8px', padding: '20px' }}>
          <Text style={{ fontSize: '11px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
            Opplevelse
          </Text>
          <Text style={{ fontSize: '20px', color: colors.primary, fontWeight: 700, margin: '0 0 16px', fontFamily: typography.fontFamily }}>
            {experienceName}
          </Text>

          <table role="presentation" cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td style={{ paddingRight: '24px', paddingBottom: '8px' }}>
                  <Text style={{ fontSize: '11px', color: colors.muted, margin: '0 0 2px', fontFamily: typography.fontFamily }}>Dato</Text>
                  <Text style={{ fontSize: typography.bodySize, color: colors.text, fontWeight: 600, margin: 0, fontFamily: typography.fontFamily }}>{formatDate(date)}</Text>
                </td>
                <td style={{ paddingRight: '24px', paddingBottom: '8px' }}>
                  <Text style={{ fontSize: '11px', color: colors.muted, margin: '0 0 2px', fontFamily: typography.fontFamily }}>Plasser</Text>
                  <Text style={{ fontSize: typography.bodySize, color: colors.text, fontWeight: 600, margin: 0, fontFamily: typography.fontFamily }}>{seats}</Text>
                </td>
                <td style={{ paddingBottom: '8px' }}>
                  <Text style={{ fontSize: '11px', color: colors.muted, margin: '0 0 2px', fontFamily: typography.fontFamily }}>Pris per plass</Text>
                  <Text style={{ fontSize: typography.bodySize, color: colors.text, fontWeight: 600, margin: 0, fontFamily: typography.fontFamily }}>
                    {formatPrice(pricePerSeat)}{isEarlybird ? ' (earlybird)' : ''}
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          <Hr style={{ borderColor: `${colors.muted}22`, margin: '12px 0' }} />

          <table role="presentation">
            <tbody>
              <tr>
                <td>
                  <Text style={{ fontSize: '11px', color: colors.muted, margin: '0 0 2px', fontFamily: typography.fontFamily }}>Bekreftelseskode</Text>
                  <Text style={{ fontSize: typography.bodySize, color: colors.accent, fontWeight: 700, margin: 0, fontFamily: typography.fontFamily, letterSpacing: '0.05em' }}>
                    {confirmationCode}
                  </Text>
                </td>
                <td style={{ paddingLeft: '24px' }}>
                  <Text style={{ fontSize: '11px', color: colors.muted, margin: '0 0 2px', fontFamily: typography.fontFamily }}>Totalt</Text>
                  <Text style={{ fontSize: typography.bodySize, color: colors.text, fontWeight: 700, margin: 0, fontFamily: typography.fontFamily }}>
                    {formatPrice(total)}
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      </Section>

      {whatToBringItems.length > 0 && (
        <>
          <Hr style={{ borderColor: `${colors.muted}33`, margin: `${spacing.sectionGap} ${spacing.contentPadding} 0` }} />
          <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
            <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: '0 0 8px' }}>
              <span style={{ color: colors.accent, fontWeight: 700 }}>Hva du må ta med:</span>
            </Text>
            {whatToBringItems.map((item, i) => (
              <Text key={i} style={{ fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, margin: '0 0 4px', paddingLeft: '16px' }}>
                &bull; {item}
              </Text>
            ))}
          </Section>
        </>
      )}

      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`, textAlign: 'center' as const }}>
        <Link href={`https://rootsculture.no/konto/bookinger/${confirmationCode}`} style={buttonStyle}>
          Vis booking
        </Link>
        <Text style={{ fontSize: '12px', color: colors.muted, margin: '12px 0 0', fontFamily: typography.fontFamily }}>
          Avbestilling: kostnadsfritt inntil 48 timer før
        </Text>
      </Section>
    </EmailLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates/booking-confirmation.tsx
git commit -m "feat(email): add BookingConfirmation React Email template"
```

---

### Task 5: Create GiftCard template

**Files:**
- Create: `src/lib/email/templates/gift-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout, colors, typography, spacing } from './components/email-layout'
import { formatPrice } from '@/lib/format'

interface GiftCardProps {
  code: string
  amount: number
  recipientName: string
  senderEmail: string
  message: string
}

export function GiftCard({
  code,
  amount,
  recipientName,
  message,
}: GiftCardProps) {
  const greeting = recipientName ? `Hei ${recipientName}` : 'Hei'

  return (
    <EmailLayout previewText="Du har fått et gavekort fra Roots & Culture!">
      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: typography.headingSize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, lineHeight: '1.3', margin: '0 0 12px' }}>
          Du har fått et gavekort!
        </Text>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.sectionGap}` }}>
          {greeting}, noen har gitt deg et gavekort hos Roots &amp; Culture.
        </Text>
      </Section>

      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Section style={{ backgroundColor: `${colors.accent}10`, borderRadius: '8px', padding: '24px', textAlign: 'center' as const }}>
          <Text style={{ fontSize: '11px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
            Gavekort-kode
          </Text>
          <Text style={{ fontSize: '28px', color: colors.accent, fontWeight: 700, margin: '0 0 16px', fontFamily: typography.fontFamily, letterSpacing: '0.08em' }}>
            {code}
          </Text>
          <Text style={{ fontSize: '11px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 4px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
            Verdi
          </Text>
          <Text style={{ fontSize: '22px', color: colors.text, fontWeight: 700, margin: 0, fontFamily: typography.fontFamily }}>
            {formatPrice(amount)}
          </Text>
        </Section>
      </Section>

      {message && (
        <>
          <Hr style={{ borderColor: `${colors.muted}33`, margin: `${spacing.sectionGap} ${spacing.contentPadding}` }} />
          <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
            <Text style={{ fontSize: '12px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
              Personlig hilsen
            </Text>
            <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, fontStyle: 'italic', margin: 0 }}>
              &ldquo;{message}&rdquo;
            </Text>
          </Section>
        </>
      )}

      <Hr style={{ borderColor: `${colors.muted}33`, margin: `${spacing.sectionGap} ${spacing.contentPadding}` }} />

      <Section style={{ padding: `0 ${spacing.contentPadding} ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: '0 0 8px' }}>
          Bruk koden i kassen på rootsculture.no for å handle produkter eller booke opplevelser.
        </Text>
        <Text style={{ fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily, margin: 0 }}>
          Gavekortet er gyldig i 12 måneder.
        </Text>
      </Section>
    </EmailLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates/gift-card.tsx
git commit -m "feat(email): add GiftCard React Email template"
```

---

### Task 6: Create MixedConfirmation template

**Files:**
- Create: `src/lib/email/templates/mixed-confirmation.tsx`

- [ ] **Step 1: Create the component**

This template composes order + booking sections into one email.

```tsx
import {
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout, colors, typography, spacing, buttonStyle } from './components/email-layout'
import { formatPrice, formatDate } from '@/lib/format'
import type { OrderItem, ShippingAddress } from '@/types'

interface BookingData {
  confirmationCode: string
  experienceName: string
  date: Date
  seats: number
  pricePerSeat: number
  total: number
  isEarlybird?: boolean
  whatToBring: string
  customerName?: string
}

interface MixedConfirmationProps {
  orderId: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  shipping: ShippingAddress | null
  customerEmail: string
  bookings: BookingData[]
}

export function MixedConfirmation({
  orderId,
  items,
  subtotal,
  shippingCost,
  total,
  shipping,
  bookings,
}: MixedConfirmationProps) {
  const greeting = shipping?.fullName ? `Hei ${shipping.fullName.split(' ')[0]}` : 'Hei'

  return (
    <EmailLayout previewText="Bestilling og booking bekreftet">
      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: typography.headingSize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, lineHeight: '1.3', margin: '0 0 12px' }}>
          Bestilling og booking bekreftet
        </Text>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.sectionGap}` }}>
          {greeting}, takk for din bestilling og booking hos Roots &amp; Culture.
        </Text>
      </Section>

      {/* Order section */}
      <Hr style={{ borderColor: `${colors.muted}33`, margin: `0 ${spacing.contentPadding}` }} />
      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
        <Text style={{ fontSize: '12px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 12px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
          Bestilling — #{orderId}
        </Text>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' as const }}>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 0', borderBottom: `1px solid ${colors.muted}22`, fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily }}>
                  {item.name}{item.variantLabel ? ` (${item.variantLabel})` : ''} &times; {item.quantity}
                </td>
                <td style={{ padding: '8px 0', borderBottom: `1px solid ${colors.muted}22`, fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, textAlign: 'right' as const }}>
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: '8px 0 0', fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily }}>Subtotal</td>
              <td style={{ padding: '8px 0 0', fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily, textAlign: 'right' as const }}>{formatPrice(subtotal)}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0 0', fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily }}>Frakt</td>
              <td style={{ padding: '4px 0 0', fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily, textAlign: 'right' as const }}>{shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis'}</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0 0', fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700 }}>Totalt bestilling</td>
              <td style={{ padding: '12px 0 0', fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, textAlign: 'right' as const }}>{formatPrice(total)}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {shipping && (
        <Section style={{ padding: `12px ${spacing.contentPadding} 0` }}>
          <Text style={{ fontSize: '13px', color: colors.muted, fontFamily: typography.fontFamily, lineHeight: typography.lineHeight, margin: 0 }}>
            Leveres til: {shipping.fullName}, {shipping.address}, {shipping.postalCode} {shipping.city}
          </Text>
        </Section>
      )}

      {/* Booking sections */}
      {bookings.map((booking, i) => (
        <React.Fragment key={i}>
          <Hr style={{ borderColor: `${colors.muted}33`, margin: `${spacing.sectionGap} ${spacing.contentPadding} 0` }} />
          <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
            <Text style={{ fontSize: '12px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 12px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
              Booking {bookings.length > 1 ? `${i + 1}` : ''}
            </Text>
            <Section style={{ backgroundColor: `${colors.primary}08`, borderRadius: '8px', padding: '16px' }}>
              <Text style={{ fontSize: '18px', color: colors.primary, fontWeight: 700, margin: '0 0 8px', fontFamily: typography.fontFamily }}>
                {booking.experienceName}
              </Text>
              <Text style={{ fontSize: typography.bodySize, color: colors.text, fontFamily: typography.fontFamily, margin: '0 0 4px' }}>
                {formatDate(booking.date)} &middot; {booking.seats} {booking.seats === 1 ? 'plass' : 'plasser'} &middot; {formatPrice(booking.total)}
                {booking.isEarlybird ? ' (earlybird)' : ''}
              </Text>
              <Text style={{ fontSize: '13px', color: colors.accent, fontWeight: 600, fontFamily: typography.fontFamily, margin: 0 }}>
                Kode: {booking.confirmationCode}
              </Text>
            </Section>
          </Section>
        </React.Fragment>
      ))}

      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`, textAlign: 'center' as const }}>
        <Link href="https://rootsculture.no/konto" style={buttonStyle}>
          Se mine bestillinger
        </Link>
      </Section>
    </EmailLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates/mixed-confirmation.tsx
git commit -m "feat(email): add MixedConfirmation React Email template"
```

---

### Task 7: Create Welcome template

**Files:**
- Create: `src/lib/email/templates/welcome.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout, colors, typography, spacing, buttonStyle } from './components/email-layout'

interface WelcomeProps {
  customerName?: string
  customerEmail: string
}

export function Welcome({ customerName }: WelcomeProps) {
  const greeting = customerName ? `Hei ${customerName.split(' ')[0]}` : 'Hei'

  return (
    <EmailLayout previewText="Velkommen til Roots & Culture!">
      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: typography.headingSize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, lineHeight: '1.3', margin: '0 0 12px' }}>
          Velkommen til Roots &amp; Culture!
        </Text>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: '0 0 12px' }}>
          {greeting}! Takk for at du ble med. Vi gleder oss til å dele norsk natur og kultur med deg.
        </Text>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.sectionGap}` }}>
          Med din konto kan du følge bestillinger, lagre favoritter og booke eksklusive opplevelser.
        </Text>
      </Section>

      <Hr style={{ borderColor: `${colors.muted}33`, margin: `0 ${spacing.contentPadding}` }} />

      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
        <Section style={{ backgroundColor: `${colors.primary}0a`, borderRadius: '8px', padding: '16px', marginBottom: '8px' }}>
          <Text style={{ fontSize: typography.bodySize, color: colors.accent, fontWeight: 700, margin: '0 0 4px', fontFamily: typography.fontFamily }}>
            Utforsk butikken
          </Text>
          <Text style={{ fontSize: '14px', color: colors.muted, margin: 0, fontFamily: typography.fontFamily }}>
            Honning, te, naturprodukter og mer
          </Text>
        </Section>
        <Section style={{ backgroundColor: `${colors.primary}0a`, borderRadius: '8px', padding: '16px' }}>
          <Text style={{ fontSize: typography.bodySize, color: colors.accent, fontWeight: 700, margin: '0 0 4px', fontFamily: typography.fontFamily }}>
            Book en opplevelse
          </Text>
          <Text style={{ fontSize: '14px', color: colors.muted, margin: 0, fontFamily: typography.fontFamily }}>
            Naturretreater, kurs og matopplevelser
          </Text>
        </Section>
      </Section>

      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`, textAlign: 'center' as const }}>
        <Link href="https://rootsculture.no" style={buttonStyle}>
          Kom i gang
        </Link>
      </Section>
    </EmailLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates/welcome.tsx
git commit -m "feat(email): add Welcome React Email template"
```

---

### Task 8: Create Newsletter template

**Files:**
- Create: `src/lib/email/templates/newsletter.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  Section,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout, colors, typography, spacing, buttonStyle } from './components/email-layout'
import { formatPrice } from '@/lib/format'

interface NewsletterProduct {
  name: string
  description: string
  price: number
  url?: string
}

interface NewsletterProps {
  month: string
  title: string
  intro: string
  articleTitle?: string
  articleDescription?: string
  articleUrl?: string
  articleImageUrl?: string
  products?: NewsletterProduct[]
}

export function Newsletter({
  month,
  title,
  intro,
  articleTitle,
  articleDescription,
  articleUrl,
  articleImageUrl,
  products,
}: NewsletterProps) {
  return (
    <EmailLayout previewText={title}>
      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: '12px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: typography.fontFamily }}>
          Nyhetsbrev &middot; {month}
        </Text>
        <Text style={{ fontSize: typography.headingSize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, lineHeight: '1.3', margin: '0 0 12px' }}>
          {title}
        </Text>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.sectionGap}` }}>
          {intro}
        </Text>
      </Section>

      {articleTitle && (
        <>
          <Hr style={{ borderColor: `${colors.muted}33`, margin: `0 ${spacing.contentPadding}` }} />
          <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
            <Section style={{ backgroundColor: `${colors.primary}08`, borderRadius: '8px', overflow: 'hidden' }}>
              {articleImageUrl && (
                <Img
                  src={articleImageUrl}
                  width="100%"
                  height="160"
                  alt={articleTitle}
                  style={{ display: 'block', objectFit: 'cover' as const }}
                />
              )}
              <Section style={{ padding: '16px' }}>
                <Text style={{ fontSize: typography.bodySize, color: colors.text, fontWeight: 700, margin: '0 0 6px', fontFamily: typography.fontFamily }}>
                  {articleTitle}
                </Text>
                {articleDescription && (
                  <Text style={{ fontSize: '14px', color: colors.muted, margin: '0 0 12px', fontFamily: typography.fontFamily, lineHeight: typography.lineHeight }}>
                    {articleDescription}
                  </Text>
                )}
                {articleUrl && (
                  <Link href={articleUrl} style={{ fontSize: '14px', color: colors.primary, fontWeight: 600, textDecoration: 'none', fontFamily: typography.fontFamily }}>
                    Les mer &rarr;
                  </Link>
                )}
              </Section>
            </Section>
          </Section>
        </>
      )}

      {products && products.length > 0 && (
        <>
          <Hr style={{ borderColor: `${colors.muted}33`, margin: `${spacing.sectionGap} ${spacing.contentPadding} 0` }} />
          <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}>
            <Text style={{ fontSize: '12px', color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 12px', fontFamily: typography.fontFamily, fontWeight: 600 }}>
              Nytt i butikken
            </Text>
            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                {products.map((product, i) => (
                  <tr key={i}>
                    <td style={{ padding: '8px 0', borderBottom: i < products.length - 1 ? `1px solid ${colors.muted}15` : 'none' }}>
                      <Text style={{ fontSize: typography.bodySize, color: colors.text, margin: 0, fontFamily: typography.fontFamily }}>
                        {product.url ? (
                          <Link href={product.url} style={{ color: colors.text, textDecoration: 'none' }}>
                            <strong>{product.name}</strong>
                          </Link>
                        ) : (
                          <strong>{product.name}</strong>
                        )}
                        {' '}&mdash; {product.description}
                      </Text>
                    </td>
                    <td style={{ padding: '8px 0', borderBottom: i < products.length - 1 ? `1px solid ${colors.muted}15` : 'none', textAlign: 'right' as const, whiteSpace: 'nowrap' as const }}>
                      <Text style={{ fontSize: typography.bodySize, color: colors.accent, fontWeight: 600, fontFamily: typography.fontFamily, margin: 0 }}>
                        {formatPrice(product.price)}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </>
      )}

      <Section style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`, textAlign: 'center' as const }}>
        <Link href="https://rootsculture.no/produkter" style={buttonStyle}>
          Se alle produkter
        </Link>
      </Section>
    </EmailLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates/newsletter.tsx
git commit -m "feat(email): add Newsletter React Email template"
```

---

### Task 9: Create PasswordReset template

**Files:**
- Create: `src/lib/email/templates/password-reset.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout, colors, typography, spacing, buttonStyle } from './components/email-layout'

interface PasswordResetProps {
  resetUrl: string
  customerEmail: string
}

export function PasswordReset({ resetUrl }: PasswordResetProps) {
  return (
    <EmailLayout previewText="Tilbakestill passordet ditt">
      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: typography.headingSize, color: colors.text, fontFamily: typography.fontFamily, fontWeight: 700, lineHeight: '1.3', margin: '0 0 12px' }}>
          Tilbakestill passordet ditt
        </Text>
        <Text style={{ fontSize: typography.bodySize, color: colors.text, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: `0 0 ${spacing.sectionGap}` }}>
          Vi mottok en forespørsel om å tilbakestille passordet ditt. Klikk på knappen under for å velge et nytt passord.
        </Text>
      </Section>

      <Section style={{ padding: `0 ${spacing.contentPadding}`, textAlign: 'center' as const }}>
        <Link href={resetUrl} style={buttonStyle}>
          Tilbakestill passord
        </Link>
      </Section>

      <Hr style={{ borderColor: `${colors.muted}33`, margin: `${spacing.sectionGap} ${spacing.contentPadding}` }} />

      <Section style={{ padding: `0 ${spacing.contentPadding} ${spacing.contentPadding}` }}>
        <Text style={{ fontSize: '14px', color: colors.muted, lineHeight: typography.lineHeight, fontFamily: typography.fontFamily, margin: 0 }}>
          Lenken er gyldig i 60 minutter. Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.
        </Text>
      </Section>
    </EmailLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates/password-reset.tsx
git commit -m "feat(email): add PasswordReset React Email template"
```

---

### Task 10: Create send.ts wrapper

**Files:**
- Create: `src/lib/email/send.ts`

- [ ] **Step 1: Create the send wrapper**

```ts
import 'server-only'
import { resend, FROM_EMAIL } from './resend'

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}): Promise<void> {
  if (!resend) {
    console.warn('Resend not configured — skipping email send')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    })
  } catch (err) {
    console.error('Email send error:', err)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/send.ts
git commit -m "feat(email): add sendEmail wrapper with error handling"
```

---

### Task 11: Refactor templates.ts to render React components

**Files:**
- Modify: `src/lib/email/templates.ts`

This is the key integration step. The existing functions keep their signatures but now return `{ subject, html, text }` instead of `{ subject, text }`.

- [ ] **Step 1: Rewrite templates.ts**

Replace the entire contents of `src/lib/email/templates.ts` with:

```ts
import { render } from '@react-email/components'
import { formatPrice, formatDate } from '@/lib/format'
import type { OrderItem, ShippingAddress } from '@/types'
import { OrderConfirmation } from './templates/order-confirmation'
import { BookingConfirmation } from './templates/booking-confirmation'
import { GiftCard } from './templates/gift-card'
import { MixedConfirmation } from './templates/mixed-confirmation'
import { Welcome } from './templates/welcome'
import { Newsletter } from './templates/newsletter'
import { PasswordReset } from './templates/password-reset'

interface OrderEmailData {
  orderId: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  shipping: ShippingAddress | null
  customerEmail: string
}

interface BookingEmailData {
  confirmationCode: string
  experienceName: string
  date: Date
  seats: number
  pricePerSeat: number
  total: number
  isEarlybird?: boolean
  whatToBring: string
  customerEmail: string
  customerName?: string
}

interface GiftCardEmailData {
  code: string
  amount: number
  recipientName: string
  senderEmail: string
  message: string
}

interface WelcomeEmailData {
  customerName?: string
  customerEmail: string
}

interface NewsletterEmailData {
  month: string
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

interface PasswordResetEmailData {
  resetUrl: string
  customerEmail: string
}

// --- Plain text fallbacks (kept from original) ---

function orderPlainText(data: OrderEmailData): string {
  const itemLines = data.items
    .map(
      (item) =>
        `  - ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    )
    .join('\n')

  const shippingLines = data.shipping
    ? `\nLeveringsadresse:\n  ${data.shipping.fullName}\n  ${data.shipping.address}\n  ${data.shipping.postalCode} ${data.shipping.city}`
    : ''

  return `Hei!\n\nTakk for din bestilling hos Roots & Culture.\n\nOrdrenummer: ${data.orderId}\n\nVarer:\n${itemLines}\n\nSubtotal: ${formatPrice(data.subtotal)}\nFrakt: ${data.shippingCost > 0 ? formatPrice(data.shippingCost) : 'Gratis'}\nTotalt: ${formatPrice(data.total)}\n${shippingLines}\n\nVi sender deg en oppdatering når bestillingen er sendt.\n\nMed vennlig hilsen,\nRoots & Culture\n`
}

function bookingPlainText(data: BookingEmailData): string {
  const whatToBringItems = data.whatToBring
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `  - ${item}`)
    .join('\n')

  const greeting = data.customerName ? `Hei ${data.customerName}!` : 'Hei!'

  return `${greeting}\n\nTakk for din booking hos Roots & Culture.\n\nBekreftelseskode: ${data.confirmationCode}\n\nOpplevelse: ${data.experienceName}\nDato: ${formatDate(data.date)}\nAntall plasser: ${data.seats}\nPris per plass: ${formatPrice(data.pricePerSeat)}${data.isEarlybird ? ' (earlybird-pris)' : ''}\nTotalt: ${formatPrice(data.total)}\n\nHusk å ta med:\n${whatToBringItems}\n\nVi gleder oss til å se deg!\n\nMed vennlig hilsen,\nRoots & Culture\n`
}

// --- Public API ---

export async function orderConfirmationEmail(data: OrderEmailData) {
  const html = await render(<OrderConfirmation {...data} />)
  return {
    subject: `Ordrebekreftelse #${data.orderId}`,
    html,
    text: orderPlainText(data),
  }
}

export async function bookingConfirmationEmail(data: BookingEmailData) {
  const html = await render(<BookingConfirmation {...data} />)
  return {
    subject: `Bookingbekreftelse — ${data.experienceName}`,
    html,
    text: bookingPlainText(data),
  }
}

export async function giftCardEmail(data: GiftCardEmailData) {
  const html = await render(<GiftCard {...data} />)
  const greeting = data.recipientName ? `Hei ${data.recipientName}!` : 'Hei!'
  const messageBlock = data.message ? `\nPersonlig hilsen:\n"${data.message}"\n` : ''

  return {
    subject: 'Du har fått et gavekort fra Roots & Culture!',
    html,
    text: `${greeting}\n\nNoen har gitt deg et gavekort hos Roots & Culture.\n\nGavekort-kode: ${data.code}\nVerdi: ${formatPrice(data.amount)}\n${messageBlock}\nBruk koden i kassen på rootsculture.no for å handle produkter eller booke opplevelser.\nGavekortet er gyldig i 12 måneder.\n\nMed vennlig hilsen,\nRoots & Culture\n`,
  }
}

export async function mixedConfirmationEmail(
  orderData: OrderEmailData,
  bookings: BookingEmailData[]
) {
  const html = await render(
    <MixedConfirmation
      {...orderData}
      bookings={bookings}
    />
  )

  const orderText = orderPlainText(orderData)
    .replace('Hei!\n\nTakk for din bestilling hos Roots & Culture.\n\n', '')
    .replace('\nMed vennlig hilsen,\nRoots & Culture\n', '')

  const bookingTexts = bookings
    .map((b) => bookingPlainText(b))
    .map((t) =>
      t
        .replace(/Hei.*!\n\nTakk for din booking hos Roots & Culture.\n\n/, '')
        .replace('\nMed vennlig hilsen,\nRoots & Culture\n', '')
    )
    .join('\n---\n\n')

  return {
    subject: 'Bestilling og booking bekreftet',
    html,
    text: `Hei!\n\nTakk for din bestilling og booking hos Roots & Culture.\n\n--- BESTILLING ---\n\n${orderText}\n\n--- BOOKING ---\n\n${bookingTexts}\n\nMed vennlig hilsen,\nRoots & Culture\n`,
  }
}

export async function welcomeEmail(data: WelcomeEmailData) {
  const html = await render(<Welcome {...data} />)
  const greeting = data.customerName ? `Hei ${data.customerName}!` : 'Hei!'

  return {
    subject: 'Velkommen til Roots & Culture!',
    html,
    text: `${greeting}\n\nVelkommen til Roots & Culture! Vi gleder oss til å dele norsk natur og kultur med deg.\n\nMed din konto kan du følge bestillinger, lagre favoritter og booke eksklusive opplevelser.\n\nBesøk oss på rootsculture.no\n\nMed vennlig hilsen,\nRoots & Culture\n`,
  }
}

export async function newsletterEmail(data: NewsletterEmailData) {
  const html = await render(<Newsletter {...data} />)
  let text = `Nyhetsbrev — ${data.month}\n\n${data.title}\n\n${data.intro}\n`

  if (data.articleTitle) {
    text += `\n${data.articleTitle}\n${data.articleDescription || ''}\n`
    if (data.articleUrl) text += `Les mer: ${data.articleUrl}\n`
  }

  if (data.products?.length) {
    text += '\nNytt i butikken:\n'
    for (const p of data.products) {
      text += `  - ${p.name}: ${p.description} — ${formatPrice(p.price)}\n`
    }
  }

  text += '\nMed vennlig hilsen,\nRoots & Culture\n'
  return { subject: data.title, html, text }
}

export async function passwordResetEmail(data: PasswordResetEmailData) {
  const html = await render(<PasswordReset {...data} />)
  return {
    subject: 'Tilbakestill passordet ditt',
    html,
    text: `Hei!\n\nVi mottok en forespørsel om å tilbakestille passordet ditt.\n\nKlikk her for å velge et nytt passord:\n${data.resetUrl}\n\nLenken er gyldig i 60 minutter. Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.\n\nMed vennlig hilsen,\nRoots & Culture\n`,
  }
}
```

**Important:** The functions are now `async` because `render()` returns a Promise. All callers must be updated to `await` the result.

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates.ts
git commit -m "feat(email): refactor templates.ts to render React Email components with HTML + text fallback"
```

---

### Task 12: Update Stripe webhook to use async templates + html

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts` (lines ~339-413)

The template functions are now async and return `html` in addition to `text`. Update all call sites.

- [ ] **Step 1: Update the email sending block**

Find the block starting around line 339 (gift card emails) and line 362 (confirmation emails). Replace the entire email-sending section (from `// Send gift card emails to recipients` through `// Sync contact to Resend segments`) with:

```ts
      // Send gift card emails to recipients
      if (resend && createdGiftCards.length > 0) {
        try {
          for (const gc of createdGiftCards) {
            const emailData = await giftCardEmail({
              code: gc.code,
              amount: gc.amount,
              recipientName: gc.recipientName,
              senderEmail: customerEmail,
              message: metadata.giftCardMessage || '',
            })
            await resend.emails.send({
              from: FROM_EMAIL,
              to: gc.recipientEmail || customerEmail,
              subject: emailData.subject,
              html: emailData.html,
              text: emailData.text,
            })
          }
        } catch (gcEmailErr) {
          console.error('Gift card email error:', gcEmailErr)
        }
      }

      // Send confirmation emails
      if (resend && customerEmail) {
        try {
          if (orderItems.length > 0 && bookingResults.length > 0) {
            const emailData = await mixedConfirmationEmail(
              {
                orderId: orderId || '',
                items: firestoreItems,
                subtotal,
                shippingCost,
                total: paymentIntent.amount,
                shipping: shippingAddress,
                customerEmail,
              },
              bookingResults.map((b) => ({ ...b, customerEmail }))
            )
            await resend.emails.send({
              from: FROM_EMAIL,
              to: customerEmail,
              subject: emailData.subject,
              html: emailData.html,
              text: emailData.text,
            })
          } else if (orderItems.length > 0) {
            const emailData = await orderConfirmationEmail({
              orderId: orderId || '',
              items: firestoreItems,
              subtotal,
              shippingCost,
              total: paymentIntent.amount,
              shipping: shippingAddress,
              customerEmail,
            })
            await resend.emails.send({
              from: FROM_EMAIL,
              to: customerEmail,
              subject: emailData.subject,
              html: emailData.html,
              text: emailData.text,
            })
          } else if (bookingResults.length > 0) {
            for (const booking of bookingResults) {
              const emailData = await bookingConfirmationEmail({ ...booking, customerEmail })
              await resend.emails.send({
                from: FROM_EMAIL,
                to: customerEmail,
                subject: emailData.subject,
                html: emailData.html,
                text: emailData.text,
              })
            }
          }
        } catch (emailErr) {
          console.error('Email sending error:', emailErr)
        }
      }
```

The key changes are:
1. Add `await` before each template function call (they're now async)
2. Add `html: emailData.html` to every `resend.emails.send()` call

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -30
```

Expected: Build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat(email): update Stripe webhook to send HTML emails with text fallback"
```

---

### Task 13: Verify full build

- [ ] **Step 1: Run full build**

```bash
npm run build 2>&1 | tail -40
```

Expected: Build succeeds. All pages compile. No type errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: No new lint errors.

- [ ] **Step 3: Final commit if any lint fixes needed**

If lint found issues, fix them and commit:

```bash
git add -A
git commit -m "fix(email): lint fixes for React Email templates"
```
