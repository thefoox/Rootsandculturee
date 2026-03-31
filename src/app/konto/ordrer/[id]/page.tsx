import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { getOrderById } from '@/lib/data/orders'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { ArrowLeft } from 'lucide-react'

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const priceFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
})

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) {
    redirect('/')
  }

  const { id } = await params
  const order = await getOrderById(id)

  // Security check: verify order belongs to this user
  if (!order || order.customerId !== session.uid) {
    notFound()
  }

  return (
    <div>
      <Link
        href="/konto/ordrer"
        className="inline-flex items-center gap-1 font-body text-[13px] text-body hover:text-forest mb-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Tilbake til ordrer
      </Link>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-[20px] font-bold text-forest">
            Ordredetaljer
          </h2>
          <p className="font-body text-[13px] text-body mt-1">
            {dateFormatter.format(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Order items */}
      <section className="mb-8">
        <h3 className="font-body text-[15px] font-medium text-forest mb-3">
          Varer
        </h3>
        <div className="border border-forest/12 rounded-lg divide-y divide-forest/12">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="font-body text-[15px] text-forest">
                  {item.name}
                </p>
                <p className="font-body text-[13px] text-body mt-0.5">
                  Antall: {item.quantity}
                </p>
              </div>
              <span className="font-body text-[15px] text-forest shrink-0">
                {priceFormatter.format((item.price * item.quantity) / 100)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping address */}
      {order.shipping && (
        <section className="mb-8">
          <h3 className="font-body text-[15px] font-medium text-forest mb-3">
            Leveringsadresse
          </h3>
          <div className="border border-forest/12 rounded-lg p-4">
            <p className="font-body text-[15px] text-forest">
              {order.shipping.fullName}
            </p>
            <p className="font-body text-[13px] text-body mt-0.5">
              {order.shipping.address}
            </p>
            <p className="font-body text-[13px] text-body">
              {order.shipping.postalCode} {order.shipping.city}
            </p>
          </div>
        </section>
      )}

      {/* Price summary */}
      <section>
        <h3 className="font-body text-[15px] font-medium text-forest mb-3">
          Prissammendrag
        </h3>
        <div className="border border-forest/12 rounded-lg p-4">
          <div className="flex justify-between py-1">
            <span className="font-body text-[13px] text-body">Delsum</span>
            <span className="font-body text-[13px] text-forest">
              {priceFormatter.format(order.subtotal / 100)}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-body text-[13px] text-body">Frakt</span>
            <span className="font-body text-[13px] text-forest">
              {priceFormatter.format(order.shippingCost / 100)}
            </span>
          </div>
          <div className="flex justify-between py-1 border-t border-forest/12 mt-2 pt-2">
            <span className="font-body text-[15px] text-forest font-medium">
              Totalt
            </span>
            <span className="font-body text-[15px] text-forest font-medium">
              {priceFormatter.format(order.total / 100)}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
