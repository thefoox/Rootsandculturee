'use client'

import type { ReactNode } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe, stripeAppearance } from '@/lib/stripe/client'

interface StripeElementsWrapperProps {
  clientSecret: string
  children: ReactNode
}

export function StripeElementsWrapper({
  clientSecret,
  children,
}: StripeElementsWrapperProps) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: stripeAppearance,
      }}
    >
      {children}
    </Elements>
  )
}
