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
  ctaText = 'Gå til betaling',
  ctaHref = '/checkout',
}: OrderSummaryPanelProps) {
  const total = subtotal + shippingCost

  return (
    <div className="rounded-xl border border-bark/20 bg-card p-6">
      <h2 className="mb-5 font-heading text-h4 font-bold text-forest tracking-[-0.015em]">
        Sammendrag
      </h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-body">Subtotal</span>
          <span className="text-body text-forest">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-body">Frakt</span>
          <span className="text-body text-forest">
            {shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis'}
          </span>
        </div>

        <div className="border-t border-bark/20 my-4" />

        <div className="flex items-center justify-between pt-3">
          <span className="text-body font-bold text-forest">Totalt</span>
          <span className="text-h4 font-bold text-forest">{formatPrice(total)}</span>
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
