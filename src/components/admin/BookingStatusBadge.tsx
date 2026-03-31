import type { BookingStatus } from '@/types'

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'Venter', className: 'bg-[#FEF3C7] text-[#92400E]' },
  confirmed: { label: 'Bekreftet', className: 'bg-[#DCFCE7] text-[#166534]' },
  cancelled: { label: 'Kansellert', className: 'bg-[#FEE2E2] text-[#991B1B]' },
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
