'use client'

import { CheckSquare } from 'lucide-react'

interface BookingChecklistProps {
  items: string
}

export function BookingChecklist({ items }: BookingChecklistProps) {
  const checklistItems = items
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (checklistItems.length === 0) return null

  return (
    <div>
      <h3 className="mb-3 font-heading text-[20px] font-bold text-forest">
        Husk a ta med:
      </h3>
      <ul className="space-y-2">
        {checklistItems.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckSquare
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-ember"
              aria-hidden="true"
            />
            <span className="text-[15px] text-forest">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
