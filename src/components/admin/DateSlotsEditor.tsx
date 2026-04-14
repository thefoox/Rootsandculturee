'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface DateSlot {
  date: string
  maxSeats: number
  earlyBirdPrice: string
  earlyBirdDeadline: string
}

interface DateSlotsEditorProps {
  dates: DateSlot[]
  onChange: (dates: DateSlot[]) => void
}

export function DateSlotsEditor({ dates, onChange }: DateSlotsEditorProps) {
  const [expandedSlots, setExpandedSlots] = useState<Set<number>>(new Set())
  const today = new Date().toISOString().split('T')[0]

  const toggleExpanded = (index: number) => {
    setExpandedSlots((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleAdd = () => {
    onChange([
      ...dates,
      { date: '', maxSeats: 10, earlyBirdPrice: '', earlyBirdDeadline: '' },
    ])
  }

  const handleRemove = (index: number) => {
    setExpandedSlots((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
    onChange(dates.filter((_, i) => i !== index))
  }

  const handleChange = (
    index: number,
    field: keyof DateSlot,
    value: string | number
  ) => {
    const updated = dates.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    )
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {dates.map((slot, index) => {
        const isExpanded = expandedSlots.has(index)
        const hasEarlyBird = slot.earlyBirdPrice || slot.earlyBirdDeadline

        return (
          <div
            key={index}
            className="rounded-md border border-forest/10 p-3"
          >
            <div className="flex items-end gap-3">
              <Input
                label="Dato"
                type="date"
                min={today}
                value={slot.date}
                onChange={(e) => handleChange(index, 'date', e.target.value)}
                id={`date-slot-date-${index}`}
              />
              <Input
                label="Maks plasser"
                type="number"
                min={1}
                value={slot.maxSeats}
                onChange={(e) =>
                  handleChange(
                    index,
                    'maxSeats',
                    parseInt(e.target.value) || 0
                  )
                }
                id={`date-slot-seats-${index}`}
              />
              <button
                onClick={() => handleRemove(index)}
                className="mb-1 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md text-forest hover:text-destructive"
                aria-label={`Fjern dato ${index + 1}`}
              >
                <span aria-hidden="true">Slett</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleExpanded(index)}
              className="mt-2 flex items-center gap-1 text-label text-forest/70 hover:text-forest"
              aria-expanded={isExpanded}
              aria-controls={`date-slot-earlybird-${index}`}
            >
              {isExpanded ? (
                <span aria-hidden="true">▼</span>
              ) : (
                <span aria-hidden="true">▶</span>
              )}
              Earlybird-innstillinger
              {hasEarlyBird && !isExpanded && (
                <span className="ml-1 text-forest/50">(aktiv)</span>
              )}
            </button>

            {isExpanded && (
              <div
                id={`date-slot-earlybird-${index}`}
                className="mt-2 flex items-end gap-3"
              >
                <Input
                  label="Earlybird-pris (NOK)"
                  type="number"
                  min={0}
                  placeholder="F.eks. 990"
                  value={slot.earlyBirdPrice}
                  onChange={(e) =>
                    handleChange(index, 'earlyBirdPrice', e.target.value)
                  }
                  id={`date-slot-eb-price-${index}`}
                />
                <Input
                  label="Earlybird gyldig til"
                  type="date"
                  min={today}
                  max={slot.date || undefined}
                  value={slot.earlyBirdDeadline}
                  onChange={(e) =>
                    handleChange(index, 'earlyBirdDeadline', e.target.value)
                  }
                  id={`date-slot-eb-deadline-${index}`}
                />
              </div>
            )}
          </div>
        )
      })}
      <Button variant="secondary" onClick={handleAdd} type="button">
        <span aria-hidden="true">+</span>
        Legg til dato
      </Button>
    </div>
  )
}
