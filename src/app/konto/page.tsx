import Link from 'next/link'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { getOrdersByUser } from '@/lib/data/orders'
import { getBookingsByUser } from '@/lib/data/bookings'
import { getUserProfile } from '@/lib/data/users'
import { OrderCard } from '@/components/konto/OrderCard'
import { BookingCard } from '@/components/konto/BookingCard'
import { EmptyState } from '@/components/konto/EmptyState'

export default async function KontoPage() {
  const session = await verifySession()
  if (!session) {
    redirect('/')
  }

  const [orders, bookings, profile] = await Promise.all([
    getOrdersByUser(session.uid),
    getBookingsByUser(session.uid),
    getUserProfile(session.uid),
  ])

  const recentOrders = orders.slice(0, 3)
  const recentBookings = bookings.slice(0, 3)
  const displayName = profile?.displayName

  return (
    <div>
      <p className="font-body text-lg text-forest mb-8">
        {displayName ? `Hei, ${displayName}!` : 'Hei!'}
      </p>

      {/* Recent orders */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-h4 font-bold text-forest">
            Siste ordrer
          </h2>
          {orders.length > 0 && (
            <Link
              href="/konto/ordrer"
              className="font-body text-label text-forest hover:underline"
            >
              Se alle ordrer
            </Link>
          )}
        </div>
        {recentOrders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState message="Du har ingen ordrer enna." />
        )}
      </section>

      {/* Recent bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-h4 font-bold text-forest">
            Siste bookinger
          </h2>
          {bookings.length > 0 && (
            <Link
              href="/konto/bookinger"
              className="font-body text-label text-forest hover:underline"
            >
              Se alle bookinger
            </Link>
          )}
        </div>
        {recentBookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState message="Du har ingen bookinger enna." />
        )}
      </section>
    </div>
  )
}
