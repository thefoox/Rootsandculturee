import type { Metadata } from 'next'
import { GavekortForm } from '@/components/gavekort/GavekortForm'

export const metadata: Metadata = {
  title: 'Gavekort — Roots & Culture',
  description:
    'Gi bort en naturopplevelse eller et autentisk norsk produkt. Kjøp et gavekort som kan brukes i hele nettbutikken.',
  openGraph: {
    title: 'Gavekort',
    description:
      'Gi bort en naturopplevelse eller et autentisk norsk produkt. Kjøp et gavekort som kan brukes i hele nettbutikken.',
  },
}

export default function GavekortPage() {
  return <GavekortForm />
}
