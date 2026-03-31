import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kjop gavekort — Roots & Culture',
  description: 'Gi bort en naturopplevelse eller et produkt. Gavekort fra Roots & Culture er gyldig i 12 maneder.',
  openGraph: {
    title: 'Kjop gavekort — Roots & Culture',
    description: 'Gi bort en naturopplevelse eller et produkt fra Roots & Culture.',
  },
}

export default function GavekortLayout({ children }: { children: React.ReactNode }) {
  return children
}
