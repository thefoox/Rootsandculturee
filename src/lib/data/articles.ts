import 'server-only'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import type { Article } from '@/types'
import { mockArticles } from '@/lib/data/mock-data'

function mapArticle(doc: FirebaseFirestore.DocumentSnapshot): Article {
  const data = doc.data()!
  return {
    id: doc.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
    coverImage: data.coverImage || { url: '', alt: '' },
    author: data.author,
    tags: data.tags || [],
    status: data.status,
    metaTitle: data.metaTitle || data.title,
    metaDescription: data.metaDescription || data.excerpt,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
    publishedAt: data.publishedAt?.toDate() ?? null,
  }
}

export const getArticles = unstable_cache(
  async (): Promise<Article[]> => {
    if (!adminDb) return mockArticles

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

export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    if (!adminDb) return mockArticles.find((a) => a.slug === slug) ?? null

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
