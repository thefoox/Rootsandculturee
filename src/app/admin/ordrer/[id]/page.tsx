'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Mail, Pencil, Check, X, RotateCcw } from 'lucide-react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { Button } from '@/components/ui/Button'
import { SendEmailModal } from '@/components/admin/SendEmailModal'
import { RefundDialog } from '@/components/admin/RefundDialog'
import {
  getOrderById,
  updateOrderStatus,
  updateOrderShipping,
  addOrderNote,
  getOrderNotes,
} from '@/actions/orders'
import { getRefundsForOrder } from '@/actions/refunds'
import { formatPrice, formatDateMedium } from '@/lib/format'
import { toast } from 'sonner'
import type { Order, OrderStatus, OrderRefund, OrderNote, ShippingAddress } from '@/types'

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

  // Refund state
  const [showRefund, setShowRefund] = useState(false)
  const [refunds, setRefunds] = useState<OrderRefund[]>([])
  const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0)

  // Email state
  const [showEmail, setShowEmail] = useState(false)

  // Shipping edit state
  const [editingShipping, setEditingShipping] = useState(false)
  const [shippingForm, setShippingForm] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    postalCode: '',
    city: '',
  })
  const [isSavingShipping, setIsSavingShipping] = useState(false)

  // Notes state
  const [notes, setNotes] = useState<OrderNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  useEffect(() => {
    if (params.id) {
      getOrderById(params.id).then((o) => {
        setOrder(o)
        if (o) {
          setSelectedStatus(o.status)
          if (o.shipping) {
            setShippingForm(o.shipping)
          }
          // Fetch refunds
          if (o.stripePaymentIntentId) {
            getRefundsForOrder(o.stripePaymentIntentId).then(setRefunds)
          }
        }
      })
      getOrderNotes(params.id).then(setNotes)
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

  async function handleSaveShipping() {
    if (!order) return
    setIsSavingShipping(true)
    const result = await updateOrderShipping(order.id, shippingForm)
    setIsSavingShipping(false)

    if (result.success) {
      setOrder({ ...order, shipping: shippingForm })
      setEditingShipping(false)
      toast.success('Leveringsadresse oppdatert.')
    } else {
      toast.error(result.error || 'Kunne ikke oppdatere adresse.')
    }
  }

  async function handleAddNote() {
    if (!order || !newNote.trim()) return
    setIsAddingNote(true)
    const result = await addOrderNote(order.id, newNote.trim())
    setIsAddingNote(false)

    if (result.success) {
      setNewNote('')
      // Refresh notes
      getOrderNotes(order.id).then(setNotes)
      toast.success('Notat lagt til.')
    } else {
      toast.error(result.error || 'Kunne ikke legge til notat.')
    }
  }

  function handleRefunded() {
    // Refresh refunds and order
    if (order?.stripePaymentIntentId) {
      getRefundsForOrder(order.stripePaymentIntentId).then(setRefunds)
    }
    if (order?.id) {
      getOrderById(order.id).then((o) => {
        if (o) {
          setOrder(o)
          setSelectedStatus(o.status)
        }
      })
    }
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
        <p className="font-body text-body">Laster ordre...</p>
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

      <div className="mb-8 flex items-start justify-between">
        <h1 className="font-heading text-h2 font-bold text-forest">
          Ordre {shortId}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowEmail(true)}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Send e-post
          </Button>
        </div>
      </div>

      {/* Bestillingsoversikt */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-h4 font-bold text-forest">
          Bestillingsoversikt
        </h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between font-body text-body"
            >
              <span className="text-forest">
                {item.name} x {item.quantity}
              </span>
              <span className="text-forest">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-forest/12 pt-4">
          <div className="flex justify-between font-body text-body">
            <span className="text-body">Subtotal</span>
            <span className="text-forest">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between font-body text-body">
            <span className="text-body">Frakt</span>
            <span className="text-forest">
              {formatPrice(order.shippingCost)}
            </span>
          </div>
          <div className="mt-2 flex justify-between font-body text-body font-medium">
            <span className="text-forest">Totalt</span>
            <span className="text-forest">{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      {/* Kundeinfo med redigerbar leveringsadresse */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-h4 font-bold text-forest">
            Kundeinfo
          </h2>
          {order.shipping && !editingShipping && (
            <Button
              variant="ghost"
              className="h-9 w-9 p-0"
              onClick={() => setEditingShipping(true)}
              aria-label="Rediger leveringsadresse"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        <div className="mt-4 space-y-2 font-body text-body text-forest">
          <p>
            <span className="text-body">E-post: </span>
            {order.customerEmail}
          </p>

          {editingShipping ? (
            <div className="mt-3 space-y-3 rounded-md border border-forest/12 bg-cream p-4">
              <div>
                <label
                  htmlFor="ship-name"
                  className="block text-label font-medium text-forest"
                >
                  Navn
                </label>
                <input
                  id="ship-name"
                  type="text"
                  value={shippingForm.fullName}
                  onChange={(e) =>
                    setShippingForm({ ...shippingForm, fullName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 text-body text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>
              <div>
                <label
                  htmlFor="ship-address"
                  className="block text-label font-medium text-forest"
                >
                  Adresse
                </label>
                <input
                  id="ship-address"
                  type="text"
                  value={shippingForm.address}
                  onChange={(e) =>
                    setShippingForm({ ...shippingForm, address: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 text-body text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ship-postal"
                    className="block text-label font-medium text-forest"
                  >
                    Postnummer
                  </label>
                  <input
                    id="ship-postal"
                    type="text"
                    value={shippingForm.postalCode}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        postalCode: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 text-body text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ship-city"
                    className="block text-label font-medium text-forest"
                  >
                    Sted
                  </label>
                  <input
                    id="ship-city"
                    type="text"
                    value={shippingForm.city}
                    onChange={(e) =>
                      setShippingForm({ ...shippingForm, city: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 text-body text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSaveShipping}
                  loading={isSavingShipping}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Lagre
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingShipping(false)
                    if (order.shipping) setShippingForm(order.shipping)
                  }}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Avbryt
                </Button>
              </div>
            </div>
          ) : (
            order.shipping && (
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
            )
          )}
        </div>
      </section>

      {/* Betaling & Refusjon */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-h4 font-bold text-forest">
          Betaling
        </h2>
        <div className="mt-4 space-y-2 font-body text-body">
          <p>
            <span className="text-body">Totalt betalt: </span>
            <span className="text-forest">{formatPrice(order.total)}</span>
          </p>
          {totalRefunded > 0 && (
            <p>
              <span className="text-body">Refundert: </span>
              <span className="text-[#C0392B]">
                {formatPrice(totalRefunded)}
              </span>
            </p>
          )}
          {order.stripePaymentIntentId && (
            <p>
              <span className="text-body">Stripe Payment Intent: </span>
              <span className="font-body text-label text-body">
                {order.stripePaymentIntentId}
              </span>
            </p>
          )}
          {order.paidAt && (
            <p>
              <span className="text-body">Betalt: </span>
              <span className="text-forest">
                {formatDateMedium(
                  order.paidAt instanceof Date
                    ? order.paidAt
                    : new Date(order.paidAt)
                )}
              </span>
            </p>
          )}
        </div>

        {/* Refund button */}
        {order.stripePaymentIntentId && totalRefunded < order.total && (
          <div className="mt-4">
            <Button
              variant="secondary"
              className="border-[#C0392B] text-[#C0392B] hover:bg-[#C0392B]/5"
              onClick={() => setShowRefund(true)}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Refunder
            </Button>
          </div>
        )}

        {/* Refund history */}
        {refunds.length > 0 && (
          <div className="mt-4 border-t border-forest/12 pt-4">
            <h3 className="font-body text-label font-medium uppercase tracking-wider text-body">
              Refusjonshistorikk
            </h3>
            <ul className="mt-2 space-y-2">
              {refunds.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between font-body text-label"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#C0392B]">
                      -{formatPrice(r.amount)}
                    </span>
                    <span className="text-body">
                      {r.reason === 'requested_by_customer'
                        ? 'Kundens onske'
                        : r.reason === 'duplicate'
                          ? 'Duplikat'
                          : r.reason === 'fraudulent'
                            ? 'Svindel'
                            : r.reason || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-label ${
                        r.status === 'succeeded'
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}
                    >
                      {r.status === 'succeeded' ? 'Fullfort' : r.status}
                    </span>
                    <span className="text-body">
                      {formatDateMedium(r.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Status */}
      <section className="mb-8 rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-h4 font-bold text-forest">
          Status
        </h2>
        <div className="mt-4 flex items-center gap-3">
          <span className="font-body text-label text-body">Gjeldende:</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="mt-4">
          <label
            htmlFor="order-status"
            className="block font-body text-body font-medium text-forest"
          >
            Ordrestatus
          </label>
          <select
            id="order-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            className="mt-1 block w-full rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-body text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
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

      {/* Notater */}
      <section className="rounded-lg border border-forest/12 bg-card p-6">
        <h2 className="font-heading text-h4 font-bold text-forest">
          Interne notater
        </h2>

        <div className="mt-4">
          <label htmlFor="new-note" className="sr-only">
            Nytt notat
          </label>
          <textarea
            id="new-note"
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Skriv et internt notat..."
            className="block w-full resize-y rounded-md border border-forest/20 bg-cream px-3 py-2 font-body text-body text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
          />
          <div className="mt-2">
            <Button
              variant="primary"
              onClick={handleAddNote}
              loading={isAddingNote}
              disabled={!newNote.trim()}
            >
              Legg til notat
            </Button>
          </div>
        </div>

        {notes.length > 0 && (
          <ul className="mt-4 space-y-3 border-t border-forest/12 pt-4">
            {notes.map((note) => (
              <li key={note.id} className="rounded-md bg-cream p-3">
                <p className="font-body text-body text-forest whitespace-pre-wrap">
                  {note.text}
                </p>
                <p className="mt-1 font-body text-label text-body">
                  {note.createdBy} —{' '}
                  {formatDateMedium(
                    note.createdAt instanceof Date
                      ? note.createdAt
                      : new Date(note.createdAt)
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modals */}
      <SendEmailModal
        isOpen={showEmail}
        onClose={() => setShowEmail(false)}
        recipientEmail={order.customerEmail}
      />

      <RefundDialog
        isOpen={showRefund}
        onClose={() => setShowRefund(false)}
        onRefunded={handleRefunded}
        orderId={order.id}
        orderTotal={order.total}
        alreadyRefunded={totalRefunded}
      />
    </div>
  )
}
