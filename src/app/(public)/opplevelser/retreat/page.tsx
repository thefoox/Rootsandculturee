import type { Metadata } from 'next'
import { Compass } from 'lucide-react'
import { getPageContent } from '@/lib/data/page-content'
import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
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
  const [page, allExperiences] = await Promise.all([
    getPageContent('retreat'),
    getExperiences(),
  ])

  const retreats = allExperiences.filter((e) => e.category === 'retreat')
  const retreatsWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      retreats.map(async (experience) => {
        const dates = await getExperienceDates(experience.id)
        return { ...experience, nextDate: dates[0] || undefined }
      })
    )

  const sortedSections = page
    ? [...page.sections].sort((a, b) => a.order - b.order)
    : []

  return (
    <>
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: 'Opplevelser', href: '/opplevelser' }, { label: 'Naturretreater' }]} />
        </div>

        <section className="border-t border-forest/10 py-12 md:py-16">
          <h2 className="font-heading text-h3 font-bold text-forest">Tilgjengelige retreater</h2>
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
