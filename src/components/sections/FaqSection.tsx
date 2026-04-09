import type { PageSection } from '@/types'

export function FaqSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-[960px] px-6">
        {section.heading && (
          <div className="mb-12 text-center">
            <h2 className="font-heading font-bold text-forest" style={{ fontSize: 'clamp(1.5rem, 1.3rem + 0.6vw, 1.75rem)' }}>
              {section.heading}
            </h2>
          </div>
        )}
        {section.items && section.items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {section.items.map((item, i) => (
              <div
                key={i}
                className="rounded-[14px] border border-forest/4 bg-cream p-6 motion-safe:transition-shadow hover:shadow-[0_4px_16px_rgba(27,67,50,0.06)]"
              >
                <h4 className="font-heading text-[0.9375rem] font-bold leading-[1.3] text-forest">
                  {item.title}
                </h4>
                <p className="mt-2 text-[0.8125rem] leading-[1.6] opacity-70">
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
