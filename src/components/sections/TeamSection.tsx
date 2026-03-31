import Image from 'next/image'
import type { PageSection } from '@/types'

export function TeamSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-card section-padding">
      <div className="mx-auto max-w-[1200px] px-4 text-center md:px-8">
        {section.heading && (
          <h2 className="font-heading text-h2 font-bold text-forest">
            {section.heading}
          </h2>
        )}
        {section.items && section.items.length > 0 && (
          <div className="mx-auto mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item, i) => (
              <div key={i} className="mx-auto max-w-sm">
                {item.image && (
                  <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-xl">
                    <Image
                      src={item.image.url}
                      alt={item.image.alt}
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  </div>
                )}
                <h3 className="mt-6 font-heading text-h3 font-bold text-forest">
                  {item.title}
                </h3>
                <p className="mt-4 text-body leading-relaxed text-body">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
