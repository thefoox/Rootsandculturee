'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface DateSlot {
  date: string
  maxSeats: number
}

interface DateSlotsEditorProps {
  dates: DateSlot[]
  onChange: (dates: DateSlot[]) => void
}

export function DateSlotsEditor({ dates, onChange }: DateSlotsEditorProps) {
  const handleAdd = () => {
    onChange([...dates, { date: '', maxSeats: 10 }])
  }

  const handleRemove = (index: number) => {
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
      {dates.map((slot, index) => (
        <div key={index} className="flex items-end gap-3">
          <Input
            label="Dato"
            type="date"
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
              handleChange(index, 'maxSeats', parseInt(e.target.value) || 0)
            }
            id={`date-slot-seats-${index}`}
          />
          <button
            onClick={() => handleRemove(index)}
            className="mb-1 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md text-forest hover:text-destructive"
            aria-label={`Fjern dato ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      <Button variant="secondary" onClick={handleAdd} type="button">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Legg til dato
      </Button>
    </div>
  )
}
