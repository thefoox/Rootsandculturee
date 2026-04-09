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
  // Use items array for secondary CTA if available
  const secondaryCta = section.items?.[0]

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden">
      {section.image && (
        <div className="absolute inset-0">
          <Image
            src={section.image.url}
            alt={section.image.alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay matching forside-v4 prototype */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(27,67,50,0.2) 0%, rgba(27,67,50,0.5) 60%, rgba(27,67,50,0.75) 100%)',
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
          {secondaryCta?.title && secondaryCta?.href && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-cream/50 bg-cream/8 px-8 py-4 text-[0.9375rem] font-semibold text-cream backdrop-blur-sm motion-safe:transition-all hover:border-cream hover:bg-cream/15"
            >
              {secondaryCta.title}
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

/** Compact hero (kontakt-v2 / om-oss): forest bg, centered text, optional bg image */
function CompactHero({ section }: { section: PageSection }) {
  // om-oss style: min-h-[70vh] centered with optional bg image
  // kontakt style: padded, no image usually
  const hasImage = Boolean(section.image)

  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden bg-forest text-center ${
        hasImage ? 'min-h-[70vh]' : 'pb-20 pt-40'
      }`}
    >
      {section.image && (
        <div className="absolute inset-0 opacity-30">
          <Image
            src={section.image.url}
            alt={section.image.alt || ''}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}
      <div className="relative z-[1] max-w-[640px] px-6">
        {section.heading && (
          <h1
            className="font-heading font-bold leading-[1.1] tracking-[-0.02em] text-cream"
            style={{ fontSize: 'clamp(2.25rem, 1.8rem + 1.5vw, 3rem)' }}
          >
            {section.heading}
          </h1>
        )}
        {section.subheading && (
          <p className="mt-3 font-heading text-lg font-light italic leading-relaxed text-cream/80 md:mt-4 md:text-[1.0625rem]">
            {section.subheading}
          </p>
        )}
      </div>
    </section>
  )
}
