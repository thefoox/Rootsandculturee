import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { SiteContent } from '@/types'
import { mockSiteContent } from '@/lib/data/mock-data'

export const getSiteContent = unstable_cache(
  async (): Promise<SiteContent | null> => {
    if (!adminDb) return mockSiteContent

    const doc = await adminDb.collection('siteContent').doc('main').get()

    if (!doc.exists) return null

    const data = doc.data()!
    return {
      id: doc.id,
      heroTitle: data.heroTitle || '',
      heroIngress: data.heroIngress || '',
      aboutText: data.aboutText || '',
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    }
  },
  ['site-content'],
  { revalidate: 3600, tags: ['site-content'] }
)
