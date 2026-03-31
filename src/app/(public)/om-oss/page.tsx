import type { Metadata } from 'next'
import { DynamicPage } from '@/components/sections/DynamicPage'

export const metadata: Metadata = {
  title: 'Om oss — Roots & Culture',
  description:
    'Roots & Culture er forankret i norsk natur og kulturarv. Lær om vår historie, våre verdier og menneskene bak.',
}

export default function OmOssPage() {
  return <DynamicPage pageId="om-oss" />
}
