'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, SlidersHorizontal } from 'lucide-react'
import type { Experience, ExperienceDate, ExperienceCategory } from '@/types'
import { formatPrice, formatDate } from '@/lib/format'
import { PriceBadge } from '@/components/shared/PriceBadge'
import { SpotsRemaining } from './SpotsRemaining'

type SortOption = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc'

const categoryLabels: Record<ExperienceCategory | 'alle', string> = {
  alle: 'Alle',
  retreat: 'Retreats',
  kurs: 'Kurs',
  matopplevelse: 'Matopplevelser',
}

interface ExperienceWithDate extends Experience {
  nextDate?: ExperienceDate
}

interface ExperienceGridProps {
  experiences: ExperienceWithDate[]
}

export function ExperienceGrid({ experiences }: ExperienceGridProps) {
  const [category, setCategory] = useState<ExperienceCategory | 'alle'>('alle')
  const [sort, setSort] = useState<SortOption>('date-asc')

  const filtered = useMemo(() => {
    let result = category === 'alle'
      ? experiences
      : experiences.filter((e) => e.category === category)

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'date-asc': {
          const aTime = a.nextDate ? new Date(a.nextDate.date).getTime() : Infinity
          const bTime = b.nextDate ? new Date(b.nextDate.date).getTime() : Infinity
          return aTime - bTime
        }
        case 'date-desc': {
          const aTime = a.nextDate ? new Date(a.nextDate.date).getTime() : 0
          const bTime = b.nextDate ? new Date(b.nextDate.date).getTime() : 0
          return bTime - aTime
        }
        case 'price-asc':
          return a.basePrice - b.basePrice
        case 'price-desc':
          return b.basePrice - a.basePrice
        default:
          return 0
      }
    })

    return result
  }, [experiences, category, sort])

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(categoryLabels) as Array<ExperienceCategory | 'alle'>).map((key) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === key
                  ? 'bg-forest text-cream'
                  : 'bg-card text-forest hover:bg-forest/10'
              }`}
            >
              {categoryLabels[key]}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-bark" aria-hidden="true" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-forest/15 bg-card px-3 py-2 text-sm text-forest"
            aria-label="Sortering"
          >
            <option value="date-asc">Dato (tidligst først)</option>
            <option value="date-desc">Dato (senest først)</option>
            <option value="price-asc">Pris (lav til høy)</option>
            <option value="price-desc">Pris (høy til lav)</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-bark">
        {filtered.length} {filtered.length === 1 ? 'opplevelse' : 'opplevelser'}
      </p>

      {/* Card grid */}
      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((experience) => (
            <ExperienceGridCard
              key={experience.id}
              experience={experience}
              nextDate={experience.nextDate}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-body text-bark">
          Ingen opplevelser i denne kategorien akkurat nå.
        </p>
      )}
    </div>
  )
}

function ExperienceGridCard({ experience, nextDate }: { experience: Experience; nextDate?: ExperienceDate }) {
  const mainImage = experience.images[0]
  const now = new Date()
  const hasEarlybird = nextDate?.earlyBirdPrice != null && nextDate?.earlyBirdDeadline != null && new Date(nextDate.earlyBirdDeadline) > now

  return (
    <Link
      href={`/opplevelser/${experience.slug}`}
      aria-label={`${experience.name}, ${formatPrice(experience.basePrice)}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-forest/8 bg-card shadow-sm motion-safe:transition-all motion-safe:duration-200 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt}
            fill
            className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card text-bark">
            Ingen bilde
          </div>
        )}
        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-forest/85 px-3 py-1 text-xs font-medium text-cream backdrop-blur-sm">
          {categoryLabels[experience.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-bold leading-snug text-forest">
          {experience.name}
        </h3>

        {nextDate && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-bark">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {formatDate(nextDate.date)}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between">
          {hasEarlybird ? (
            <p className="text-body font-bold text-forest">
              {formatPrice(nextDate!.earlyBirdPrice!)}{' '}
              <span className="text-sm font-normal text-bark line-through">{formatPrice(experience.basePrice)}</span>
            </p>
          ) : (
            <PriceBadge priceInOre={experience.basePrice} />
          )}

          {nextDate && (
            <SpotsRemaining
              available={nextDate.availableSeats}
              total={nextDate.maxSeats}
            />
          )}
        </div>
      </div>
    </Link>
  )
}
