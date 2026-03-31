import Image from 'next/image'
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
    <section className="bg-cream section-padding">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        {section.heading && (
          <h2 className="font-heading text-h2 font-bold text-forest">
            {section.heading}
          </h2>
        )}
        {section.items && section.items.length > 0 && (
          <div className="mt-8 space-y-6">
            {section.items.map((item, i) => {
              const Icon = getIcon(item.icon)
              return (
                <div key={i} className="flex items-start gap-4">
                  {Icon && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
                      <Icon className="h-5 w-5 text-forest" aria-hidden="true" />
                    </div>
                  )}
                  <div>
                    <p className="text-label font-medium tracking-wide text-forest">
                      {item.title}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-body underline-offset-2 motion-safe:transition-colors motion-safe:duration-100 hover:text-forest hover:underline"
                        {...(item.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.description}
                      </a>
                    ) : (
                      <p className="text-body">{item.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {section.image && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={section.image.url}
              alt={section.image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
      </div>
    </section>
  )
}
