import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import {
  EmailLayout,
  colors,
  typography,
  spacing,
} from './components/email-layout'
import { formatPrice } from '@/lib/format'

interface GiftCardProps {
  code: string
  amount: number
  recipientName: string
  senderEmail: string
  message: string
}

export function GiftCard({ code, amount, recipientName, message }: GiftCardProps) {
  const greeting = recipientName ? `Hei ${recipientName}` : 'Hei'

  return (
    <EmailLayout previewText="Du har fått et gavekort fra Roots & Culture!">
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
          Du har fått et gavekort!
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
          {greeting}, noen har gitt deg et gavekort hos Roots &amp; Culture.
        </Text>
      </Section>

      <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
        <Section
          style={{
            backgroundColor: `${colors.accent}10`,
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center' as const,
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
            Gavekort-kode
          </Text>
          <Text
            style={{
              fontSize: '28px',
              color: colors.accent,
              fontWeight: 700,
              margin: '0 0 16px',
              fontFamily: typography.fontFamily,
              letterSpacing: '0.08em',
            }}
          >
            {code}
          </Text>
          <Text
            style={{
              fontSize: '11px',
              color: colors.muted,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              margin: '0 0 4px',
              fontFamily: typography.fontFamily,
              fontWeight: 600,
            }}
          >
            Verdi
          </Text>
          <Text
            style={{
              fontSize: '22px',
              color: colors.text,
              fontWeight: 700,
              margin: 0,
              fontFamily: typography.fontFamily,
            }}
          >
            {formatPrice(amount)}
          </Text>
        </Section>
      </Section>

      {message && (
        <>
          <Hr
            style={{
              borderColor: `${colors.muted}33`,
              margin: `${spacing.sectionGap} ${spacing.contentPadding}`,
            }}
          />
          <Section style={{ padding: `0 ${spacing.contentPadding}` }}>
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
              Personlig hilsen
            </Text>
            <Text
              style={{
                fontSize: typography.bodySize,
                color: colors.text,
                lineHeight: typography.lineHeight,
                fontFamily: typography.fontFamily,
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              &ldquo;{message}&rdquo;
            </Text>
          </Section>
        </>
      )}

      <Hr
        style={{
          borderColor: `${colors.muted}33`,
          margin: `${spacing.sectionGap} ${spacing.contentPadding}`,
        }}
      />

      <Section
        style={{
          padding: `0 ${spacing.contentPadding} ${spacing.contentPadding}`,
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
          Bruk koden i kassen på rootsculture.no for å handle produkter eller
          booke opplevelser.
        </Text>
        <Text
          style={{
            fontSize: '13px',
            color: colors.muted,
            fontFamily: typography.fontFamily,
            margin: 0,
          }}
        >
          Gavekortet er gyldig i 12 måneder.
        </Text>
      </Section>
    </EmailLayout>
  )
}
