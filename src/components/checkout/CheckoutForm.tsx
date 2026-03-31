'use client'

import { useState } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { LockKeyhole } from 'lucide-react'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { Button } from '@/components/ui/Button'
import { createPaymentIntent } from '@/actions/checkout'
import type { CartItem } from '@/types'

const shippingSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse.'),
  fullName: z.string().min(1, 'Fullt navn er pakrevd.'),
  address: z.string().min(1, 'Adresse er pakrevd.'),
  postalCode: z.string().regex(/^[0-9]{4}$/, 'Postnummer ma vaere 4 siffer.'),
  city: z.string().min(1, 'Sted er pakrevd.'),
})

const contactOnlySchema = z.object({
  email: z.string().email('Ugyldig e-postadresse.'),
})

interface CheckoutFormProps {
  items: CartItem[]
  userEmail?: string | null
  onPaymentSuccess: (paymentIntentId: string) => void
}

export function CheckoutForm({
  items,
  userEmail,
  onPaymentSuccess,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [email, setEmail] = useState(userEmail || '')
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentError, setPaymentError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)

  const hasProducts = items.some((i) => i.type === 'product')
  const needsShipping = hasProducts

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setPaymentError('')

    if (!stripe || !elements) {
      setPaymentError('Betalingssystemet er ikke lastet enda. Vent litt.')
      return
    }

    // Validate form
    const formData = { email, fullName, address, postalCode, city }
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
      return
    }

    setLoading(true)

    try {
      // Create PaymentIntent on server
      const result = await createPaymentIntent(formData, items)

      if ('error' in result) {
        setPaymentError(result.error)
        setLoading(false)
        return
      }

      // Confirm payment with Stripe Elements
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        // Map Stripe error codes to Norwegian messages
        const errorMessages: Record<string, string> = {
          card_declined: 'Kortet ble avvist. Prov et annet kort.',
          insufficient_funds: 'Ikke nok dekning pa kortet.',
          expired_card: 'Kortet har utlopt.',
          incorrect_cvc: 'Feil CVC-kode.',
          processing_error: 'Det oppsto en feil. Prov igjen.',
          incorrect_number: 'Ugyldig kortnummer.',
        }
        setPaymentError(
          errorMessages[stripeError.code || ''] ||
            stripeError.message ||
            'Noe gikk galt med betalingen. Prov igjen.'
        )
        setLoading(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id)
      }
    } catch {
      setPaymentError('En uventet feil oppsto. Prov igjen.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Section 1: Contact info */}
      <section className="mb-8">
        <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
          Kontaktinformasjon
        </h2>
        <div className="space-y-4">
          <Input
            label={userEmail ? `Innlogget som ${userEmail}` : 'E-postadresse'}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            readOnly={!!userEmail}
            required
          />
        </div>
      </section>

      {/* Section 2: Shipping address (only for products) */}
      {needsShipping && (
        <section className="mb-8">
          <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
            Leveringsadresse
          </h2>
          <div className="space-y-4">
            <Input
              label="Fullt navn"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              required
            />
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

      {/* Section 3: Payment */}
      <section className="mb-8">
        <h2 className="mb-4 font-heading text-h4 font-bold text-forest">
          Betaling
        </h2>
        <div className="mb-4 flex items-center gap-2">
          <LockKeyhole className="h-4 w-4 text-body" aria-hidden="true" />
          <span className="text-label text-body">Sikret med Stripe</span>
        </div>
        <div
          className="rounded-lg border border-forest/20 bg-card p-6"
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

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        loading={loading}
        disabled={!stripe || !elements || !paymentReady}
        aria-busy={loading}
      >
        {loading ? (
          'Behandler betaling...'
        ) : (
          <>
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Betal na
          </>
        )}
      </Button>
    </form>
  )
}
