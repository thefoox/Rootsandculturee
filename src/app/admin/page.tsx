import Link from 'next/link'
import { Package, Mountain, FileText, Layout } from 'lucide-react'
import { getAllProducts } from '@/actions/products'
import { getAllExperiences } from '@/actions/experiences'
import { getAllArticles } from '@/actions/articles'

export default async function AdminDashboard() {
  const [products, experiences, articles] = await Promise.all([
    getAllProducts(),
    getAllExperiences(),
    getAllArticles(),
  ])

  const stats = [
    {
      label: 'Produkter',
      count: products.length,
      href: '/admin/produkter',
      icon: Package,
    },
    {
      label: 'Opplevelser',
      count: experiences.length,
      href: '/admin/opplevelser',
      icon: Mountain,
    },
    {
      label: 'Artikler',
      count: articles.length,
      href: '/admin/artikler',
      icon: FileText,
    },
    {
      label: 'Sideinnhold',
      count: null,
      href: '/admin/innhold',
      icon: Layout,
    },
  ]

  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="mb-8 font-heading text-[28px] font-bold text-forest">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.href}
              href={stat.href}
              className="flex items-center gap-4 rounded-lg border border-forest/12 bg-card p-6 hover:shadow-md"
            >
              <Icon className="h-8 w-8 text-rust" aria-hidden="true" />
              <div>
                <p className="text-[13px] text-bark">{stat.label}</p>
                {stat.count !== null && (
                  <p className="font-heading text-[20px] font-bold text-forest">
                    {stat.count}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
