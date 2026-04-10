'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { OrderSummaryPanel } from '@/components/cart/OrderSummaryPanel'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { StripeElementsWrapper } from '@/components/checkout/StripeElementsWrapper'
import { ConfirmationModal } from '@/components/checkout/ConfirmationModal'
import { GiftCardInput } from '@/components/checkout/GiftCardInput'
import { createPaymentIntent, getCheckoutUser } from '@/actions/checkout'
import { formatPrice } from '@/lib/format'

const FLAT_RATE_SHIPPING = 9900 // 99 NOK in ore

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, mounted } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [initPaymentIntentId, setInitPaymentIntentId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [initError, setInitError] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
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
          </details>

          {/* Desktop: always visible */}
          <div className="sticky top-24 hidden lg:block">
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
      </div>
    </div>
  )
}
