import type { OrderStatus } from '@/types'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Venter', className: 'bg-badge-warning-bg text-badge-warning' },
  paid: { label: 'Bekreftet', className: 'bg-badge-easy-bg text-badge-easy' },
  confirmed: { label: 'Bekreftet', className: 'bg-badge-easy-bg text-badge-easy' },
  shipped: { label: 'Sendt', className: 'bg-badge-warning-bg text-badge-warning' },
  delivered: { label: 'Levert', className: 'border border-forest/20 bg-card text-forest' },
  cancelled: { label: 'Avbrutt', className: 'bg-badge-error-bg text-badge-error' },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 font-body text-label font-normal ${config.className}`}
    >
      {config.label}
    </span>
  )
}
