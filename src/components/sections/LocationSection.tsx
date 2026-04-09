import * as icons from 'lucide-react'
import type { PageSection } from '@/types'

function getIcon(name?: string) {
  if (!name) return null
  const key = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const Icon = (icons as unknown as Record<string, icons.LucideIcon>)[key]
  return Icon ?? null
}

export function LocationSection({ section }: { section: PageSection }) {
  // Dark variant: forest bg (om-oss style), Light variant: cream bg (kontakt style)
  // Detect from section body or default to light
  const isDark = section.body === 'dark'

  if (isDark) {
    return <LocationDark section={section} />
  }
  return <LocationLight section={section} />
}

/** Dark variant (om-oss.html): forest bg, cream text, 1fr 1fr grid */
function LocationDark({ section }: { section: PageSection }) {
  return (
    <section className="bg-forest py-24 text-cream">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid items-center gap-16 max-md:grid-cols-1 md:grid-cols-2">
          <div>
            {section.heading && (
              <h2
                className="font-heading font-bold text-cream"
                style={{ fontSize: 'clamp(1.75rem, 1.5rem + 0.8vw, 2rem)' }}
              >
                {section.heading}
              </h2>
            )}
            {section.subheading && (
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/80">
                {section.subheading}
              </p>
            )}
            {section.items && section.items.length > 0 && (
              <div className="mt-6 space-y-6">
                {section.items.map((item, i) => {
                  const Icon = getIcon(item.icon)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      {Icon && (
                        <Icon className="h-5 w-5 shrink-0 text-cream/60" strokeWidth={1.5} aria-hidden="true" />
                      )}
                      <span className="text-[0.9375rem] text-cream/80">{item.title}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {/* Map placeholder */}
          <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-cream/10 text-[0.875rem] text-cream/40">
            Kart
          </div>
        </div>
      </div>
    </section>
  )
}

/** Light variant (kontakt-v2.html): cream bg, 1fr 1.5fr grid */
function LocationLight({ section }: { section: PageSection }) {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid items-center gap-12 max-md:grid-cols-1 md:grid-cols-[1fr_1.5fr]">
          <div>
            {section.heading && (
              <h2
                className="font-heading font-bold text-forest"
                style={{ fontSize: 'clamp(1.5rem, 1.3rem + 0.6vw, 1.75rem)' }}
              >
                {section.heading}
              </h2>
            )}
            {section.subheading && (
              <p className="mt-3 text-[0.9375rem] leading-relaxed">
                {section.subheading}
              </p>
            )}
            {section.items && section.items.length > 0 && (
              <div className="mt-6 space-y-3">
                {section.items.map((item, i) => {
                  const Icon = getIcon(item.icon)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      {Icon && (
                        <Icon className="h-[18px] w-[18px] shrink-0 text-forest opacity-50" strokeWidth={1.5} aria-hidden="true" />
                      )}
                      <span className="text-[0.9375rem]">{item.title}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {/* Map placeholder */}
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-forest/6 bg-card text-[0.875rem] text-body opacity-40">
            Kart
          </div>
        </div>
      </div>
    </section>
  )
}
