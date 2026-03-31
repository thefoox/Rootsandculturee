import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

interface PriceBadgeProps {
  priceInOre: number
  className?: string
}

export function PriceBadge({ priceInOre, className }: PriceBadgeProps) {
  return (
    <span className={cn('text-[15px] text-forest font-body', className)}>
      {formatPrice(priceInOre)}
    </span>
  )
}
