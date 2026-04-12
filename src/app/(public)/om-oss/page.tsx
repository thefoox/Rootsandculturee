import type { Metadata } from 'next'
import { getPageContent } from '@/lib/data/page-content'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Om oss — Roots & Culture',
  description:
    'Forankret i norsk natur og kulturarv. Vi bringer deg nærmere det ekte. Les om vår historie, våre verdier og menneskene bak Roots & Culture.',
  openGraph: {
    title: 'Om oss — Roots & Culture',
    description:
      'Forankret i norsk natur og kulturarv. Vi bringer deg nærmere det ekte.',
  },
}

export default async function OmOssPage() {
  const page = await getPageContent('om-oss')
  if (!page) return <div>Innhold ikke tilgjengelig</div>

  const sortedSections = [...page.sections].sort((a, b) => a.order - b.order)

  return (
    <>
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  )
}
