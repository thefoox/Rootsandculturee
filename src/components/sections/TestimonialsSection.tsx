import type { PageSection } from '@/types'

export function TestimonialsSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-card py-24">
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {section.items.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-forest/4 bg-cream p-8"
              >
                <div className="text-sm tracking-wider text-[var(--color-cart-badge)]">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </div>
                <p className="mt-4 font-heading text-body italic leading-relaxed text-forest">
                  &laquo;{item.description}&raquo;
                </p>
                <div className="mt-5 text-label font-bold text-forest">{item.title}</div>
                {item.icon && (
                  <div className="text-[0.75rem] text-body/50">{item.icon}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
