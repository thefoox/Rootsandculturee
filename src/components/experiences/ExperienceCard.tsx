import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import type { Experience, ExperienceDate } from '@/types'
import { formatPrice, formatDate } from '@/lib/format'
import { PriceBadge } from '@/components/shared/PriceBadge'
import { SpotsRemaining } from './SpotsRemaining'

interface ExperienceCardProps {
  experience: Experience
  nextDate?: ExperienceDate
}

export function ExperienceCard({ experience, nextDate }: ExperienceCardProps) {
  const mainImage = experience.images[0]

  return (
    <Link
      href={`/opplevelser/${experience.slug}`}
      aria-label={`${experience.name}${nextDate ? `, ${formatDate(nextDate.date)}` : ''}, ${formatPrice(experience.basePrice)}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-forest/8 bg-card shadow-sm md:flex-row motion-safe:transition-all motion-safe:duration-150 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden md:w-[280px] md:rounded-l-xl md:rounded-tr-none">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 280px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card text-body">
            Ingen bilde
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center p-6">
        <h3 className="font-heading text-h4 font-bold leading-[1.25] text-forest">
          {experience.name}
        </h3>
        {nextDate && (
          <p className="mt-2 flex items-center gap-1 font-body text-label text-body">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {formatDate(nextDate.date)}
          </p>
        )}
        <PriceBadge priceInOre={experience.basePrice} className="mt-2 block" />
        {nextDate && (
          <div className="mt-2">
            <SpotsRemaining
              available={nextDate.availableSeats}
              total={nextDate.maxSeats}
            />
          </div>
        )}
      </div>
    </Link>
  )
}
