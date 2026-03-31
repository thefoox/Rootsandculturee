import { BookingStatusBadge } from '@/components/admin/BookingStatusBadge'
import type { Booking } from '@/types'
import { Info } from 'lucide-react'

interface BookingCardProps {
  booking: Booking
  showWhatToBring?: boolean
}

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function BookingCard({ booking, showWhatToBring = false }: BookingCardProps) {
  return (
    <div className="border border-forest/12 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-body text-[15px] text-forest font-medium">
            {booking.experienceName}
          </p>
          <p className="font-body text-[13px] text-body mt-0.5">
            {dateFormatter.format(booking.date)}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-body text-[13px] text-body">
              {booking.seats} {booking.seats === 1 ? 'plass' : 'plasser'}
            </span>
            <span className="font-body text-[13px] text-body">
              Kode: {booking.confirmationCode}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>
      {showWhatToBring && booking.whatToBring && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-card px-3 py-2">
          <Info className="h-4 w-4 text-forest mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-body text-[13px] text-forest font-medium">
              Hva du ma ta med
            </p>
            <p className="font-body text-[13px] text-body mt-0.5">
              {booking.whatToBring}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
