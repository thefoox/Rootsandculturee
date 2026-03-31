'use client'

import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import { SpotsRemaining } from './SpotsRemaining'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import type { Experience, ExperienceDate } from '@/types'

interface BookingInfoPanelProps {
  selectedDate: ExperienceDate
  experience: Experience
}

export function BookingInfoPanel({ selectedDate, experience }: BookingInfoPanelProps) {
  const { addItem } = useCart()

  const formattedDate = new Intl.DateTimeFormat('nb-NO', {
    dateStyle: 'long',
    weekday: 'long',
  }).format(selectedDate.date)

  const price = selectedDate.priceOverride ?? experience.basePrice
  const isFull = selectedDate.availableSeats <= 0

  function handleAddToCart() {
    addItem({
      id: experience.id,
      type: 'experience',
      name: experience.name,
      price,
      quantity: 1,
      image: experience.images[0] ?? null,
      slug: experience.slug,
      experienceDateId: selectedDate.id,
      experienceDate: selectedDate.date.toISOString(),
      experienceName: experience.name,
    })
    toast.success(`${experience.name} lagt i handlekurven.`)
  }

  return (
    <div className="mt-6 rounded-lg border border-forest/12 bg-card p-4">
      <p className="font-body text-[15px] font-medium text-forest capitalize">
        {formattedDate}
      </p>

      <div className="mt-3">
        <SpotsRemaining
          available={selectedDate.availableSeats}
          total={selectedDate.maxSeats}
        />
      </div>

      <p className="mt-2 font-body text-[15px] font-medium text-forest">
        {formatPrice(price)}
      </p>

      {isFull ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#C0392B]/20 bg-[#FEE2E2] p-4"
        >
          <p className="font-body text-[15px] font-normal text-[#C0392B]">
            Alle plasser er fylt. Velg en annen dato eller sjekk tilbake senere.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleAddToCart}
          >
            Legg booking i handlekurv
          </Button>
        </div>
      )}
    </div>
  )
}
