import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageContentBySlug } from '@/lib/data/page-content'
import { SectionRenderer } from '@/components/sections/SectionRenderer'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageContentBySlug(slug)
  if (!page || !page.isPublished) return {}

  return {
    title: `${page.title} — Roots & Culture`,
    openGraph: {
      title: `${page.title} — Roots & Culture`,
    },
  }
}

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params
  const page = await getPageContentBySlug(slug)
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
