'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, getItemKey } from '@/components/cart/CartProvider'
import { OrderSummaryPanel } from '@/components/cart/OrderSummaryPanel'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { StripeElementsWrapper } from '@/components/checkout/StripeElementsWrapper'
import { ConfirmationModal } from '@/components/checkout/ConfirmationModal'
import { GiftCardInput } from '@/components/checkout/GiftCardInput'
import { createPaymentIntent } from '@/actions/checkout'
import { formatPrice } from '@/lib/format'

const FLAT_RATE_SHIPPING = 9900 // 99 NOK in ore

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [initError, setInitError] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [giftCardCode, setGiftCardCode] = useState<string | null>(null)
  const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null)

  const hasProducts = items.some((i) => i.type === 'product')
  const shippingCost = hasProducts ? FLAT_RATE_SHIPPING : 0
  const giftCardDeduction = giftCardBalance ? Math.min(giftCardBalance, subtotal + shippingCost) : 0
  const total = subtotal + shippingCost - giftCardDeduction

  // Redirect to cart if empty
  useEffect(() => {
    // Wait for cart to load from localStorage
    const timer = setTimeout(() => {
      if (items.length === 0 && !paymentIntentId) {
        router.push('/handlekurv')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [items.length, paymentIntentId, router])

  // Create initial PaymentIntent for Stripe Elements
  useEffect(() => {
    if (items.length === 0 || clientSecret) return

    async function initPayment() {
      try {
        const result = await createPaymentIntent(
          { email: 'placeholder@init.no' },
          items
        )
        if ('clientSecret' in result) {
          setClientSecret(result.clientSecret)
        } else if ('error' in result) {
          setInitError(result.error)
        }
      } catch {
        setInitError('Kunne ikke starte betalingen. Prøv igjen.')
      }
    }

    initPayment()
  }, [items, clientSecret])

  function handlePaymentSuccess(piId: string) {
    setPaymentIntentId(piId)
  }

  // If payment succeeded, show confirmation modal
  if (paymentIntentId) {
    return (
      <ConfirmationModal
        paymentIntentId={paymentIntentId}
        customerEmail={customerEmail || ''}
      />
    )
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 pt-24 pb-16">
      <h1 className="mb-8 font-heading text-h2 font-bold text-forest">
        Kasse
      </h1>

      {initError && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-body text-destructive">
          {initError}
        </div>
      )}

      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Checkout form -- left column */}
        <div className="flex-1 lg:w-[60%]">
          {/* Gift card redemption */}
          <div className="mb-6">
            <GiftCardInput
              onApply={(code, balance) => {
                setGiftCardCode(code)
                setGiftCardBalance(balance)
              }}
              onRemove={() => {
                setGiftCardCode(null)
                setGiftCardBalance(null)
              }}
              appliedCode={giftCardCode}
              appliedBalance={giftCardDeduction > 0 ? giftCardDeduction : null}
            />
          </div>

          {clientSecret ? (
            <StripeElementsWrapper clientSecret={clientSecret}>
              <CheckoutForm
                items={items}
                onPaymentSuccess={handlePaymentSuccess}
                giftCardCode={giftCardCode}
              />
            </StripeElementsWrapper>
          ) : (
            !initError && (
              <div className="flex items-center justify-center py-12">
                <p className="text-body">Laster betalingsskjema...</p>
              </div>
            )
          )}
        </div>

        {/* Order summary -- right column */}
        <div className="lg:w-[40%]">
          {/* Mobile: collapsible accordion */}
          <details
            className="lg:hidden"
            open={summaryOpen}
            onToggle={(e) => setSummaryOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer rounded-lg border border-forest/12 bg-card px-4 py-3 text-body text-forest">
              Vis ordresammendrag ({formatPrice(total)})
            </summary>
            <div className="mt-3">
              <OrderSummaryPanel
                subtotal={subtotal}
                shippingCost={shippingCost}
                showCta={false}
              />
              {/* Item list */}
              <div className="mt-4 space-y-2 rounded-lg border border-forest/12 bg-card p-4">
                {items.map((item) => (
                  <div
                    key={getItemKey(item)}
                    className="flex justify-between text-label text-forest"
                  >
                    <span>
                      {item.name}
                      {item.variantLabel && ` — ${item.variantLabel}`}
                      {item.quantity > 1 ? ` x${item.quantity}` : ''}
                    </span>
                    <span className="text-forest">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </details>

          {/* Desktop: always visible */}
          <div className="sticky top-24 hidden lg:block">
            <OrderSummaryPanel
              subtotal={subtotal}
              shippingCost={shippingCost}
              showCta={false}
            />
            {/* Item list */}
            <div className="mt-4 space-y-2 rounded-lg border border-forest/12 bg-card p-4">
              {items.map((item) => (
                <div
                  key={getItemKey(item)}
                  className="flex justify-between text-label text-forest"
                >
                  <span>
                    {item.name}
                    {item.variantLabel && ` — ${item.variantLabel}`}
                    {item.quantity > 1 ? ` x${item.quantity}` : ''}
                  </span>
                  <span className="text-forest">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
