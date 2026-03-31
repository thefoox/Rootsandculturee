'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/format'

interface OrderSummaryPanelProps {
  subtotal: number
  shippingCost: number
  showCta?: boolean
  ctaText?: string
  ctaHref?: string
}

export function OrderSummaryPanel({
  subtotal,
  shippingCost,
  showCta = true,
  ctaText = 'Ga til betaling',
  ctaHref = '/checkout',
}: OrderSummaryPanelProps) {
  const total = subtotal + shippingCost

  return (
    <div className="rounded-lg border border-forest/12 bg-card p-6">
      <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
        Sammendrag
      </h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-body">Subtotal</span>
          <span className="text-[15px] text-rust">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[15px] text-body">Frakt</span>
          <span className="text-[15px] text-rust">
            {shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis'}
          </span>
        </div>

        <div className="border-t border-forest/12 my-4" />

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-normal text-forest">Totalt</span>
          <span className="text-[15px] text-rust">{formatPrice(total)}</span>
        </div>
      </div>

      {showCta && (
        <Link href={ctaHref} className="mt-6 block">
          <Button variant="primary" className="w-full">
            {ctaText}
          </Button>
        </Link>
      )}
    </div>
  )
}
