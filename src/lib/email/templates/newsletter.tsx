import { Section, Text, Link, Img, Hr } from '@react-email/components'
import * as React from 'react'
import {
  EmailLayout,
  colors,
  typography,
  spacing,
  buttonStyle,
} from './components/email-layout'
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
        <Text
          style={{
            fontSize: '12px',
            color: colors.muted,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            margin: '0 0 8px',
            fontFamily: typography.fontFamily,
          }}
        >
          Nyhetsbrev &middot; {month}
        </Text>
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
          {title}
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
          {intro}
        </Text>
      </Section>

      {articleTitle && (
        <>
          <Hr
            style={{
              borderColor: `${colors.muted}33`,
              margin: `0 ${spacing.contentPadding}`,
            }}
          />
          <Section
            style={{
              padding: `${spacing.sectionGap} ${spacing.contentPadding} 0`,
            }}
          >
            <Section
              style={{
                backgroundColor: `${colors.primary}08`,
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {articleImageUrl && (
                <Img
                  src={articleImageUrl}
                  width="100%"
                  height="160"
                  alt={articleTitle}
                  style={{
                    display: 'block',
                    objectFit: 'cover' as const,
                  }}
                />
              )}
              <Section style={{ padding: '16px' }}>
                <Text
                  style={{
                    fontSize: typography.bodySize,
                    color: colors.text,
                    fontWeight: 700,
                    margin: '0 0 6px',
                    fontFamily: typography.fontFamily,
                  }}
                >
                  {articleTitle}
                </Text>
                {articleDescription && (
                  <Text
                    style={{
                      fontSize: '14px',
                      color: colors.muted,
                      margin: '0 0 12px',
                      fontFamily: typography.fontFamily,
                      lineHeight: typography.lineHeight,
                    }}
                  >
                    {articleDescription}
                  </Text>
                )}
                {articleUrl && (
                  <Link
                    href={articleUrl}
                    style={{
                      fontSize: '14px',
                      color: colors.primary,
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontFamily: typography.fontFamily,
                    }}
                  >
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
              Nytt i butikken
            </Text>
            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
            >
              <tbody>
                {products.map((product, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        padding: '8px 0',
                        borderBottom:
                          i < products.length - 1
                            ? `1px solid ${colors.muted}15`
                            : 'none',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: typography.bodySize,
                          color: colors.text,
                          margin: 0,
                          fontFamily: typography.fontFamily,
                        }}
                      >
                        {product.url ? (
                          <Link
                            href={product.url}
                            style={{
                              color: colors.text,
                              textDecoration: 'none',
                            }}
                          >
                            <strong>{product.name}</strong>
                          </Link>
                        ) : (
                          <strong>{product.name}</strong>
                        )}{' '}
                        &mdash; {product.description}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        borderBottom:
                          i < products.length - 1
                            ? `1px solid ${colors.muted}15`
                            : 'none',
                        textAlign: 'right' as const,
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: typography.bodySize,
                          color: colors.accent,
                          fontWeight: 600,
                          fontFamily: typography.fontFamily,
                          margin: 0,
                        }}
                      >
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

      <Section
        style={{
          padding: `${spacing.sectionGap} ${spacing.contentPadding} ${spacing.contentPadding}`,
          textAlign: 'center' as const,
        }}
      >
        <Link href="https://rootsculture.no/produkter" style={buttonStyle}>
          Se alle produkter
        </Link>
      </Section>
    </EmailLayout>
  )
}
