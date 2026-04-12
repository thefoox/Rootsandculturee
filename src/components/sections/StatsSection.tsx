import type { PageSection } from '@/types'

export function StatsSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-forest py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        {section.heading && (
          <div className="mb-12 text-center">
            <h2 className="font-heading text-h2 font-bold tracking-tight text-cream">
              {section.heading}
            </h2>
            {section.subheading && (
              <p className="mt-3 text-body text-cream/65">
                {section.subheading}
              </p>
            )}
          </div>
        )}
        {section.items && section.items.length > 0 && (
          <div className={`grid grid-cols-2 gap-8 ${section.items.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {section.items.map((item, i) => (
              <div key={i} className="text-center">
                <div className="font-heading text-h1 font-bold text-cream">
                  {item.title}
                </div>
                <div className="mt-2 text-body text-cream/65">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
