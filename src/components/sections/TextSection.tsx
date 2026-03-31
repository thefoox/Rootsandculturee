import type { PageSection } from '@/types'

export function TextSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        {section.heading && (
          <h2 className="font-heading text-h1 font-bold text-forest">
            {section.heading}
          </h2>
        )}
        {section.subheading && (
          <p className="mt-2 max-w-md font-body text-body">
            {section.subheading}
          </p>
        )}
      </div>
    </section>
  )
}
