'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'
import { useCart, getItemKey } from './CartProvider'
import { CartItem } from './CartItem'
import { formatPrice } from '@/lib/format'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const FLAT_RATE_SHIPPING = 9900 // 99 NOK in ore

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, subtotal } = useCart()
  const closeRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return

    // Focus close button on open
    closeRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const hasProducts = items.some((i) => i.type === 'product')
  const shippingCost = hasProducts ? FLAT_RATE_SHIPPING : 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[149] bg-forest/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Handlekurv"
        className="fixed right-0 top-0 bottom-0 z-[150] flex w-full max-w-[400px] flex-col border-l border-forest/12 bg-cream shadow-[-4px_0_24px_rgba(0,0,0,0.10)] motion-safe:animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-forest/12 px-4">
          <h2 className="font-heading text-h4 font-bold text-forest">
            Handlekurv
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded text-forest hover:bg-forest/10 motion-safe:transition-colors motion-safe:duration-100"
            aria-label="Lukk handlekurv"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-forest" aria-hidden="true" />
              <p className="mt-4 font-heading text-h4 font-bold text-forest">
                Handlekurven er tom
              </p>
              <p className="mt-2 text-body">
                Du har ikke lagt til noe enda.
              </p>
            </div>
          ) : (
            <ul role="list">
              {items.map((item) => (
                <CartItem
                  key={getItemKey(item)}
                  item={item}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer — compact totals + CTA (no item duplication) */}
        {items.length > 0 && (
          <div className="border-t border-forest/12 px-4 py-4">
            <div className="space-y-1.5 text-[14px]">
              <div className="flex justify-between">
                <span className="text-body/70">Delsum</span>
                <span className="font-medium text-forest">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body/70">Frakt</span>
                <span className="font-medium text-forest">
                  {shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis'}
                </span>
              </div>
              <div className="flex justify-between border-t border-forest/10 pt-2 mt-2">
                <span className="text-[15px] font-bold text-forest">Totalt</span>
                <span className="text-[15px] font-bold text-forest">{formatPrice(subtotal + shippingCost)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-forest text-[15px] font-semibold text-cream hover:bg-[#153a2a] motion-safe:transition-colors"
            >
              Gå til betaling
            </Link>
            <Link
              href="/handlekurv"
              onClick={onClose}
              className="mt-2 block text-center text-[13px] text-forest/60 hover:text-forest"
            >
              Se full handlekurv
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
