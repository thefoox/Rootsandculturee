'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { BookingStatusBadge } from '@/components/admin/BookingStatusBadge'
import { SendEmailModal } from '@/components/admin/SendEmailModal'
import { getCustomerDetail } from '@/actions/customers'
import { formatPrice, formatDateMedium } from '@/lib/format'
import type { CustomerSummary, Order, Booking } from '@/types'

export default function CustomerDetailPage() {
  const params = useParams<{ uid: string }>()
  const [customer, setCustomer] = useState<CustomerSummary | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => {
    if (params.uid) {
      getCustomerDetail(params.uid).then((result) => {
        if (result) {
          setCustomer(result.customer)
          setOrders(result.orders)
          setBookings(result.bookings)
        }
      })
    }
  }, [params.uid])

  if (!customer) {
    return (
      <div>
        <AdminBreadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Kunder', href: '/admin/kunder' },
            { label: 'Laster...' },
          ]}
        />
        <p className="font-body text-[15px] text-body">Laster kunde...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Kunder', href: '/admin/kunder' },
          { label: customer.displayName || customer.email },
        ]}
      />

      <div className="mb-8 flex items-start justify-between">
        <h1 className="font-heading text-[28px] font-bold text-forest">
          {customer.displayName || customer.email}
        </h1>
        <Button variant="secondary" onClick={() => setShowEmail(true)}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          Send e-post
        </Button>
      </div>

      {/* Kundeinformasjon */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-[20px] font-bold text-forest">
          Kundeinformasjon
        </h2>
        <div className="mt-4 space-y-2 font-body text-[15px]">
          <p>
            <span className="text-body">E-post: </span>
            <span className="text-forest">{customer.email}</span>
          </p>
          {customer.displayName && (
            <p>
              <span className="text-body">Navn: </span>
              <span className="text-forest">{customer.displayName}</span>
            </p>
          )}
          <p>
            <span className="text-body">Registrert: </span>
            <span className="text-forest">
              {formatDateMedium(customer.createdAt)}
            </span>
          </p>
        </div>

        {/* Sammendrag */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-forest/12 pt-4">
          <div>
            <p className="font-body text-[13px] text-body">Ordrer</p>
            <p className="font-heading text-[20px] font-bold text-forest">
              {customer.orderCount}
            </p>
          </div>
          <div>
            <p className="font-body text-[13px] text-body">Bookinger</p>
            <p className="font-heading text-[20px] font-bold text-forest">
              {customer.bookingCount}
            </p>
          </div>
          <div>
            <p className="font-body text-[13px] text-body">Total brukt</p>
            <p className="font-heading text-[20px] font-bold text-rust">
              {formatPrice(customer.totalSpent)}
            </p>
          </div>
        </div>
      </section>

      {/* Ordrehistorikk */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-[20px] font-bold text-forest">
          Ordrehistorikk
        </h2>
        {orders.length === 0 ? (
          <p className="mt-4 font-body text-[15px] text-body">
            Ingen ordrer.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">Ordrer for kunde</caption>
              <thead>
                <tr className="h-[44px] border-b border-forest/12">
                  <th className="px-3 text-left text-[13px] font-normal uppercase tracking-wide text-forest">
                    Ordrenr.
                  </th>
                  <th className="px-3 text-left text-[13px] font-normal uppercase tracking-wide text-forest">
                    Dato
                  </th>
                  <th className="px-3 text-right text-[13px] font-normal uppercase tracking-wide text-forest">
                    Total
                  </th>
                  <th className="px-3 text-left text-[13px] font-normal uppercase tracking-wide text-forest">
                    Status
                  </th>
                  <th className="w-[60px] px-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-forest/8 hover:bg-cream"
                  >
                    <td className="px-3 py-2 font-body text-[13px] text-body">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 font-body text-[13px] text-body">
                      {formatDateMedium(
                        order.createdAt instanceof Date
                          ? order.createdAt
                          : new Date(order.createdAt)
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-body text-[15px] text-rust">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-3 py-2">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/ordrer/${order.id}`}>
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          aria-label={`Se ordre ${order.id.slice(0, 8)}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Bookinghistorikk */}
      <section className="rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-[20px] font-bold text-forest">
          Bookinghistorikk
        </h2>
        {bookings.length === 0 ? (
          <p className="mt-4 font-body text-[15px] text-body">
            Ingen bookinger.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">Bookinger for kunde</caption>
              <thead>
                <tr className="h-[44px] border-b border-forest/12">
                  <th className="px-3 text-left text-[13px] font-normal uppercase tracking-wide text-forest">
                    Kode
                  </th>
                  <th className="px-3 text-left text-[13px] font-normal uppercase tracking-wide text-forest">
                    Opplevelse
                  </th>
                  <th className="px-3 text-left text-[13px] font-normal uppercase tracking-wide text-forest">
                    Dato
                  </th>
                  <th className="px-3 text-right text-[13px] font-normal uppercase tracking-wide text-forest">
                    Total
                  </th>
                  <th className="px-3 text-left text-[13px] font-normal uppercase tracking-wide text-forest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-forest/8 hover:bg-cream"
                  >
                    <td className="px-3 py-2 font-body text-[13px] tracking-[0.04em] text-body">
                      {booking.confirmationCode}
                    </td>
                    <td className="px-3 py-2 font-body text-[15px] text-forest">
                      {booking.experienceName}
                    </td>
                    <td className="px-3 py-2 font-body text-[13px] text-body">
                      {formatDateMedium(
                        booking.date instanceof Date
                          ? booking.date
                          : new Date(booking.date)
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-body text-[15px] text-rust">
                      {formatPrice(booking.total)}
                    </td>
                    <td className="px-3 py-2">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <SendEmailModal
        isOpen={showEmail}
        onClose={() => setShowEmail(false)}
        recipientEmail={customer.email}
      />
    </div>
  )
}
