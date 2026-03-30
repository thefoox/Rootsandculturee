import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Stripe Elements appearance config matching Roots & Culture brand palette
// per 03-UI-SPEC.md Stripe Elements Styling section
export const stripeAppearance = {
  theme: 'flat' as const,
  variables: {
    colorPrimary: '#B84D00',
    colorBackground: '#F5F0E8',
    colorText: '#1B4332',
    colorDanger: '#C0392B',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '15px',
    borderRadius: '4px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid rgba(27, 67, 50, 0.2)',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid #1B4332',
      boxShadow: 'none',
      outline: '2px solid #1B4332',
      outlineOffset: '2px',
    },
    '.Label': {
      color: '#1B4332',
      fontSize: '13px',
      fontWeight: '400',
    },
  },
}
