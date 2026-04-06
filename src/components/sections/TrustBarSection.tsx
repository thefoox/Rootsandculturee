import { Leaf, RotateCcw, Mountain } from 'lucide-react'
import type { PageSection } from '@/types'

const trustItems = [
  { icon: Leaf, label: 'Lokal produksjon', description: 'Alle produkter fra norsk natur' },
  { icon: RotateCcw, label: '14 dagers angrerett', description: 'Full returrett på alle produkter' },
  { icon: Mountain, label: 'Norsk natur', description: 'Autentiske naturopplevelser' },
]

export function TrustBarSection({ section: _section }: { section: PageSection }) {
  return (
    <section className="border-y border-forest/8 bg-cream py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {trustItems.map(({ icon: Icon, label, description }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <Icon className="h-8 w-8 text-forest" aria-hidden="true" />
              <p className="mt-3 font-heading text-lg font-bold text-forest">{label}</p>
              <p className="mt-1 font-body text-label text-body/70">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
