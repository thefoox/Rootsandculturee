import Link from 'next/link'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import type { Order } from '@/types'

interface OrderCardProps {
  order: Order
}

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const priceFormatter = new Intl.NumberFormat('nb-NO', {
  style: 'currency',
  currency: 'NOK',
})

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Link
      href={`/konto/ordrer/${order.id}`}
      className="block border border-forest/12 rounded-lg p-4 hover:bg-cream/50 transition-colors duration-100"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-body text-body text-forest font-medium">
            {dateFormatter.format(order.createdAt)}
          </p>
          <p className="font-body text-label text-body mt-0.5">
            {itemCount} {itemCount === 1 ? 'vare' : 'varer'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-body text-body text-forest font-medium">
            {priceFormatter.format(order.total / 100)}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>
    </Link>
  )
}
