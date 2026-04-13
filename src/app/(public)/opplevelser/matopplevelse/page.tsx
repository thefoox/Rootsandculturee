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
  title: 'Matopplevelser — Roots & Culture',
  description: 'Smak på norske tradisjoner med matlagingskurs, gårdsmat og lokale råvarer fra norsk natur.',
}

export const revalidate = 3600

export default async function MatopplevelsePage() {
  const [page, allExperiences] = await Promise.all([
    getPageContent('matopplevelse'),
    getExperiences(),
  ])

  const mat = allExperiences.filter((e) => e.category === 'matopplevelse')
  const matWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      mat.map(async (experience) => {
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
          <Breadcrumbs items={[{ label: 'Opplevelser', href: '/opplevelser' }, { label: 'Matopplevelser' }]} />
        </div>

        <section className="border-t border-forest/10 py-12 md:py-16">
          <h2 className="font-heading text-h3 font-bold text-forest">Tilgjengelige matopplevelser</h2>
          <div className="mt-8">
            {matWithDates.length > 0 ? (
              <ExperienceList experiences={matWithDates} />
            ) : (
              <EmptyState icon={Compass} heading="Kommer snart" body="Vi planlegger nye matopplevelser med norske tradisjonsretter. Følg med!" ctaLabel="Se alle opplevelser" ctaHref="/opplevelser" />
            )}
          </div>
        </section>
      </div>
    </>
  )
}
