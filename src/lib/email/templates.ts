import { formatPrice, formatDate } from '@/lib/format'
import type { OrderItem, ShippingAddress, Booking } from '@/types'

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
  whatToBring: string
  customerEmail: string
  customerName?: string
}

export function orderConfirmationEmail(data: OrderEmailData) {
  const itemLines = data.items
    .map(
      (item) =>
        `  - ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    )
    .join('\n')

  const shippingLines = data.shipping
    ? `\nLeveringsadresse:\n  ${data.shipping.fullName}\n  ${data.shipping.address}\n  ${data.shipping.postalCode} ${data.shipping.city}`
    : ''

  return {
    subject: `Ordrebekreftelse #${data.orderId}`,
    text: `Hei!

Takk for din bestilling hos Roots & Culture.

Ordrenummer: ${data.orderId}

Varer:
${itemLines}

Subtotal: ${formatPrice(data.subtotal)}
Frakt: ${data.shippingCost > 0 ? formatPrice(data.shippingCost) : 'Gratis'}
Totalt: ${formatPrice(data.total)}
${shippingLines}

Vi sender deg en oppdatering når bestillingen er sendt.

Med vennlig hilsen,
Roots & Culture
`,
  }
}

export function bookingConfirmationEmail(data: BookingEmailData) {
  const whatToBringItems = data.whatToBring
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `  - ${item}`)
    .join('\n')

  const greeting = data.customerName ? `Hei ${data.customerName}!` : 'Hei!'

  return {
    subject: `Bookingbekreftelse - ${data.experienceName}`,
    text: `${greeting}

Takk for din booking hos Roots & Culture.

Bekreftelseskode: ${data.confirmationCode}

Opplevelse: ${data.experienceName}
Dato: ${formatDate(data.date)}
Antall plasser: ${data.seats}
Pris per plass: ${formatPrice(data.pricePerSeat)}
Totalt: ${formatPrice(data.total)}

Husk å ta med:
${whatToBringItems}

Vi gleder oss til å se deg!

Med vennlig hilsen,
Roots & Culture
`,
  }
}

interface GiftCardEmailData {
  code: string
  amount: number
  recipientName: string
  senderEmail: string
  message: string
}

export function giftCardEmail(data: GiftCardEmailData) {
  const greeting = data.recipientName ? `Hei ${data.recipientName}!` : 'Hei!'
  const messageBlock = data.message
    ? `\nPersonlig hilsen:\n"${data.message}"\n`
    : ''

  return {
    subject: 'Du har fått et gavekort fra Roots & Culture!',
    text: `${greeting}

Noen har gitt deg et gavekort hos Roots & Culture.

Gavekort-kode: ${data.code}
Verdi: ${formatPrice(data.amount)}
${messageBlock}
Bruk koden i kassen på rootsculture.no for å handle produkter eller booke opplevelser.
Gavekortet er gyldig i 12 måneder.

Med vennlig hilsen,
Roots & Culture
`,
  }
}

export function mixedConfirmationEmail(
  orderData: OrderEmailData,
  bookings: BookingEmailData[]
) {
  const orderEmail = orderConfirmationEmail(orderData)
  const bookingTexts = bookings
    .map((b) => {
      const email = bookingConfirmationEmail(b)
      return email.text
        .replace('Hei!\n\nTakk for din booking hos Roots & Culture.\n\n', '')
        .replace('\nMed vennlig hilsen,\nRoots & Culture\n', '')
    })
    .join('\n---\n\n')

  return {
    subject: `Bestilling og booking bekreftet`,
    text: `Hei!

Takk for din bestilling og booking hos Roots & Culture.

--- BESTILLING ---

${orderEmail.text
  .replace('Hei!\n\nTakk for din bestilling hos Roots & Culture.\n\n', '')
  .replace('\nMed vennlig hilsen,\nRoots & Culture\n', '')}

--- BOOKING ---

${bookingTexts}

Med vennlig hilsen,
Roots & Culture
`,
  }
}
