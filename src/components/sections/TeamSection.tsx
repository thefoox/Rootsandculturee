import Image from 'next/image'
import type { PageSection } from '@/types'

export function TeamSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        {section.heading && (
          <h2
            className="mb-12 text-center font-heading font-bold text-forest"
            style={{ fontSize: 'clamp(1.75rem, 1.5rem + 0.8vw, 2rem)' }}
          >
            {section.heading}
          </h2>
        )}
        {section.items && section.items.length > 0 && (
          <div className="grid gap-8 md:grid-cols-3">
            {section.items.map((item, i) => (
              <div key={i} className="text-center">
                {/* Photo: 3/4 aspect ratio, large rounded */}
                <div className="relative mx-auto aspect-[3/4] overflow-hidden rounded-2xl bg-card">
                  {item.image ? (
                    <Image
                      src={item.image.url}
                      alt={item.image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-card" />
                  )}
                </div>
                {/* Name */}
                <h4 className="mt-4 font-heading text-[1.125rem] font-bold text-forest">
                  {item.title}
                </h4>
                {/* Role */}
                {item.description && (
                  <p className="mt-1 text-[0.8125rem] text-bark">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
