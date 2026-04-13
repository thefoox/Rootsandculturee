'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { articleSchema } from '@/lib/validations'
import { mapArticle } from '@/lib/mappers/articles'
import type { ActionResult, Article } from '@/types'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export async function getAllArticles(): Promise<Article[]> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') return []

  const snapshot = await adminDb
    .collection('articles')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapArticle)
}

export async function getArticleById(id: string): Promise<Article | null> {
  const doc = await adminDb.collection('articles').doc(id).get()
  if (!doc.exists) return null
  return mapArticle(doc)
}

export async function createArticle(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const rawCoverImage = formData.get('coverImage') as string
  let parsedImage: unknown
  try {
    parsedImage = rawCoverImage ? JSON.parse(rawCoverImage) : null
  } catch {
    return { success: false, errors: { coverImage: 'Ugyldig bildedata.' } }
  }
  const coverImageValue = (parsedImage as Record<string, unknown>)?.url ? parsedImage : undefined

  const parsed = articleSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: (formData.get('excerpt') as string) || undefined,
    body: formData.get('body'),
    coverImage: coverImageValue,
    metaTitle: (formData.get('metaTitle') as string) || undefined,
    metaDescription: (formData.get('metaDescription') as string) || undefined,
    publish: formData.get('publish') === 'true',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  // Check slug uniqueness
  const existingSlug = await adminDb
    .collection('articles')
    .where('slug', '==', parsed.data.slug)
    .limit(1)
    .get()
  if (!existingSlug.empty) {
    return { success: false, errors: { slug: 'Denne URL-adressen er allerede i bruk. Velg en annen.' } }
  }

  const { publish, ...data } = parsed.data
  const excerpt = data.excerpt || stripHtml(data.body).slice(0, 200)
  const now = new Date()

  try {
    const docRef = await adminDb.collection('articles').add({
      ...data,
      coverImage: data.coverImage?.url ? data.coverImage : null,
      excerpt,
      author: session.email,
      tags: [],
      status: publish ? 'published' : 'draft',
      publishedAt: publish ? now : null,
      createdAt: now,
      updatedAt: now,
    })

    revalidateTag('articles')
    return { success: true, data: { id: docRef.id } }
  } catch (err) {
    console.error('[createArticle] Firestore write failed:', err)
    return { success: false, errors: { _form: 'Kunne ikke opprette artikkelen. Prøv igjen.' } }
  }
}

export async function updateArticle(id: string, formData: FormData): Promise<ActionResult> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }

  const rawCoverImage = formData.get('coverImage') as string
  let parsedImage: unknown
  try {
    parsedImage = rawCoverImage ? JSON.parse(rawCoverImage) : null
  } catch {
    return { success: false, errors: { coverImage: 'Ugyldig bildedata.' } }
  }
  const coverImageValue = (parsedImage as Record<string, unknown>)?.url ? parsedImage : undefined

  const parsed = articleSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: (formData.get('excerpt') as string) || undefined,
    body: formData.get('body'),
    coverImage: coverImageValue,
    metaTitle: (formData.get('metaTitle') as string) || undefined,
    metaDescription: (formData.get('metaDescription') as string) || undefined,
    publish: formData.get('publish') === 'true',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = issue.message
    }
    return { success: false, errors: fieldErrors }
  }

  // Check slug uniqueness (exclude current document)
  const existingSlugUpdate = await adminDb
    .collection('articles')
    .where('slug', '==', parsed.data.slug)
    .limit(1)
    .get()
  if (!existingSlugUpdate.empty && existingSlugUpdate.docs[0].id !== id) {
    return { success: false, errors: { slug: 'Denne URL-adressen er allerede i bruk. Velg en annen.' } }
  }

  const { publish, ...data } = parsed.data
  const existingDoc = await adminDb.collection('articles').doc(id).get()
  if (!existingDoc.exists) {
    return { success: false, errors: { _form: 'Artikkelen ble ikke funnet.' } }
  }
  const existing = existingDoc.data()
  const excerpt = data.excerpt || stripHtml(data.body).slice(0, 200)
  const now = new Date()

  try {
    await adminDb.collection('articles').doc(id).update({
      ...data,
      excerpt,
      status: publish ? 'published' : 'draft',
      publishedAt: publish
        ? (existing.publishedAt instanceof Date ? existing.publishedAt : now)
        : (existing.publishedAt instanceof Date ? existing.publishedAt : null),
      updatedAt: now,
    })

    revalidateTag('articles')
    return { success: true }
  } catch (err) {
    console.error('[updateArticle] Firestore write failed:', err)
    return { success: false, errors: { _form: 'Kunne ikke oppdatere artikkelen. Prøv igjen.' } }
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }

  await adminDb.collection('articles').doc(id).delete()
  revalidateTag('articles')
  return { success: true }
}
