import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Handlekurv — Roots & Culture',
  description: 'Se over handlekurven din og gå til kassen.',
}

export default function HandlekurvLayout({ children }: { children: React.ReactNode }) {
  return children
}
