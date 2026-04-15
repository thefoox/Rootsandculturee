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
  const greeting = customerName
    ? `Hei ${customerName.split(' ')[0]}`
    : 'Hei'
  const whatToBringItems = whatToBring
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)

  return (
    <EmailLayout previewText={`Booking bekreftet — ${experienceName}`}>
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
          Booking bekreftet!
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
          {greeting}, din plass er reservert. Her er detaljene for opplevelsen
          din.
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
        <Section
          style={{
            backgroundColor: `${colors.primary}08`,
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <Text
            style={{
              fontSize: '11px',
              color: colors.muted,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              margin: '0 0 8px',
              fontFamily: typography.fontFamily,
              fontWeight: 600,
            }}
          >
            Opplevelse
          </Text>
          <Text
            style={{
              fontSize: '20px',
              color: colors.primary,
              fontWeight: 700,
              margin: '0 0 16px',
              fontFamily: typography.fontFamily,
            }}
          >
            {experienceName}
          </Text>

          <table role="presentation" cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td style={{ paddingRight: '24px', paddingBottom: '8px' }}>
                  <Text
                    style={{
                      fontSize: '11px',
                      color: colors.muted,
                      margin: '0 0 2px',
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    Dato
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.bodySize,
                      color: colors.text,
                      fontWeight: 600,
                      margin: 0,
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    {formatDate(date)}
                  </Text>
                </td>
                <td style={{ paddingRight: '24px', paddingBottom: '8px' }}>
                  <Text
                    style={{
                      fontSize: '11px',
                      color: colors.muted,
                      margin: '0 0 2px',
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    Plasser
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.bodySize,
                      color: colors.text,
                      fontWeight: 600,
                      margin: 0,
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    {seats}
                  </Text>
                </td>
                <td style={{ paddingBottom: '8px' }}>
                  <Text
                    style={{
                      fontSize: '11px',
                      color: colors.muted,
                      margin: '0 0 2px',
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    Pris per plass
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.bodySize,
                      color: colors.text,
                      fontWeight: 600,
                      margin: 0,
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    {formatPrice(pricePerSeat)}
                    {isEarlybird ? ' (earlybird)' : ''}
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          <Hr
            style={{ borderColor: `${colors.muted}22`, margin: '12px 0' }}
          />

          <table role="presentation">
            <tbody>
              <tr>
                <td>
                  <Text
                    style={{
                      fontSize: '11px',
                      color: colors.muted,
                      margin: '0 0 2px',
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    Bekreftelseskode
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.bodySize,
                      color: colors.accent,
                      fontWeight: 700,
                      margin: 0,
                      fontFamily: typography.fontFamily,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {confirmationCode}
                  </Text>
                </td>
                <td style={{ paddingLeft: '24px' }}>
                  <Text
                    style={{
                      fontSize: '11px',
                      color: colors.muted,
                      margin: '0 0 2px',
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    Totalt
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.bodySize,
                      color: colors.text,
                      fontWeight: 700,
                      margin: 0,
                      fontFamily: typography.fontFamily,
                    }}
                  >
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
                fontSize: typography.bodySize,
                color: colors.text,
                lineHeight: typography.lineHeight,
                fontFamily: typography.fontFamily,
                margin: '0 0 8px',
              }}
            >
              <span style={{ color: colors.accent, fontWeight: 700 }}>
                Hva du må ta med:
              </span>
            </Text>
            {whatToBringItems.map((item, i) => (
              <Text
                key={i}
                style={{
                  fontSize: typography.bodySize,
                  color: colors.text,
                  fontFamily: typography.fontFamily,
                  margin: '0 0 4px',
                  paddingLeft: '16px',
                }}
              >
                &bull; {item}
              </Text>
            ))}
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
          href={`https://rootsculture.no/konto/bookinger/${confirmationCode}`}
          style={buttonStyle}
        >
          Vis booking
        </Link>
        <Text
          style={{
            fontSize: '12px',
            color: colors.muted,
            margin: '12px 0 0',
            fontFamily: typography.fontFamily,
          }}
        >
          Avbestilling: kostnadsfritt inntil 48 timer før
        </Text>
      </Section>
    </EmailLayout>
  )
}
