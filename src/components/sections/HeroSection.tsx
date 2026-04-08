import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { PageSection } from '@/types'

export function HeroSection({ section }: { section: PageSection }) {
  return (
    <section className="relative flex min-h-screen items-center hero-texture">
      {section.image && (
        <Image
          src={section.image.url}
          alt={section.image.alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.1) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/50 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pt-28 md:px-8">
        {section.heading && (
          <h1
            className="max-w-3xl font-heading text-h1 font-bold leading-[1.08] tracking-tighter text-cream whitespace-pre-line motion-safe:[animation:hero-enter_600ms_ease-out_100ms_both]"
          >
            {section.heading}
          </h1>
        )}
        {section.subheading && (
          <p className="mt-6 max-w-lg font-heading font-light text-lg leading-relaxed text-cream/90 motion-safe:[animation:hero-enter_600ms_ease-out_250ms_both]">
            {section.subheading}
          </p>
        )}
        {section.ctaText && section.ctaLink && (
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={section.ctaLink}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-4 font-body text-body font-medium text-cream shadow-lg shadow-forest/30 motion-safe:transition-all motion-safe:duration-150 hover:bg-forest/85 motion-safe:[animation:hero-enter_400ms_ease-out_400ms_both]"
            >
              {section.ctaText}
            </Link>
          </div>
        )}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 motion-safe:animate-bounce" aria-hidden="true">
        <ChevronDown className="h-6 w-6 text-cream/70" />
      </div>
    </section>
  )
}
