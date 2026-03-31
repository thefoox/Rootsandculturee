import type { PageSection } from '@/types'

export function FaqSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-card section-padding">
      <div className="mx-auto max-w-[800px] px-4 md:px-8">
        {section.heading && (
          <h2 className="text-center font-heading text-h2 font-bold text-forest">
            {section.heading}
          </h2>
        )}
        {section.items && section.items.length > 0 && (
          <div className="mt-10 space-y-4">
            {section.items.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl bg-cream"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-body font-medium text-forest marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{item.title}</span>
                  <span
                    className="ml-4 shrink-0 text-body motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-body leading-relaxed text-body">
                  {item.description}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
