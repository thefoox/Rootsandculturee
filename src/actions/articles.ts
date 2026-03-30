'use server'

import { revalidateTag } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { adminDb } from '@/lib/firebase/admin'
import { articleSchema } from '@/lib/validations'
import { FieldValue } from 'firebase-admin/firestore'
import type { Article } from '@/types'

function mapArticle(doc: FirebaseFirestore.DocumentSnapshot): Article {
  const data = doc.data()!
  return {
    id: doc.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt || '',
    body: data.body,
    coverImage: data.coverImage || { url: '', alt: '' },
    author: data.author || '',
    tags: data.tags || [],
    status: data.status,
    metaTitle: data.metaTitle || data.title,
    metaDescription: data.metaDescription || data.excerpt || '',
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    publishedAt: data.publishedAt?.toDate() ?? null,
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export async function getAllArticles(): Promise<Article[]> {
  if (!adminDb) return []
  const snapshot = await adminDb
    .collection('articles')
    .orderBy('createdAt', 'desc')
    .get()
  return snapshot.docs.map(mapArticle)
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (!adminDb) return null
  const doc = await adminDb.collection('articles').doc(id).get()
  if (!doc.exists) return null
  return mapArticle(doc)
}

export async function createArticle(formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }
  if (!adminDb) {
    return { success: false, errors: { _form: 'Server er ikke konfigurert.' } }
  }

  const rawCoverImage = formData.get('coverImage') as string

  const parsed = articleSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: (formData.get('excerpt') as string) || undefined,
    body: formData.get('body'),
    coverImage: rawCoverImage ? JSON.parse(rawCoverImage) : { url: '', alt: '' },
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
  // Auto-generate excerpt from body if not provided
  const excerpt = data.excerpt || stripHtml(data.body).slice(0, 200)

  const docRef = await adminDb.collection('articles').add({
    ...data,
    excerpt,
    author: session.email,
    tags: [],
    status: publish ? 'published' : 'draft',
    publishedAt: publish ? FieldValue.serverTimestamp() : null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  revalidateTag('articles', 'max')
  return { success: true, id: docRef.id }
}

export async function updateArticle(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, errors: { _form: 'Ikke autorisert.' } }
  }
  if (!adminDb) {
    return { success: false, errors: { _form: 'Server er ikke konfigurert.' } }
  }

  const rawCoverImage = formData.get('coverImage') as string

  const parsed = articleSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: (formData.get('excerpt') as string) || undefined,
    body: formData.get('body'),
    coverImage: rawCoverImage ? JSON.parse(rawCoverImage) : { url: '', alt: '' },
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
  const existing = existingDoc.data()
  const excerpt = data.excerpt || stripHtml(data.body).slice(0, 200)

  await adminDb
    .collection('articles')
    .doc(id)
    .update({
      ...data,
      excerpt,
      status: publish ? 'published' : 'draft',
      publishedAt: publish
        ? existing?.publishedAt || FieldValue.serverTimestamp()
        : existing?.publishedAt || null,
      updatedAt: FieldValue.serverTimestamp(),
    })

  revalidateTag('articles', 'max')
  return { success: true }
}

export async function deleteArticle(id: string) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Ikke autorisert.' }
  }
  if (!adminDb) {
    return { success: false, error: 'Server er ikke konfigurert.' }
  }

  await adminDb.collection('articles').doc(id).delete()
  revalidateTag('articles', 'max')
  return { success: true }
}
