import * as icons from 'lucide-react'
import { Leaf, RotateCcw, Mountain, Shield } from 'lucide-react'
import type { PageSection } from '@/types'

const FALLBACK_ITEMS = [
  { icon: 'Shield', label: 'Trygg betaling' },
  { icon: 'Leaf', label: 'Norsk kvalitet' },
  { icon: 'Mountain', label: 'Lokale guider' },
  { icon: 'RotateCcw', label: 'Gratis kansellering' },
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
void Shield

export function TrustBarSection({ section }: { section: PageSection }) {
  const items = (section.items && section.items.length > 0)
    ? section.items.map((item) => ({
        icon: item.icon || 'Leaf',
        label: item.title,
      }))
    : FALLBACK_ITEMS

  return (
    <section className="bg-forest py-7 border-t border-cream/5">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 max-md:justify-start max-md:gap-x-5 max-md:px-0">
          {items.map(({ icon, label }) => {
            const Icon = getIcon(icon)
            return (
              <div key={label} className="flex items-center gap-2 text-cream/65">
                {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />}
                <span className="text-[0.8125rem] font-medium">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
