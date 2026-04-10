'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { siteContentSchema } from '@/lib/validations'
import type { SiteContent } from '@/types'

export async function fetchSiteContent(): Promise<SiteContent | null> {
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
}

export async function updateSiteContent(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const parsed = siteContentSchema.safeParse({
    heroTitle: formData.get('heroTitle'),
    heroIngress: formData.get('heroIngress'),
    aboutText: formData.get('aboutText'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  await adminDb.collection('siteContent').doc('main').set(
    {
      ...parsed.data,
      updatedAt: new Date(),
    },
    true // merge
  )

  revalidateTag('site-content', 'max')
  return { success: true }
}
