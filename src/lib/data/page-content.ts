import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import { mockPageContent } from '@/lib/data/mock-data'
import type { PageContent, PageSection } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

function mapPageContent(doc: FirestoreDoc): PageContent {
  const data = doc.data()
  return {
    id: doc.id,
    title: (data.title as string) || '',
    slug: (data.slug as string) || doc.id,
    isPublished: (data.isPublished as boolean) ?? true,
    showInNavigation: (data.showInNavigation as boolean) ?? false,
    navigationOrder: (data.navigationOrder as number) ?? 0,
    sections: ((data.sections as Record<string, unknown>[]) || []).map((s, i) => ({
      id: (s.id as string) || `section-${i}`,
      type: (s.type as string) || 'text',
      heading: (s.heading as string) || undefined,
      subheading: (s.subheading as string) || undefined,
      body: (s.body as string) || undefined,
      image: (s.image as { url?: string } | null)?.url ? s.image : undefined,
      imagePosition: (s.imagePosition as 'left' | 'right') || undefined,
      items: s.items || undefined,
      ctaText: (s.ctaText as string) || undefined,
      ctaLink: (s.ctaLink as string) || undefined,
      ctaSecondaryText: (s.ctaSecondaryText as string) || undefined,
      ctaSecondaryLink: (s.ctaSecondaryLink as string) || undefined,
      order: typeof s.order === 'number' ? s.order : i,
    })) as PageSection[],
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
  }
}

const _getPageContent = unstable_cache(
  async (pageId: string): Promise<PageContent | null> => {
    const doc = await adminDb.collection('pageContent').doc(pageId).get()
    if (!doc.exists) return mockPageContent.get(pageId) ?? null
    return mapPageContent(doc)
  },
  ['page-content'],
  { revalidate: 3600, tags: ['page-content'] }
)

export async function getPageContent(pageId: string): Promise<PageContent | null> {
  try {
    return await _getPageContent(pageId)
  } catch (e) {
    console.warn('getPageContent failed:', e)
    return mockPageContent.get(pageId) ?? null
  }
}

export function getSection(page: PageContent | null, sectionId: string): PageSection | undefined {
  return page?.sections.find((s) => s.id === sectionId)
}

function getMockNavigationPages(): PageContent[] {
  return Array.from(mockPageContent.values())
    .filter((p) => p.showInNavigation)
    .sort((a, b) => a.navigationOrder - b.navigationOrder)
}

const _getNavigationPages = unstable_cache(
  async (): Promise<PageContent[]> => {
    try {
      const snapshot = await adminDb
        .collection('pageContent')
        .where('showInNavigation', '==', true)
        .orderBy('navigationOrder', 'asc')
        .get()
      if (snapshot.empty) return getMockNavigationPages()
      return snapshot.docs.map(mapPageContent)
    } catch {
      return getMockNavigationPages()
    }
  },
  ['navigation-pages'],
  { revalidate: 3600, tags: ['page-content'] }
)

export async function getNavigationPages(): Promise<PageContent[]> {
  try {
    return await _getNavigationPages()
  } catch (e) {
    console.warn('getNavigationPages failed:', e)
    return getMockNavigationPages()
  }
}

const _getPageContentBySlug = unstable_cache(
  async (slug: string): Promise<PageContent | null> => {
    const snapshot = await adminDb
      .collection('pageContent')
      .where('slug', '==', slug)
      .limit(1)
      .get()
    if (snapshot.empty) {
      return Array.from(mockPageContent.values()).find((p) => p.slug === slug) ?? null
    }
    return mapPageContent(snapshot.docs[0])
  },
  ['page-content-by-slug'],
  { revalidate: 3600, tags: ['page-content'] }
)

export async function getPageContentBySlug(slug: string): Promise<PageContent | null> {
  try {
    return await _getPageContentBySlug(slug)
  } catch (e) {
    console.warn('getPageContentBySlug failed:', e)
    return Array.from(mockPageContent.values()).find((p) => p.slug === slug) ?? null
  }
}
