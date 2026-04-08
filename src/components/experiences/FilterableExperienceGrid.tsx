'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, MapPin } from 'lucide-react'
import type { Experience, ExperienceDate } from '@/types'
import { formatPrice, formatDate } from '@/lib/format'

const CATEGORY_LABELS: Record<string, string> = {
  retreat: 'Retreat',
  kurs: 'Kurs',
  matopplevelse: 'Matopplevelse',
}

const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  retreat: 'bg-badge-easy-bg text-badge-easy',
  kurs: 'bg-badge-warning-bg text-badge-warning',
  matopplevelse: 'bg-badge-error-bg text-badge-error',
}

interface ExperienceWithDate extends Experience {
  nextDate?: ExperienceDate
}

interface FilterableExperienceGridProps {
  experiences: ExperienceWithDate[]
  title?: string
  subtitle?: string
  showSeeAll?: boolean
  limit?: number
}

export function FilterableExperienceGrid({
  experiences,
  title = 'Kurs og Retreater',
  subtitle = 'Book din neste naturopplevelse',
  showSeeAll = true,
  limit,
}: FilterableExperienceGridProps) {
  const [activeFilter, setActiveFilter] = useState<string>('alle')

  const categories = useMemo(() => {
    const cats = new Set(experiences.map((e) => e.category))
    return Array.from(cats)
  }, [experiences])

  const filtered = useMemo(() => {
    const result =
      activeFilter === 'alle'
        ? experiences
        : experiences.filter((e) => e.category === activeFilter)
    return limit ? result.slice(0, limit) : result
  }, [experiences, activeFilter, limit])

  return (
    <div>
      {/* Header */}
      {title && (
        <div className="mb-10 text-center">
          <h2 className="font-heading text-h2 font-bold text-forest tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 font-body text-body text-body/60">{subtitle}</p>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div
        className="mb-10 flex justify-center gap-1 border-b border-forest/8"
        role="tablist"
        aria-label="Filtrer opplevelser"
      >
        <button
          role="tab"
          aria-selected={activeFilter === 'alle'}
          onClick={() => setActiveFilter('alle')}
          className={`mb-[-1px] border-b-2 px-6 py-3 font-body text-label font-medium transition-colors ${
            activeFilter === 'alle'
              ? 'border-forest text-forest font-semibold'
              : 'border-transparent text-body/50 hover:text-body/80'
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeFilter === cat}
            onClick={() => setActiveFilter(cat)}
            className={`mb-[-1px] border-b-2 px-6 py-3 font-body text-label font-medium transition-colors ${
              activeFilter === cat
                ? 'border-forest text-forest font-semibold'
                : 'border-transparent text-body/50 hover:text-body/80'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exp) => {
          const mainImage = exp.images[0]
          const now = new Date()
          const hasEarlybird =
            exp.nextDate?.earlyBirdPrice != null &&
            exp.nextDate?.earlyBirdDeadline != null &&
            new Date(exp.nextDate.earlyBirdDeadline) > now
          const displayPrice = hasEarlybird
            ? exp.nextDate!.earlyBirdPrice!
            : exp.basePrice

          return (
            <Link
              key={exp.id}
              href={`/opplevelser/${exp.slug}`}
              className="group overflow-hidden rounded-2xl border border-forest/6 bg-cream motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(27,67,50,0.12)]"
            >
              {/* Image */}
              <div className="relative aspect-[16/11] overflow-hidden">
                {mainImage ? (
                  <Image
                    src={mainImage.url}
                    alt={mainImage.alt}
                    fill
                    className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-card text-body/40">
                    Ingen bilde
                  </div>
                )}
                {hasEarlybird && (
                  <span className="absolute left-4 top-4 rounded-md bg-[var(--color-cart-badge)] px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-white">
                    Earlybird
                  </span>
                )}
                {exp.nextDate && exp.nextDate.availableSeats > 0 && (
                  <span className="absolute bottom-4 right-4 rounded-md bg-forest/85 px-3 py-1.5 text-xs font-medium text-cream backdrop-blur-sm">
                    {exp.nextDate.availableSeats} plasser igjen
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Category badge */}
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    CATEGORY_BADGE_CLASSES[exp.category] || 'bg-card text-forest'
                  }`}
                >
                  {CATEGORY_LABELS[exp.category] || exp.category}
                </span>

                {/* Title */}
                <h3 className="mt-3 line-clamp-2 font-heading text-h4 font-bold leading-snug text-forest">
                  {exp.name}
                </h3>

                {/* Date */}
                {exp.nextDate && (
                  <div className="mt-2 flex items-center gap-1.5 font-body text-label text-bark">
                    <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    {formatDate(exp.nextDate.date)}
                  </div>
                )}

                {/* Location */}
                <div className="mt-1 flex items-center gap-1.5 font-body text-label text-body/50">
                  <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  {exp.location}
                </div>

                {/* Description */}
                {exp.description && (
                  <p className="mt-2.5 line-clamp-2 font-body text-label leading-relaxed text-body/65">
                    {exp.description}
                  </p>
                )}

                {/* Footer: Price + Link */}
                <div className="mt-5 flex items-center justify-between border-t border-forest/6 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-h4 font-bold text-forest">
                      {formatPrice(displayPrice)}
                    </span>
                    {hasEarlybird && (
                      <span className="text-label line-through opacity-40">
                        {formatPrice(exp.basePrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-label font-semibold text-forest group-hover:underline">
                    Les mer &rarr;
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* See all */}
      {showSeeAll && (
        <div className="mt-10 text-center">
          <Link
            href="/opplevelser"
            className="inline-flex items-center gap-1.5 font-body text-body font-medium text-forest hover:underline"
          >
            Se alle opplevelser &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
