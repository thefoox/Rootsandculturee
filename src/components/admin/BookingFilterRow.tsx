'use client'

import { Button } from '@/components/ui/Button'

interface FilterExperience {
  id: string
  name: string
}

interface FilterDate {
  id: string
  date: Date
  experienceId: string
}

interface BookingFilterRowProps {
  experiences: FilterExperience[]
  dates: FilterDate[]
  selectedExperienceId: string
  selectedDateId: string
  onExperienceChange: (experienceId: string) => void
  onDateChange: (dateId: string) => void
  onReset: () => void
}

export function BookingFilterRow({
  experiences,
  dates,
  selectedExperienceId,
  selectedDateId,
  onExperienceChange,
  onDateChange,
  onReset,
}: BookingFilterRowProps) {
  const filteredDates = selectedExperienceId
    ? dates.filter((d) => d.experienceId === selectedExperienceId)
    : []

  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <div>
        <label
          htmlFor="filter-experience"
          className="block font-body text-[13px] text-bark"
        >
          Filtrer etter opplevelse:
        </label>
        <select
          id="filter-experience"
          value={selectedExperienceId}
          onChange={(e) => {
            onExperienceChange(e.target.value)
            onDateChange('')
          }}
          className="mt-1 block min-w-[200px] rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-[15px] text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
        >
          <option value="">Alle opplevelser</option>
          {experiences.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name}
            </option>
          ))}
        </select>
      </div>

      {selectedExperienceId && filteredDates.length > 0 && (
        <div>
          <label
            htmlFor="filter-date"
            className="block font-body text-[13px] text-bark"
          >
            Filtrer etter dato:
          </label>
          <select
            id="filter-date"
            value={selectedDateId}
            onChange={(e) => onDateChange(e.target.value)}
            className="mt-1 block min-w-[200px] rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-[15px] text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
          >
            <option value="">Alle datoer</option>
            {filteredDates.map((d) => {
              const dateObj = d.date instanceof Date ? d.date : new Date(d.date)
              return (
                <option key={d.id} value={d.id}>
                  {new Intl.DateTimeFormat('nb-NO', { dateStyle: 'medium' }).format(dateObj)}
                </option>
              )
            })}
          </select>
        </div>
      )}

      {(selectedExperienceId || selectedDateId) && (
        <Button variant="ghost" onClick={onReset} className="text-bark">
          Nullstill filter
        </Button>
      )}
    </div>
  )
}
