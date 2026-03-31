'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, MailOpen, Loader2 } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import { BookingChecklist } from './BookingChecklist'
import { formatPrice, formatDate } from '@/lib/format'
import { getOrderByStripePaymentIntent } from '@/actions/orders'
import type { Order } from '@/types'

interface BookingConfirmation {
  confirmationCode: string
  experienceName: string
  date: string
  whatToBring: string
  total: number
}

interface ConfirmationModalProps {
  paymentIntentId: string
  customerEmail: string
  bookings?: BookingConfirmation[]
}

export function ConfirmationModal({
  paymentIntentId,
  customerEmail,
  bookings = [],
}: ConfirmationModalProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Poll for order until webhook confirms
  useEffect(() => {
    let cancelled = false
    let attempts = 0
    const maxAttempts = 30 // 60 seconds max

    async function pollOrder() {
      while (!cancelled && attempts < maxAttempts) {
        try {
          const result = await getOrderByStripePaymentIntent(paymentIntentId)
          if (result) {
            setOrder(result)
            setLoading(false)
            return
          }
        } catch {
          // retry
        }
        attempts++
        await new Promise((r) => setTimeout(r, 2000))
      }
      // Even if no order found (e.g. booking-only), stop loading
      setLoading(false)
    }

    pollOrder()
    return () => { cancelled = true }
  }, [paymentIntentId])

  // Focus heading on mount
  useEffect(() => {
    if (!loading) {
      headingRef.current?.focus()
    }
  }, [loading])

  // Focus trap
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, a, input, [tabindex]:not([tabindex="-1"])'
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
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [])

  function handleDismiss() {
    clearCart()
    router.push('/')
  }

  const hasOrder = order !== null
  const hasBookings = bookings.length > 0

  let headingText = 'Bestilling bekreftet!'
  if (hasOrder && hasBookings) {
    headingText = 'Bestilling og booking bekreftet!'
  } else if (hasBookings && !hasOrder) {
    headingText = 'Booking bekreftet!'
  }

  return (
    <>
      {/* Backdrop -- no click-to-close per UI spec */}
      <div
        className="fixed inset-0 z-[200] bg-forest/60"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-heading"
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-[480px] rounded-lg bg-cream p-8 shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-forest" aria-hidden="true" />
              <p className="mt-4 text-[15px] text-forest" aria-live="polite">
                Bekrefter betaling...
              </p>
            </div>
          ) : (
            <>
              {/* Success header */}
              <div className="mb-6 rounded-lg bg-success-bg p-4 text-center">
                <CheckCircle2
                  className="mx-auto h-8 w-8 text-success"
                  aria-hidden="true"
                />
                <h2
                  ref={headingRef}
                  id="confirmation-heading"
                  className="mt-2 font-heading text-[20px] font-bold text-success"
                  tabIndex={-1}
                >
                  {headingText}
                </h2>
              </div>

              {/* Order details */}
              {hasOrder && order && (
                <div className="mb-6 space-y-3">
                  <div>
                    <span className="text-[13px] text-body">Ordrenummer:</span>
                    <code className="ml-2 rounded bg-card px-2 py-1 text-[15px] tracking-wider">
                      {order.id}
                    </code>
                  </div>

                  <div className="space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[15px] text-forest">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="text-rust">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {order.shipping && (
                    <div className="text-[13px] text-body">
                      <p>Leveres til:</p>
                      <p>{order.shipping.fullName}</p>
                      <p>{order.shipping.address}</p>
                      <p>{order.shipping.postalCode} {order.shipping.city}</p>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-forest/12 pt-3 text-[15px] text-forest">
                    <span>Totalt betalt</span>
                    <span className="text-rust">{formatPrice(order.total)}</span>
                  </div>
                </div>
              )}

              {/* Booking details */}
              {hasBookings &&
                bookings.map((booking, i) => (
                  <div key={i} className="mb-6 space-y-3">
                    <div>
                      <span className="text-[13px] text-body">Bekreftelseskode:</span>
                      <code className="ml-2 rounded bg-card px-2 py-1 text-[15px] tracking-wider">
                        {booking.confirmationCode}
                      </code>
                    </div>
                    <p className="text-[15px] text-forest">{booking.experienceName}</p>
                    <p className="text-[13px] text-body">
                      Dato: {formatDate(new Date(booking.date))}
                    </p>
                    <p className="text-[15px] text-rust">
                      {formatPrice(booking.total)}
                    </p>
                    {booking.whatToBring && (
                      <BookingChecklist items={booking.whatToBring} />
                    )}
                  </div>
                ))}

              {/* Email notice */}
              <div className="mb-6 flex items-center gap-2 text-[13px] text-body">
                <MailOpen className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>En bekreftelse er sendt til {customerEmail}.</span>
              </div>

              {/* Dismiss CTA */}
              <Button
                variant="primary"
                className="w-full"
                onClick={handleDismiss}
              >
                Tilbake til nettbutikken
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
