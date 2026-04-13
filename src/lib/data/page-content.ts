import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { PageContent, PageSection } from '@/types'
import { mapPageContent } from '@/lib/mappers/page-content'

// Short TTL cache (60s) + tag-based invalidation via revalidateTag('page-content')
// in the CMS PUT handler. revalidatePath also purges page-level CDN cache.

const _getPageContent = unstable_cache(
  async (pageId: string): Promise<PageContent | null> => {
    const doc = await adminDb.collection('pageContent').doc(pageId).get()
    if (!doc.exists) return null
    return mapPageContent(doc)
  },
  ['page-content'],
  { revalidate: 60, tags: ['page-content'] }
)

export async function getPageContent(pageId: string): Promise<PageContent | null> {
  try {
    return await _getPageContent(pageId)
  } catch (e) {
    console.error('getPageContent failed:', e)
    return null
  }
}

export function getSection(page: PageContent | null, sectionId: string): PageSection | undefined {
  return page?.sections.find((s) => s.id === sectionId)
}

const _getNavigationPages = unstable_cache(
  async (): Promise<PageContent[]> => {
    const snapshot = await adminDb
      .collection('pageContent')
      .where('showInNavigation', '==', true)
      .orderBy('navigationOrder', 'asc')
      .get()
    if (snapshot.empty) return []
    return snapshot.docs.map(mapPageContent)
  },
  ['navigation-pages'],
  { revalidate: 60, tags: ['page-content'] }
)

export async function getNavigationPages(): Promise<PageContent[]> {
  try {
    return await _getNavigationPages()
  } catch (e) {
    console.error('getNavigationPages failed:', e)
    return []
  }
}

const _getPageContentBySlug = unstable_cache(
  async (slug: string): Promise<PageContent | null> => {
    const snapshot = await adminDb
      .collection('pageContent')
      .where('slug', '==', slug)
      .limit(1)
      .get()
    if (snapshot.empty) return null
    return mapPageContent(snapshot.docs[0])
  },
  ['page-content-by-slug'],
  { revalidate: 60, tags: ['page-content'] }
)

export async function getPageContentBySlug(slug: string): Promise<PageContent | null> {
  try {
    return await _getPageContentBySlug(slug)
  } catch (e) {
    console.error('getPageContentBySlug failed:', e)
    return null
  }
}
