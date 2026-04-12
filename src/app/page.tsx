import type { Metadata } from 'next'
import { getPageContent } from '@/lib/data/page-content'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

export const metadata: Metadata = {
  title: 'Roots & Culture — Norske natur- og kulturopplevelser',
  description:
    'Oppdag autentiske norske naturopplevelser, kurs og matkultur. Kjøp produkter fra norsk natur og bestill din neste opplevelse.',
  openGraph: {
    title: 'Roots & Culture',
    description:
      'Oppdag autentiske norske naturopplevelser, kurs og matkultur.',
  },
}

export const revalidate = 3600

export default async function Home() {
  const pageContent = await getPageContent('forside')
  if (!pageContent) return <div>Innhold ikke tilgjengelig</div>

  const sortedSections = [...pageContent.sections].sort((a, b) => a.order - b.order)

  return (
    <>
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  )
}
