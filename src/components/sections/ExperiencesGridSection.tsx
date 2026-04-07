import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, CalendarDays } from 'lucide-react'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { formatPrice, formatDate } from '@/lib/format'
import type { PageSection } from '@/types'

export async function ExperiencesGridSection({ section }: { section: PageSection }) {
  const experiences = await getExperiences()
  const experiencesWithDates = await Promise.all(
    experiences.slice(0, 3).map(async (experience) => {
      const dates = await getExperienceDates(experience.id)
      return { experience, nextDate: dates[0] ?? undefined }
    })
  )

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="flex items-end justify-between">
          <div>
            {section.heading && (
              <h2 className="font-heading text-h1 font-bold text-forest">
                {section.heading}
              </h2>
            )}
            {section.subheading && (
              <p className="mt-2 max-w-md font-body text-body">
                {section.subheading}
              </p>
            )}
          </div>
          <Link
            href="/opplevelser"
            className="hidden font-body text-body font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
          >
            Se alle <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {experiencesWithDates.length > 0 ? (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {experiencesWithDates.map(({ experience, nextDate }) => {
                const mainImage = experience.images[0]
                const now = new Date()
                const hasEb = nextDate?.earlyBirdPrice != null && nextDate?.earlyBirdDeadline != null && nextDate.earlyBirdDeadline > now
                return (
                  <Link
                    key={experience.id}
                    href={`/opplevelser/${experience.slug}`}
                    className="group relative overflow-hidden rounded-2xl"
                  >
                    <div className="relative aspect-[3/4]">
                      {mainImage ? (
                        <Image
                          src={mainImage.url}
                          alt={mainImage.alt}
                          fill
                          className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-card" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <h3 className="font-heading text-h3 font-bold leading-tight text-cream">
                        {experience.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-cream/80">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {experience.location}
                        </span>
                        {nextDate && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                            {formatDate(nextDate.date)}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-body text-lg font-bold text-cream">
                        {hasEb ? (
                          <>
                            fra {formatPrice(nextDate!.earlyBirdPrice!)}{' '}
                            <span className="text-cream/50 line-through text-sm font-normal">{formatPrice(experience.basePrice)}</span>
                          </>
                        ) : (
                          <>fra {formatPrice(experience.basePrice)}</>
                        )}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="mt-6 text-center md:hidden">
              <Link
                href="/opplevelser"
                className="inline-flex items-center gap-1 font-body text-body font-medium text-forest hover:underline"
              >
                Se alle opplevelser <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-10 text-center font-body text-body">
            Ingen opplevelser tilgjengelig akkurat nå.
          </p>
        )}
      </div>
    </section>
  )
}
