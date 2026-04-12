'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ExperienceCategory } from '@/types'

const CATEGORY_BADGES: Record<ExperienceCategory, { label: string; className: string }> = {
  retreat: { label: 'Retreat', className: 'bg-[#DCFCE7] text-[#166534]' },
  kurs: { label: 'Kurs', className: 'bg-[#FEF3C7] text-[#92400E]' },
  matopplevelse: { label: 'Matopplevelse', className: 'bg-[#FEE2E2] text-[#991B1B]' },
}

const TABS: Array<{ key: 'all' | ExperienceCategory; label: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'retreat', label: 'Retreats' },
  { key: 'kurs', label: 'Kurs' },
  { key: 'matopplevelse', label: 'Matopplevelser' },
]

interface ExperienceItem {
  id: string
  slug: string
  name: string
  category: ExperienceCategory
  location: string
  description: string
  basePrice: number
  image: { url: string; alt: string } | null
  nextDate: { date: string } | null
}

interface Props {
  heading?: string
  subheading?: string
  items: ExperienceItem[]
}

export function ExperiencesGridClient({ heading, subheading, items }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | ExperienceCategory>('all')

  const filtered = activeTab === 'all'
    ? items.slice(0, 6)
    : items.filter((i) => i.category === activeTab).slice(0, 6)

  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          {heading && (
            <h2
              className="font-heading font-bold text-forest"
              style={{ fontSize: 'clamp(1.75rem, 1.5rem + 0.8vw, 2.25rem)' }}
            >
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-2 text-[0.9375rem] opacity-60">{subheading}</p>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex gap-1 rounded-full border border-forest/10 bg-cream p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'rounded-full px-5 py-2 text-[13px] font-medium motion-safe:transition-colors',
                  activeTab === tab.key
                    ? 'bg-forest text-cream shadow-sm'
                    : 'text-forest/60 hover:text-forest'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const badge = CATEGORY_BADGES[item.category]
                const dateStr = item.nextDate
                  ? new Intl.DateTimeFormat('nb-NO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }).format(new Date(item.nextDate.date))
                  : null

                return (
                  <Link
                    key={item.id}
                    href={`/opplevelser/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border border-forest/6 bg-cream motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(27,67,50,0.12)]"
                  >
                    <div className="relative aspect-[16/11] overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image.url}
                          alt={item.image.alt}
                          fill
                          className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.06]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-card" />
                      )}
                    </div>

                    <div className="p-6">
                      {badge && (
                        <span
                          className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      )}

                      <h3 className="font-heading text-[1.1875rem] font-bold leading-[1.3] text-forest line-clamp-2">
                        {item.name}
                      </h3>

                      {dateStr && (
                        <div className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-bark">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{dateStr}</span>
                        </div>
                      )}

                      <p className="mt-1 text-[0.8125rem] text-body/50">{item.location}</p>

                      <p className="mt-2.5 text-[0.8125rem] leading-[1.55] opacity-65 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-forest/6 pt-4">
                        <span className="text-[1.1875rem] font-bold text-forest">
                          {formatPrice(item.basePrice)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-forest">
                          Les mer <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/opplevelser"
                className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-forest hover:underline"
              >
                Se alle opplevelser <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-10 text-center text-body">
            Ingen opplevelser i denne kategorien.
          </p>
        )}
      </div>
    </section>
  )
}
