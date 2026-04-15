import { Section, Text, Link, Hr } from '@react-email/components'
import * as React from 'react'
import {
  EmailLayout,
  colors,
  typography,
  spacing,
  buttonStyle,
} from './components/email-layout'
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
  const greeting = shipping?.fullName
    ? `Hei ${shipping.fullName.split(' ')[0]}`
    : 'Hei'

  return (
    <EmailLayout previewText="Bestilling og booking bekreftet">
      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Text
          style={{
            fontSize: typography.headingSize,
            color: colors.text,
            fontFamily: typography.fontFamily,
            fontWeight: 700,
            lineHeight: '1.3',
            margin: '0 0 12px',
          }}
        >
          Bestilling og booking bekreftet
        </Text>
        <Text
          style={{
            fontSize: typography.bodySize,
            color: colors.text,
            lineHeight: typography.lineHeight,
            fontFamily: typography.fontFamily,
            margin: `0 0 ${spacing.sectionGap}`,
          }}
        >
          {greeting}, takk for din bestilling og booking hos Roots &amp;
          Culture.
        </Text>
      </Section>

      {/* Order section */}
      <Hr
        style={{
          borderColor: `${colors.muted}33`,
          margin: `0 ${spacing.contentPadding}`,
        }}
      />
      <Section
        style={{ padding: `${spacing.sectionGap} ${spacing.contentPadding} 0` }}
      >
        <Text
          style={{
            fontSize: '12px',
            color: colors.muted,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            margin: '0 0 12px',
            fontFamily: typography.fontFamily,
            fontWeight: 600,
          }}
        >
          Bestilling — #{orderId}
        </Text>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ borderCollapse: 'collapse' as const }}
        >
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td
                  style={{
                    padding: '8px 0',
                    borderBottom: `1px solid ${colors.muted}22`,
                    fontSize: typography.bodySize,
                    color: colors.text,
                    fontFamily: typography.fontFamily,
                  }}
                >
                  {item.name}
                  {item.variantLabel ? ` (${item.variantLabel})` : ''} &times;{' '}
                  {item.quantity}
                </td>
                <td
                  style={{
                    padding: '8px 0',
                    borderBottom: `1px solid ${colors.muted}22`,
                    fontSize: typography.bodySize,
                    color: colors.text,
                    fontFamily: typography.fontFamily,
                    textAlign: 'right' as const,
                  }}
                >
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
            <tr>
              <td
                style={{
                  padding: '8px 0 0',
                  fontSize: '13px',
                  color: colors.muted,
                  fontFamily: typography.fontFamily,
                }}
              >
                Subtotal
              </td>
              <td
                style={{
                  padding: '8px 0 0',
                  fontSize: '13px',
                  color: colors.muted,
                  fontFamily: typography.fontFamily,
                  textAlign: 'right' as const,
                }}
              >
                {formatPrice(subtotal)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '4px 0 0',
                  fontSize: '13px',
                  color: colors.muted,
                  fontFamily: typography.fontFamily,
                }}
              >
                Frakt
              </td>
              <td
                style={{
                  padding: '4px 0 0',
                  fontSize: '13px',
                  color: colors.muted,
                  fontFamily: typography.fontFamily,
                  textAlign: 'right' as const,
                }}
              >
                {shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis'}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '12px 0 0',
                  fontSize: typography.bodySize,
                  color: colors.text,
                  fontFamily: typography.fontFamily,
                  fontWeight: 700,
                }}
              >
                Totalt bestilling
              </td>
              <td
                style={{
                  padding: '12px 0 0',
                  fontSize: typography.bodySize,
                  color: colors.text,
                  fontFamily: typography.fontFamily,
                  fontWeight: 700,
                  textAlign: 'right' as const,
                }}
              >
                {formatPrice(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {shipping && (
        <Section
          style={{ padding: `12px ${spacing.contentPadding} 0` }}
        >
          <Text
            style={{
              fontSize: '13px',
              color: colors.muted,
              fontFamily: typography.fontFamily,
              lineHeight: typography.lineHeight,
              margin: 0,
            }}
          >
            Leveres til: {shipping.fullName}, {shipping.address},{' '}
            {shipping.postalCode} {shipping.city}
          </Text>
        </Section>
      )}

      {/* Booking sections */}
      {bookings.map((booking, i) => (
        <React.Fragment key={i}>
          <Hr
            style={{
              borderColor: `${colors.muted}33`,
              margin: `${spacing.sectionGap} ${spacing.contentPadding} 0`,
            }}
          />
          <Section
            style={{
              padding: `${spacing.sectionGap} ${spacing.contentPadding} 0`,
            }}
          >
            <Text
              style={{
                fontSize: '12px',
                color: colors.muted,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                margin: '0 0 12px',
                fontFamily: typography.fontFamily,
                fontWeight: 600,
              }}
            >
              Booking{bookings.length > 1 ? ` ${i + 1}` : ''}
            </Text>
            <Section
              style={{
                backgroundColor: `${colors.primary}08`,
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <Text
                style={{
                  fontSize: '18px',
                  color: colors.primary,
                  fontWeight: 700,
                  margin: '0 0 8px',
                  fontFamily: typography.fontFamily,
                }}
              >
                {booking.experienceName}
              </Text>
              <Text
                style={{
                  fontSize: typography.bodySize,
                  color: colors.text,
                  fontFamily: typography.fontFamily,
                  margin: '0 0 4px',
                }}
              >
                {formatDate(booking.date)} &middot; {booking.seats}{' '}
                {booking.seats === 1 ? 'plass' : 'plasser'} &middot;{' '}
                {formatPrice(booking.total)}
                {booking.isEarlybird ? ' (earlybird)' : ''}
              </Text>
              <Text
                style={{
                  fontSize: '13px',
                  color: colors.accent,
                  fontWeight: 600,
                  fontFamily: typography.fontFamily,
                  margin: 0,
                }}
              >
                Kode: {booking.confirmationCode}
              </Text>
            </Section>
          </Section>
        </React.Fragment>
      ))}

      <Section
        style={{
          padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`,
          textAlign: 'center' as const,
        }}
      >
        <Link href="https://rootsculture.no/konto" style={buttonStyle}>
          Se mine bestillinger
        </Link>
      </Section>
    </EmailLayout>
  )
}
