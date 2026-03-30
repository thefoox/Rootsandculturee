'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { siteContentSchema } from '@/lib/validations'
import { FieldValue } from 'firebase-admin/firestore'
import type { SiteContent } from '@/types'

export async function fetchSiteContent(): Promise<SiteContent | null> {
  if (!adminDb) return null
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
}

export async function updateSiteContent(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }
  if (!adminDb) {
    return { success: false, errors: { _form: 'Server er ikke konfigurert.' } }
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

  await adminDb
    .collection('siteContent')
    .doc('main')
    .set(
      {
        ...parsed.data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

  revalidateTag('site-content', 'max')
  return { success: true }
}
