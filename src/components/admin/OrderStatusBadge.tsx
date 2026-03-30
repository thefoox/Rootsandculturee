import type { OrderStatus } from '@/types'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Venter', className: 'bg-[#FEF3C7] text-[#92400E]' },
  paid: { label: 'Bekreftet', className: 'bg-[#DCFCE7] text-[#166534]' },
  confirmed: { label: 'Bekreftet', className: 'bg-[#DCFCE7] text-[#166534]' },
  shipped: { label: 'Sendt', className: 'bg-[#FEF3C7] text-[#92400E]' },
  delivered: { label: 'Levert', className: 'border border-forest/20 bg-card text-forest' },
  cancelled: { label: 'Avbrutt', className: 'bg-[#FEE2E2] text-[#991B1B]' },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 font-body text-[13px] font-normal ${config.className}`}
    >
      {config.label}
    </span>
  )
}
