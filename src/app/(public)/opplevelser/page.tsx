import type { Metadata } from 'next'
import { getPageContent } from '@/lib/data/page-content'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Opplevelser — Roots & Culture',
  description: 'Naturretreater, kurs og matopplevelser i norsk natur. Book din neste naturopplevelse.',
  openGraph: {
    title: 'Opplevelser',
    description: 'Naturretreater, kurs og matopplevelser i norsk natur. Book din neste naturopplevelse.',
  },
}

export const revalidate = 3600

export default async function OpplevelserPage() {
  const page = await getPageContent('opplevelser')

  const sortedSections = page
    ? [...page.sections].sort((a, b) => a.order - b.order)
    : []

  return (
    <>
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-8">
        <Breadcrumbs items={[{ label: 'Opplevelser' }]} />
      </div>
    </>
  )
}
