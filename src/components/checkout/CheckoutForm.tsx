'use client'

import { useState, useRef } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { LockKeyhole, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { Button } from '@/components/ui/Button'
import { updatePaymentIntentMetadata } from '@/actions/checkout'
import type { CartItem } from '@/types'

const shippingSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse.'),
  fullName: z.string().min(1, 'Fullt navn er påkrevd.'),
  phone: z.string().min(8, 'Telefonnummer må ha minst 8 siffer.'),
  address: z.string().min(1, 'Adresse er påkrevd.'),
  postalCode: z.string().regex(/^[0-9]{4}$/, 'Postnummer må være 4 siffer.'),
  city: z.string().min(1, 'Sted er påkrevd.'),
})

const contactOnlySchema = z.object({
  email: z.string().email('Ugyldig e-postadresse.'),
  fullName: z.string().min(1, 'Fullt navn er påkrevd.'),
  phone: z.string().min(8, 'Telefonnummer må ha minst 8 siffer.'),
})

interface CheckoutFormProps {
  items: CartItem[]
  paymentIntentId: string
  userEmail?: string | null
  onPaymentSuccess: (paymentIntentId: string, email: string) => void
  giftCardCode?: string | null
}

export function CheckoutForm({
  items,
  paymentIntentId,
  userEmail,
  onPaymentSuccess,
  giftCardCode,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState(userEmail || '')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentError, setPaymentError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)

  const step2HeadingRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const hasProducts = items.some((i) => i.type === 'product')
  const needsShipping = hasProducts

  function validateStep1(): boolean {
    const formData = { email, fullName, phone, address, postalCode, city }
    const schema = needsShipping ? shippingSchema : contactOnlySchema
    const validation = schema.safeParse(formData)

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of validation.error.issues) {
        const field = err.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message
        }
      }
      setErrors(fieldErrors)
      return false
    }
    return true
  }

  function handleNextStep() {
    setErrors({})
    if (validateStep1()) {
      setStep(2)
      // Focus step 2 heading after render for WCAG AA
      setTimeout(() => {
        step2HeadingRef.current?.focus()
        step2HeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      // Focus first errored field for WCAG AA
      setTimeout(() => {
        const firstError = formRef.current?.querySelector('[aria-invalid="true"]') as HTMLElement | null
        firstError?.focus()
      }, 50)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setPaymentError('')

    if (!stripe || !elements) {
      setPaymentError('Betalingssystemet er ikke lastet enda. Vent litt.')
      return
    }

    setLoading(true)

    try {
      // Update existing PaymentIntent metadata with real customer data
      const formData = { email, fullName, phone, address, postalCode, city }
      const updateResult = await updatePaymentIntentMetadata(paymentIntentId, formData, items, giftCardCode)

      if ('error' in updateResult) {
        setPaymentError(updateResult.error)
        setLoading(false)
        return
      }

      // If gift card covers the full amount, skip Stripe payment
      if ('coveredByGiftCard' in updateResult && updateResult.coveredByGiftCard) {
        onPaymentSuccess(paymentIntentId, email)
        return
      }

      // Confirm payment with Stripe Elements (uses the same PI that was initialized)
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        const errorMessages: Record<string, string> = {
          card_declined: 'Kortet ble avvist. Prøv et annet kort.',
          insufficient_funds: 'Ikke nok dekning på kortet.',
          expired_card: 'Kortet har utløpt.',
          incorrect_cvc: 'Feil CVC-kode.',
          processing_error: 'Det oppstod en feil. Prøv igjen.',
          incorrect_number: 'Ugyldig kortnummer.',
        }
        setPaymentError(
          errorMessages[stripeError.code || ''] ||
            stripeError.message ||
            'Noe gikk galt med betalingen. Prøv igjen.'
        )
        setLoading(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id, email)
      }
    } catch {
      setPaymentError('En uventet feil oppstod. Prøv igjen.')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-10">
        <div className="flex items-center gap-3">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-body font-bold ${
                step >= 2
                  ? 'bg-forest text-cream'
                  : step === 1
                    ? 'bg-forest text-cream ring-2 ring-offset-2 ring-forest/20'
                    : 'bg-card border border-forest/20 text-body/40'
              }`}
              {...(step >= 2 ? { 'aria-label': 'Fullfort' } : {})}
            >
              {step >= 2 ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                1
              )}
            </div>
            <span className="text-label text-body">Kontaktinfo</span>
          </div>
          {/* Connector */}
          <div className="relative h-0.5 flex-1">
            <div className="absolute inset-0 bg-forest/12" />
            <div
              className="absolute inset-y-0 left-0 bg-forest motion-safe:transition-all motion-safe:duration-300"
              style={{ width: step >= 2 ? '100%' : '0%' }}
            />
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-body font-bold ${
                step === 2
                  ? 'bg-forest text-cream ring-2 ring-offset-2 ring-forest/20'
                  : 'bg-card border border-forest/20 text-body/40'
              }`}
            >
              2
            </div>
            <span className="text-label text-body">Betaling</span>
          </div>
        </div>
      </div>

      {/* Step 1: Contact + Shipping */}
      {step === 1 && (
        <div ref={formRef}>
          <section className="relative overflow-hidden rounded-xl border border-forest/10 bg-card p-6 mb-6 before:content-[''] before:absolute before:left-0 before:top-6 before:bottom-6 before:w-0.5 before:bg-bark/40 before:rounded-full">
            <h2 className="mb-5 font-heading text-h4 font-bold text-forest tracking-[-0.015em]">
              Kontaktinformasjon
            </h2>
            <div className="space-y-5">
              <Input
                label={userEmail ? `Innlogget som ${userEmail}` : 'E-postadresse'}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                readOnly={!!userEmail}
                required
              />
              <Input
                label="Fullt navn"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                autoComplete="name"
                required
              />
              <Input
                label="Telefonnummer"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </div>
          </section>

          {needsShipping && (
            <section className="relative overflow-hidden rounded-xl border border-forest/10 bg-card p-6 mb-6 before:content-[''] before:absolute before:left-0 before:top-6 before:bottom-6 before:w-0.5 before:bg-bark/40 before:rounded-full">
              <h2 className="mb-5 font-heading text-h4 font-bold text-forest tracking-[-0.015em]">
                Leveringsadresse
              </h2>
              <div className="space-y-5">
                <Input
                  label="Adresse"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  error={errors.address}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postnummer"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    error={errors.postalCode}
                    pattern="[0-9]{4}"
                    inputMode="numeric"
                    maxLength={4}
                    required
                  />
                  <Input
                    label="Sted"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    error={errors.city}
                    required
                  />
                </div>
              </div>
            </section>
          )}

          <Button
            type="button"
            variant="primary"
            className="w-full min-h-[48px] font-bold"
            onClick={handleNextStep}
          >
            <span>Gå til betaling</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          {/* Summary of step 1 info */}
          <div className="mb-6 rounded-xl border border-forest/10 bg-card p-5">
            <p className="text-label font-normal text-body mb-3">Dine opplysninger</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-body text-forest font-normal">{fullName}</p>
                <p className="font-body text-label text-body">{email}</p>
                <p className="font-body text-label text-body">{phone}</p>
                {needsShipping && (
                  <p className="font-body text-label text-body mt-1">
                    {address}, {postalCode} {city}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-label text-forest hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Endre
              </button>
            </div>
          </div>

          <section className="mb-6">
            <h2
              ref={step2HeadingRef}
              tabIndex={-1}
              className="mb-5 font-heading text-h4 font-bold text-forest tracking-[-0.015em] outline-none"
            >
              Betaling
            </h2>
            <div className="mb-4 flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-success" aria-hidden="true" />
              <span className="text-label text-body">Sikret med Stripe</span>
            </div>
            <div
              className={cn(
                "rounded-xl border border-bark/30 bg-card p-6",
                loading && "pointer-events-none opacity-60"
              )}
              aria-label="Betalingsinformasjon"
            >
              <PaymentElement
                onChange={(event) => setPaymentReady(event.complete)}
              />
            </div>
            {paymentError && (
              <div className="mt-4">
                <FormError id="payment-error" message={paymentError} />
              </div>
            )}
          </section>

          <Button
            type="submit"
            variant="primary"
            className="w-full min-h-[48px] font-bold shadow-md"
            loading={loading}
            disabled={!stripe || !elements || !paymentReady}
            aria-busy={loading}
          >
            {loading ? (
              'Behandler betaling...'
            ) : (
              <>
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Betal nå
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
