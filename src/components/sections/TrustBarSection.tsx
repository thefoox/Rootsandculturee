import * as icons from 'lucide-react'
import { Leaf, RotateCcw, Mountain } from 'lucide-react'
import type { PageSection } from '@/types'

const FALLBACK_ITEMS = [
  { icon: 'Leaf', label: 'Lokal produksjon', description: 'Alle produkter fra norsk natur' },
  { icon: 'RotateCcw', label: '14 dagers angrerett', description: 'Full returrett på alle produkter' },
  { icon: 'Mountain', label: 'Norsk natur', description: 'Autentiske naturopplevelser' },
]

function getIcon(name?: string): icons.LucideIcon | null {
  if (!name) return null
  const key = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const Icon = (icons as unknown as Record<string, icons.LucideIcon>)[key]
  return Icon ?? null
}

// Keep named imports to prevent tree-shaking from removing them in fallback path
void Leaf
void RotateCcw
void Mountain

export function TrustBarSection({ section }: { section: PageSection }) {
  const items = (section.items && section.items.length > 0)
    ? section.items.map((item) => ({
        icon: item.icon || 'Leaf',
        label: item.title,
        description: item.description,
      }))
    : FALLBACK_ITEMS

  return (
    <section className="border-y border-forest/8 bg-cream py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {items.map(({ icon, label, description }) => {
            const Icon = getIcon(icon)
            return (
              <div key={label} className="flex flex-col items-center text-center">
                {Icon && <Icon className="h-8 w-8 text-forest" aria-hidden="true" />}
                <p className="mt-3 font-heading text-lg font-bold text-forest">{label}</p>
                <p className="mt-1 font-body text-label text-body/70">{description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
