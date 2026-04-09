import * as icons from 'lucide-react'
import type { PageSection } from '@/types'

function getIcon(name?: string) {
  if (!name) return null
  const key = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const Icon = (icons as unknown as Record<string, icons.LucideIcon>)[key]
  return Icon ?? null
}

export function ValuesSection({ section }: { section: PageSection }) {
  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section header with optional subheading */}
        <div className="mx-auto mb-16 max-w-[640px] text-center">
          {section.heading && (
            <h2
              className="font-heading font-bold text-forest"
              style={{ fontSize: 'clamp(1.75rem, 1.5rem + 0.8vw, 2rem)' }}
            >
              {section.heading}
            </h2>
          )}
          {section.subheading && (
            <p className="mt-3 text-[0.9375rem] leading-relaxed">
              {section.subheading}
            </p>
          )}
        </div>

        {section.items && section.items.length > 0 && (
          <div className="grid gap-8 max-md:grid-cols-1 md:grid-cols-3">
            {section.items.map((item, i) => {
              const Icon = getIcon(item.icon)
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-cream px-8 py-12 text-center motion-safe:transition-transform hover:-translate-y-1"
                >
                  {Icon && (
                    <Icon
                      className="mx-auto h-12 w-12 text-forest"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                  <h3 className="mt-4 font-heading text-[1.25rem] font-bold text-forest">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-[1.6]">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
