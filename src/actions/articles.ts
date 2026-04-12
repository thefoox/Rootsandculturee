'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { articleSchema } from '@/lib/validations'
import type { Article } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

function mapArticle(doc: FirestoreDoc): Article {
  const data = doc.data()
  return {
    id: doc.id,
    slug: data.slug as string,
    title: data.title as string,
    excerpt: (data.excerpt as string) || '',
    body: data.body as string,
    coverImage: (data.coverImage as Article['coverImage']) || { url: '', alt: '' },
    author: (data.author as string) || '',
    tags: (data.tags as string[]) || [],
    status: data.status as Article['status'],
    metaTitle: (data.metaTitle as string) || (data.title as string),
    metaDescription: (data.metaDescription as string) || (data.excerpt as string) || '',
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    publishedAt: data.publishedAt instanceof Date ? data.publishedAt : null,
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export async function getAllArticles(): Promise<Article[]> {
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

export async function createArticle(formData: FormData) {
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
    return { success: true, id: docRef.id }
  } catch (err) {
    console.error('[createArticle] Firestore write failed:', err)
    return { success: false, errors: { _form: 'Kunne ikke opprette artikkelen. Prøv igjen.' } }
  }
}

export async function updateArticle(id: string, formData: FormData) {
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

  const { publish, ...data } = parsed.data
  const existingDoc = await adminDb.collection('articles').doc(id).get()
  if (!existingDoc.exists) {
    return { success: false, errors: { _form: 'Artikkelen ble ikke funnet.' } }
  }
  const existing = existingDoc.data()
  const excerpt = data.excerpt || stripHtml(data.body).slice(0, 200)
  const now = new Date()

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
}

export async function deleteArticle(id: string) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }

  await adminDb.collection('articles').doc(id).delete()
  revalidateTag('articles')
  return { success: true }
}
