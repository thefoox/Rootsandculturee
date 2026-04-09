import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitize'
import type { PageSection } from '@/types'

export function TextImageSection({ section }: { section: PageSection }) {
  const imageOnRight = section.imagePosition === 'right'

  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Desktop: overlapping grid layout */}
        <div className={`items-center max-md:space-y-0 md:grid md:gap-0 ${
          imageOnRight
            ? 'md:grid-cols-[1fr_1.2fr]'
            : 'md:grid-cols-[1.2fr_1fr]'
        }`}>
          {/* Image */}
          <div className={`relative overflow-hidden max-md:aspect-video ${
            imageOnRight
              ? 'md:order-2 md:ml-[-48px] md:rounded-l-none md:rounded-r-3xl'
              : 'md:order-1 md:mr-[-48px] md:rounded-l-none md:rounded-r-3xl'
          } md:z-[1] md:aspect-[4/5] md:shadow-[24px_24px_48px_rgba(27,67,50,0.1)]`}>
            {section.image ? (
              <Image
                src={section.image.url}
                alt={section.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
            ) : (
              <div className="h-full w-full bg-card" />
            )}
          </div>

          {/* Text box */}
          <div className={`relative bg-card max-md:p-8 md:z-[2] md:rounded-3xl md:p-16 ${
            imageOnRight ? 'md:order-1' : 'md:order-2'
          }`}>
            {section.heading && (
              <h2
                className="font-heading font-bold text-forest"
                style={{ fontSize: 'clamp(1.75rem, 1.5rem + 0.8vw, 2rem)' }}
              >
                {section.heading}
              </h2>
            )}
            {section.body && (
              <div
                className="mt-4 text-[0.9375rem] leading-[1.65] text-body [&>p]:mt-4 [&>p:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body) }}
              />
            )}
            {/* Optional signature line from subheading */}
            {section.subheading && (
              <p className="mt-8 font-heading text-[0.9375rem] font-light italic text-bark">
                {section.subheading}
              </p>
            )}
            {section.ctaText && section.ctaLink && (
              <Link
                href={section.ctaLink}
                className="mt-8 inline-flex items-center gap-2 rounded-[10px] bg-forest px-6 py-3 text-[0.9375rem] font-semibold text-cream motion-safe:transition-all hover:-translate-y-0.5 hover:opacity-90"
              >
                {section.ctaText}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
