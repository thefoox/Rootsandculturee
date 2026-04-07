import type { Metadata } from 'next'
import { DynamicPage } from '@/components/sections/DynamicPage'

export const metadata: Metadata = {
  title: 'Roots & Culture — Norske natur- og kulturopplevelser',
  description:
    'Oppdag autentiske norske naturopplevelser, kurs og matkultur. Kjøp produkter fra norsk natur og bestill din neste opplevelse.',
  openGraph: {
    title: 'Roots & Culture',
    description:
      'Oppdag autentiske norske naturopplevelser, kurs og matkultur. Kjøp produkter fra norsk natur og bestill din neste opplevelse.',
  },
}

export default function Home() {
  return <DynamicPage pageId="forside" />
}
