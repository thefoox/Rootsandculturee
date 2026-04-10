import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Article } from '@/types'
import { mockArticles } from '@/lib/data/mock-data'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

function mapArticle(doc: FirestoreDoc): Article {
  const data = doc.data()
  return {
    id: doc.id,
    slug: data.slug as string,
    title: data.title as string,
    excerpt: data.excerpt as string,
    body: data.body as string,
    coverImage: (data.coverImage as Article['coverImage']) || { url: '', alt: '' },
    author: data.author as string,
    tags: (data.tags as string[]) || [],
    status: data.status as Article['status'],
    metaTitle: (data.metaTitle as string) || (data.title as string),
    metaDescription: (data.metaDescription as string) || (data.excerpt as string),
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    publishedAt: data.publishedAt instanceof Date ? data.publishedAt : null,
  }
}

const _getArticles = unstable_cache(
  async (): Promise<Article[]> => {
    const snapshot = await adminDb
      .collection('articles')
      .where('status', '==', 'published')
      .where('publishedAt', '!=', null)
      .orderBy('publishedAt', 'desc')
      .get()
    return snapshot.docs.map(mapArticle)
  },
  ['articles'],
  { revalidate: 3600, tags: ['articles'] }
)

export async function getArticles(): Promise<Article[]> {
  try {
    return await _getArticles()
  } catch (e) {
    console.warn('getArticles failed:', e)
    return mockArticles
  }
}

const _getArticleBySlug = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    const snapshot = await adminDb
      .collection('articles')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get()
    if (snapshot.empty) return null
    return mapArticle(snapshot.docs[0])
  },
  ['articles'],
  { revalidate: 3600, tags: ['articles'] }
)

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    return await _getArticleBySlug(slug)
  } catch (e) {
    console.warn('getArticleBySlug failed:', e)
    return mockArticles.find((a) => a.slug === slug) ?? null
  }
}
