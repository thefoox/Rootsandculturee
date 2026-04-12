import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PageSection } from '@/types'

export function CategoriesSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        {section.heading && (
          <div className="mb-12 text-center">
            <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
              {section.heading}
            </h2>
            {section.subheading && (
              <p className="mt-3 text-body leading-relaxed text-body/70">
                {section.subheading}
              </p>
            )}
          </div>
        )}
        {section.items && section.items.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {section.items.map((item, i) => (
              <Link
                key={i}
                href={item.href || '#'}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
              >
                {item.image && (
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.title}
                    fill
                    className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-108"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 z-10 p-8 text-cream">
                  <h3 className="font-heading text-h3 font-bold text-cream">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1.5 text-label text-cream/80">{item.description}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-label font-bold text-cream opacity-0 motion-safe:translate-y-2 motion-safe:transition-all motion-safe:duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Utforsk <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
