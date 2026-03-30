'use client'

import { useCart } from './CartProvider'

export function CartBadge() {
  const { itemCount } = useCart()

  if (itemCount === 0) return null

  return (
    <span aria-live="polite" aria-atomic="true">
      <span
        className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-cart-badge text-cream"
        style={{
          fontSize: '13px',
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </span>
  )
}
