import type { Metadata } from 'next'
import { Compass } from 'lucide-react'
import { getExperiences } from '@/lib/data/experiences'
import { getExperienceDates } from '@/lib/data/experiences'
import { ExperienceList } from '@/components/experiences/ExperienceList'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Experience, ExperienceDate } from '@/types'

export const metadata: Metadata = {
  title: 'Opplevelser — Roots & Culture',
  description:
    'Opplev norsk natur og kultur pa nart hold — naturretreater, kurs og matopplevelser.',
  openGraph: {
    title: 'Opplevelser',
    description:
      'Opplev norsk natur og kultur pa nart hold — naturretreater, kurs og matopplevelser.',
  },
}

export const revalidate = 3600

export default async function OpplevelserPage() {
  const experiences = await getExperiences()

  // Fetch the next upcoming date for each experience
  const experiencesWithDates: Array<Experience & { nextDate?: ExperienceDate }> =
    await Promise.all(
      experiences.map(async (experience) => {
        const dates = await getExperienceDates(experience.id)
        return {
          ...experience,
          nextDate: dates[0] || undefined,
        }
      })
    )

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 md:px-8 md:pb-24">
      <div className="pb-8 pt-12">
        <h1 className="font-heading text-[28px] font-bold text-forest">
          Opplevelser
        </h1>
        <p className="mt-2 text-[15px] text-bark">
          Opplev norsk natur og kultur pa nart hold gjennom unike opplevelser.
        </p>
      </div>
      {experiencesWithDates.length > 0 ? (
        <ExperienceList experiences={experiencesWithDates} />
      ) : (
        <EmptyState
          icon={Compass}
          heading="Ingen opplevelser"
          body="Vi har ingen opplevelser tilgjengelig akkurat na."
        />
      )}
    </div>
  )
}
