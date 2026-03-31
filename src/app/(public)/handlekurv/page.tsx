'use client'

import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'
import { CartItem } from '@/components/cart/CartItem'
import { OrderSummaryPanel } from '@/components/cart/OrderSummaryPanel'
import { Button } from '@/components/ui/Button'

const FLAT_RATE_SHIPPING = 9900 // 99 NOK in ore

export default function HandlekurvPage() {
  const { items, subtotal } = useCart()

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
          <Link href="/produkter" className="mt-6">
            <Button variant="primary">Se produkter</Button>
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
                key={
                  item.experienceDateId
                    ? `${item.id}:${item.experienceDateId}`
                    : item.id
                }
                item={item}
              />
            ))}
          </ul>

          <Link
            href="/produkter"
            className="mt-6 inline-flex items-center gap-2 text-body text-forest hover:opacity-85"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Fortsett a handle
          </Link>
        </div>

        {/* Order summary -- right column */}
        <div className="lg:w-[35%]">
          <OrderSummaryPanel
            subtotal={subtotal}
            shippingCost={shippingCost}
            ctaText="Ga til betaling"
            ctaHref="/checkout"
          />
        </div>
      </div>
    </div>
  )
}
