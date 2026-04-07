import type { BookingStatus } from '@/types'

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'Venter', className: 'bg-badge-warning-bg text-badge-warning' },
  confirmed: { label: 'Bekreftet', className: 'bg-badge-easy-bg text-badge-easy' },
  cancelled: { label: 'Kansellert', className: 'bg-badge-error-bg text-badge-error' },
}

interface BookingStatusBadgeProps {
  status: BookingStatus
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 font-body text-label font-normal ${config.className}`}
    >
      {config.label}
    </span>
  )
}
