import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getExperienceBySlug, getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { HeroImage } from '@/components/shared/HeroImage'
import { PriceBadge } from '@/components/shared/PriceBadge'
import { DifficultyBadge } from '@/components/experiences/DifficultyBadge'
import { SpotsRemaining } from '@/components/experiences/SpotsRemaining'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/format'
import { CalendarDays, MapPin } from 'lucide-react'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const experience = await getExperienceBySlug(slug)

  if (!experience) {
    return { title: 'Opplevelse ikke funnet — Roots & Culture' }
  }

  return {
    title: `${experience.name} — Roots & Culture`,
    description: experience.description,
    openGraph: {
      title: experience.name,
      description: experience.description,
      images: experience.images[0]?.url ? [{ url: experience.images[0].url }] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const experiences = await getExperiences()
  return experiences.map((e) => ({ slug: e.slug }))
}

export default async function OpplevelsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const experience = await getExperienceBySlug(slug)

  if (!experience) {
    notFound()
  }

  const dates = await getExperienceDates(experience.id)
  const nextDate = dates[0]
  const mainImage = experience.images[0]

  return (
    <>
      {mainImage && (
        <HeroImage
          src={mainImage.url}
          alt={mainImage.alt}
          title={experience.name}
          heightClass="h-[300px] md:h-[650px]"
        />
      )}
      <div className="mx-auto max-w-[800px] px-4 pb-16 pt-12 md:px-8">
        {/* Info row */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-forest/12 bg-card p-4">
          {nextDate && (
            <span className="flex items-center gap-1 font-body text-[13px] text-bark">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {formatDate(nextDate.date)}
            </span>
          )}
          <PriceBadge priceInOre={nextDate?.priceOverride ?? experience.basePrice} />
          {nextDate && (
            <SpotsRemaining
              available={nextDate.availableSeats}
              total={nextDate.maxSeats}
            />
          )}
          <DifficultyBadge difficulty={experience.difficulty} />
        </div>

        {/* Description */}
        <section className="mt-8">
          <h2 className="font-heading text-[20px] font-bold text-forest">
            Beskrivelse
          </h2>
          <p className="mt-4 font-body text-[15px] leading-[1.5] text-forest">
            {experience.description}
          </p>
        </section>

        {/* What is included */}
        {experience.whatIsIncluded.length > 0 && (
          <section className="mt-8">
            <h2 className="font-heading text-[20px] font-bold text-forest">
              Hva er inkludert
            </h2>
            <ul className="mt-4 list-disc pl-6 font-body text-[15px] text-forest">
              {experience.whatIsIncluded.map((item, i) => (
                <li key={i} className="mb-1">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* What to bring */}
        {experience.whatToBring && (
          <section className="mt-8">
            <h2 className="font-heading text-[20px] font-bold text-forest">
              Hva du bor ta med
            </h2>
            <p className="mt-4 font-body text-[15px] leading-[1.5] text-forest">
              {experience.whatToBring}
            </p>
          </section>
        )}

        {/* Location */}
        <section className="mt-8">
          <h2 className="font-heading text-[20px] font-bold text-forest">
            Sted
          </h2>
          <p className="mt-4 flex items-center gap-2 font-body text-[15px] text-forest">
            <MapPin className="h-4 w-4 text-bark" aria-hidden="true" />
            {experience.location}
          </p>
        </section>

        {/* Cancellation policy */}
        {experience.cancellationPolicy && (
          <section className="mt-8">
            <h2 className="font-heading text-[20px] font-bold text-forest">
              Kanselleringsvilkar
            </h2>
            <p className="mt-4 font-body text-[15px] leading-[1.5] text-forest">
              {experience.cancellationPolicy}
            </p>
          </section>
        )}

        {/* Booking button */}
        <div className="mt-12">
          <Button
            variant="primary"
            disabled
            aria-disabled="true"
            title="Bestilling kommer snart"
            className="w-full md:w-auto"
          >
            Bestill opplevelse
          </Button>
        </div>
      </div>
    </>
  )
}
