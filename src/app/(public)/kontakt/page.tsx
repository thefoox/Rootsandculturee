import type { Metadata } from 'next'
import { DynamicPage } from '@/components/sections/DynamicPage'

export const metadata: Metadata = {
  title: 'Kontakt oss — Roots & Culture',
  description:
    'Ta kontakt med Roots & Culture. Vi hjelper deg gjerne med spørsmål om produkter, opplevelser og bestillinger.',
}

export default function KontaktPage() {
  return <DynamicPage pageId="kontakt" />
}
