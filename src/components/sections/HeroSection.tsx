import Image from 'next/image'
import Link from 'next/link'
import type { PageSection } from '@/types'

export function HeroSection({ section }: { section: PageSection }) {
  return (
    <section className="relative flex min-h-screen items-center">
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

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pt-28 md:px-8">
        {section.heading && (
          <h1 className="max-w-3xl font-heading text-h1 font-bold leading-[1.08] text-cream whitespace-pre-line">
            {section.heading}
          </h1>
        )}
        {section.subheading && (
          <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-cream/90">
            {section.subheading}
          </p>
        )}
        {section.ctaText && section.ctaLink && (
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={section.ctaLink}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-body text-body font-medium text-cream motion-safe:transition-all motion-safe:duration-150 hover:bg-forest/85"
            >
              {section.ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
