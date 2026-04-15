import { Section, Text, Link, Hr } from '@react-email/components'
import * as React from 'react'
import {
  EmailLayout,
  colors,
  typography,
  spacing,
  buttonStyle,
} from './components/email-layout'

interface WelcomeProps {
  customerName?: string
  customerEmail: string
}

export function Welcome({ customerName }: WelcomeProps) {
  const greeting = customerName
    ? `Hei ${customerName.split(' ')[0]}`
    : 'Hei'

  return (
    <EmailLayout previewText="Velkommen til Roots & Culture!">
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
          Velkommen til Roots &amp; Culture!
        </Text>
        <Text
          style={{
            fontSize: typography.bodySize,
            color: colors.text,
            lineHeight: typography.lineHeight,
            fontFamily: typography.fontFamily,
            margin: '0 0 12px',
          }}
        >
          {greeting}! Takk for at du ble med. Vi gleder oss til å dele norsk
          natur og kultur med deg.
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
          Med din konto kan du følge bestillinger, lagre favoritter og booke
          eksklusive opplevelser.
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
            backgroundColor: `${colors.primary}0a`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '8px',
          }}
        >
          <Text
            style={{
              fontSize: typography.bodySize,
              color: colors.accent,
              fontWeight: 700,
              margin: '0 0 4px',
              fontFamily: typography.fontFamily,
            }}
          >
            Utforsk butikken
          </Text>
          <Text
            style={{
              fontSize: '14px',
              color: colors.muted,
              margin: 0,
              fontFamily: typography.fontFamily,
            }}
          >
            Honning, te, naturprodukter og mer
          </Text>
        </Section>
        <Section
          style={{
            backgroundColor: `${colors.primary}0a`,
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <Text
            style={{
              fontSize: typography.bodySize,
              color: colors.accent,
              fontWeight: 700,
              margin: '0 0 4px',
              fontFamily: typography.fontFamily,
            }}
          >
            Book en opplevelse
          </Text>
          <Text
            style={{
              fontSize: '14px',
              color: colors.muted,
              margin: 0,
              fontFamily: typography.fontFamily,
            }}
          >
            Naturretreater, kurs og matopplevelser
          </Text>
        </Section>
      </Section>

      <Section
        style={{
          padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`,
          textAlign: 'center' as const,
        }}
      >
        <Link href="https://rootsculture.no" style={buttonStyle}>
          Kom i gang
        </Link>
      </Section>
    </EmailLayout>
  )
}
