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
    <section className="bg-cream section-padding">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        {section.heading && (
          <h2 className="text-center font-heading text-h2 font-bold text-forest">
            {section.heading}
          </h2>
        )}
        {section.items && section.items.length > 0 && (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {section.items.map((item, i) => {
              const Icon = getIcon(item.icon)
              return (
                <div
                  key={i}
                  className="rounded-xl bg-card p-8 text-center"
                >
                  {Icon && (
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
                      <Icon className="h-7 w-7 text-forest" aria-hidden="true" />
                    </div>
                  )}
                  <h3 className="mt-5 font-heading text-h4 font-bold text-forest">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-body leading-relaxed text-body">
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
