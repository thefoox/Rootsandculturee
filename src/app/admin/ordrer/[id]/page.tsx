'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { Button } from '@/components/ui/Button'
import { getOrderById, updateOrderStatus } from '@/actions/orders'
import { formatPrice, formatDateMedium } from '@/lib/format'
import { toast } from 'sonner'
import type { Order, OrderStatus } from '@/types'

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'paid', label: 'Bekreftet' },
  { value: 'shipped', label: 'Sendt' },
  { value: 'delivered', label: 'Levert' },
  { value: 'cancelled', label: 'Avbrutt' },
]

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('paid')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      getOrderById(params.id).then((o) => {
        setOrder(o)
        if (o) setSelectedStatus(o.status)
      })
    }
  }, [params.id])

  async function handleUpdateStatus() {
    if (!order) return
    setIsUpdating(true)
    try {
      await updateOrderStatus(order.id, selectedStatus)
      setOrder({ ...order, status: selectedStatus })
      toast.success('Ordrestatus oppdatert.')
    } catch {
      toast.error('Kunne ikke oppdatere status. Prov igjen.')
    }
    setIsUpdating(false)
  }

  if (!order) {
    return (
      <div>
        <AdminBreadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Ordrer', href: '/admin/ordrer' },
            { label: 'Laster...' },
          ]}
        />
        <p className="font-body text-[15px] text-body">Laster ordre...</p>
      </div>
    )
  }

  const shortId = order.id.slice(0, 8)

  return (
    <div className="mx-auto max-w-[720px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Ordrer', href: '/admin/ordrer' },
          { label: `Ordre ${shortId}` },
        ]}
      />

      <h1 className="mb-8 font-heading text-[28px] font-bold text-forest">
        Ordre {shortId}
      </h1>

      {/* Bestillingsoversikt */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-[20px] font-bold text-forest">
          Bestillingsoversikt
        </h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between font-body text-[15px]"
            >
              <span className="text-forest">
                {item.name} x {item.quantity}
              </span>
              <span className="text-rust">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-forest/12 pt-4">
          <div className="flex justify-between font-body text-[15px]">
            <span className="text-body">Subtotal</span>
            <span className="text-forest">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between font-body text-[15px]">
            <span className="text-body">Frakt</span>
            <span className="text-forest">{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="mt-2 flex justify-between font-body text-[15px] font-medium">
            <span className="text-forest">Totalt</span>
            <span className="text-rust">{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      {/* Kundeinfo */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-[20px] font-bold text-forest">
          Kundeinfo
        </h2>
        <div className="mt-4 space-y-2 font-body text-[15px] text-forest">
          <p>
            <span className="text-body">E-post: </span>
            {order.customerEmail}
          </p>
          {order.shipping && (
            <>
              <p>
                <span className="text-body">Navn: </span>
                {order.shipping.fullName}
              </p>
              <p>
                <span className="text-body">Adresse: </span>
                {order.shipping.address}
              </p>
              <p>
                <span className="text-body">Postnummer: </span>
                {order.shipping.postalCode} {order.shipping.city}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Betaling */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-[20px] font-bold text-forest">
          Betaling
        </h2>
        <div className="mt-4 space-y-2 font-body text-[15px]">
          <p>
            <span className="text-body">Totalt betalt: </span>
            <span className="text-rust">{formatPrice(order.total)}</span>
          </p>
          {order.stripePaymentIntentId && (
            <p>
              <span className="text-body">Stripe Payment Intent: </span>
              <span className="font-body text-[13px] text-body">
                {order.stripePaymentIntentId}
              </span>
            </p>
          )}
          {order.paidAt && (
            <p>
              <span className="text-body">Betalt: </span>
              <span className="text-forest">
                {formatDateMedium(order.paidAt instanceof Date ? order.paidAt : new Date(order.paidAt))}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Status */}
      <section className="rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-[20px] font-bold text-forest">
          Status
        </h2>
        <div className="mt-4 flex items-center gap-3">
          <span className="font-body text-[13px] text-body">Gjeldende:</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="mt-4">
          <label
            htmlFor="order-status"
            className="block font-body text-[15px] font-medium text-forest"
          >
            Ordrestatus
          </label>
          <select
            id="order-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-[15px] text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <Button
            variant="primary"
            onClick={handleUpdateStatus}
            loading={isUpdating}
          >
            Oppdater status
          </Button>
        </div>
      </section>
    </div>
  )
}
