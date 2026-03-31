import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PageSection } from '@/types'

export function CtaSection({ section }: { section: PageSection }) {
  const hasImage = !!section.image

  if (hasImage) {
    return (
      <section className="relative py-24 md:py-32">
        <Image
          src={section.image!.url}
          alt={section.image!.alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto max-w-[700px] px-6 text-center md:px-8">
          {section.heading && (
            <h2 className="font-heading text-h1 font-bold text-cream">
              {section.heading}
            </h2>
          )}
          {section.subheading && (
            <p className="mx-auto mt-4 max-w-lg font-body text-lg leading-relaxed text-cream/85">
              {section.subheading}
            </p>
          )}
          {section.ctaText && section.ctaLink && (
            <Link
              href={section.ctaLink}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-cream px-8 py-3.5 font-body text-body font-medium text-forest motion-safe:transition-all motion-safe:duration-150 hover:bg-white"
            >
              {section.ctaText}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream section-padding">
      <div className="mx-auto max-w-[1200px] px-4 text-center md:px-8">
        {section.heading && (
          <h2 className="font-heading text-h2 font-bold text-forest">
            {section.heading}
          </h2>
        )}
        {section.subheading && (
          <p className="mx-auto mt-3 max-w-lg text-body leading-relaxed text-body">
            {section.subheading}
          </p>
        )}
        {section.ctaText && section.ctaLink && (
          <Link
            href={section.ctaLink}
            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-md bg-forest px-6 py-2 font-body text-body font-medium text-cream motion-safe:transition-all motion-safe:duration-100 hover:opacity-85 active:scale-[0.98]"
          >
            {section.ctaText}
          </Link>
        )}
      </div>
    </section>
  )
}
