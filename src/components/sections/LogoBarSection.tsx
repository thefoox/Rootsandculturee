import Image from 'next/image'
import type { PageSection } from '@/types'

export function LogoBarSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        {section.heading && (
          <div className="mb-10 text-center">
            <h2 className="text-label font-bold uppercase tracking-widest text-body/40">
              {section.heading}
            </h2>
          </div>
        )}
        {section.items && section.items.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:gap-16">
            {section.items.map((item, i) =>
              item.image ? (
                <div
                  key={i}
                  className="relative h-10 w-28 grayscale opacity-50 motion-safe:transition-all motion-safe:duration-200 hover:opacity-100 hover:grayscale-0"
                >
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.title}
                    fill
                    className="object-contain"
                    sizes="112px"
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
