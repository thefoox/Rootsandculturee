import type { Metadata } from 'next'
import { getPageContent } from '@/lib/data/page-content'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Om oss — Roots & Culture',
  description: 'Forankret i norsk natur og kulturarv. Lær mer om Roots & Culture, vår historie og hva vi står for.',
  openGraph: {
    title: 'Om oss — Roots & Culture',
    description: 'Forankret i norsk natur og kulturarv.',
  },
}

export default async function OmOssPage() {
  const page = await getPageContent('om-oss')
  if (!page) return <div>Innhold ikke tilgjengelig</div>

  return (
    <>
      {page.sections
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
    </>
  )
}
