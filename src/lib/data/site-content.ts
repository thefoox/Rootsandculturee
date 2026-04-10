import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { SiteContent } from '@/types'
import { mockSiteContent } from '@/lib/data/mock-data'

const _getSiteContent = unstable_cache(
  async (): Promise<SiteContent | null> => {
    const doc = await adminDb.collection('siteContent').doc('main').get()
    if (!doc.exists) return null
    const data = doc.data()
    return {
      id: doc.id,
      heroTitle: (data.heroTitle as string) || '',
      heroIngress: (data.heroIngress as string) || '',
      aboutText: (data.aboutText as string) || '',
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    }
  },
  ['site-content'],
  { revalidate: 3600, tags: ['site-content'] }
)

export async function getSiteContent(): Promise<SiteContent | null> {
  try {
    return await _getSiteContent()
  } catch (e) {
    console.warn('getSiteContent failed:', e)
    return mockSiteContent
  }
}
