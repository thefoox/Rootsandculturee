import { sanitizeHtml } from '@/lib/sanitize'
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
        {section.body && (
          <div
            className="mt-5 max-w-2xl font-body text-body leading-relaxed text-forest prose-p:mt-4 first:prose-p:mt-0"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body) }}
          />
        )}
      </div>
    </section>
  )
}
