import * as icons from 'lucide-react'
import type { PageSection } from '@/types'

function getIcon(name?: string) {
  if (!name) return null
  const key = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const Icon = (icons as unknown as Record<string, icons.LucideIcon>)[key]
  return Icon ?? null
}

export function ContactInfoSection({ section }: { section: PageSection }) {
  return (
    <section className="relative z-[2] -mt-12 px-6">
      <div className="mx-auto max-w-[1200px]">
        {section.items && section.items.length > 0 && (
          <div className="grid gap-5 md:grid-cols-3">
            {section.items.map((item, i) => {
              const Icon = getIcon(item.icon)
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-forest/4 bg-white p-8 text-center shadow-[0_4px_24px_rgba(27,67,50,0.08)] motion-safe:transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(27,67,50,0.12)]"
                >
                  {/* Icon container */}
                  {Icon && (
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] bg-forest/6">
                      <Icon className="h-6 w-6 text-forest" aria-hidden="true" />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-heading text-[1.0625rem] font-bold text-forest">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-1 text-[0.875rem] opacity-60">
                      {item.description}
                    </p>
                  )}

                  {/* Value link */}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-3 inline-block text-[0.9375rem] font-semibold text-forest hover:underline"
                      {...(item.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {item.href.replace('mailto:', '').replace('tel:', '')}
                    </a>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
