import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kasse — Roots & Culture',
  description: 'Fullfar bestillingen din hos Roots & Culture.',
  robots: { index: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
