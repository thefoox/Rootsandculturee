import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import { mockPageContent } from '@/lib/data/mock-data'
import type { PageContent, PageSection } from '@/types'

function mapPageContent(doc: FirebaseFirestore.DocumentSnapshot): PageContent {
  const data = doc.data()!
  return {
    id: doc.id,
    title: data.title || '',
    sections: (data.sections || []).map((s: Record<string, unknown>, i: number) => ({
      id: s.id || `section-${i}`,
      type: s.type || 'text',
      heading: s.heading || undefined,
      subheading: s.subheading || undefined,
      body: s.body || undefined,
      image: s.image || undefined,
      items: s.items || undefined,
      ctaText: s.ctaText || undefined,
      ctaLink: s.ctaLink || undefined,
      order: typeof s.order === 'number' ? s.order : i,
    })) as PageSection[],
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  }
}

const _getPageContent = unstable_cache(
  async (pageId: string): Promise<PageContent | null> => {
    const doc = await adminDb!.collection('pageContent').doc(pageId).get()
    if (!doc.exists) return null
    return mapPageContent(doc)
  },
  ['page-content'],
  { revalidate: 3600, tags: ['page-content'] }
)

export async function getPageContent(pageId: string): Promise<PageContent | null> {
  if (!adminDb) return mockPageContent.get(pageId) ?? null
  return _getPageContent(pageId)
}

export function getSection(page: PageContent | null, sectionId: string): PageSection | undefined {
  return page?.sections.find((s) => s.id === sectionId)
}
