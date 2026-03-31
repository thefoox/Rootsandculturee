'use client'

import { cn } from '@/lib/utils'
import type { ExperienceDate } from '@/types'

interface DateCardProps {
  experienceDate: ExperienceDate
  isSelected: boolean
  onSelect: (date: ExperienceDate) => void
}

function formatDateParts(date: Date) {
  const weekday = new Intl.DateTimeFormat('nb-NO', { weekday: 'short' }).format(date)
  const day = new Intl.DateTimeFormat('nb-NO', { day: 'numeric' }).format(date)
  const month = new Intl.DateTimeFormat('nb-NO', { month: 'short' }).format(date)
  const longDate = new Intl.DateTimeFormat('nb-NO', { dateStyle: 'full' }).format(date)
  return { weekday: weekday.toUpperCase(), day, month, longDate }
}

export function DateCard({ experienceDate, isSelected, onSelect }: DateCardProps) {
  const isSoldOut = experienceDate.availableSeats <= 0 || !experienceDate.isActive
  const { weekday, day, month, longDate } = formatDateParts(experienceDate.date)

  const ariaLabel = isSoldOut
    ? `${longDate}, utsolgt`
    : longDate

  return (
    <button
      type="button"
      onClick={() => onSelect(experienceDate)}
      disabled={isSoldOut}
      aria-pressed={isSelected}
      aria-disabled={isSoldOut || undefined}
      aria-label={ariaLabel}
      className={cn(
        'flex w-[80px] flex-col items-center justify-center rounded-lg border px-2 py-2',
        'min-h-[68px] shrink-0',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
        // Default state
        !isSelected && !isSoldOut && 'border-forest/15 bg-card motion-safe:hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
        // Selected state
        isSelected && !isSoldOut && 'border-2 border-forest bg-forest',
        // Sold out state
        isSoldOut && 'cursor-not-allowed opacity-50 border-forest/15 bg-card',
      )}
    >
      <span
        className={cn(
          'font-body text-[13px] font-normal',
          isSelected && !isSoldOut ? 'text-cream' : 'text-body'
        )}
      >
        {weekday}
      </span>
      <span
        className={cn(
          'font-body text-[15px] font-normal',
          isSelected && !isSoldOut ? 'text-cream' : 'text-forest'
        )}
      >
        {day}
      </span>
      <span
        className={cn(
          'font-body text-[13px] font-normal',
          isSelected && !isSoldOut ? 'text-cream' : 'text-body'
        )}
      >
        {month}
      </span>
      {isSoldOut && (
        <span className="font-body text-[13px] font-normal text-[#C0392B]">
          Utsolgt
        </span>
      )}
    </button>
  )
}
