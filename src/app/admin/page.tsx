import Link from 'next/link'
import {
  Package,
  Mountain,
  FileText,
  Layout,
  ShoppingCart,
  CalendarCheck,
  Users,
  TrendingUp,
} from 'lucide-react'
import { getAllProducts } from '@/actions/products'
import { getAllExperiences } from '@/actions/experiences'
import { getAllArticles } from '@/actions/articles'
import { getOrderStats, getOrders } from '@/actions/orders'
import { getBookingsFiltered } from '@/actions/bookings'
import { formatPrice, formatDateMedium } from '@/lib/format'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { BookingStatusBadge } from '@/components/admin/BookingStatusBadge'

export default async function AdminDashboard() {
  const [products, experiences, articles, stats, recentOrders, recentBookings] =
    await Promise.all([
      getAllProducts(),
      getAllExperiences(),
      getAllArticles(),
      getOrderStats(),
      getOrders(),
      getBookingsFiltered(),
    ])

  const last5Orders = recentOrders.slice(0, 5)
  const last5Bookings = recentBookings.slice(0, 5)

  const overviewStats = [
    {
      label: 'Omsetning',
      value: formatPrice(stats.totalRevenue),
      href: '/admin/ordrer',
      icon: TrendingUp,
    },
    {
      label: 'Ordrer',
      value: String(stats.orderCount),
      href: '/admin/ordrer',
      icon: ShoppingCart,
    },
    {
      label: 'Bookinger',
      value: String(stats.bookingCount),
      href: '/admin/bookinger',
      icon: CalendarCheck,
    },
    {
      label: 'Kunder',
      value: String(stats.customerCount),
      href: '/admin/kunder',
      icon: Users,
    },
  ]

  const contentStats = [
    {
      label: 'Produkter',
      count: products.length,
      href: '/admin/produkter',
      icon: Package,
    },
    {
      label: 'Opplevelser',
      count: experiences.length,
      href: '/admin/opplevelser',
      icon: Mountain,
    },
    {
      label: 'Artikler',
      count: articles.length,
      href: '/admin/artikler',
      icon: FileText,
    },
    {
      label: 'Sideinnhold',
      count: null,
      href: '/admin/innhold',
      icon: Layout,
    },
  ]

  return (
    <div className="mx-auto max-w-[900px]">
      <h1 className="mb-8 font-heading text-h2 font-bold text-forest">
        Admin Dashboard
      </h1>

      {/* Oversikt */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.href + stat.label}
              href={stat.href}
              className="flex flex-col gap-2 rounded-lg border border-forest/12 bg-card p-5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-rust" aria-hidden="true" />
                <span className="font-body text-label text-body">
                  {stat.label}
                </span>
              </div>
              <span className="font-heading text-h4 font-bold text-forest">
                {stat.value}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Siste ordrer og bookinger */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Siste ordrer */}
        <section className="rounded-lg border border-forest/12 bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-h4 font-bold text-forest">
              Siste ordrer
            </h2>
            <Link
              href="/admin/ordrer"
              className="font-body text-label text-rust hover:underline"
            >
              Se alle
            </Link>
          </div>
          {last5Orders.length === 0 ? (
            <p className="mt-4 font-body text-body">
              Ingen ordrer enda.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {last5Orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/ordrer/${order.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-cream"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-body text-label text-body">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="font-body text-label text-forest">
                        {order.customerEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-body text-body font-medium text-rust">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Siste bookinger */}
        <section className="rounded-lg border border-forest/12 bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-h4 font-bold text-forest">
              Siste bookinger
            </h2>
            <Link
              href="/admin/bookinger"
              className="font-body text-label text-rust hover:underline"
            >
              Se alle
            </Link>
          </div>
          {last5Bookings.length === 0 ? (
            <p className="mt-4 font-body text-body">
              Ingen bookinger enda.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {last5Bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between rounded-md px-2 py-2"
                >
                  <div>
                    <span className="font-body text-body text-forest">
                      {booking.experienceName}
                    </span>
                    <span className="ml-2 font-body text-label text-body">
                      {formatDateMedium(
                        booking.date instanceof Date
                          ? booking.date
                          : new Date(booking.date)
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookingStatusBadge status={booking.status} />
                    <span className="font-body text-label text-body">
                      {booking.customerEmail}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Innhold */}
      <h2 className="mb-4 mt-8 font-heading text-h4 font-bold text-forest">
        Innhold
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {contentStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.href}
              href={stat.href}
              className="flex items-center gap-4 rounded-lg border border-forest/12 bg-card p-5 hover:shadow-md"
            >
              <Icon className="h-7 w-7 text-rust" aria-hidden="true" />
              <div>
                <p className="text-label text-body">{stat.label}</p>
                {stat.count !== null && (
                  <p className="font-heading text-h4 font-bold text-forest">
                    {stat.count}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
