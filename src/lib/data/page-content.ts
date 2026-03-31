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
    slug: data.slug || doc.id,
    isPublished: data.isPublished ?? true,
    showInNavigation: data.showInNavigation ?? false,
    navigationOrder: data.navigationOrder ?? 0,
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

const _getNavigationPages = unstable_cache(
  async (): Promise<PageContent[]> => {
    const snapshot = await adminDb!
      .collection('pageContent')
      .where('showInNavigation', '==', true)
      .orderBy('navigationOrder')
      .get()
    return snapshot.docs.map(mapPageContent)
  },
  ['navigation-pages'],
  { revalidate: 3600, tags: ['page-content'] }
)

export async function getNavigationPages(): Promise<PageContent[]> {
  if (!adminDb) {
    return Array.from(mockPageContent.values())
      .filter((p) => p.showInNavigation)
      .sort((a, b) => a.navigationOrder - b.navigationOrder)
  }
  return _getNavigationPages()
}

const _getPageContentBySlug = unstable_cache(
  async (slug: string): Promise<PageContent | null> => {
    const snapshot = await adminDb!
      .collection('pageContent')
      .where('slug', '==', slug)
      .limit(1)
      .get()
    if (snapshot.empty) return null
    return mapPageContent(snapshot.docs[0])
  },
  ['page-content-by-slug'],
  { revalidate: 3600, tags: ['page-content'] }
)

export async function getPageContentBySlug(slug: string): Promise<PageContent | null> {
  if (!adminDb) {
    return Array.from(mockPageContent.values()).find((p) => p.slug === slug) ?? null
  }
  return _getPageContentBySlug(slug)
}
