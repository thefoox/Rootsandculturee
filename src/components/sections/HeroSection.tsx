import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { PageSection } from '@/types'

export function HeroSection({ section }: { section: PageSection }) {
  const isFullscreen = Boolean(section.ctaText)

  if (isFullscreen) {
    return <FullscreenHero section={section} />
  }
  return <CompactHero section={section} />
}

/** Fullscreen hero: left-aligned desktop, centered mobile, pill buttons, dual gradient */
function FullscreenHero({ section }: { section: PageSection }) {
  const secondaryText = section.ctaSecondaryText || section.items?.[0]?.title
  const secondaryLink = section.ctaSecondaryLink || section.items?.[0]?.href

  return (
    <section className="relative flex h-[70vh] min-h-[500px] items-center justify-center overflow-hidden md:h-[90vh] md:min-h-[600px] md:justify-start lg:h-screen">
      {section.image?.url && (
        <div className="absolute inset-0">
          <Image
            src={section.image.url}
            alt={section.image.alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Left-to-right gradient (desktop: stronger left fade) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(28,25,23,0.7), rgba(28,25,23,0.4), rgba(28,25,23,0.2))',
            }}
          />
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                'linear-gradient(to right, rgba(28,25,23,0.9), rgba(28,25,23,0.6), transparent)',
            }}
          />
          {/* Bottom gradient for mobile readability */}
          <div
            className="absolute inset-0 md:hidden"
            style={{
              background:
                'linear-gradient(to top, rgba(28,25,23,0.6), transparent)',
            }}
          />
        </div>
      )}

      <div className="relative z-[1] mx-auto w-full max-w-[1280px] px-4 md:px-6">
        <div className="flex max-w-[64rem] flex-col items-center text-center md:items-start md:pt-24 md:text-left">
          {section.heading && (
            <>
              {/* Mobile title */}
              <h1
                className="font-heading font-medium leading-[1.2] tracking-[-0.02em] text-cream md:hidden"
                style={{
                  fontSize: 'clamp(2.5rem, 10vw, 3.5rem)',
                  paddingTop: '6rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                {section.heading}
              </h1>
              {/* Desktop title */}
              <h1
                className="hidden font-heading font-medium leading-[1.1] tracking-[-0.02em] text-cream md:block"
                style={{
                  fontSize: 'clamp(3.5rem, 7vw, 5.5rem)',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                {section.heading}
              </h1>
            </>
          )}
          {section.subheading && (
            <>
              {/* Mobile subtitle */}
              <p
                className="mt-4 font-light text-cream/80 md:hidden"
                style={{
                  fontSize: '1rem',
                  textShadow: '0 1px 5px rgba(0,0,0,0.2)',
                }}
              >
                {section.subheading}
              </p>
              {/* Desktop subtitle */}
              <p
                className="mt-5 hidden max-w-[42rem] font-light leading-relaxed text-cream/90 md:block"
                style={{
                  fontSize: 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)',
                  textShadow: '0 1px 5px rgba(0,0,0,0.2)',
                }}
              >
                {section.subheading}
              </p>
            </>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col items-center gap-4 md:mt-7 md:flex-row md:items-start md:gap-6">
            {section.ctaText && section.ctaLink && (
              <>
                {/* Mobile primary */}
                <Link
                  href={section.ctaLink}
                  className="inline-flex h-12 items-center rounded-full bg-forest px-8 text-[0.875rem] font-medium text-cream shadow-[0_10px_15px_rgba(0,0,0,0.07)] motion-safe:transition-all hover:opacity-90 md:hidden"
                >
                  {section.ctaText}
                </Link>
                {/* Desktop primary */}
                <Link
                  href={section.ctaLink}
                  className="hidden h-14 items-center rounded-full bg-forest px-10 text-[1rem] font-medium text-cream shadow-[0_10px_15px_rgba(0,0,0,0.07)] motion-safe:transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_25px_rgba(0,0,0,0.06)] md:inline-flex"
                >
                  {section.ctaText}
                </Link>
              </>
            )}
            {secondaryText && secondaryLink && (
              <>
                {/* Mobile: text link */}
                <Link
                  href={secondaryLink}
                  className="text-[0.875rem] font-medium text-cream/80 hover:text-cream md:hidden"
                >
                  {secondaryText} &rarr;
                </Link>
                {/* Desktop: ghost pill button */}
                <Link
                  href={secondaryLink}
                  className="hidden h-14 items-center rounded-full border border-cream/30 bg-transparent px-10 text-[1rem] font-medium text-cream motion-safe:transition-all hover:border-cream/50 hover:bg-cream/10 md:inline-flex"
                >
                  {secondaryText}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-[1] -translate-x-1/2" aria-hidden="true">
        <ChevronDown className="h-7 w-7 text-cream/40 motion-safe:animate-bounce" />
      </div>
    </section>
  )
}

/** Compact hero: centered text, optional bg image */
function CompactHero({ section }: { section: PageSection }) {
  const hasImage = Boolean(section.image?.url)

  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden text-center ${
        hasImage ? 'min-h-[70vh]' : 'bg-white pb-20 pt-40'
      }`}
    >
      {hasImage && section.image && (
        <div className="absolute inset-0">
          <Image
            src={section.image.url}
            alt={section.image.alt || ''}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <div className="relative z-[1] max-w-[640px] px-6">
        {section.heading && (
          <h1
            className={`font-heading font-bold leading-[1.1] tracking-[-0.02em] ${
              hasImage ? 'text-cream' : 'text-forest'
            }`}
            style={{ fontSize: 'clamp(2.25rem, 1.8rem + 1.5vw, 3rem)' }}
          >
            {section.heading}
          </h1>
        )}
        {section.subheading && (
          <p className={`mt-3 font-heading text-lg font-light italic leading-relaxed md:mt-4 md:text-[1.0625rem] ${
            hasImage ? 'text-cream/80' : 'text-forest/70'
          }`}>
            {section.subheading}
          </p>
        )}
      </div>
    </section>
  )
}
