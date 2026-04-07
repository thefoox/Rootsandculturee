import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PageSection } from '@/types'

export function TextImageSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className={`flex flex-col gap-10 py-20 md:gap-16 md:py-28 md:items-center ${
          section.imagePosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
        }`}>
          {section.image && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:w-1/2">
              <Image
                src={section.image.url}
                alt={section.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <div className="md:w-1/2">
            {section.heading && (
              <h2 className="font-heading text-h1 font-bold text-forest">
                {section.heading}
              </h2>
            )}
            {section.body && (
              <div
                className="mt-5 font-body text-body leading-relaxed text-forest prose-p:mt-4 first:prose-p:mt-0"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            )}
            {section.ctaText && section.ctaLink && (
              <Link
                href={section.ctaLink}
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-forest px-6 py-3 font-body text-body font-medium text-cream motion-safe:transition-all motion-safe:duration-150 hover:bg-forest/90"
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
