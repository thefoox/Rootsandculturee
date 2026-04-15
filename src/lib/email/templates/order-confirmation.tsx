import { Section, Text, Link, Hr } from '@react-email/components'
import * as React from 'react'
import {
  EmailLayout,
  colors,
  typography,
  spacing,
  buttonStyle,
} from './components/email-layout'
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
  const greeting = shipping?.fullName
    ? `Hei ${shipping.fullName.split(' ')[0]}`
    : 'Hei'

  return (
    <EmailLayout previewText={`Ordrebekreftelse #${orderId}`}>
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
          Takk for din bestilling!
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
          {greeting}, vi har mottatt din bestilling og den er nå under
          behandling. Du får en oppdatering når pakken sendes.
        </Text>
      </Section>

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
          Ordredetaljer — #{orderId}
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
                    padding: '10px 0',
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
                    padding: '10px 0',
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
                Totalt
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
        <>
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
                margin: '0 0 8px',
                fontFamily: typography.fontFamily,
                fontWeight: 600,
              }}
            >
              Leveringsadresse
            </Text>
            <Text
              style={{
                fontSize: typography.bodySize,
                color: colors.text,
                fontFamily: typography.fontFamily,
                lineHeight: typography.lineHeight,
                margin: 0,
              }}
            >
              {shipping.fullName}
              <br />
              {shipping.address}
              <br />
              {shipping.postalCode} {shipping.city}
            </Text>
          </Section>
        </>
      )}

      <Section
        style={{
          padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`,
          textAlign: 'center' as const,
        }}
      >
        <Link
          href={`https://rootsculture.no/konto/bestillinger/${orderId}`}
          style={buttonStyle}
        >
          Se bestillingen din
        </Link>
      </Section>
    </EmailLayout>
  )
}
