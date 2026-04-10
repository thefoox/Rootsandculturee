'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/format'
import type { CartItem } from '@/types'

interface OrderSummaryPanelProps {
  items: CartItem[]
  subtotal: number
  shippingCost: number
  giftCardDeduction?: number
  showCta?: boolean
  ctaText?: string
  ctaHref?: string
  children?: React.ReactNode
}

export function OrderSummaryPanel({
  items,
  subtotal,
  shippingCost,
  giftCardDeduction = 0,
  showCta = true,
  ctaText = 'Gå til betaling',
  ctaHref = '/checkout',
  children,
}: OrderSummaryPanelProps) {
  const total = subtotal + shippingCost - giftCardDeduction

  return (
    <div className="rounded-xl border border-[#e8e3da] bg-white p-7">
      <h2 className="font-heading text-[18px] font-bold text-forest mb-6">
        Din bestilling
      </h2>

      {/* Product items with images */}
      <div className="flex flex-col gap-4 mb-6">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.variantId || ''}-${item.experienceDateId || ''}`}
            className="flex gap-3.5 items-start"
          >
            {/* 64px thumbnail */}
            {item.image ? (
              <img
                src={item.image.url}
                alt={item.image.alt}
                className="h-16 w-16 rounded-lg object-cover bg-card flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div
                className="h-16 w-16 rounded-lg bg-card flex-shrink-0"
                aria-hidden="true"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-forest leading-snug">
                {item.name}
              </div>
              <div className="text-[13px] text-body/60 mt-0.5">
                {item.type === 'experience' && item.experienceDate
                  ? `${new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(item.experienceDate))} · ${item.quantity} plass${item.quantity > 1 ? 'er' : ''}`
                  : item.variantLabel
                    ? `${item.quantity} x ${formatPrice(item.price)} · ${item.variantLabel}`
                    : `${item.quantity} x ${formatPrice(item.price)}`}
              </div>
              {item.isEarlybird && (
                <span className="mt-1 inline-block rounded-[3px] bg-rust/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rust">
                  earlybird
                </span>
              )}
            </div>

            <div className="text-[14px] font-semibold text-forest whitespace-nowrap">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e8e3da] mb-4" />

      {/* Subtotal row */}
      <div className="flex justify-between items-center py-1 text-[14px]">
        <span className="text-body/70">Delsum</span>
        <span className="font-medium text-forest">{formatPrice(subtotal)}</span>
      </div>

      {/* Shipping row */}
      <div className="flex justify-between items-center py-1 text-[14px]">
        <span className="text-body/70">Frakt</span>
        <span className="font-medium text-forest">
          {shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis'}
        </span>
      </div>

      {/* Gift card deduction row (conditional) */}
      {giftCardDeduction > 0 && (
        <div className="flex justify-between items-center py-1 text-[14px]">
          <span className="text-body/70">Gavekort</span>
          <span className="font-medium text-forest">-{formatPrice(giftCardDeduction)}</span>
        </div>
      )}

      {/* Total row with forest top border */}
      <div className="flex justify-between items-baseline pt-4 mt-3 border-t-[1.5px] border-forest">
        <span className="text-[16px] font-bold text-forest">Totalt</span>
        <span className="text-[20px] font-bold text-forest">{formatPrice(total)}</span>
      </div>

      {/* Legal text */}
      <p className="text-[12px] text-body/50 leading-relaxed mt-5">
        Priser inkl. mva. Ved å fullføre kjøpet godtar du våre{' '}
        <a href="/vilkar" className="text-forest underline">vilkår</a> og{' '}
        <a href="/personvern" className="text-forest underline">personvernerklæring</a>.
      </p>

      {/* Slot for GiftCardInput */}
      {children}

      {/* Optional CTA (for cart page usage) */}
      {showCta && (
        <Link href={ctaHref} className="mt-6 block">
          <Button variant="primary" className="w-full">{ctaText}</Button>
        </Link>
      )}
    </div>
  )
}
