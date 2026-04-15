import { Section, Text, Link, Hr } from '@react-email/components'
import * as React from 'react'
import {
  EmailLayout,
  colors,
  typography,
  spacing,
  buttonStyle,
} from './components/email-layout'

interface PasswordResetProps {
  resetUrl: string
  customerEmail: string
}

export function PasswordReset({ resetUrl }: PasswordResetProps) {
  return (
    <EmailLayout previewText="Tilbakestill passordet ditt">
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
          Tilbakestill passordet ditt
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
          Vi mottok en forespørsel om å tilbakestille passordet ditt. Klikk på
          knappen under for å velge et nytt passord.
        </Text>
      </Section>

      <Section
        style={{
          padding: `0 ${spacing.contentPadding}`,
          textAlign: 'center' as const,
        }}
      >
        <Link href={resetUrl} style={buttonStyle}>
          Tilbakestill passord
        </Link>
      </Section>

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
            fontSize: '14px',
            color: colors.muted,
            lineHeight: typography.lineHeight,
            fontFamily: typography.fontFamily,
            margin: 0,
          }}
        >
          Lenken er gyldig i 60 minutter. Hvis du ikke ba om dette, kan du
          trygt ignorere denne e-posten.
        </Text>
      </Section>
    </EmailLayout>
  )
}
