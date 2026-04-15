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

// --- Plain text fallbacks ---

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
  const messageBlock = data.message
    ? `\nPersonlig hilsen:\n"${data.message}"\n`
    : ''

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
    <MixedConfirmation {...orderData} bookings={bookings} />
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
