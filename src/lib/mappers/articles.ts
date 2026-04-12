import type { Article } from '@/types'
import type { FirestoreDoc } from '@/lib/firebase/firestore-rest'

export function mapArticle(doc: FirestoreDoc): Article {
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
