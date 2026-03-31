import Link from 'next/link'
import { FileText, Home, Users, Mail, Mountain, TreePine, BookOpen, ShoppingBag, Pencil } from 'lucide-react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'

const pages = [
  { id: 'forside', title: 'Forside', description: 'Hero, produkter, opplevelser, blogg, CTA', icon: Home },
  { id: 'om-oss', title: 'Om oss', description: 'Historie, team, verdier, galleri', icon: Users },
  { id: 'kontakt', title: 'Kontakt', description: 'Kontaktinfo, FAQ', icon: Mail },
  { id: 'opplevelser', title: 'Opplevelser', description: 'Landingsside, intro, FAQ', icon: Mountain },
  { id: 'retreat', title: 'Naturretreater', description: 'Hero og beskrivelse', icon: TreePine },
  { id: 'kurs', title: 'Kurs', description: 'Hero og beskrivelse', icon: BookOpen },
  { id: 'matopplevelse', title: 'Matopplevelser', description: 'Hero og beskrivelse', icon: FileText },
  { id: 'produkter', title: 'Produkter', description: 'Overskrift og undertekst', icon: ShoppingBag },
  { id: 'blogg', title: 'Blogg', description: 'Overskrift og undertekst', icon: Pencil },
]

export default function SiteContentPage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Sideinnhold' },
        ]}
      />
      <h1 className="mb-2 font-heading text-h2 font-bold text-forest">
        Sideinnhold
      </h1>
      <p className="mb-8 text-body">
        Rediger tekst, bilder og seksjoner på alle sider.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => {
          const Icon = page.icon
          return (
            <Link
              key={page.id}
              href={`/admin/innhold/${page.id}`}
              className="group flex items-start gap-4 rounded-xl border border-forest/10 bg-cream p-5 motion-safe:transition-all motion-safe:duration-150 hover:shadow-md hover:border-forest/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest/8">
                <Icon className="h-5 w-5 text-forest" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-forest">{page.title}</h2>
                <p className="mt-0.5 text-label text-body/70">{page.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
