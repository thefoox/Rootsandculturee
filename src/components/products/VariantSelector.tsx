'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/format'
import type { ProductImage, ProductVariant } from '@/types'

interface VariantSelectorProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    images: ProductImage[]
    variants: ProductVariant[]
  }
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const { addItem } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? null)

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null
  const activePrice = selectedVariant?.price ?? product.price
  const isInStock = selectedVariant?.inStock ?? true

  function handleAdd() {
    addItem({
      id: product.id,
      type: 'product',
      name: product.name,
      price: activePrice,
      quantity: 1,
      image: product.images[0] ?? null,
      slug: product.slug,
      variantId: selectedVariant?.id ?? null,
      variantLabel: selectedVariant?.label ?? null,
      experienceDateId: null,
      experienceDate: null,
      experienceName: null,
      isEarlybird: null,
      originalPrice: null,
      giftCardRecipientName: null,
      giftCardRecipientEmail: null,
      giftCardMessage: null,
    })
    const label = selectedVariant ? `${product.name} (${selectedVariant.label})` : product.name
    toast(`${label} lagt i handlekurven.`)
  }

  return (
    <div>
      <fieldset className="mt-6">
        <legend className="font-body text-label font-medium text-forest">Velg størrelse</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              disabled={!variant.inStock}
              className={`rounded-md border px-4 py-2 font-body text-body transition-all duration-100 min-h-[44px] ${
                selectedVariantId === variant.id
                  ? 'border-forest bg-forest text-cream'
                  : 'border-forest/20 bg-cream text-forest hover:border-forest/40'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-pressed={selectedVariantId === variant.id}
            >
              {variant.label} — {formatPrice(variant.price)}
            </button>
          ))}
        </div>
        <p className="mt-3 font-body text-h4 font-bold text-forest">
          {formatPrice(activePrice)}
        </p>
      </fieldset>

      <div className="mt-6">
        <Button variant="primary" onClick={handleAdd} disabled={!isInStock}>
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {isInStock ? 'Legg i handlekurv' : 'Ikke på lager'}
        </Button>
      </div>
    </div>
  )
}
