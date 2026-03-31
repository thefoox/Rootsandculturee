import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { getBookingsByUser } from '@/lib/data/bookings'
import { BookingCard } from '@/components/konto/BookingCard'
import { EmptyState } from '@/components/konto/EmptyState'

export default async function BookingerPage() {
  const session = await verifySession()
  if (!session) {
    redirect('/')
  }

  const bookings = await getBookingsByUser(session.uid)

  const now = new Date()
  const upcoming = bookings.filter(
    (b) => b.date >= now && b.status !== 'cancelled'
  )
  const past = bookings.filter(
    (b) => b.date < now || b.status === 'cancelled'
  )

  return (
    <div>
      {/* Upcoming bookings */}
      <section className="mb-10">
        <h2 className="font-heading text-[20px] font-bold text-forest mb-6">
          Kommende bookinger
        </h2>
        {upcoming.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                showWhatToBring
              />
            ))}
          </div>
        ) : (
          <EmptyState message="Du har ingen kommende bookinger." />
        )}
      </section>

      {/* Past bookings */}
      <section>
        <h2 className="font-heading text-[20px] font-bold text-forest mb-6">
          Tidligere bookinger
        </h2>
        {past.length > 0 ? (
          <div className="flex flex-col gap-3">
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState message="Du har ingen tidligere bookinger." />
        )}
      </section>
    </div>
  )
}
