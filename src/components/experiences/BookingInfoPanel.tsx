'use client'

import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import { SpotsRemaining } from './SpotsRemaining'
import { formatPrice, formatDate } from '@/lib/format'
import { toast } from 'sonner'
import type { Experience, ExperienceDate } from '@/types'

interface BookingInfoPanelProps {
  selectedDate: ExperienceDate
  experience: Experience
}

export function BookingInfoPanel({ selectedDate, experience }: BookingInfoPanelProps) {
  const { addItem } = useCart()

  const formattedDate = new Intl.DateTimeFormat('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDate.date)

  const normalPrice = selectedDate.priceOverride ?? experience.basePrice

  const isEarlybirdActive =
    selectedDate.earlyBirdPrice != null &&
    selectedDate.earlyBirdDeadline != null &&
    selectedDate.earlyBirdDeadline > new Date()

  const price = isEarlybirdActive ? selectedDate.earlyBirdPrice! : normalPrice
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
      variantId: null,
      variantLabel: null,
      experienceDateId: selectedDate.id,
      experienceDate: selectedDate.date.toISOString(),
      experienceName: experience.name,
      isEarlybird: isEarlybirdActive,
      originalPrice: isEarlybirdActive ? normalPrice : null,
    })
    toast.success(`${experience.name} lagt i handlekurven.`)
  }

  return (
    <div className="mt-6 rounded-lg border border-forest/12 bg-card p-4">
      <p className="font-body text-body font-medium text-forest capitalize">
        {formattedDate}
      </p>

      <div className="mt-3">
        <SpotsRemaining
          available={selectedDate.availableSeats}
          total={selectedDate.maxSeats}
        />
      </div>

      <div className="mt-2">
        {isEarlybirdActive ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="font-body text-body font-medium text-forest">
                {formatPrice(price)}
              </span>
              <span className="font-body text-body font-normal text-body/60 line-through">
                {formatPrice(normalPrice)}
              </span>
            </div>
            <span className="mt-1 inline-block rounded-full bg-rust/10 px-2 py-0.5 font-body text-label font-medium text-rust">
              Earlybird — gyldig til {formatDate(selectedDate.earlyBirdDeadline!)}
            </span>
          </>
        ) : (
          <p className="font-body text-body font-medium text-forest">
            {formatPrice(price)}
          </p>
        )}
      </div>

      {isFull ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#C0392B]/20 bg-[#FEE2E2] p-4"
        >
          <p className="font-body text-body font-normal text-[#C0392B]">
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
