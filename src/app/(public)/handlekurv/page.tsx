'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useCart, getItemKey } from '@/components/cart/CartProvider'
import { CartItem } from '@/components/cart/CartItem'
import { OrderSummaryPanel } from '@/components/cart/OrderSummaryPanel'
import { Button } from '@/components/ui/Button'
import { validateCartItems } from '@/actions/cart'

const FLAT_RATE_SHIPPING = 9900 // 99 NOK in ore

export default function HandlekurvPage() {
  const { items, subtotal, removeItem, mounted } = useCart()

  const hasValidated = useRef(false)

  // Validate cart items against Firestore once after cart loads from localStorage.
  // Depends only on `mounted` to prevent infinite loops when items change due to removal.
  useEffect(() => {
    if (!mounted || hasValidated.current || items.length === 0) return
    hasValidated.current = true

    validateCartItems(items)
      .then((result) => {
        result.removed.forEach((r) => {
          removeItem(r.id, r.experienceDateId ?? undefined, r.variantId ?? undefined)
          toast.error(r.reason, { description: r.name })
        })
      })
      .catch(() => {
        // Validation failure is non-blocking — items stay in cart, checkout will catch issues
      })
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasProducts = items.some((i) => i.type === 'product')
  const shippingCost = hasProducts ? FLAT_RATE_SHIPPING : 0

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 pt-24 pb-16">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <ShoppingBag className="h-12 w-12 text-forest" aria-hidden="true" />
          <h1 className="mt-4 font-heading text-h4 font-bold text-forest">
            Handlekurven er tom
          </h1>
          <p className="mt-2 text-body">
            Du har ikke lagt til noe enda.
          </p>
          <Link href="/opplevelser" className="mt-6">
            <Button variant="primary">Utforsk opplevelser</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-24 pb-16">
      <h1 className="mb-8 font-heading text-h2 font-bold text-forest">
        Handlekurv
      </h1>

      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Cart items -- left column */}
        <div className="flex-1 lg:w-[65%]">
          <ul role="list">
            {items.map((item) => (
              <CartItem
                key={getItemKey(item)}
                item={item}
              />
            ))}
          </ul>

          <Link
            href="/opplevelser"
            className="mt-6 inline-flex items-center gap-2 text-body text-forest hover:opacity-85"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Fortsett å handle
          </Link>
        </div>

        {/* Order summary -- right column */}
        <div className="lg:w-[35%]">
          <OrderSummaryPanel
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            ctaText="Gå til betaling"
            ctaHref="/checkout"
          />
        </div>
      </div>
    </div>
  )
}
