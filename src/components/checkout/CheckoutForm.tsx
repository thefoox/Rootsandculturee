'use client'

import { useState } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { LockKeyhole, ArrowRight, User, CreditCard, Check } from 'lucide-react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentError, setPaymentError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)

  const hasProducts = items.some((i) => i.type === 'product')
  const needsShipping = hasProducts

  function validateStep1(): boolean {
    // Individual name field validation before schema check
    const fieldErrors: Record<string, string> = {}
    if (!firstName.trim()) fieldErrors.firstName = 'Fornavn er påkrevd.'
    if (!lastName.trim()) fieldErrors.lastName = 'Etternavn er påkrevd.'
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return false
    }

    const formData = {
      email,
      fullName: `${firstName} ${lastName}`.trim(),
      phone,
      address,
      postalCode,
      city,
    }
    const schema = needsShipping ? shippingSchema : contactOnlySchema
    const validation = schema.safeParse(formData)

    if (!validation.success) {
      const schemaErrors: Record<string, string> = {}
      for (const err of validation.error.issues) {
        const field = err.path[0] as string
        if (!schemaErrors[field]) {
          schemaErrors[field] = err.message
        }
      }
      setErrors(schemaErrors)
      return false
    }
    return true
  }

  function handleNextStep() {
    setErrors({})
    if (validateStep1()) {
      setStep(2)
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
      const formData = {
        email,
        fullName: `${firstName} ${lastName}`.trim(),
        phone,
        address,
        postalCode,
        city,
      }
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
      {/* Step indicator — 3 icon-based steps */}
      <div className="mb-12 flex items-center justify-center px-5">
        {/* Step 1: Kontakt */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              step >= 1
                ? 'bg-forest text-cream'
                : 'border-[1.5px] border-forest/20 text-forest/20'
            )}
          >
            <User className="h-[18px] w-[18px]" aria-hidden="true" />
          </div>
          <span
            className={cn(
              'hidden text-[14px] font-medium sm:inline',
              step === 1
                ? 'font-semibold text-forest'
                : step > 1
                  ? 'text-forest'
                  : 'text-forest/20'
            )}
          >
            Kontakt
          </span>
        </div>

        {/* Connector 1 */}
        <div
          className={cn(
            'mx-4 h-0 w-20 border-t-[1.5px]',
            step > 1 ? 'border-solid border-forest' : 'border-dashed border-forest/20'
          )}
        />

        {/* Step 2: Betaling */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              step === 2
                ? 'bg-forest text-cream'
                : step > 2
                  ? 'bg-forest text-cream'
                  : 'border-[1.5px] border-forest/20 text-forest/20'
            )}
          >
            <CreditCard className="h-[18px] w-[18px]" aria-hidden="true" />
          </div>
          <span
            className={cn(
              'hidden text-[14px] font-medium sm:inline',
              step === 2
                ? 'font-semibold text-forest'
                : step > 2
                  ? 'text-forest'
                  : 'text-forest/20'
            )}
          >
            Betaling
          </span>
        </div>

        {/* Connector 2 — always dashed (step 3 is never reached in this form) */}
        <div className="mx-4 h-0 w-20 border-t-[1.5px] border-dashed border-forest/20" />

        {/* Step 3: Bekreftelse (visual only) */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-forest/20 text-forest/20">
            <Check className="h-[18px] w-[18px]" aria-hidden="true" />
          </div>
          <span className="hidden text-[14px] font-medium text-forest/20 sm:inline">
            Bekreftelse
          </span>
        </div>
      </div>

      {/* Step 1: Contact + Shipping */}
      {step === 1 && (
        <div className="motion-safe:animate-[fadeUp_350ms_ease-out]">
          <section className="mb-10">
            <h2 className="mb-1.5 font-heading text-h4 font-bold text-forest">
              Kontaktinformasjon
            </h2>
            <p className="mb-7 text-[14px] leading-relaxed text-body/60">
              Vi trenger din kontaktinformasjon for ordrebekreftelse
            </p>

            {/* Split name row */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                variant="underline"
                label="Fornavn"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
                autoComplete="given-name"
                placeholder="Ola"
                required
              />
              <Input
                variant="underline"
                label="Etternavn"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
                autoComplete="family-name"
                placeholder="Nordmann"
                required
              />
            </div>

            <div className="space-y-6">
              <Input
                variant="underline"
                label={userEmail ? `Innlogget som ${userEmail}` : 'E-post'}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                readOnly={!!userEmail}
                placeholder="ola@eksempel.no"
                autoComplete="email"
                required
              />
              <Input
                variant="underline"
                label="Telefon"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+47 123 45 678"
                required
              />
            </div>
          </section>

          {needsShipping && (
            <section className="mb-10">
              <h2 className="mb-1.5 font-heading text-h4 font-bold text-forest">
                Leveringsadresse
              </h2>
              <p className="mb-7 text-[14px] leading-relaxed text-body/60">
                Oppgi adressen produktene skal sendes til
              </p>

              <div className="space-y-6">
                <Input
                  variant="underline"
                  label="Gateadresse"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  error={errors.address}
                  autoComplete="address-line1"
                  placeholder="Storgata 1"
                  required
                />
                <div className="grid grid-cols-[160px_1fr] gap-6">
                  <Input
                    variant="underline"
                    label="Postnummer"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    error={errors.postalCode}
                    pattern="[0-9]{4}"
                    inputMode="numeric"
                    maxLength={4}
                    autoComplete="postal-code"
                    placeholder="0150"
                    required
                  />
                  <Input
                    variant="underline"
                    label="Sted"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    error={errors.city}
                    autoComplete="address-level2"
                    placeholder="Oslo"
                    required
                  />
                </div>
              </div>
            </section>
          )}

          <button
            type="button"
            className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-lg bg-forest px-8 py-4 text-[15px] font-semibold text-cream hover:bg-[#153a2a] hover:shadow-[0_2px_12px_rgba(27,67,50,0.2)] active:scale-[0.99] motion-safe:transition-all motion-safe:duration-150"
            onClick={handleNextStep}
          >
            Gå til betaling
            <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="motion-safe:animate-[fadeUp_350ms_ease-out]">
            {/* Recap card */}
            <div className="mb-8 flex items-start justify-between rounded-[10px] border border-forest/8 bg-cream px-6 py-5">
              <div className="leading-[1.7]">
                <div className="text-[15px] font-semibold text-forest">
                  {firstName} {lastName}
                </div>
                <div className="text-[14px] text-body/70">{email}</div>
                <div className="text-[14px] text-body/70">{phone}</div>
                {needsShipping && (
                  <div className="mt-1 text-[14px] text-body/70">
                    {address}, {postalCode} {city}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-shrink-0 p-1 text-[13px] text-forest underline opacity-60 hover:opacity-100"
              >
                Endre
              </button>
            </div>

            <section className="mb-8">
              <h2 className="mb-1.5 font-heading text-h4 font-bold text-forest">
                Betaling
              </h2>
              <p className="mb-7 text-[14px] leading-relaxed text-body/60">
                Alle transaksjoner er kryptert og sikret av Stripe
              </p>

              {/* Security badge */}
              <div className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-body/50">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                Sikret med SSL-kryptering
              </div>

              {/* Stripe payment element box */}
              <div
                className="mb-6 rounded-[10px] border-[1.5px] border-forest/20 bg-white p-6"
                aria-label="Betalingsinformasjon"
              >
                <PaymentElement onChange={(event) => setPaymentReady(event.complete)} />
              </div>

              {paymentError && (
                <div className="mb-4">
                  <FormError id="payment-error" message={paymentError} />
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={!stripe || !elements || !paymentReady || loading}
              aria-busy={loading}
              className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-lg bg-forest px-8 py-4 text-[15px] font-semibold text-cream hover:bg-[#153a2a] hover:shadow-[0_2px_12px_rgba(27,67,50,0.2)] active:scale-[0.99] motion-safe:transition-all motion-safe:duration-150 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                'Behandler betaling...'
              ) : (
                <>
                  <LockKeyhole className="h-[18px] w-[18px]" aria-hidden="true" />
                  Fullfør betaling
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
