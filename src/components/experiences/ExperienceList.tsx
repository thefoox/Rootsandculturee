import type { Experience, ExperienceDate } from '@/types'
import { ExperienceCard } from './ExperienceCard'

interface ExperienceListProps {
  experiences: Array<Experience & { nextDate?: ExperienceDate }>
}

export function ExperienceList({ experiences }: ExperienceListProps) {
  return (
    <div className="flex flex-col gap-6">
      {experiences.map((experience) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          nextDate={experience.nextDate}
        />
      ))}
    </div>
  )
}
