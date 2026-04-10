'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'
import { OrderSummaryPanel } from '@/components/cart/OrderSummaryPanel'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { StripeElementsWrapper } from '@/components/checkout/StripeElementsWrapper'
import { ConfirmationModal } from '@/components/checkout/ConfirmationModal'
import { GiftCardInput } from '@/components/checkout/GiftCardInput'
import { createPaymentIntent, getCheckoutUser } from '@/actions/checkout'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CartItem } from '@/types'

const FLAT_RATE_SHIPPING = 9900 // 99 NOK in ore

function MobileOrderSummary({
  items,
  subtotal,
  shippingCost,
  giftCardDeduction,
  total,
  giftCardCode,
  onGiftCardApply,
  onGiftCardRemove,
}: {
  items: CartItem[]
  subtotal: number
  shippingCost: number
  giftCardDeduction: number
  total: number
  giftCardCode: string | null
  onGiftCardApply: (code: string, balance: number) => void
  onGiftCardRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-[#e8e3da] bg-white shadow-[0_-4px_24px_rgba(27,67,50,0.1)] lg:hidden',
        expanded ? 'max-h-[70vh] overflow-y-auto' : ''
      )}
    >
      {/* Peek bar -- always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4"
        aria-expanded={expanded}
        aria-label={expanded ? 'Skjul ordresammendrag' : 'Vis ordresammendrag'}
      >
        <div>
          <div className="text-[13px] text-body/60">Din bestilling</div>
          <div className="font-heading text-[18px] font-bold text-forest">
            {formatPrice(total)}
          </div>
        </div>
        <ChevronUp
          className={cn(
            'h-5 w-5 text-forest/50 motion-safe:transition-transform',
            expanded && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="px-6 pb-6">
          <OrderSummaryPanel
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            giftCardDeduction={giftCardDeduction}
            showCta={false}
          >
            <GiftCardInput
              onApply={onGiftCardApply}
              onRemove={onGiftCardRemove}
              appliedCode={giftCardCode}
              appliedBalance={giftCardDeduction > 0 ? giftCardDeduction : null}
            />
          </OrderSummaryPanel>
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, mounted } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [initPaymentIntentId, setInitPaymentIntentId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [initError, setInitError] = useState('')
  const [giftCardCode, setGiftCardCode] = useState<string | null>(null)
  const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null)

  const hasProducts = items.some((i) => i.type === 'product')
  const shippingCost = hasProducts ? FLAT_RATE_SHIPPING : 0
  const giftCardDeduction = giftCardBalance ? Math.min(giftCardBalance, subtotal + shippingCost) : 0
  const total = subtotal + shippingCost - giftCardDeduction

  // Load logged-in user email for pre-fill
  useEffect(() => {
    getCheckoutUser().then(({ email }) => {
      if (email) setUserEmail(email)
    })
  }, [])

  // Redirect to cart if empty — wait for localStorage hydration via mounted flag
  useEffect(() => {
    if (!mounted) return
    if (items.length === 0 && !paymentIntentId) {
      router.push('/handlekurv')
    }
  }, [mounted, items.length, paymentIntentId, router])

  // Create initial PaymentIntent for Stripe Elements
  useEffect(() => {
    if (items.length === 0 || clientSecret) return

    async function initPayment() {
      try {
        const result = await createPaymentIntent(
          { email: '', isInit: true },
          items
        )
        if ('clientSecret' in result) {
          setClientSecret(result.clientSecret)
          // Extract PI id from clientSecret (format: pi_xxx_secret_yyy)
          setInitPaymentIntentId(result.clientSecret.split('_secret_')[0])
        } else if ('error' in result) {
          setInitError(result.error)
        }
      } catch {
        setInitError('Kunne ikke starte betalingen. Prøv igjen.')
      }
    }

    initPayment()
  }, [items, clientSecret])

  function handlePaymentSuccess(piId: string, email: string) {
    setPaymentIntentId(piId)
    setCustomerEmail(email || userEmail || '')
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
    <div className="mx-auto max-w-[1120px] px-8 pt-24 pb-20 max-lg:px-4 max-lg:pb-[120px]">
      <h1 className="mb-10 font-heading text-h2 font-bold text-forest max-lg:mb-6 max-lg:text-[1.5rem]">
        Kasse
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-14 items-start">
        {/* LEFT: Form area */}
        <div>
          {initError && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-body text-destructive">
              {initError}
            </div>
          )}

          {clientSecret ? (
            <StripeElementsWrapper clientSecret={clientSecret}>
              <CheckoutForm
                items={items}
                paymentIntentId={initPaymentIntentId ?? ''}
                userEmail={userEmail}
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

        {/* RIGHT: Order Summary Sidebar */}
        {/* Desktop: sticky sidebar, always visible */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <OrderSummaryPanel
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              giftCardDeduction={giftCardDeduction}
              showCta={false}
            >
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
            </OrderSummaryPanel>
          </div>
        </div>

        {/* Mobile: Fixed bottom sheet */}
        <MobileOrderSummary
          items={items}
          subtotal={subtotal}
          shippingCost={shippingCost}
          giftCardDeduction={giftCardDeduction}
          total={total}
          giftCardCode={giftCardCode}
          onGiftCardApply={(code, balance) => {
            setGiftCardCode(code)
            setGiftCardBalance(balance)
          }}
          onGiftCardRemove={() => {
            setGiftCardCode(null)
            setGiftCardBalance(null)
          }}
        />
      </div>
    </div>
  )
}
