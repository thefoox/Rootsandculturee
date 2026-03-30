'use client'

import { ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import type { ProductImage } from '@/types'

interface AddToCartButtonProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    images: ProductImage[]
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()

  function handleAdd() {
    addItem({
      id: product.id,
      type: 'product',
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] ?? null,
      slug: product.slug,
      experienceDateId: null,
      experienceDate: null,
      experienceName: null,
    })
    toast(`${product.name} lagt i handlekurven.`)
  }

  return (
    <Button variant="primary" onClick={handleAdd}>
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      Legg i handlekurv
    </Button>
  )
}
