import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { PageSection } from '@/types'

export function HeroSection({ section }: { section: PageSection }) {
  // Variant selection: if ctaText exists -> fullscreen, else -> compact
  const isFullscreen = Boolean(section.ctaText)

  if (isFullscreen) {
    return <FullscreenHero section={section} />
  }
  return <CompactHero section={section} />
}

/** Fullscreen hero (forside-v4.html): 100vh, bottom-aligned text, dual CTA, scroll indicator */
function FullscreenHero({ section }: { section: PageSection }) {
  // Secondary CTA: prefer dedicated fields, fall back to items array
  const secondaryText = section.ctaSecondaryText || section.items?.[0]?.title
  const secondaryLink = section.ctaSecondaryLink || section.items?.[0]?.href

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden">
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
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)',
            }}
          />
        </div>
      )}

      <div className="relative z-[1] mx-auto w-full max-w-[1200px] px-6 pb-20">
        {section.heading && (
          <h1
            className="max-w-[700px] font-heading font-bold leading-[1.02] tracking-[-0.02em] text-cream"
            style={{ fontSize: 'clamp(3rem, 2rem + 3.5vw, 5rem)' }}
          >
            {section.heading}
          </h1>
        )}
        {section.subheading && (
          <p
            className="mt-5 max-w-[520px] leading-relaxed text-cream/85"
            style={{ fontSize: 'clamp(1rem, 0.9rem + 0.3vw, 1.1875rem)' }}
          >
            {section.subheading}
          </p>
        )}
        <div className="mt-9 flex flex-wrap gap-3.5 max-md:flex-col max-md:items-start">
          {section.ctaText && section.ctaLink && (
            <Link
              href={section.ctaLink}
              className="inline-flex items-center gap-2 rounded-[10px] bg-forest px-8 py-4 text-[0.9375rem] font-semibold text-cream shadow-[0_4px_16px_rgba(0,0,0,0.15)] motion-safe:transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
            >
              {section.ctaText}
            </Link>
          )}
          {secondaryText && secondaryLink && (
            <Link
              href={secondaryLink}
              className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-cream/50 bg-cream/8 px-8 py-4 text-[0.9375rem] font-semibold text-cream backdrop-blur-sm motion-safe:transition-all hover:border-cream hover:bg-cream/15"
            >
              {secondaryText}
            </Link>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-[1] -translate-x-1/2" aria-hidden="true">
        <ChevronDown className="h-7 w-7 text-cream/40 motion-safe:animate-bounce" />
      </div>
    </section>
  )
}

/** Compact hero (kontakt-v2 / om-oss): centered text, optional bg image */
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
