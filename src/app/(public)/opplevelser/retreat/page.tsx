import type { Metadata } from 'next'
import Image from 'next/image'
import { Compass } from 'lucide-react'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { ExperienceList } from '@/components/experiences/ExperienceList'
import { EmptyState } from '@/components/shared/EmptyState'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import type { Experience, ExperienceDate } from '@/types'

export const metadata: Metadata = {
  title: 'Naturretreater — Roots & Culture',
  description: 'Koble av i naturen med guidede retreater. Skogsbad, meditasjon og villmark ved fjord og fjell.',
}

export const revalidate = 3600

export default async function RetreatPage() {
  const allExperiences = await getExperiences()
  const retreats = allExperiences.filter((e) => e.category === 'retreat')

  const retreatsWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      retreats.map(async (experience) => {
        const dates = await getExperienceDates(experience.id)
        return { ...experience, nextDate: dates[0] || undefined }
      })
    )

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-end">
        <Image
          src="/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-20-desktop.webp"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/25" />
        
        <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-14 md:px-8 md:pb-20">
          <h1 className="max-w-xl font-heading text-[36px] font-bold leading-[1.1] text-cream md:text-[48px]">
            Naturretreater
          </h1>
          <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-cream/85">
            Koble av fra hverdagen med guidede retreater i norsk natur. Skogsbad, meditasjon og ro.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: 'Opplevelser', href: '/opplevelser' }, { label: 'Naturretreater' }]} />
        </div>

        {/* Info */}
        <section className="grid gap-10 py-12 md:grid-cols-5 md:items-start md:gap-16 md:py-16">
          <div className="md:col-span-3">
            <h2 className="font-heading text-[24px] font-bold text-forest">Om våre retreater</h2>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-body">
              <p>Våre naturretreater gir deg muligheten til å koble helt av fra hverdagen. Med erfarne guider tar vi deg med inn i norsk natur — fra stille skogsbad i Nordmarka til villmarksretreater ved Sognefjorden.</p>
              <p>Alle retreater inkluderer overnatting, måltider med lokale råvarer, og guidede aktiviteter tilpasset ditt nivå. Du trenger ingen forkunnskaper — bare et ønske om ro og natur.</p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:col-span-2">
            <Image
              src="/bilder-brukt-paa-sidene/opplevelser-retreat/retreat-12-desktop.webp"
              alt="Retreat i norsk natur"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </section>

        {/* Liste */}
        <section className="border-t border-forest/10 py-12 md:py-16">
          <h2 className="font-heading text-[24px] font-bold text-forest">Tilgjengelige retreater</h2>
          <div className="mt-8">
            {retreatsWithDates.length > 0 ? (
              <ExperienceList experiences={retreatsWithDates} />
            ) : (
              <EmptyState icon={Compass} heading="Ingen retreater" body="Vi har ingen retreater tilgjengelig akkurat nå." />
            )}
          </div>
        </section>
      </div>
    </>
  )
}
