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
              <Section
                style={{
                  padding: `${spacing.contentPadding} ${spacing.contentPadding} ${spacing.sectionGap}`,
                  textAlign: 'center' as const,
                }}
              >
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
                <Hr
                  style={{
                    borderColor: `${colors.muted}33`,
                    margin: `0 ${spacing.contentPadding}`,
                  }}
                />
                <Section
                  style={{
                    padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`,
                    textAlign: 'center' as const,
                  }}
                >
                  <Text
                    style={{
                      fontSize: '12px',
                      color: colors.muted,
                      margin: '0 0 8px',
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    Roots &amp; Culture &middot; Oslo, Norge
                  </Text>
                  <Text
                    style={{
                      fontSize: '12px',
                      color: colors.muted,
                      margin: 0,
                      fontFamily: typography.fontFamily,
                    }}
                  >
                    <Link
                      href="https://rootsculture.no/avmeld"
                      style={{
                        color: colors.muted,
                        textDecoration: 'underline',
                      }}
                    >
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
