'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from './CartProvider'
import { formatPrice, formatDate } from '@/lib/format'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart()

  function handleRemove() {
    removeItem(item.id, item.experienceDateId ?? undefined)
    toast('Fjernet fra handlekurven.')
  }

  const isExperience = item.type === 'experience'
  const itemTotal = item.price * item.quantity

  return (
    <li className="flex min-h-[80px] gap-3 border-b border-forest/8 py-3">
      {/* Thumbnail */}
      {item.image ? (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={item.image.url}
            alt={item.image.alt}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-card text-body/40">
          <span className="text-label">Bilde</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-body text-body font-normal leading-snug text-forest line-clamp-2">
              {item.name}
            </p>
            {isExperience && item.experienceDate && (
              <p className="mt-1 text-label text-body">
                Opplevelse &mdash; {formatDate(new Date(item.experienceDate))}
              </p>
            )}
            <p className="mt-1 text-label text-body">
              {formatPrice(item.price)}
            </p>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-body hover:text-destructive"
            aria-label={`Fjern ${item.name} fra handlekurv`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Quantity controls -- hidden for experiences */}
          {!isExperience ? (
            <div className="flex items-center gap-0">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded border border-forest/20 text-forest disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Reduser antall"
                aria-disabled={item.quantity <= 1}
              >
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <span className="flex w-8 items-center justify-center font-body text-body text-forest">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded border border-forest/20 text-forest"
                aria-label="Ok antall"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <span className="text-label text-body">1 plass</span>
          )}

          {/* Item total */}
          <span className="font-body text-body text-forest">
            {formatPrice(itemTotal)}
          </span>
        </div>
      </div>
    </li>
  )
}
