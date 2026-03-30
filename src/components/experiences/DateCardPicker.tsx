'use client'

import { useState, useEffect, useId } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { DateCard } from './DateCard'
import { BookingInfoPanel } from './BookingInfoPanel'
import type { Experience, ExperienceDate } from '@/types'

interface DateCardPickerProps {
  experienceId: string
  dates: ExperienceDate[]
  experience: Experience
}

export function DateCardPicker({ experienceId, dates, experience }: DateCardPickerProps) {
  const headingId = useId()
  const [selectedDate, setSelectedDate] = useState<ExperienceDate | null>(null)
  const [liveDates, setLiveDates] = useState<ExperienceDate[]>(dates)

  // Keep liveDates in sync when prop changes (e.g. revalidation)
  useEffect(() => {
    setLiveDates(dates)
  }, [dates])

  // Real-time listener for the selected date's availability
  useEffect(() => {
    if (!selectedDate) return

    const dateRef = doc(db, 'experiences', experienceId, 'dates', selectedDate.id)
    const unsubscribe = onSnapshot(dateRef, (snapshot) => {
      if (!snapshot.exists()) return
      const data = snapshot.data()

      const updatedDate: ExperienceDate = {
        id: snapshot.id,
        date: data.date?.toDate() ?? selectedDate.date,
        maxSeats: data.maxSeats ?? selectedDate.maxSeats,
        bookedSeats: data.bookedSeats ?? selectedDate.bookedSeats,
        availableSeats: data.availableSeats ?? selectedDate.availableSeats,
        isActive: data.isActive ?? selectedDate.isActive,
        priceOverride: data.priceOverride ?? null,
      }

      // Update selected date with live data
      setSelectedDate(updatedDate)

      // Also update the date in the list
      setLiveDates((prev) =>
        prev.map((d) => (d.id === updatedDate.id ? updatedDate : d))
      )
    })

    return () => unsubscribe()
  }, [selectedDate?.id, experienceId])

  // Filter to future dates only (server already filters, but safety check for client)
  const futureDates = liveDates.filter((d) => {
    const dateObj = d.date instanceof Date ? d.date : new Date(d.date)
    return dateObj > new Date()
  })

  if (futureDates.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="font-heading text-[20px] font-bold text-forest">
          Velg dato
        </h2>
        <p className="mt-4 font-body text-[15px] text-bark">
          Ingen tilgjengelige datoer for oyeblikket.
        </p>
      </section>
    )
  }

  function handleSelect(date: ExperienceDate) {
    const isSoldOut = date.availableSeats <= 0 || !date.isActive
    if (isSoldOut) return
    setSelectedDate(date)
  }

  return (
    <section className="mt-8">
      <h2
        id={headingId}
        className="font-heading text-[20px] font-bold text-forest"
      >
        Velg dato
      </h2>

      <div
        role="group"
        aria-labelledby={headingId}
        className="mt-4 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-x-visible md:pb-0"
      >
        {futureDates.map((date) => (
          <DateCard
            key={date.id}
            experienceDate={date}
            isSelected={selectedDate?.id === date.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selectedDate && (
        <BookingInfoPanel
          selectedDate={selectedDate}
          experience={experience}
        />
      )}
    </section>
  )
}
