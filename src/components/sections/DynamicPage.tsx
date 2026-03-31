import { notFound } from 'next/navigation'
import { getPageContent } from '@/lib/data/page-content'
import { SectionRenderer } from './SectionRenderer'

export async function DynamicPage({ pageId }: { pageId: string }) {
  const page = await getPageContent(pageId)
  if (!page || !page.isPublished) notFound()

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
