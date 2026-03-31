'use client'

import { PaymentElement } from '@stripe/react-stripe-js'
import { LockKeyhole } from 'lucide-react'
import { FormError } from '@/components/ui/FormError'

interface PaymentSectionProps {
  error?: string
}

export function PaymentSection({ error }: PaymentSectionProps) {
  return (
    <section>
      <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
        Betaling
      </h2>

      <div className="mb-4 flex items-center gap-2">
        <LockKeyhole className="h-4 w-4 text-body" aria-hidden="true" />
        <span className="text-[13px] text-body">Sikret med Stripe</span>
      </div>

      <div
        className="rounded-lg border border-forest/20 bg-card p-6"
        aria-label="Betalingsinformasjon"
      >
        <PaymentElement />
      </div>

      {error && (
        <div className="mt-4">
          <FormError id="payment-error" message={error} />
        </div>
      )}
    </section>
  )
}
