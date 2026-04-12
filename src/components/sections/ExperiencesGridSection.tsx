import { getExperiences, getExperienceDates } from '@/lib/data/experiences'
import type { PageSection } from '@/types'
import { ExperiencesGridClient } from './ExperiencesGridClient'

export async function ExperiencesGridSection({ section }: { section: PageSection }) {
  const experiences = await getExperiences()
  const experiencesWithDates = await Promise.all(
    experiences.map(async (experience) => {
      const dates = await getExperienceDates(experience.id)
      return { experience, nextDate: dates[0] ?? undefined }
    })
  )

  return (
    <ExperiencesGridClient
      heading={section.heading}
      subheading={section.subheading}
      items={experiencesWithDates.map(({ experience, nextDate }) => ({
        id: experience.id,
        slug: experience.slug,
        name: experience.name,
        category: experience.category,
        location: experience.location,
        description: experience.description,
        basePrice: experience.basePrice,
        image: experience.images[0] || null,
        nextDate: nextDate ? { date: nextDate.date instanceof Date ? nextDate.date.toISOString() : String(nextDate.date) } : null,
      }))}
    />
  )
}
