import Image from 'next/image'
import type { PageSection } from '@/types'

export function GallerySection({ section }: { section: PageSection }) {
  return (
    <section className="bg-card section-padding">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        {section.heading && (
          <h2 className="text-center font-heading text-h2 font-bold text-forest">
            {section.heading}
          </h2>
        )}
        {section.items && section.items.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {section.items.map((item, i) =>
              item.image ? (
                <div
                  key={i}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl"
                >
                  <Image
                    src={item.image.url}
                    alt={item.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </section>
  )
}
