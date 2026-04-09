import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { formatPrice, formatDate } from '@/lib/format'
import type { PageSection, ExperienceCategory } from '@/types'

const CATEGORY_BADGES: Record<ExperienceCategory, { label: string; className: string }> = {
  retreat: { label: 'Retreat', className: 'bg-[#DCFCE7] text-[#166534]' },
  kurs: { label: 'Kurs', className: 'bg-[#FEF3C7] text-[#92400E]' },
  matopplevelse: { label: 'Matopplevelse', className: 'bg-[#FEE2E2] text-[#991B1B]' },
}

export async function ExperiencesGridSection({ section }: { section: PageSection }) {
  const experiences = await getExperiences()
  const experiencesWithDates = await Promise.all(
    experiences.slice(0, 6).map(async (experience) => {
      const dates = await getExperienceDates(experience.id)
      return { experience, nextDate: dates[0] ?? undefined }
    })
  )

  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section header — centered */}
        <div className="mb-10 text-center">
          {section.heading && (
            <h2 className="font-heading font-bold text-forest" style={{ fontSize: 'clamp(1.75rem, 1.5rem + 0.8vw, 2.25rem)' }}>
              {section.heading}
            </h2>
          )}
          {section.subheading && (
            <p className="mt-2 text-[0.9375rem] opacity-60">
              {section.subheading}
            </p>
          )}
        </div>

        {experiencesWithDates.length > 0 ? (
          <>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {experiencesWithDates.map(({ experience, nextDate }) => {
                const mainImage = experience.images[0]
                const badge = CATEGORY_BADGES[experience.category]

                return (
                  <Link
                    key={experience.id}
                    href={`/opplevelser/${experience.slug}`}
                    className="group overflow-hidden rounded-2xl border border-forest/6 bg-cream motion-safe:transition-all motion-safe:duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(27,67,50,0.12)]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/11] overflow-hidden">
                      {mainImage ? (
                        <Image
                          src={mainImage.url}
                          alt={mainImage.alt}
                          fill
                          className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.06]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-card" />
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      {/* Category badge */}
                      {badge && (
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge.className} mb-3`}>
                          {badge.label}
                        </span>
                      )}

                      {/* Title */}
                      <h3 className="font-heading text-[1.1875rem] font-bold leading-[1.3] text-forest line-clamp-2">
                        {experience.name}
                      </h3>

                      {/* Date */}
                      {nextDate && (
                        <div className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-bark">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{formatDate(nextDate.date)}</span>
                        </div>
                      )}

                      {/* Location */}
                      <p className="mt-1 text-[0.8125rem] text-body/50">
                        {experience.location}
                      </p>

                      {/* Description */}
                      <p className="mt-2.5 text-[0.8125rem] leading-[1.55] opacity-65 line-clamp-2">
                        {experience.description}
                      </p>

                      {/* Footer: price + link */}
                      <div className="mt-5 flex items-center justify-between border-t border-forest/6 pt-4">
                        <span className="text-[1.1875rem] font-bold text-forest">
                          {formatPrice(experience.basePrice)}
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

            {/* See all link */}
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
            Ingen opplevelser tilgjengelig akkurat na.
          </p>
        )}
      </div>
    </section>
  )
}
